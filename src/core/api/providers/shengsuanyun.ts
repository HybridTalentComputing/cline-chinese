import { Anthropic } from "@anthropic-ai/sdk"
import { ShengSuanYunModelInfo } from "@shared/proto/cline/models"
import OpenAI from "openai"
import type { ChatCompletionTool } from "openai/resources/chat/completions"
import { HostProvider } from "@/hosts/host-provider"
import { Logger } from "@/services/logging/Logger"
import { ClineStorageMessage } from "@/shared/messages"
import { calculateApiCostOpenAI } from "@/utils/cost"
import { shouldSkipReasoningForModel } from "@/utils/model-utils"
import { shengSuanYunDefaultModelId, shengSuanYunDefaultModelInfo } from "../../../shared/api"
import { ApiHandler, CommonApiHandlerOptions } from "../"
import { withRetry } from "../retry"
import { convertToOpenAIResponsesInput } from "../transform/openai-response-format"
import { createOpenRouterStream } from "../transform/openrouter-stream"
import { ApiStream } from "../transform/stream"
import { OpenRouterErrorResponse } from "./types"

interface ShengSuanYunHandlerOptions extends CommonApiHandlerOptions {
	shengSuanYunApiKey?: string
	reasoningEffort?: string
	thinkingBudgetTokens?: number
	shengSuanYunModelId?: string
	shengSuanYunModelInfo?: ShengSuanYunModelInfo
}

export class ShengSuanYunHandler implements ApiHandler {
	private options: ShengSuanYunHandlerOptions
	private client: OpenAI | undefined
	private httpReferer: string | undefined
	lastGenerationId?: string

	constructor(options: ShengSuanYunHandlerOptions) {
		this.options = options
	}

	private async getHttpReferer(): Promise<string> {
		if (this.httpReferer) {
			return this.httpReferer
		}

		try {
			const callbackUrl = await HostProvider.get().getCallbackUrl()
			this.httpReferer = `${callbackUrl}/ssy`
		} catch (error) {
			// Fallback to default if unable to get callback URL (e.g., in CLI mode)
			console.warn("Failed to get callback URL for HTTP-Referer, using default:", error)
			this.httpReferer = "cline-chinese"
		}

		return this.httpReferer
	}

	private async ensureClient(): Promise<OpenAI> {
		if (!this.client) {
			if (!this.options.shengSuanYunApiKey) {
				throw new Error("shengsuanyun API key is required")
			}
			try {
				this.client = new OpenAI({
					baseURL: "https://router.shengsuanyun.com/api/v1",
					apiKey: this.options.shengSuanYunApiKey,
					defaultHeaders: {
						"HTTP-Referer": await this.getHttpReferer(),
						"X-Title": "cline-chinese",
					},
				})
			} catch (error: any) {
				throw new Error(`Error creating shengsuanyun client: ${error.message}`)
			}
		}
		return this.client
	}

	@withRetry()
	async *createMessage(systemPrompt: string, messages: ClineStorageMessage[], tools?: ChatCompletionTool[]): ApiStream {
		const model = this.getModel()
		// Ensure client is initialized before using it
		await this.ensureClient()

		// 如果 endPoints 为空或未定义，默认使用 chat completions API
		const endPoints = model?.info?.endPoints || ["/v1/chat/completions"]

		if (endPoints.includes("/v1/chat/completions")) {
			yield* this.createCompletionStream(systemPrompt, messages)
		} else if (endPoints.includes("/v1/responses")) {
			// If tools is empty, create a default tool to prevent errors
			const effectiveTools = tools?.length
				? tools
				: [
						{
							type: "function" as const,
							function: {
								name: "no_operation",
								description:
									"A placeholder function that performs no operation. Used when no tools are available.",
								parameters: {
									type: "object",
									properties: {},
									required: [],
									additionalProperties: false,
								},
							},
						},
					]
			yield* this.createResponseStream(systemPrompt, messages, effectiveTools)
		} else {
			console.error("Unsupported ShengSuanYun model endpoints:", model)
			throw new Error("Unsupported ShengSuanYun model endpoints")
		}
	}

