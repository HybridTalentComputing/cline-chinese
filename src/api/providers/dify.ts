import { Anthropic } from "@anthropic-ai/sdk"
import { ApiConfiguration, ApiHandlerOptions, ModelInfo, difyModels } from "../../shared/api"
import { getApiMetrics } from "../../shared/getApiMetrics"
import { ApiHandler } from ".."
import { ApiStream, ApiStreamChunk } from "../transform/stream"

export class DifyHandler implements ApiHandler {
	private readonly baseUrl: string
	private readonly apiKey: string
	private readonly modelInfo: ModelInfo

	constructor(options: ApiHandlerOptions) {
		if (!options.difyBaseUrl) {
			throw new Error("需要 Dify 基础 URL")
		}
		if (!options.difyApiKey) {
			throw new Error("需要 Dify API 密钥")
		}

		this.baseUrl = options.difyBaseUrl.replace(/\/$/, "") // 如果存在，则删除末尾的斜杠
		this.apiKey = options.difyApiKey
		this.modelInfo = difyModels["dify-default"]
	}

	async *createMessage(systemPrompt: string, messages: Anthropic.Messages.MessageParam[]): ApiStream {
		if (!messages || messages.length === 0) {
			throw new Error("未提供消息")
		}

		const lastMessage = messages[messages.length - 1]
		console.log("最后一条消息:", lastMessage)

		// 将消息转换为 Dify 格式
		const query =
			`${systemPrompt}\n\n` +
			"# UserTask" +
			messages
				.map((msg) => {
					if (typeof msg === "string") {
						return msg
					}

					if (msg.content) {
						if (Array.isArray(msg.content)) {
							return msg.content
								.map((part) => {
									if (typeof part === "string") {
										return part
									}
									if (typeof part === "object") {
										switch (part.type) {
											case "text":
												return part.text
											case "image":
												console.warn("Dify 不支持图像输入")
												return ""
											case "tool_result":
												return typeof part.content === "string"
													? part.content
													: Array.isArray(part.content)
														? part.content
																.filter((p) => p.type === "text")
																.map((p) => p.text)
																.join("\n")
														: ""
										}
									}
									return ""
								})
								.filter(Boolean)
								.join("\n")
						}
						return typeof msg.content === "string" ? msg.content : ""
					}
					return ""
				})
				.join("\n\n")

		if (!query) {
			throw new Error("查询是必需的")
		}

		console.log("正在向 Dify 发送查询:", query)

		const response = await fetch(`${this.baseUrl}/v1/chat-messages`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${this.apiKey}`,
			},
			body: JSON.stringify({
				query,
				user: "vscode-user",
				inputs: {},
				response_mode: "streaming",
				conversation_id: "", // 可选，用于继续之前的对话
				files: [], // 可选，用于文件输入
				auto_generate_name: true, // 可选，用于自动生成对话标题
			}),
		})

		if (!response.ok) {
			const error = await response.text()
			console.error("Dify API 错误响应:", error)
			throw new Error(`Dify API 错误: ${error}`)
		}

		if (!response.body) {
			throw new Error("无响应正文")
		}

		const reader = response.body.getReader()
		const decoder = new TextDecoder()
		let buffer = ""

		try {
			while (true) {
				const { value, done } = await reader.read()
				if (done) {
					break
				}

				const chunk = decoder.decode(value)
				buffer += chunk

				// 将缓冲区拆分为行并处理每个完整的行
				const lines = buffer.split("\n")
				// 将最后可能不完整的行保留在缓冲区中
				buffer = lines.pop() || ""

				for (const line of lines) {
					const trimmedLine = line.trim()
					if (!trimmedLine || !trimmedLine.startsWith("data: ")) {
						continue
					}

					try {
						const jsonStr = trimmedLine.slice(6)
						const data = JSON.parse(jsonStr)

						if (data.event === "message") {
							// 处理消息事件
							yield {
								type: "text",
								text: data.answer || "",
							} as ApiStreamChunk
						} else if (data.event === "error") {
							// 处理错误事件
							console.error("Dify 流式传输错误:", data.message)
							throw new Error(`Dify 流式传输错误: ${data.message}`)
						} else if (data.event === "message_end") {
							// 处理消息结束事件 - 可能包含令牌使用情况（如果可用）
							console.log("Dify 消息结束:", data)
						}
					} catch (e) {
						if (e instanceof SyntaxError) {
							console.warn("流中的 JSON 无效:", trimmedLine)
						} else {
							throw e
						}
					}
				}
			}

			// 处理缓冲区中任何剩余的数据
			if (buffer.trim()) {
				if (buffer.startsWith("data: ")) {
					try {
						const data = JSON.parse(buffer.slice(6))
						if (data.event === "message") {
							yield {
								type: "text",
								text: data.answer || "",
							} as ApiStreamChunk
						}
					} catch (e) {
						console.warn("解析剩余缓冲区时出错:", e)
					}
				} else {
					// 不执行任何操作
				}
			}
		} finally {
			reader.releaseLock()
		}
	}

	getModel(): { id: string; info: ModelInfo } {
		return {
			id: "dify-default",
			info: this.modelInfo,
		}
	}
}
