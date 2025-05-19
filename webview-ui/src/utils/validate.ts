import { ApiConfiguration, openRouterDefaultModelId, ModelInfo } from "@shared/api"

export function validateApiConfiguration(apiConfiguration?: ApiConfiguration): string | undefined {
	if (apiConfiguration) {
		switch (apiConfiguration.apiProvider) {
			case "anthropic":
				if (!apiConfiguration.apiKey) {
					return "您必须提供有效的 API 密钥或选择其他提供商。"
				}
				break
			case "bedrock":
				if (!apiConfiguration.awsRegion) {
					return "您必须选择一个区域才能使用 AWS Bedrock。"
				}
				break
			case "openrouter":
				if (!apiConfiguration.openRouterApiKey) {
					return "您必须提供有效的 API 密钥或选择其他提供商。"
				}
				break
			case "vertex":
				if (!apiConfiguration.vertexProjectId || !apiConfiguration.vertexRegion) {
					return "您必须提供有效的 Google Cloud 项目 ID 和区域。"
				}
				break
			case "gemini":
				if (!apiConfiguration.geminiApiKey) {
					return "您必须提供有效的 API 密钥或选择其他提供商。"
				}
				break
			case "openai-native":
				if (!apiConfiguration.openAiNativeApiKey) {
					return "您必须提供有效的 API 密钥或选择其他提供商。"
				}
				break
			case "deepseek":
				if (!apiConfiguration.deepSeekApiKey) {
					return "您必须提供有效的 API 密钥或选择其他提供商。"
				}
				break
			case "xai":
				if (!apiConfiguration.xaiApiKey) {
					return "您必须提供有效的 API 密钥或选择其他提供商。"
				}
				break
			case "qwen":
				if (!apiConfiguration.qwenApiKey) {
					return "You must provide a valid API key or choose a different provider."
				}
				break
			case "doubao":
				if (!apiConfiguration.doubaoApiKey) {
					return "You must provide a valid API key or choose a different provider."
				}
				break
			case "mistral":
				if (!apiConfiguration.mistralApiKey) {
					return "您必须提供有效的 API 密钥或选择其他提供商。"
				}
				break
			case "cline":
				if (!apiConfiguration.clineApiKey) {
					return "您必须提供有效的 API 密钥或选择其他提供商。"
				}
				break
			case "openai":
				if (!apiConfiguration.openAiBaseUrl || !apiConfiguration.openAiApiKey || !apiConfiguration.openAiModelId) {
					return "您必须提供有效的基本 URL、API 密钥和模型 ID。"
				}
				break
			case "requesty":
				if (!apiConfiguration.requestyApiKey || !apiConfiguration.requestyModelId) {
					return "You must provide a valid API key or choose a different provider."
				}
				break
			case "fireworks":
				if (!apiConfiguration.fireworksApiKey || !apiConfiguration.fireworksModelId) {
					return "You must provide a valid API key or choose a different provider."
				}
				break
			case "together":
				if (!apiConfiguration.togetherApiKey || !apiConfiguration.togetherModelId) {
					return "您必须提供有效的 API 密钥或选择其他提供商。"
				}
				break
			case "ollama":
				if (!apiConfiguration.ollamaModelId) {
					return "您必须提供有效的模型 ID。"
				}
				break
			case "lmstudio":
				if (!apiConfiguration.lmStudioModelId) {
					return "您必须提供有效的模型 ID。"
				}
				break
			case "vscode-lm":
				if (!apiConfiguration.vsCodeLmModelSelector) {
					return "您必须提供有效的模型选择器。"
				}
				break
			case "dify":
				if (!apiConfiguration.difyApiKey || !apiConfiguration.difyBaseUrl) {
					return "您必须同时提供有效的 API 密钥和基本 URL。"
				}
				break
			case "asksage":
				if (!apiConfiguration.asksageApiKey) {
					return "您必须提供有效的 API 密钥或选择其他提供商。"
				}
				break
			case "sambanova":
				if (!apiConfiguration.sambanovaApiKey) {
					return "您必须提供有效的 API 密钥或选择其他提供商。"
				}
				break
		}
	}
	return undefined
}

export function validateModelId(
	apiConfiguration?: ApiConfiguration,
	openRouterModels?: Record<string, ModelInfo>,
): string | undefined {
	if (apiConfiguration) {
		switch (apiConfiguration.apiProvider) {
			case "openrouter":
			case "cline":
				const modelId = apiConfiguration.openRouterModelId || openRouterDefaultModelId // in case the user hasn't changed the model id, it will be undefined by default
				if (!modelId) {
					return "您必须提供模型 ID。"
				}
				if (openRouterModels && !Object.keys(openRouterModels).includes(modelId)) {
					// 即使模型列表端点失败，extensionstatecontext 也将始终具有默认模型信息
					return "您提供的模型 ID 不可用。请选择其他模型。"
				}
				break
		}
	}
	return undefined
}