	async *createCompletionStream(systemPrompt: string, messages: Anthropic.Messages.MessageParam[]): ApiStream {
		const client = await this.ensureClient()
		const model = this.getModel()
		try {
			const stream = await createOpenRouterStream(
				client,
				systemPrompt,
				messages,
				model,
				this.options.reasoningEffort,
				this.options.thinkingBudgetTokens,
			)

			for await (const chunk of stream) {
				// openrouter returns an error object instead of the openai sdk throwing an error
				if ("error" in chunk) {
					const error = chunk.error as OpenRouterErrorResponse["error"]
					console.error(`ShengSuanYun API Error: ${error?.code} - ${error?.message}`)
					// Include metadata in the error message if available
					const metadataStr = error.metadata ? `\nMetadata: ${JSON.stringify(error.metadata, null, 2)}` : ""

					// Create a proper error object with status for retry logic
					const apiError = new Error(`ShengSuanYun API Error ${error.code}: ${error.message}${metadataStr}`)
					// Set status for rate limit detection
					if (error.code === 429 || String(error.code) === "429") {
						;(apiError as any).status = 429
					}
					throw apiError
				}

				if (!chunk.choices || chunk.choices.length === 0) {
					console.error("shengSuanYun stream chunk:", chunk)
					continue
				}

				const choice = chunk.choices?.[0]
				// Use type assertion since OpenRouter uses non-standard "error" finish_reason
				if ((choice?.finish_reason as string) === "error") {
					// Use type assertion since OpenRouter adds non-standard error property
					const choiceWithError = choice as any
					if (choiceWithError.error) {
						const error = choiceWithError.error
						console.error(
							`ShengSuanYun Mid-Stream Error: ${error?.code || "Unknown"} - ${error?.message || "Unknown error"}`,
						)
						// Format error details
						const errorDetails = typeof error === "object" ? JSON.stringify(error, null, 2) : String(error)

						// Create a proper error object with status for retry logic
						const streamError = new Error(`ShengSuanYun Mid-Stream Error: ${errorDetails}`)
						if (error?.code === 429 || error?.code === "rate_limit_exceeded" || String(error?.code) === "429") {
							;(streamError as any).status = 429
						}
						throw streamError
					} else {
						// Fallback if error details are not available
						throw new Error(
							`ShengSuanYun Mid-Stream Error: Stream terminated with error status but no error details provided`,
						)
					}
				}

				const delta = chunk.choices[0]?.delta
				if (delta?.content) {
					yield {
						type: "text",
						text: delta.content,
					}
				}

				// Reasoning tokens are returned separately from the content
				// Skip reasoning content for Grok 4 models since it only displays "thinking" without providing useful information
				if ("reasoning" in delta && delta.reasoning && !shouldSkipReasoningForModel(this.options.shengSuanYunModelId)) {
					yield {
						type: "reasoning",
						// @ts-expect-error-next-line
						reasoning: delta.reasoning,
					}
				}
				if (chunk.usage) {
					const input = (chunk.usage.prompt_tokens || 0) - (chunk.usage.prompt_tokens_details?.cached_tokens || 0)
					const output = chunk.usage.completion_tokens || 0
					// @ts-expect-error-next-line
					const cost = (chunk.usage.cost || 0) + (chunk.usage.cost_details?.upstream_inference_cost || 0)
					const inputPrice = model.info.inputPrice || 0
					const outputPrice = model.info.outputPrice || 0
					yield {
						type: "usage",
						cacheWriteTokens: 0,
						cacheReadTokens: chunk.usage.prompt_tokens_details?.cached_tokens || 0,
						inputTokens: input,
						outputTokens: output,
						totalCost: cost ? cost : (input / 1000000) * inputPrice + (output / 1000000) * outputPrice,
					}
				}
			}
		} catch (e) {
			console.log(e)
			throw e
		}
	}

