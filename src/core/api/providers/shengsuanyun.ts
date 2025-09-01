import { Anthropic } from "@anthropic-ai/sdk"
import OpenAI from "openai"
import * as vscode from "vscode"
import { shouldSkipReasoningForModel } from "@/utils/model-utils"
import { ModelInfo, shengSuanYunDefaultModelId, shengSuanYunDefaultModelInfo } from "../../../shared/api"
import { ApiHandler, CommonApiHandlerOptions } from "../"
import { withRetry } from "../retry"
import { createOpenRouterStream } from "../transform/openrouter-stream"
import { ApiStream } from "../transform/stream"
import { OpenRouterErrorResponse } from "./types"

interface ShengSuanYunHandlerOptions extends CommonApiHandlerOptions {
	shengSuanYunApiKey?: string
	reasoningEffort?: string
	thinkingBudgetTokens?: number
	shengSuanYunModelId?: string
	shengSuanYunModelInfo?: ModelInfo
}

export class ShengSuanYunHandler implements ApiHandler {
	private options: ShengSuanYunHandlerOptions
	private client: OpenAI | undefined
	lastGenerationId?: string

	constructor(options: ShengSuanYunHandlerOptions) {
		this.options = options
	}

	private ensureClient(): OpenAI {
		if (!this.client) {
			if (!this.options.shengSuanYunApiKey) {
				throw new Error("shengsuanyun API key is required")
			}
			try {
				this.client = new OpenAI({
					baseURL: "https://router.shengsuanyun.com/api/v1",
					apiKey: this.options.shengSuanYunApiKey,
					defaultHeaders: {
						"HTTP-Referer": `${vscode.env.uriScheme || "vscode"}://shengsuan-cloud.cline-shengsuan/ssy`,
						"X-Title": "ClineShengsuan",
					},
				})
			} catch (error: any) {
				throw new Error(`Error creating OpenRouter client: ${error.message}`)
			}
		}
		return this.client
	}

	@withRetry()
	async *createMessage(systemPrompt: string, messages: Anthropic.Messages.MessageParam[]): ApiStream {
		const client = this.ensureClient()
		this.lastGenerationId = undefined
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

			let didOutputUsage: boolean = false
			let lastChunk: any = {}
			for await (const chunk of stream) {
				// openrouter returns an error object instead of the openai sdk throwing an error
				if ("error" in chunk) {
					const error = chunk.error as OpenRouterErrorResponse["error"]
					console.error(`ShengSuanYun API Error: ${error?.code} - ${error?.message}`)
					// Include metadata in the error message if available
					const metadataStr = error.metadata ? `\nMetadata: ${JSON.stringify(error.metadata, null, 2)}` : ""
					throw new Error(`ShengSuanYun API Error ${error.code}: ${error.message}${metadataStr}`)
				}
				if (!chunk.choices || chunk.choices.length === 0) {
					console.error("shengSuanYun stream chunk:", chunk)
					continue
				}

				lastChunk = chunk
				// console.log(JSON.stringify(chunk, null, 2))

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
						throw new Error(`ShengSuanYun Mid-Stream Error: ${errorDetails}`)
					} else {
						// Fallback if error details are not available
						throw new Error(
							`ShengSuanYun Mid-Stream Error: Stream terminated with error status but no error details provided`,
						)
					}
				}

				if (!this.lastGenerationId && chunk.id) {
					this.lastGenerationId = chunk.id
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
						// @ts-ignore-next-line
						reasoning: delta.reasoning,
					}
				}
				if (!didOutputUsage && chunk.usage) {
					yield {
						type: "usage",
						cacheWriteTokens: 0,
						cacheReadTokens: chunk.usage.prompt_tokens_details?.cached_tokens || 0,
						inputTokens: (chunk.usage.prompt_tokens || 0) - (chunk.usage.prompt_tokens_details?.cached_tokens || 0),
						outputTokens: chunk.usage.completion_tokens || 0,
						// @ts-ignore-next-line
						totalCost: (chunk.usage.cost || 0) + (chunk.usage.cost_details?.upstream_inference_cost || 0),
					}
					didOutputUsage = true
				}
			}
			// Fallback to generation endpoint if usage chunk not returned ; NotImplemented yet
			if (!didOutputUsage) {
				console.log("ShengSuanYunHandler.createMessage -- lastChunk", JSON.stringify(lastChunk, null, 2))
				// const apiStreamUsage = await this.getApiStreamUsage()
				// if (apiStreamUsage) {
				// 	yield apiStreamUsage
				// }
			}
		} catch (e) {
			console.error("ShengSuanYunHandler.createMessage(): ", e)
			console.log(client, this.options)
			throw e
		}
	}

	getModel(): { id: string; info: ModelInfo } {
		const modelId = this.options.shengSuanYunModelId
		const modelInfo = this.options.shengSuanYunModelInfo
		if (modelId && modelInfo) {
			return { id: modelId, info: modelInfo }
		}
		return { id: shengSuanYunDefaultModelId, info: shengSuanYunDefaultModelInfo }
	}
}
