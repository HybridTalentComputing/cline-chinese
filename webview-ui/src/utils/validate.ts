import { ApiConfiguration, ModelInfo, openRouterDefaultModelId } from "@shared/api"
import { Mode } from "@shared/storage/types"
import { getModeSpecificFields } from "@/components/settings/utils/providerUtils"

export function validateApiConfiguration(currentMode: Mode, apiConfiguration?: ApiConfiguration): string | undefined {
	if (apiConfiguration) {
		const { apiProvider, openAiModelId, togetherModelId, ollamaModelId, lmStudioModelId, vsCodeLmModelSelector } =
			getModeSpecificFields(apiConfiguration, currentMode)

		const tips = "您必须提供有效的API密钥或选择其他提供者。"
		switch (apiProvider) {
			case "anthropic":
				if (!apiConfiguration.apiKey) {
					return tips
				}
				break
			case "bedrock":
				if (!apiConfiguration.awsRegion) {
					return "您必须选择一个区域以使用 AWS Bedrock。"
				}
				break
			case "openrouter":
				if (!apiConfiguration.openRouterApiKey) {
					return tips
				}
				break
			case "vertex":
				if (!apiConfiguration.vertexProjectId || !apiConfiguration.vertexRegion) {
					return "您必须提供有效的 Google Cloud 项目 ID 和区域。"
				}
				break
			case "gemini":
				if (!apiConfiguration.geminiApiKey) {
					return tips
				}
				break
			case "openai-native":
				if (!apiConfiguration.openAiNativeApiKey) {
					return tips
				}
				break
			case "deepseek":
				if (!apiConfiguration.deepSeekApiKey) {
					return tips
				}
				break
			case "xai":
				if (!apiConfiguration.xaiApiKey) {
					return tips
				}
				break
			case "qwen":
				if (!apiConfiguration.qwenApiKey) {
					return tips
				}
				break
			case "doubao":
				if (!apiConfiguration.doubaoApiKey) {
					return tips
				}
				break
			case "mistral":
				if (!apiConfiguration.mistralApiKey) {
					return tips
				}
				break
			case "cline":
				break
			case "openai":
				if (!apiConfiguration.openAiBaseUrl || !apiConfiguration.openAiApiKey || !openAiModelId) {
					return "您必须提供一个有效的基本网址、API 密钥和模型 ID。"
				}
				break
			case "requesty":
				if (!apiConfiguration.requestyApiKey) {
					return tips
				}
				break
			case "fireworks":
				if (!apiConfiguration.fireworksApiKey) {
					return tips
				}
				break
			case "together":
				if (!apiConfiguration.togetherApiKey || !togetherModelId) {
					return tips
				}
				break
			case "ollama":
				if (!ollamaModelId) {
					return "您必须提供一个有效的模型 ID。"
				}
				break
			case "lmstudio":
				if (!lmStudioModelId) {
					return "您必须提供一个有效的模型 ID。"
				}
				break
			case "vscode-lm":
				if (!vsCodeLmModelSelector) {
					return "您必须提供一个有效的模型 ID。"
				}
				break
			case "moonshot":
				if (!apiConfiguration.moonshotApiKey) {
					return tips
				}
				break
			case "nebius":
				if (!apiConfiguration.nebiusApiKey) {
					return tips
				}
				break
			case "asksage":
				if (!apiConfiguration.asksageApiKey) {
					return tips
				}
				break
			case "sambanova":
				if (!apiConfiguration.sambanovaApiKey) {
					return tips
				}
				break
			case "shengsuanyun":
				if (!apiConfiguration.shengSuanYunApiKey) {
					return tips
				}
				break
			case "sapaicore":
				if (!apiConfiguration.sapAiCoreBaseUrl) {
					return "您必须提供有效的 URL 密钥或选择其他提供者。"
				}
				if (!apiConfiguration.sapAiCoreClientId) {
					return "您必须提供有效的客户端ID密钥或选择其他提供者。"
				}
				if (!apiConfiguration.sapAiCoreClientSecret) {
					return "您必须提供有效的客户端密钥或选择其他提供者。"
				}
				if (!apiConfiguration.sapAiCoreTokenUrl) {
					return "您必须提供有效的用户认证URL或选择其他提供者。"
				}
				break
			case "zai":
				if (!apiConfiguration.zaiApiKey) {
					return tips
				}
				break
			case "dify":
				if (!apiConfiguration.difyBaseUrl) {
					return tips
				}
				if (!apiConfiguration.difyApiKey) {
					return tips
				}
				break
			case "minimax":
				if (!apiConfiguration.minimaxApiKey) {
					return "You must provide a valid API key or choose a different provider."
				}
				break
			case "hicap":
				if (!apiConfiguration.hicapApiKey) {
					return "You must provide a valid API key"
				}
				break
		}
	}
	return undefined
}

export function validateModelId(
	currentMode: Mode,
	apiConfiguration?: ApiConfiguration,
	openRouterModels?: Record<string, ModelInfo>,
): string | undefined {
	if (apiConfiguration) {
		const { apiProvider, openRouterModelId } = getModeSpecificFields(apiConfiguration, currentMode)
		switch (apiProvider) {
			case "openrouter":
			case "cline":
				const modelId = openRouterModelId || openRouterDefaultModelId // in case the user hasn't changed the model id, it will be undefined by default
				if (!modelId) {
					return "你必须提供一个可用的模型 ID."
				}
				if (modelId.startsWith("@preset/")) {
					break
				}
				if (openRouterModels && !Object.keys(openRouterModels).includes(modelId)) {
					// even if the model list endpoint failed, extensionstatecontext will always have the default model info
					return "模型 ID 无效，请选择其他模型."
				}
				break
		}
	}
	return undefined
}