	private async *createResponseStream(
		systemPrompt: string,
		messages: ClineStorageMessage[],
		tools: ChatCompletionTool[],
	): ApiStream {
		const client = await this.ensureClient()
		const model = this.getModel()

		try {
			// Convert messages to Responses API input format
			const input = convertToOpenAIResponsesInput(messages)

			// Convert ChatCompletion tools to Responses API format if provided
			const responseTools = tools
				?.filter((tool) => tool.type === "function")
				.map((tool: any) => ({
					type: "function" as const,
					name: tool.function.name,
					description: tool.function.description,
					parameters: tool.function.parameters,
					strict: tool.function.strict ?? true, // Responses API defaults to strict mode
				}))

			Logger.debug("OpenAI Responses Input: " + JSON.stringify(input))

			// const lastAssistantMessage = [...messages].reverse().find((msg) => msg.role === "assistant" && msg.id)
			// const previous_response_id = lastAssistantMessage?.id

			// Create the response using Responses API
			const stream = await client.responses.create({
				model: model.id,
				instructions: systemPrompt,
				input,
				stream: true,
				tools: responseTools,
				// previous_response_id,
				// store: true,
				reasoning: { effort: "medium", summary: "auto" },
				// include: ["reasoning.encrypted_content"],
			})

			// Process the response stream
			for await (const chunk of stream) {
				Logger.debug("OpenAI Responses Chunk: " + JSON.stringify(chunk))

				// Handle different event types from Responses API
				if (chunk.type === "response.output_item.added") {
					const item = chunk.item
					if (item.type === "function_call" && item.id) {
						yield {
							type: "tool_calls",
							id: item.id,
							tool_call: {
								call_id: item.call_id,
								function: {
									id: item.id,
									name: item.name,
									arguments: item.arguments,
								},
							},
						}
					}
					if (item.type === "reasoning" && item.encrypted_content && item.id) {
						yield {
							type: "reasoning",
							id: item.id,
							reasoning: "",
							redacted_data: item.encrypted_content,
						}
					}
				}
				if (chunk.type === "response.output_item.done") {
					const item = chunk.item
					if (item.type === "function_call") {
						yield {
							type: "tool_calls",
							id: item.id || item.call_id,
							tool_call: {
								call_id: item.call_id,
								function: {
									id: item.id,
									name: item.name,
									arguments: item.arguments,
								},
							},
						}
					}
					if (item.type === "reasoning") {
						yield {
							type: "reasoning",
							id: item.id,
							details: item.summary,
							reasoning: "",
						}
					}
				}
				if (chunk.type === "response.reasoning_summary_part.added") {
					yield {
						type: "reasoning",
						id: chunk.item_id,
						reasoning: chunk.part.text,
					}
				}
				if (chunk.type === "response.reasoning_summary_text.delta") {
					yield {
						type: "reasoning",
						id: chunk.item_id,
						reasoning: chunk.delta,
					}
				}
				if (chunk.type === "response.reasoning_summary_part.done") {
					yield {
						type: "reasoning",
						id: chunk.item_id,
						details: chunk.part,
						reasoning: "",
					}
				}
				if (chunk.type === "response.output_text.delta") {
					// Handle text content deltas
					if (chunk.delta) {
						yield {
							id: chunk.item_id,
							type: "text",
							text: chunk.delta,
						}
					}
				}
				if (chunk.type === "response.reasoning_text.delta") {
					// Handle reasoning content deltas
					if (chunk.delta) {
						yield {
							id: chunk.item_id,
							type: "reasoning",
							reasoning: chunk.delta,
						}
					}
				}
				if (chunk.type === "response.function_call_arguments.delta") {
					yield {
						type: "tool_calls",
						tool_call: {
							function: {
								id: chunk.item_id,
								name: chunk.item_id,
								arguments: chunk.delta,
							},
						},
					}
				}
				if (chunk.type === "response.function_call_arguments.done") {
					// Handle completed function call
					if (chunk.item_id && chunk.name && chunk.arguments) {
						yield {
							type: "tool_calls",
							tool_call: {
								function: {
									id: chunk.item_id,
									name: chunk.name,
									arguments: chunk.arguments,
								},
							},
						}
					}
				}

				if (
					chunk.type === "response.incomplete" &&
					chunk.response?.status === "incomplete" &&
					chunk.response?.incomplete_details?.reason === "max_output_tokens"
				) {
					console.log("Ran out of tokens")
					if (chunk.response?.output_text?.length > 0) {
						console.log("Partial output:", chunk.response.output_text)
					} else {
						console.log("Ran out of tokens during reasoning")
					}
				}

				if (chunk.type === "response.completed" && chunk.response?.usage) {
					// Handle usage information when response is complete
					const usage = chunk.response.usage
					const inputTokens = usage.input_tokens || 0
					const outputTokens = usage.output_tokens || 0
					const cacheReadTokens = usage.output_tokens_details?.reasoning_tokens || 0
					const cacheWriteTokens = usage.input_tokens_details?.cached_tokens || 0
					const totalTokens = usage.total_tokens || 0
					Logger.log(`Total tokens from Responses API usage: ${totalTokens}`)
					const totalCost = calculateApiCostOpenAI(
						model.info,
						inputTokens,
						outputTokens,
						cacheWriteTokens,
						cacheReadTokens,
					)
					const nonCachedInputTokens = Math.max(0, inputTokens - cacheReadTokens - cacheWriteTokens)
					yield {
						type: "usage",
						inputTokens: nonCachedInputTokens,
						outputTokens: outputTokens,
						cacheWriteTokens: cacheWriteTokens,
						cacheReadTokens: cacheReadTokens,
						totalCost: totalCost,
						id: chunk.response.id,
					}
				}
			}
		} catch (e) {
			console.error("ShengSuanYun Responses API Error:", e)
			throw e
		}
	}

	getModel(): { id: string; info: ShengSuanYunModelInfo } {
		const modelId = this.options.shengSuanYunModelId
		const modelInfo = this.options.shengSuanYunModelInfo
		if (modelId && modelInfo) {
			return { id: modelId, info: modelInfo }
		}
		return { id: shengSuanYunDefaultModelId, info: shengSuanYunDefaultModelInfo as ShengSuanYunModelInfo }
	}
}
