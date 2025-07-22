import { ApiConfiguration, openRouterDefaultModelId, ModelInfo } from "@shared/api"
import { getModeSpecificFields } from "@/components/settings/utils/providerUtils"
import { Mode } from "@shared/ChatSettings"

export function validateApiConfiguration(currentMode: Mode, apiConfiguration?: ApiConfiguration): string | undefined {
	if (apiConfiguration) {
		const {
			apiProvider,
			openAiModelId,
			requestyModelId,
			fireworksModelId,
			togetherModelId,
			ollamaModelId,
			lmStudioModelId,
			vsCodeLmModelSelector,
		} = getModeSpecificFields(apiConfiguration, currentMode)

		switch (apiProvider) {
			case "anthropic":
				if (!apiConfiguration.apiKey) {
					return "您必须提供有效的API密钥或选择其他提供者。"
				}
				break
			case "bedrock":
				if (!apiConfiguration.awsRegion) {
					return "您必须选择一个区域以使用 AWS Bedrock。"
				}
				break
			case "openrouter":
				if (!apiConfiguration.openRouterApiKey) {
					return "您必须提供有效的API密钥或选择其他提供者。"
				}
				break
			case "vertex":
				if (!apiConfiguration.vertexProjectId || !apiConfiguration.vertexRegion) {
					return "您必须提供有效的 Google Cloud 项目 ID 和区域。"
				}
				break
			case "gemini":
				if (!apiConfiguration.geminiApiKey) {
					return "您必须提供有效的API密钥或选择其他提供者。"
				}
				break
			case "openai-native":
				if (!apiConfiguration.openAiNativeApiKey) {
					return "您必须提供有效的API密钥或选择其他提供者。"
				}
				break
			case "deepseek":
				if (!apiConfiguration.deepSeekApiKey) {
					return "您必须提供有效的API密钥或选择其他提供者。"
				}
				break
			case "xai":
				if (!apiConfiguration.xaiApiKey) {
					return "您必须提供有效的API密钥或选择其他提供者。"
				}
				break
			case "qwen":
				if (!apiConfiguration.qwenApiKey) {
					return "您必须提供有效的API密钥或选择其他提供者。"
				}
				break
			case "doubao":
				if (!apiConfiguration.doubaoApiKey) {
					return "您必须提供有效的API密钥或选择其他提供者。"
				}
				break
			case "mistral":
				if (!apiConfiguration.mistralApiKey) {
					return "您必须提供有效的API密钥或选择其他提供者。"
				}
				break
			case "cline":
				if (!apiConfiguration.clineAccountId) {
					return "You must provide a valid API key or choose a different provider."
				}
				break
			case "openai":
				if (!apiConfiguration.openAiBaseUrl || !apiConfiguration.openAiApiKey || !openAiModelId) {
					return "您必须提供一个有效的基本网址、API 密钥和模型 ID。"
				}
				break
			case "requesty":
				if (!apiConfiguration.requestyApiKey || !requestyModelId) {
					return "您必须提供一个有效的 API密钥"
				}
				break
			case "fireworks":
				if (!apiConfiguration.fireworksApiKey || !fireworksModelId) {
					return "您必须提供一个有效的 API密钥"
				}
				break
			case "together":
				if (!apiConfiguration.togetherApiKey || !togetherModelId) {
					return "您必须提供一个有效的 API密钥"
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
					return "You must provide a valid API key or choose a different provider."
				}
				break
			case "nebius":
				if (!apiConfiguration.nebiusApiKey) {
					return "您必须提供有效的API密钥或选择其他提供者。"
				}
				break
			case "asksage":
				if (!apiConfiguration.asksageApiKey) {
					return "您必须提供有效的API密钥或选择其他提供者。"
				}
				break
			case "sambanova":
				if (!apiConfiguration.sambanovaApiKey) {
					return "您必须提供有效的API密钥或选择其他提供者。"
				}
				break
			case "shengsuanyun":
				if (!apiConfiguration.shengSuanYunApiKey) {
					return "您必须提供有效的API密钥或选择其他提供者。"
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
					return "You must provide a model ID."
				}
				if (openRouterModels && !Object.keys(openRouterModels).includes(modelId)) {
					// even if the model list endpoint failed, extensionstatecontext will always have the default model info
					return "The model ID you provided is not available. Please choose a different model."
				}
				break
		}
	}
	return undefined
}
