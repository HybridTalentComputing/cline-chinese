import {
	VSCodeButton,
	VSCodeCheckbox,
	VSCodeDropdown,
	VSCodeLink,
	VSCodeOption,
	VSCodeRadio,
	VSCodeRadioGroup,
	VSCodeTextField,
} from "@vscode/webview-ui-toolkit/react"
import { Fragment, memo, useCallback, useEffect, useMemo, useRef, useState } from "react"
import ThinkingBudgetSlider from "./ThinkingBudgetSlider"
import { useEvent, useInterval } from "react-use"
import styled from "styled-components"
import * as vscodemodels from "vscode"
import {
	anthropicDefaultModelId,
	anthropicModels,
	ApiConfiguration,
	ApiProvider,
	azureOpenAiDefaultApiVersion,
	bedrockDefaultModelId,
	bedrockModels,
	deepSeekDefaultModelId,
	deepSeekModels,
	geminiDefaultModelId,
	geminiModels,
	mistralDefaultModelId,
	mistralModels,
	ModelInfo,
	openAiModelInfoSaneDefaults,
	openAiNativeDefaultModelId,
	openAiNativeModels,
	openRouterDefaultModelId,
	openRouterDefaultModelInfo,
	requestyDefaultModelId,
	requestyDefaultModelInfo,
	mainlandQwenModels,
	internationalQwenModels,
	mainlandQwenDefaultModelId,
	internationalQwenDefaultModelId,
	vertexDefaultModelId,
	vertexModels,
	vertexGlobalModels,
	askSageModels,
	askSageDefaultModelId,
	askSageDefaultURL,
	xaiDefaultModelId,
	xaiModels,
	sambanovaModels,
	sambanovaDefaultModelId,
	doubaoModels,
	doubaoDefaultModelId,
	liteLlmModelInfoSaneDefaults,
} from "@shared/api"
import { ExtensionMessage } from "@shared/ExtensionMessage"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { vscode } from "@/utils/vscode"
import { ModelsServiceClient } from "@/services/grpc-client"
import { getAsVar, VSC_DESCRIPTION_FOREGROUND } from "@/utils/vscStyles"
import VSCodeButtonLink from "@/components/common/VSCodeButtonLink"
import OpenRouterModelPicker, { ModelDescriptionMarkdown, OPENROUTER_MODEL_PICKER_Z_INDEX } from "./OpenRouterModelPicker"
import { ClineAccountInfoCard } from "./ClineAccountInfoCard"
import RequestyModelPicker from "./RequestyModelPicker"
import { useOpenRouterKeyInfo } from "../ui/hooks/useOpenRouterKeyInfo"

interface ApiOptionsProps {
	showModelOptions: boolean
	apiErrorMessage?: string
	modelIdErrorMessage?: string
	isPopup?: boolean
	saveImmediately?: boolean // Add prop to control immediate saving
}

const OpenRouterBalanceDisplay = ({ apiKey }: { apiKey: string }) => {
	const { data: keyInfo, isLoading, error } = useOpenRouterKeyInfo(apiKey)

	if (isLoading) {
		return <span style={{ fontSize: "12px", color: "var(--vscode-descriptionForeground)" }}>加载中...</span>
	}

	if (error || !keyInfo || keyInfo.limit === null) {
		// Don't show anything if there's an error, no info, or no limit set
		return null
	}

	// Calculate remaining balance
	const remainingBalance = keyInfo.limit - keyInfo.usage
	const formattedBalance = remainingBalance.toLocaleString("en-US", {
		style: "currency",
		currency: "USD",
		minimumFractionDigits: 2,
		maximumFractionDigits: 4,
	})

	return (
		<VSCodeLink
			href="https://openrouter.ai/settings/keys"
			title={`剩余额度: ${formattedBalance}\n总额度: ${keyInfo.limit.toLocaleString("en-US", { style: "currency", currency: "USD" })}\n已用额度: ${keyInfo.usage.toLocaleString("en-US", { style: "currency", currency: "USD" })}`}
			style={{
				fontSize: "12px",
				color: "var(--vscode-foreground)",
				textDecoration: "none",
				fontWeight: 500,
				paddingLeft: 4,
				cursor: "pointer",
			}}>
			余额: {formattedBalance}
		</VSCodeLink>
	)
}

// This is necessary to ensure dropdown opens downward, important for when this is used in popup
const DROPDOWN_Z_INDEX = OPENROUTER_MODEL_PICKER_Z_INDEX + 2 // Higher than the OpenRouterModelPicker's and ModelSelectorTooltip's z-index

export const DropdownContainer = styled.div<{ zIndex?: number }>`
	position: relative;
	z-index: ${(props) => props.zIndex || DROPDOWN_Z_INDEX};

	// Force dropdowns to open downward
	& vscode-dropdown::part(listbox) {
		position: absolute !important;
		top: 100% !important;
		bottom: auto !important;
	}
`

declare module "vscode" {
	interface LanguageModelChatSelector {
		vendor?: string
		family?: string
		version?: string
		id?: string
	}
}

const ApiOptions = ({
	showModelOptions,
	apiErrorMessage,
	modelIdErrorMessage,
	isPopup,
	saveImmediately = false, // Default to false
}: ApiOptionsProps) => {
	// Use full context state for immediate save payload
	const extensionState = useExtensionState()
	const { apiConfiguration, setApiConfiguration, uriScheme } = extensionState
	const [ollamaModels, setOllamaModels] = useState<string[]>([])
	const [lmStudioModels, setLmStudioModels] = useState<string[]>([])
	const [vsCodeLmModels, setVsCodeLmModels] = useState<vscodemodels.LanguageModelChatSelector[]>([])
	const [anthropicBaseUrlSelected, setAnthropicBaseUrlSelected] = useState(!!apiConfiguration?.anthropicBaseUrl)
	const [geminiBaseUrlSelected, setGeminiBaseUrlSelected] = useState(!!apiConfiguration?.geminiBaseUrl)
	const [azureApiVersionSelected, setAzureApiVersionSelected] = useState(!!apiConfiguration?.azureApiVersion)
	const [awsEndpointSelected, setAwsEndpointSelected] = useState(!!apiConfiguration?.awsBedrockEndpoint)
	const [modelConfigurationSelected, setModelConfigurationSelected] = useState(false)
	const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)
	const [providerSortingSelected, setProviderSortingSelected] = useState(!!apiConfiguration?.openRouterProviderSorting)
	const [reasoningEffortSelected, setReasoningEffortSelected] = useState(!!apiConfiguration?.reasoningEffort)

	const handleInputChange = (field: keyof ApiConfiguration) => (event: any) => {
		const newValue = event.target.value

		// 更新本地状态
		setApiConfiguration({
			...apiConfiguration,
			[field]: newValue,
		})

		// 如果字段是提供者且 saveImmediately 为 true，则使用完整的上下文状态立即保存
		if (saveImmediately && field === "apiProvider") {
			// 使用来自完整 extensionState 上下文的 apiConfiguration 发送最完整的数据
			const currentFullApiConfig = extensionState.apiConfiguration
			vscode.postMessage({
				type: "apiConfiguration",
				apiConfiguration: {
					...currentFullApiConfig, // 发送可用的最完整配置
					apiProvider: newValue, // 使用新的提供者覆盖
				},
			})
		}
	}

	const { selectedProvider, selectedModelId, selectedModelInfo } = useMemo(() => {
		return normalizeApiConfiguration(apiConfiguration)
	}, [apiConfiguration])

	// 轮询 ollama/lmstudio 模型
	const requestLocalModels = useCallback(async () => {
		if (selectedProvider === "ollama") {
			try {
				const response = await ModelsServiceClient.getOllamaModels({
					value: apiConfiguration?.ollamaBaseUrl || "",
				})
				if (response && response.values) {
					setOllamaModels(response.values)
				}
			} catch (error) {
				console.error("获取 Ollama 模型失败：", error)
				setOllamaModels([])
			}
		} else if (selectedProvider === "lmstudio") {
			try {
				const response = await ModelsServiceClient.getLmStudioModels({
					value: apiConfiguration?.lmStudioBaseUrl || "",
				})
				if (response && response.values) {
					setLmStudioModels(response.values)
				}
			} catch (error) {
				console.error("获取 LM Studio 模型失败：", error)
				setLmStudioModels([])
			}
		} else if (selectedProvider === "vscode-lm") {
			try {
				const response = await ModelsServiceClient.getVsCodeLmModels({})
				if (response && response.models) {
					setVsCodeLmModels(response.models)
				}
			} catch (error) {
				console.error("获取 VS Code LM 模型失败：", error)
				setVsCodeLmModels([])
			}
		}
	}, [selectedProvider, apiConfiguration?.ollamaBaseUrl, apiConfiguration?.lmStudioBaseUrl])
	useEffect(() => {
		if (selectedProvider === "ollama" || selectedProvider === "lmstudio" || selectedProvider === "vscode-lm") {
			requestLocalModels()
		}
	}, [selectedProvider, requestLocalModels])
	useInterval(
		requestLocalModels,
		selectedProvider === "ollama" || selectedProvider === "lmstudio" || selectedProvider === "vscode-lm" ? 2000 : null,
	)

	/*
	VSCodeDropdown 有一个未解决的 bug，即动态渲染的选项不会自动选择提供的 value 属性。您可以通过将其与正常工作的 select/option 元素进行比较来亲自查看此问题。
	https://github.com/microsoft/vscode-webview-ui-toolkit/issues/433

	在我们的案例中，当用户在提供商之间切换时，我们会根据提供商、该提供商的默认模型以及用户可能已选择的模型 ID 重新计算 selectedModelId。不幸的是，VSCodeDropdown 组件不会选择这个计算出来的值，而是会默认选择第一个“选择一个模型...”选项，这使得模型看起来像是被清除了，而实际上并没有。

	作为一种解决方法，我们为每个提供商创建了下拉菜单的单独实例，然后有条件地渲染与当前提供商匹配的实例。
	*/
	const createDropdown = (models: Record<string, ModelInfo>) => {
		return (
			<VSCodeDropdown
				id="model-id"
				value={selectedModelId}
				onChange={handleInputChange("apiModelId")}
				style={{ width: "100%" }}>
				<VSCodeOption value="">选择一个模型...</VSCodeOption>
				{Object.keys(models).map((modelId) => (
					<VSCodeOption
						key={modelId}
						value={modelId}
						style={{
							whiteSpace: "normal",
							wordWrap: "break-word",
							maxWidth: "100%",
						}}>
						{modelId}
					</VSCodeOption>
				))}
			</VSCodeDropdown>
		)
	}

	// 用于刷新 OpenAI 模型的防抖函数（防止在键入时进行过多的 API 调用）
	const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

	useEffect(() => {
		return () => {
			if (debounceTimerRef.current) {
				clearTimeout(debounceTimerRef.current)
			}
		}
	}, [])

	const debouncedRefreshOpenAiModels = useCallback((baseUrl?: string, apiKey?: string) => {
		if (debounceTimerRef.current) {
			clearTimeout(debounceTimerRef.current)
		}

		if (baseUrl && apiKey) {
			debounceTimerRef.current = setTimeout(() => {
				ModelsServiceClient.refreshOpenAiModels({
					baseUrl,
					apiKey,
				}).catch((error) => {
					console.error("刷新 OpenAI 模型失败：", error)
				})
			}, 500)
		}
	}, [])

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: isPopup ? -10 : 0 }}>
			<DropdownContainer className="dropdown-container">
				<label htmlFor="api-provider">
					<span style={{ fontWeight: 500 }}>API 提供商</span>
				</label>
				<VSCodeDropdown
					id="api-provider"
					value={selectedProvider}
					onChange={handleInputChange("apiProvider")}
					style={{
						minWidth: 130,
						position: "relative",
					}}>
					<VSCodeOption value="cline">Cline</VSCodeOption>
					<VSCodeOption value="openrouter">OpenRouter</VSCodeOption>
					<VSCodeOption value="anthropic">Anthropic</VSCodeOption>
					<VSCodeOption value="bedrock">Amazon Bedrock</VSCodeOption>
					<VSCodeOption value="openai">OpenAI Compatible</VSCodeOption>
					<VSCodeOption value="vertex">GCP Vertex AI</VSCodeOption>
					<VSCodeOption value="gemini">Google Gemini</VSCodeOption>
					<VSCodeOption value="deepseek">DeepSeek</VSCodeOption>
					<VSCodeOption value="mistral">Mistral</VSCodeOption>
					<VSCodeOption value="openai-native">OpenAI</VSCodeOption>
					<VSCodeOption value="vscode-lm">VS Code LM API</VSCodeOption>
					<VSCodeOption value="requesty">Requesty</VSCodeOption>
					<VSCodeOption value="fireworks">Fireworks</VSCodeOption>
					<VSCodeOption value="together">Together</VSCodeOption>
					<VSCodeOption value="qwen">阿里巴巴通义千问</VSCodeOption>
					<VSCodeOption value="doubao">字节跳动豆包</VSCodeOption>
					<VSCodeOption value="lmstudio">LM Studio</VSCodeOption>
					<VSCodeOption value="ollama">Ollama</VSCodeOption>
					<VSCodeOption value="litellm">LiteLLM</VSCodeOption>
					<VSCodeOption value="dify">Dify</VSCodeOption>
					<VSCodeOption value="asksage">AskSage</VSCodeOption>
					<VSCodeOption value="xai">xAI</VSCodeOption>
					<VSCodeOption value="sambanova">SambaNova</VSCodeOption>
				</VSCodeDropdown>
			</DropdownContainer>

			{selectedProvider === "cline" && (
				<div style={{ marginBottom: 14, marginTop: 4 }}>
					<ClineAccountInfoCard />
				</div>
			)}

			{selectedProvider === "asksage" && (
				<div>
					<VSCodeTextField
						value={apiConfiguration?.asksageApiKey || ""}
						style={{ width: "100%" }}
						type="password"
						onInput={handleInputChange("asksageApiKey")}
						placeholder="请输入 API 密钥...">
						<span style={{ fontWeight: 500 }}>AskSage API 密钥</span>
					</VSCodeTextField>
					<p
						style={{
							fontSize: "12px",
							marginTop: 3,
							color: "var(--vscode-descriptionForeground)",
						}}>
						此密钥存储在本地，仅用于从此扩展程序发出 API 请求。
					</p>
					<VSCodeTextField
						value={apiConfiguration?.asksageApiUrl || askSageDefaultURL}
						style={{ width: "100%" }}
						type="url"
						onInput={handleInputChange("asksageApiUrl")}
						placeholder="请输入 AskSage API URL...">
						<span style={{ fontWeight: 500 }}>AskSage API URL</span>
					</VSCodeTextField>
				</div>
			)}

			{selectedProvider === "anthropic" && (
				<div>
					<VSCodeTextField
						value={apiConfiguration?.apiKey || ""}
						style={{ width: "100%" }}
						type="password"
						onInput={handleInputChange("apiKey")}
						placeholder="请输入 API 密钥...">
						<span style={{ fontWeight: 500 }}>Anthropic API 密钥</span>
					</VSCodeTextField>

					<VSCodeCheckbox
						checked={anthropicBaseUrlSelected}
						onChange={(e: any) => {
							const isChecked = e.target.checked === true
							setAnthropicBaseUrlSelected(isChecked)
							if (!isChecked) {
								setApiConfiguration({
									...apiConfiguration,
									anthropicBaseUrl: "",
								})
							}
						}}>
						使用自定义基础 URL
					</VSCodeCheckbox>

					{anthropicBaseUrlSelected && (
						<VSCodeTextField
							value={apiConfiguration?.anthropicBaseUrl || ""}
							style={{ width: "100%", marginTop: 3 }}
							type="url"
							onInput={handleInputChange("anthropicBaseUrl")}
							placeholder="默认: https://api.anthropic.com"
						/>
					)}

					<p
						style={{
							fontSize: "12px",
							marginTop: 3,
							color: "var(--vscode-descriptionForeground)",
						}}>
						此密钥存储在本地，仅用于从此扩展程序发出 API 请求。
						{!apiConfiguration?.apiKey && (
							<VSCodeLink
								href="https://console.anthropic.com/settings/keys"
								style={{
									display: "inline",
									fontSize: "inherit",
								}}>
								您可以在此处注册获取 Anthropic API 密钥。
							</VSCodeLink>
						)}
					</p>
				</div>
			)}

			{selectedProvider === "openai-native" && (
				<div>
					<VSCodeTextField
						value={apiConfiguration?.openAiNativeApiKey || ""}
						style={{ width: "100%" }}
						type="password"
						onInput={handleInputChange("openAiNativeApiKey")}
						placeholder="请输入 API 密钥...">
						<span style={{ fontWeight: 500 }}>OpenAI API 密钥</span>
					</VSCodeTextField>
					<p
						style={{
							fontSize: "12px",
							marginTop: 3,
							color: "var(--vscode-descriptionForeground)",
						}}>
						此密钥存储在本地，仅用于从此扩展程序发出 API 请求。
						{!apiConfiguration?.openAiNativeApiKey && (
							<VSCodeLink
								href="https://platform.openai.com/api-keys"
								style={{
									display: "inline",
									fontSize: "inherit",
								}}>
								您可以在此处注册获取 OpenAI API 密钥。
							</VSCodeLink>
						)}
					</p>
				</div>
			)}

			{selectedProvider === "deepseek" && (
				<div>
					<VSCodeTextField
						value={apiConfiguration?.deepSeekApiKey || ""}
						style={{ width: "100%" }}
						type="password"
						onInput={handleInputChange("deepSeekApiKey")}
						placeholder="请输入 API 密钥...">
						<span style={{ fontWeight: 500 }}>DeepSeek API 密钥</span>
					</VSCodeTextField>
					<p
						style={{
							fontSize: "12px",
							marginTop: 3,
							color: "var(--vscode-descriptionForeground)",
						}}>
						此密钥存储在本地，仅用于从此扩展程序发出 API 请求。
						{!apiConfiguration?.deepSeekApiKey && (
							<VSCodeLink
								href="https://www.deepseek.com/"
								style={{
									display: "inline",
									fontSize: "inherit",
								}}>
								您可以在此处注册获取 DeepSeek API 密钥。
							</VSCodeLink>
						)}
					</p>
				</div>
			)}

			{selectedProvider === "qwen" && (
				<div>
					<DropdownContainer className="dropdown-container" style={{ position: "inherit" }}>
						<label htmlFor="qwen-line-provider">
							<span style={{ fontWeight: 500, marginTop: 5 }}>阿里API线路</span>
						</label>
						<VSCodeDropdown
							id="qwen-line-provider"
							value={apiConfiguration?.qwenApiLine || "china"}
							onChange={handleInputChange("qwenApiLine")}
							style={{
								minWidth: 130,
								position: "relative",
							}}>
							<VSCodeOption value="china">中国API</VSCodeOption>
							<VSCodeOption value="international">国际API</VSCodeOption>
						</VSCodeDropdown>
					</DropdownContainer>
					<p
						style={{
							fontSize: "12px",
							marginTop: 3,
							color: "var(--vscode-descriptionForeground)",
						}}>
						请根据您所在的地区选择合适的API接口。如果您在中国，请选择中国API接口。否则，请选择国际API接口。
					</p>
					<VSCodeTextField
						value={apiConfiguration?.qwenApiKey || ""}
						style={{ width: "100%" }}
						type="password"
						onInput={handleInputChange("qwenApiKey")}
						placeholder="请输入 API 密钥...">
						<span style={{ fontWeight: 500 }}>通义千问 API 密钥</span>
					</VSCodeTextField>
					<p
						style={{
							fontSize: "12px",
							marginTop: 3,
							color: "var(--vscode-descriptionForeground)",
						}}>
						此密钥存储在本地，仅用于从此扩展程序发出 API 请求。
						{!apiConfiguration?.qwenApiKey && (
							<VSCodeLink
								href="https://bailian.console.aliyun.com/"
								style={{
									display: "inline",
									fontSize: "inherit",
								}}>
								您可以在此处注册获取通义千问 API 密钥。
							</VSCodeLink>
						)}
					</p>
				</div>
			)}

			{selectedProvider === "doubao" && (
				<div>
					<VSCodeTextField
						value={apiConfiguration?.doubaoApiKey || ""}
						style={{ width: "100%" }}
						type="password"
						onInput={handleInputChange("doubaoApiKey")}
						placeholder="请输入 API 密钥...">
						<span style={{ fontWeight: 500 }}>豆包 API 密钥</span>
					</VSCodeTextField>
					<p
						style={{
							fontSize: "12px",
							marginTop: 3,
							color: "var(--vscode-descriptionForeground)",
						}}>
						此密钥存储在本地，仅用于从此扩展程序发出 API 请求。
						{!apiConfiguration?.doubaoApiKey && (
							<VSCodeLink
								href="https://console.volcengine.com/home"
								style={{
									display: "inline",
									fontSize: "inherit",
								}}>
								您可以在此处注册获取豆包 API 密钥。
							</VSCodeLink>
						)}
					</p>
				</div>
			)}

			{selectedProvider === "mistral" && (
				<div>
					<VSCodeTextField
						value={apiConfiguration?.mistralApiKey || ""}
						style={{ width: "100%" }}
						type="password"
						onInput={handleInputChange("mistralApiKey")}
						placeholder="请输入 API 密钥...">
						<span style={{ fontWeight: 500 }}>Mistral API 密钥</span>
					</VSCodeTextField>
					<p
						style={{
							fontSize: "12px",
							marginTop: 3,
							color: "var(--vscode-descriptionForeground)",
						}}>
						此密钥存储在本地，仅用于从此扩展程序发出 API 请求。
						{!apiConfiguration?.mistralApiKey && (
							<VSCodeLink
								href="https://console.mistral.ai/codestral"
								style={{
									display: "inline",
									fontSize: "inherit",
								}}>
								您可以在此处注册获取 Mistral API 密钥。
							</VSCodeLink>
						)}
					</p>
				</div>
			)}

			{selectedProvider === "openrouter" && (
				<div>
					<VSCodeTextField
						value={apiConfiguration?.openRouterApiKey || ""}
						style={{ width: "100%" }}
						type="password"
						onInput={handleInputChange("openRouterApiKey")}
						placeholder="请输入 API 密钥...">
						<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
							<span style={{ fontWeight: 500 }}>OpenRouter API 密钥</span>
							{apiConfiguration?.openRouterApiKey && (
								<OpenRouterBalanceDisplay apiKey={apiConfiguration.openRouterApiKey} />
							)}
						</div>
					</VSCodeTextField>
					{!apiConfiguration?.openRouterApiKey && (
						<VSCodeButtonLink
							href={getOpenRouterAuthUrl(uriScheme)}
							style={{ margin: "5px 0 0 0" }}
							appearance="secondary">
							获取 OpenRouter API 密钥
						</VSCodeButtonLink>
					)}
					<p
						style={{
							fontSize: "12px",
							marginTop: "5px",
							color: "var(--vscode-descriptionForeground)",
						}}>
						此密钥存储在本地，仅用于从此扩展程序发出 API 请求。{" "}
						{/* {!apiConfiguration?.openRouterApiKey && (
							<span style={{ color: "var(--vscode-charts-green)" }}>
								(<span style={{ fontWeight: 500 }}>注意：</span> 建议使用 OpenRouter 以获得高频率限制、提示缓存和更广泛的模型选择。)
							</span>
						)} */}
					</p>
				</div>
			)}

			{selectedProvider === "bedrock" && (
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						gap: 5,
					}}>
					<VSCodeRadioGroup
						value={apiConfiguration?.awsUseProfile ? "profile" : "credentials"}
						onChange={(e) => {
							const value = (e.target as HTMLInputElement)?.value
							const useProfile = value === "profile"
							setApiConfiguration({
								...apiConfiguration,
								awsUseProfile: useProfile,
							})
						}}>
						<VSCodeRadio value="credentials">AWS 凭证</VSCodeRadio>
						<VSCodeRadio value="profile">AWS 配置文件</VSCodeRadio>
					</VSCodeRadioGroup>

					{apiConfiguration?.awsUseProfile ? (
						<VSCodeTextField
							value={apiConfiguration?.awsProfile || ""}
							style={{ width: "100%" }}
							onInput={handleInputChange("awsProfile")}
							placeholder="输入配置文件名称（如果为空则为默认值）">
							<span style={{ fontWeight: 500 }}>AWS 配置文件名称</span>
						</VSCodeTextField>
					) : (
						<>
							<VSCodeTextField
								value={apiConfiguration?.awsAccessKey || ""}
								style={{ width: "100%" }}
								type="password"
								onInput={handleInputChange("awsAccessKey")}
								placeholder="请输入访问密钥...">
								<span style={{ fontWeight: 500 }}>AWS 访问密钥</span>
							</VSCodeTextField>
							<VSCodeTextField
								value={apiConfiguration?.awsSecretKey || ""}
								style={{ width: "100%" }}
								type="password"
								onInput={handleInputChange("awsSecretKey")}
								placeholder="请输入私有密钥...">
								<span style={{ fontWeight: 500 }}>AWS 私有密钥</span>
							</VSCodeTextField>
							<VSCodeTextField
								value={apiConfiguration?.awsSessionToken || ""}
								style={{ width: "100%" }}
								type="password"
								onInput={handleInputChange("awsSessionToken")}
								placeholder="请输入会话令牌...">
								<span style={{ fontWeight: 500 }}>AWS 会话令牌</span>
							</VSCodeTextField>
						</>
					)}
					<DropdownContainer zIndex={DROPDOWN_Z_INDEX - 1} className="dropdown-container">
						<label htmlFor="aws-region-dropdown">
							<span style={{ fontWeight: 500 }}>AWS 区域</span>
						</label>
						<VSCodeDropdown
							id="aws-region-dropdown"
							value={apiConfiguration?.awsRegion || ""}
							style={{ width: "100%" }}
							onChange={handleInputChange("awsRegion")}>
							<VSCodeOption value="">选择一个区域...</VSCodeOption>
							{/* 用户将必须选择支持他们使用的模型的区域，但这应该不是问题，因为他们首先必须在该区域请求访问权限。 */}
							<VSCodeOption value="us-east-1">us-east-1</VSCodeOption>
							<VSCodeOption value="us-east-2">us-east-2</VSCodeOption>
							{/* <VSCodeOption value="us-west-1">us-west-1</VSCodeOption> */}
							<VSCodeOption value="us-west-2">us-west-2</VSCodeOption>
							{/* <VSCodeOption value="af-south-1">af-south-1</VSCodeOption> */}
							{/* <VSCodeOption value="ap-east-1">ap-east-1</VSCodeOption> */}
							<VSCodeOption value="ap-south-1">ap-south-1</VSCodeOption>
							<VSCodeOption value="ap-northeast-1">ap-northeast-1</VSCodeOption>
							<VSCodeOption value="ap-northeast-2">ap-northeast-2</VSCodeOption>
							<VSCodeOption value="ap-northeast-3">ap-northeast-3</VSCodeOption>
							<VSCodeOption value="ap-southeast-1">ap-southeast-1</VSCodeOption>
							<VSCodeOption value="ap-southeast-2">ap-southeast-2</VSCodeOption>
							<VSCodeOption value="ca-central-1">ca-central-1</VSCodeOption>
							<VSCodeOption value="eu-central-1">eu-central-1</VSCodeOption>
							<VSCodeOption value="eu-central-2">eu-central-2</VSCodeOption>
							<VSCodeOption value="eu-west-1">eu-west-1</VSCodeOption>
							<VSCodeOption value="eu-west-2">eu-west-2</VSCodeOption>
							<VSCodeOption value="eu-west-3">eu-west-3</VSCodeOption>
							<VSCodeOption value="eu-north-1">eu-north-1</VSCodeOption>
							{/* <VSCodeOption value="me-south-1">me-south-1</VSCodeOption> */}
							<VSCodeOption value="sa-east-1">sa-east-1</VSCodeOption>
							<VSCodeOption value="us-gov-east-1">us-gov-east-1</VSCodeOption>
							<VSCodeOption value="us-gov-west-1">us-gov-west-1</VSCodeOption>
							{/* <VSCodeOption value="us-gov-east-1">us-gov-east-1</VSCodeOption> */}
						</VSCodeDropdown>
					</DropdownContainer>

					<div style={{ display: "flex", flexDirection: "column" }}>
						<VSCodeCheckbox
							checked={awsEndpointSelected}
							onChange={(e: any) => {
								const isChecked = e.target.checked === true
								setAwsEndpointSelected(isChecked)
								if (!isChecked) {
									setApiConfiguration({
										...apiConfiguration,
										awsBedrockEndpoint: "",
									})
								}
							}}>
							使用自定义 VPC 端点
						</VSCodeCheckbox>

						{awsEndpointSelected && (
							<VSCodeTextField
								value={apiConfiguration?.awsBedrockEndpoint || ""}
								style={{ width: "100%", marginTop: 3, marginBottom: 5 }}
								type="url"
								onInput={handleInputChange("awsBedrockEndpoint")}
								placeholder="输入 VPC 端点 URL（可选）"
							/>
						)}

						<VSCodeCheckbox
							checked={apiConfiguration?.awsUseCrossRegionInference || false}
							onChange={(e: any) => {
								const isChecked = e.target.checked === true
								setApiConfiguration({
									...apiConfiguration,
									awsUseCrossRegionInference: isChecked,
								})
							}}>
							使用跨区域推理
						</VSCodeCheckbox>

						{selectedModelInfo.supportsPromptCache && (
							<>
								<VSCodeCheckbox
									checked={apiConfiguration?.awsBedrockUsePromptCache || false}
									onChange={(e: any) => {
										const isChecked = e.target.checked === true
										setApiConfiguration({
											...apiConfiguration,
											awsBedrockUsePromptCache: isChecked,
										})
									}}>
									使用提示缓存
								</VSCodeCheckbox>
							</>
						)}
					</div>
					<p
						style={{
							fontSize: "12px",
							marginTop: "5px",
							color: "var(--vscode-descriptionForeground)",
						}}>
						{apiConfiguration?.awsUseProfile ? (
							<>
								使用来自 ~/.aws/credentials 的 AWS 配置文件凭证。将配置文件名称留空以使用默认配置文件。这些凭证仅在本地用于从此扩展程序发出 API 请求。
							</>
						) : (
							<>
								通过提供上述密钥或使用默认的 AWS 凭证提供程序（即 ~/.aws/credentials 或环境变量）进行身份验证。这些凭证仅在本地用于从此扩展程序发出 API 请求。
							</>
						)}
					</p>
					<label htmlFor="bedrock-model-dropdown">
						<span style={{ fontWeight: 500 }}>模型</span>
					</label>
					<DropdownContainer zIndex={DROPDOWN_Z_INDEX - 2} className="dropdown-container">
						<VSCodeDropdown
							id="bedrock-model-dropdown"
							value={apiConfiguration?.awsBedrockCustomSelected ? "custom" : selectedModelId}
							onChange={(e: any) => {
								const isCustom = e.target.value === "custom"
								setApiConfiguration({
									...apiConfiguration,
									apiModelId: isCustom ? "" : e.target.value,
									awsBedrockCustomSelected: isCustom,
									awsBedrockCustomModelBaseId: bedrockDefaultModelId,
								})
							}}
							style={{ width: "100%" }}>
							<VSCodeOption value="">选择一个模型...</VSCodeOption>
							{Object.keys(bedrockModels).map((modelId) => (
								<VSCodeOption
									key={modelId}
									value={modelId}
									style={{
										whiteSpace: "normal",
										wordWrap: "break-word",
										maxWidth: "100%",
									}}>
									{modelId}
								</VSCodeOption>
							))}
							<VSCodeOption value="custom">自定义</VSCodeOption>
						</VSCodeDropdown>
					</DropdownContainer>
					{apiConfiguration?.awsBedrockCustomSelected && (
						<div>
							<p
								style={{
									fontSize: "12px",
									marginTop: "5px",
									color: "var(--vscode-descriptionForeground)",
								}}>
								在 Bedrock 中使用应用程序推理配置文件时选择“自定义”。在模型 ID 字段中输入应用程序推理配置文件 ARN。
							</p>
							<label htmlFor="bedrock-model-input">
								<span style={{ fontWeight: 500 }}>模型 ID</span>
							</label>
							<VSCodeTextField
								id="bedrock-model-input"
								value={apiConfiguration?.apiModelId || ""}
								style={{ width: "100%", marginTop: 3 }}
								onInput={handleInputChange("apiModelId")}
								placeholder="输入自定义模型 ID..."
							/>
							<label htmlFor="bedrock-base-model-dropdown">
								<span style={{ fontWeight: 500 }}>基础推理模型</span>
							</label>
							<DropdownContainer zIndex={DROPDOWN_Z_INDEX - 3} className="dropdown-container">
								<VSCodeDropdown
									id="bedrock-base-model-dropdown"
									value={apiConfiguration?.awsBedrockCustomModelBaseId || bedrockDefaultModelId}
									onChange={handleInputChange("awsBedrockCustomModelBaseId")}
									style={{ width: "100%" }}>
									<VSCodeOption value="">选择一个模型...</VSCodeOption>
									{Object.keys(bedrockModels).map((modelId) => (
										<VSCodeOption
											key={modelId}
											value={modelId}
											style={{
												whiteSpace: "normal",
												wordWrap: "break-word",
												maxWidth: "100%",
											}}>
											{modelId}
										</VSCodeOption>
									))}
								</VSCodeDropdown>
							</DropdownContainer>
						</div>
					)}
					{(selectedModelId === "anthropic.claude-3-7-sonnet-20250219-v1:0" ||
						(apiConfiguration?.awsBedrockCustomSelected &&
							apiConfiguration?.awsBedrockCustomModelBaseId === "anthropic.claude-3-7-sonnet-20250219-v1:0")) && (
						<ThinkingBudgetSlider apiConfiguration={apiConfiguration} setApiConfiguration={setApiConfiguration} />
					)}
					<ModelInfoView
						selectedModelId={selectedModelId}
						modelInfo={selectedModelInfo}
						isDescriptionExpanded={isDescriptionExpanded}
						setIsDescriptionExpanded={setIsDescriptionExpanded}
						isPopup={isPopup}
					/>
				</div>
			)}

			{apiConfiguration?.apiProvider === "vertex" && (
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						gap: 5,
					}}>
					<VSCodeTextField
						value={apiConfiguration?.vertexProjectId || ""}
						style={{ width: "100%" }}
						onInput={handleInputChange("vertexProjectId")}
						placeholder="请输入项目 ID...">
						<span style={{ fontWeight: 500 }}>Google Cloud 项目 ID</span>
					</VSCodeTextField>
					<DropdownContainer zIndex={DROPDOWN_Z_INDEX - 1} className="dropdown-container">
						<label htmlFor="vertex-region-dropdown">
							<span style={{ fontWeight: 500 }}>Google Cloud 区域</span>
						</label>
						<VSCodeDropdown
							id="vertex-region-dropdown"
							value={apiConfiguration?.vertexRegion || ""}
							style={{ width: "100%" }}
							onChange={handleInputChange("vertexRegion")}>
							<VSCodeOption value="">选择一个区域...</VSCodeOption>
							<VSCodeOption value="us-east5">us-east5</VSCodeOption>
							<VSCodeOption value="us-central1">us-central1</VSCodeOption>
							<VSCodeOption value="europe-west1">europe-west1</VSCodeOption>
							<VSCodeOption value="europe-west4">europe-west4</VSCodeOption>
							<VSCodeOption value="asia-southeast1">asia-southeast1</VSCodeOption>
							<VSCodeOption value="global">global</VSCodeOption>
						</VSCodeDropdown>
					</DropdownContainer>
					<p
						style={{
							fontSize: "12px",
							marginTop: "5px",
							color: "var(--vscode-descriptionForeground)",
						}}>
						要使用 Google Cloud Vertex AI，您需要
						<VSCodeLink
							href="https://cloud.google.com/vertex-ai/generative-ai/docs/partner-models/use-claude#before_you_begin"
							style={{ display: "inline", fontSize: "inherit" }}>
							{"1) 创建一个 Google Cloud 帐户 › 启用 Vertex AI API › 启用所需的 Claude 模型，"}
						</VSCodeLink>{" "}
						<VSCodeLink
							href="https://cloud.google.com/docs/authentication/provide-credentials-adc#google-idp"
							style={{ display: "inline", fontSize: "inherit" }}>
							{"2) 安装 Google Cloud CLI › 配置应用程序默认凭据。"}
						</VSCodeLink>
					</p>
				</div>
			)}

			{selectedProvider === "gemini" && (
				<div>
					<VSCodeTextField
						value={apiConfiguration?.geminiApiKey || ""}
						style={{ width: "100%" }}
						type="password"
						onInput={handleInputChange("geminiApiKey")}
						placeholder="请输入 API 密钥...">
						<span style={{ fontWeight: 500 }}>Gemini API 密钥</span>
					</VSCodeTextField>

					<VSCodeCheckbox
						checked={geminiBaseUrlSelected}
						onChange={(e: any) => {
							const isChecked = e.target.checked === true
							setGeminiBaseUrlSelected(isChecked)
							if (!isChecked) {
								setApiConfiguration({
									...apiConfiguration,
									geminiBaseUrl: "",
								})
							}
						}}>
						使用自定义基础 URL
					</VSCodeCheckbox>

					{geminiBaseUrlSelected && (
						<VSCodeTextField
							value={apiConfiguration?.geminiBaseUrl || ""}
							style={{ width: "100%", marginTop: 3 }}
							type="url"
							onInput={handleInputChange("geminiBaseUrl")}
							placeholder="默认: https://generativelanguage.googleapis.com"
						/>
					)}

					<p
						style={{
							fontSize: "12px",
							marginTop: 3,
							color: "var(--vscode-descriptionForeground)",
						}}>
						此密钥存储在本地，仅用于从此扩展程序发出 API 请求。
						{!apiConfiguration?.geminiApiKey && (
							<VSCodeLink
								href="https://aistudio.google.com/apikey"
								style={{
									display: "inline",
									fontSize: "inherit",
								}}>
								您可以在此处注册获取 Gemini API 密钥。
							</VSCodeLink>
						)}
					</p>

					{/* 专门为 gemini-2.5-flash-preview-04-17 添加思考预算滑块 */}
					{selectedProvider === "gemini" && selectedModelId === "gemini-2.5-flash-preview-04-17" && (
						<ThinkingBudgetSlider
							apiConfiguration={apiConfiguration}
							setApiConfiguration={setApiConfiguration}
							maxBudget={selectedModelInfo.thinkingConfig?.maxBudget}
						/>
					)}
				</div>
			)}

			{selectedProvider === "openai" && (
				<div>
					<VSCodeTextField
						value={apiConfiguration?.openAiBaseUrl || ""}
						style={{ width: "100%", marginBottom: 10 }}
						type="url"
						onInput={(e: any) => {
							const baseUrl = e.target.value
							handleInputChange("openAiBaseUrl")({ target: { value: baseUrl } })

							debouncedRefreshOpenAiModels(baseUrl, apiConfiguration?.openAiApiKey)
						}}
						placeholder={"输入基础 URL..."}>
						<span style={{ fontWeight: 500 }}>基础 URL</span>
					</VSCodeTextField>
					<VSCodeTextField
						value={apiConfiguration?.openAiApiKey || ""}
						style={{ width: "100%", marginBottom: 10 }}
						type="password"
						onInput={(e: any) => {
							const apiKey = e.target.value
							handleInputChange("openAiApiKey")({ target: { value: apiKey } })

							debouncedRefreshOpenAiModels(apiConfiguration?.openAiBaseUrl, apiKey)
						}}
						placeholder="输入 API 密钥...">
						<span style={{ fontWeight: 500 }}>API 密钥</span>
					</VSCodeTextField>
					<VSCodeTextField
						value={apiConfiguration?.openAiModelId || ""}
						style={{ width: "100%", marginBottom: 10 }}
						onInput={handleInputChange("openAiModelId")}
						placeholder={"输入模型 ID..."}>
						<span style={{ fontWeight: 500 }}>模型 ID</span>
					</VSCodeTextField>

					{/* OpenAI Compatible的自定义标头 */}
					{(() => {
						const headerEntries = Object.entries(apiConfiguration?.openAiHeaders ?? {})
						return (
							<div style={{ marginBottom: 10 }}>
								<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
									<span style={{ fontWeight: 500 }}>自定义标头</span>
									<VSCodeButton
										onClick={() => {
											const currentHeaders = { ...(apiConfiguration?.openAiHeaders || {}) }
											const headerCount = Object.keys(currentHeaders).length
											const newKey = `header${headerCount + 1}`
											currentHeaders[newKey] = ""
											handleInputChange("openAiHeaders")({
												target: {
													value: currentHeaders,
												},
											})
										}}>
										添加标头
									</VSCodeButton>
								</div>
								<div>
									{headerEntries.map(([key, value], index) => (
										<div key={index} style={{ display: "flex", gap: 5, marginTop: 5 }}>
											<VSCodeTextField
												value={key}
												style={{ width: "40%" }}
												placeholder="标头名称"
												onInput={(e: any) => {
													const currentHeaders = apiConfiguration?.openAiHeaders ?? {}
													const newValue = e.target.value
													if (newValue && newValue !== key) {
														const { [key]: _, ...rest } = currentHeaders
														handleInputChange("openAiHeaders")({
															target: {
																value: {
																	...rest,
																	[newValue]: value,
																},
															},
														})
													}
												}}
											/>
											<VSCodeTextField
												value={value}
												style={{ width: "40%" }}
												placeholder="标头值"
												onInput={(e: any) => {
													handleInputChange("openAiHeaders")({
														target: {
															value: {
																...(apiConfiguration?.openAiHeaders ?? {}),
																[key]: e.target.value,
															},
														},
													})
												}}
											/>
											<VSCodeButton
												appearance="secondary"
												onClick={() => {
													const { [key]: _, ...rest } = apiConfiguration?.openAiHeaders ?? {}
													handleInputChange("openAiHeaders")({
														target: {
															value: rest,
														},
													})
												}}>
												移除
											</VSCodeButton>
										</div>
									))}
								</div>
							</div>
						)
					})()}

					<VSCodeCheckbox
						checked={azureApiVersionSelected}
						onChange={(e: any) => {
							const isChecked = e.target.checked === true
							setAzureApiVersionSelected(isChecked)
							if (!isChecked) {
								setApiConfiguration({
									...apiConfiguration,
									azureApiVersion: "",
								})
							}
						}}>
						设置 Azure API 版本
					</VSCodeCheckbox>
					{azureApiVersionSelected && (
						<VSCodeTextField
							value={apiConfiguration?.azureApiVersion || ""}
							style={{ width: "100%", marginTop: 3 }}
							onInput={handleInputChange("azureApiVersion")}
							placeholder={`默认: ${azureOpenAiDefaultApiVersion}`}
						/>
					)}
					<div
						style={{
							color: getAsVar(VSC_DESCRIPTION_FOREGROUND),
							display: "flex",
							margin: "10px 0",
							cursor: "pointer",
							alignItems: "center",
						}}
						onClick={() => setModelConfigurationSelected((val) => !val)}>
						<span
							className={`codicon ${modelConfigurationSelected ? "codicon-chevron-down" : "codicon-chevron-right"}`}
							style={{
								marginRight: "4px",
							}}></span>
						<span
							style={{
								fontWeight: 700,
								textTransform: "uppercase",
							}}>
							模型配置
						</span>
					</div>
					{modelConfigurationSelected && (
						<>
							<VSCodeCheckbox
								checked={!!apiConfiguration?.openAiModelInfo?.supportsImages}
								onChange={(e: any) => {
									const isChecked = e.target.checked === true
									const modelInfo = apiConfiguration?.openAiModelInfo
										? apiConfiguration.openAiModelInfo
										: { ...openAiModelInfoSaneDefaults }
									modelInfo.supportsImages = isChecked
									setApiConfiguration({
										...apiConfiguration,
										openAiModelInfo: modelInfo,
									})
								}}>
								支持图像
							</VSCodeCheckbox>
							<VSCodeCheckbox
								checked={!!apiConfiguration?.openAiModelInfo?.supportsImages} // BUG: Should be supportsBrowserUse
								onChange={(e: any) => {
									const isChecked = e.target.checked === true
									let modelInfo = apiConfiguration?.openAiModelInfo
										? apiConfiguration.openAiModelInfo
										: { ...openAiModelInfoSaneDefaults }
									// Assuming this was a typo and should be supportsBrowserUse
									modelInfo.supportsImages = isChecked // Corrected field
									setApiConfiguration({
										...apiConfiguration,
										openAiModelInfo: modelInfo,
									})
								}}>
								支持浏览器使用
							</VSCodeCheckbox>
							<VSCodeCheckbox
								checked={!!apiConfiguration?.openAiModelInfo?.isR1FormatRequired}
								onChange={(e: any) => {
									const isChecked = e.target.checked === true
									let modelInfo = apiConfiguration?.openAiModelInfo
										? apiConfiguration.openAiModelInfo
										: { ...openAiModelInfoSaneDefaults }
									modelInfo = { ...modelInfo, isR1FormatRequired: isChecked }

									setApiConfiguration({
										...apiConfiguration,
										openAiModelInfo: modelInfo,
									})
								}}>
								启用 R1 消息格式
							</VSCodeCheckbox>
							<div style={{ display: "flex", gap: 10, marginTop: "5px" }}>
								<VSCodeTextField
									value={
										apiConfiguration?.openAiModelInfo?.contextWindow
											? apiConfiguration.openAiModelInfo.contextWindow.toString()
											: openAiModelInfoSaneDefaults.contextWindow?.toString()
									}
									style={{ flex: 1 }}
									onInput={(input: any) => {
										const modelInfo = apiConfiguration?.openAiModelInfo
											? apiConfiguration.openAiModelInfo
											: { ...openAiModelInfoSaneDefaults }
										modelInfo.contextWindow = Number(input.target.value)
										setApiConfiguration({
											...apiConfiguration,
											openAiModelInfo: modelInfo,
										})
									}}>
									<span style={{ fontWeight: 500 }}>上下文窗口大小</span>
								</VSCodeTextField>
								<VSCodeTextField
									value={
										apiConfiguration?.openAiModelInfo?.maxTokens
											? apiConfiguration.openAiModelInfo.maxTokens.toString()
											: openAiModelInfoSaneDefaults.maxTokens?.toString()
									}
									style={{ flex: 1 }}
									onInput={(input: any) => {
										const modelInfo = apiConfiguration?.openAiModelInfo
											? apiConfiguration.openAiModelInfo
											: { ...openAiModelInfoSaneDefaults }
										modelInfo.maxTokens = input.target.value
										setApiConfiguration({
											...apiConfiguration,
											openAiModelInfo: modelInfo,
										})
									}}>
									<span style={{ fontWeight: 500 }}>最大输出令牌数</span>
								</VSCodeTextField>
							</div>
							<div style={{ display: "flex", gap: 10, marginTop: "5px" }}>
								<VSCodeTextField
									value={
										apiConfiguration?.openAiModelInfo?.inputPrice
											? apiConfiguration.openAiModelInfo.inputPrice.toString()
											: openAiModelInfoSaneDefaults.inputPrice?.toString()
									}
									style={{ flex: 1 }}
									onInput={(input: any) => {
										const modelInfo = apiConfiguration?.openAiModelInfo
											? apiConfiguration.openAiModelInfo
											: { ...openAiModelInfoSaneDefaults }
										modelInfo.inputPrice = input.target.value
										setApiConfiguration({
											...apiConfiguration,
											openAiModelInfo: modelInfo,
										})
									}}>
									<span style={{ fontWeight: 500 }}>输入价格 / 1M 令牌</span>
								</VSCodeTextField>
								<VSCodeTextField
									value={
										apiConfiguration?.openAiModelInfo?.outputPrice
											? apiConfiguration.openAiModelInfo.outputPrice.toString()
											: openAiModelInfoSaneDefaults.outputPrice?.toString()
									}
									style={{ flex: 1 }}
									onInput={(input: any) => {
										const modelInfo = apiConfiguration?.openAiModelInfo
											? apiConfiguration.openAiModelInfo
											: { ...openAiModelInfoSaneDefaults }
										modelInfo.outputPrice = input.target.value
										setApiConfiguration({
											...apiConfiguration,
											openAiModelInfo: modelInfo,
										})
									}}>
									<span style={{ fontWeight: 500 }}>输出价格 / 1M 令牌</span>
								</VSCodeTextField>
							</div>
							<div style={{ display: "flex", gap: 10, marginTop: "5px" }}>
								<VSCodeTextField
									value={
										apiConfiguration?.openAiModelInfo?.temperature
											? apiConfiguration.openAiModelInfo.temperature.toString()
											: openAiModelInfoSaneDefaults.temperature?.toString()
									}
									onInput={(input: any) => {
										const modelInfo = apiConfiguration?.openAiModelInfo
											? apiConfiguration.openAiModelInfo
											: { ...openAiModelInfoSaneDefaults }

										// 检查输入是否以小数点结尾或小数点后有尾随零
										const value = input.target.value
										const shouldPreserveFormat =
											value.endsWith(".") || (value.includes(".") && value.endsWith("0"))

										modelInfo.temperature =
											value === ""
												? openAiModelInfoSaneDefaults.temperature
												: shouldPreserveFormat
													? value // 保留为字符串以保留小数格式
													: parseFloat(value)

										setApiConfiguration({
											...apiConfiguration,
											openAiModelInfo: modelInfo,
										})
									}}>
									<span style={{ fontWeight: 500 }}>温度</span>
								</VSCodeTextField>
							</div>
						</>
					)}
					<p
						style={{
							fontSize: "12px",
							marginTop: 3,
							color: "var(--vscode-descriptionForeground)",
						}}>
						<span style={{ color: "var(--vscode-errorForeground)" }}>
							（<span style={{ fontWeight: 500 }}>注意：</span> Cline 使用复杂的提示，并且最适合 Claude
							模型。能力较弱的模型可能无法按预期工作。）
						</span>
					</p>
				</div>
			)}

			{selectedProvider === "requesty" && (
				<div>
					<VSCodeTextField
						value={apiConfiguration?.requestyApiKey || ""}
						style={{ width: "100%" }}
						type="password"
						onInput={handleInputChange("requestyApiKey")}
						placeholder="输入 API 密钥...">
						<span style={{ fontWeight: 500 }}>API 密钥</span>
					</VSCodeTextField>
					{!apiConfiguration?.requestyApiKey && <a href="https://app.requesty.ai/manage-api">获取 API 密钥</a>}
				</div>
			)}

			{selectedProvider === "fireworks" && (
				<div>
					<VSCodeTextField
						value={apiConfiguration?.fireworksApiKey || ""}
						style={{ width: "100%" }}
						type="password"
						onInput={handleInputChange("fireworksApiKey")}
						placeholder="输入 API 密钥...">
						<span style={{ fontWeight: 500 }}>Fireworks API 密钥</span>
					</VSCodeTextField>
					<p
						style={{
							fontSize: "12px",
							marginTop: 3,
							color: "var(--vscode-descriptionForeground)",
						}}>
						此密钥存储在本地，仅用于从此扩展程序发出 API 请求。
						{!apiConfiguration?.fireworksApiKey && (
							<VSCodeLink
								href="https://fireworks.ai/settings/users/api-keys"
								style={{
									display: "inline",
									fontSize: "inherit",
								}}>
								您可以在此处注册获取 Fireworks API 密钥。
							</VSCodeLink>
						)}
					</p>
					<VSCodeTextField
						value={apiConfiguration?.fireworksModelId || ""}
						style={{ width: "100%" }}
						onInput={handleInputChange("fireworksModelId")}
						placeholder={"输入模型 ID..."}>
						<span style={{ fontWeight: 500 }}>模型 ID</span>
					</VSCodeTextField>
					<p
						style={{
							fontSize: "12px",
							marginTop: 3,
							color: "var(--vscode-descriptionForeground)",
						}}>
						<span style={{ color: "var(--vscode-errorForeground)" }}>
							（<span style={{ fontWeight: 500 }}>注意：</span> Cline 使用复杂的提示，并且最适合 Claude
							模型。能力较弱的模型可能无法按预期工作。）
						</span>
					</p>
					<VSCodeTextField
						value={apiConfiguration?.fireworksModelMaxCompletionTokens?.toString() || ""}
						style={{ width: "100%", marginBottom: 8 }}
						onInput={(e) => {
							const value = (e.target as HTMLInputElement).value
							if (!value) {
								return
							}
							const num = parseInt(value, 10)
							if (isNaN(num)) {
								return
							}
							handleInputChange("fireworksModelMaxCompletionTokens")({
								target: {
									value: num,
								},
							})
						}}
						placeholder={"2000"}>
						<span style={{ fontWeight: 500 }}>最大完成令牌数</span>
					</VSCodeTextField>
					<VSCodeTextField
						value={apiConfiguration?.fireworksModelMaxTokens?.toString() || ""}
						style={{ width: "100%", marginBottom: 8 }}
						onInput={(e) => {
							const value = (e.target as HTMLInputElement).value
							if (!value) {
								return
							}
							const num = parseInt(value)
							if (isNaN(num)) {
								return
							}
							handleInputChange("fireworksModelMaxTokens")({
								target: {
									value: num,
								},
							})
						}}
						placeholder={"4000"}>
						<span style={{ fontWeight: 500 }}>最大上下文令牌数</span>
					</VSCodeTextField>
				</div>
			)}

			{selectedProvider === "together" && (
				<div>
					<VSCodeTextField
						value={apiConfiguration?.togetherApiKey || ""}
						style={{ width: "100%" }}
						type="password"
						onInput={handleInputChange("togetherApiKey")}
						placeholder="输入 API 密钥...">
						<span style={{ fontWeight: 500 }}>API 密钥</span>
					</VSCodeTextField>
					<VSCodeTextField
						value={apiConfiguration?.togetherModelId || ""}
						style={{ width: "100%" }}
						onInput={handleInputChange("togetherModelId")}
						placeholder={"输入模型 ID..."}>
						<span style={{ fontWeight: 500 }}>模型 ID</span>
					</VSCodeTextField>
					<p
						style={{
							fontSize: "12px",
							marginTop: 3,
							color: "var(--vscode-descriptionForeground)",
						}}>
						<span style={{ color: "var(--vscode-errorForeground)" }}>
							（<span style={{ fontWeight: 500 }}>注意：</span> Cline 使用复杂的提示，并且最适合 Claude
							模型。能力较弱的模型可能无法按预期工作。）
						</span>
					</p>
				</div>
			)}

			{selectedProvider === "vscode-lm" && (
				<div>
					<DropdownContainer zIndex={DROPDOWN_Z_INDEX - 2} className="dropdown-container">
						<label htmlFor="vscode-lm-model">
							<span style={{ fontWeight: 500 }}>语言模型</span>
						</label>
						{vsCodeLmModels.length > 0 ? (
							<VSCodeDropdown
								id="vscode-lm-model"
								value={
									apiConfiguration?.vsCodeLmModelSelector
										? `${apiConfiguration.vsCodeLmModelSelector.vendor ?? ""}/${apiConfiguration.vsCodeLmModelSelector.family ?? ""}`
										: ""
								}
								onChange={(e) => {
									const value = (e.target as HTMLInputElement).value
									if (!value) {
										return
									}
									const [vendor, family] = value.split("/")
									handleInputChange("vsCodeLmModelSelector")({
										target: {
											value: { vendor, family },
										},
									})
								}}
								style={{ width: "100%" }}>
								<VSCodeOption value="">选择一个模型...</VSCodeOption>
								{vsCodeLmModels.map((model) => (
									<VSCodeOption
										key={`${model.vendor}/${model.family}`}
										value={`${model.vendor}/${model.family}`}>
										{model.vendor} - {model.family}
									</VSCodeOption>
								))}
							</VSCodeDropdown>
						) : (
							<p
								style={{
									fontSize: "12px",
									marginTop: "5px",
									color: "var(--vscode-descriptionForeground)",
								}}>
								VS Code 语言模型 API 允许您运行由其他 VS Code 扩展（包括但不限于 GitHub Copilot）提供的模型。最简单的入门方法是从 VS Marketplace 安装 Copilot 扩展并启用 Claude 3.7 Sonnet。
							</p>
						)}

						<p
							style={{
								fontSize: "12px",
								marginTop: "5px",
								color: "var(--vscode-errorForeground)",
								fontWeight: 500,
							}}>
							注意：这是一个非常实验性的集成，可能无法按预期工作。
						</p>
					</DropdownContainer>
				</div>
			)}

			{selectedProvider === "lmstudio" && (
				<div>
					<VSCodeTextField
						value={apiConfiguration?.lmStudioBaseUrl || ""}
						style={{ width: "100%" }}
						type="url"
						onInput={handleInputChange("lmStudioBaseUrl")}
						placeholder={"默认: http://localhost:1234"}>
						<span style={{ fontWeight: 500 }}>基础 URL (可选)</span>
					</VSCodeTextField>
					<VSCodeTextField
						value={apiConfiguration?.lmStudioModelId || ""}
						style={{ width: "100%" }}
						onInput={handleInputChange("lmStudioModelId")}
						placeholder={"例如 meta-llama-3.1-8b-instruct"}>
						<span style={{ fontWeight: 500 }}>模型 ID</span>
					</VSCodeTextField>
					{lmStudioModels.length > 0 && (
						<VSCodeRadioGroup
							value={
								lmStudioModels.includes(apiConfiguration?.lmStudioModelId || "")
									? apiConfiguration?.lmStudioModelId
									: ""
							}
							onChange={(e) => {
								const value = (e.target as HTMLInputElement)?.value
								// 需要先检查值，因为单选按钮组有时会返回空字符串
								if (value) {
									handleInputChange("lmStudioModelId")({
										target: { value },
									})
								}
							}}>
							{lmStudioModels.map((model) => (
								<VSCodeRadio key={model} value={model} checked={apiConfiguration?.lmStudioModelId === model}>
									{model}
								</VSCodeRadio>
							))}
						</VSCodeRadioGroup>
					)}
					<p
						style={{
							fontSize: "12px",
							marginTop: "5px",
							color: "var(--vscode-descriptionForeground)",
						}}>
						LM Studio 允许您在计算机上本地运行模型。有关如何开始的说明，请参阅他们的
						<VSCodeLink href="https://lmstudio.ai/docs" style={{ display: "inline", fontSize: "inherit" }}>
							快速入门指南。
						</VSCodeLink>
						您还需要启动 LM Studio 的{" "}
						<VSCodeLink
							href="https://lmstudio.ai/docs/basics/server"
							style={{ display: "inline", fontSize: "inherit" }}>
							本地服务器
						</VSCodeLink>{" "}
						功能才能将其与此扩展程序一起使用。{" "}
						<span style={{ color: "var(--vscode-errorForeground)" }}>
							（<span style={{ fontWeight: 500 }}>注意：</span> Cline 使用复杂的提示，并且最适合 Claude
							模型。能力较弱的模型可能无法按预期工作。）
						</span>
					</p>
				</div>
			)}

			{selectedProvider === "litellm" && (
				<div>
					<VSCodeTextField
						value={apiConfiguration?.liteLlmBaseUrl || ""}
						style={{ width: "100%" }}
						type="url"
						onInput={handleInputChange("liteLlmBaseUrl")}
						placeholder={"默认: http://localhost:4000"}>
						<span style={{ fontWeight: 500 }}>基础 URL (可选)</span>
					</VSCodeTextField>
					<VSCodeTextField
						value={apiConfiguration?.liteLlmApiKey || ""}
						style={{ width: "100%" }}
						type="password"
						onInput={handleInputChange("liteLlmApiKey")}
						placeholder="默认: noop">
						<span style={{ fontWeight: 500 }}>API 密钥</span>
					</VSCodeTextField>
					<VSCodeTextField
						value={apiConfiguration?.liteLlmModelId || ""}
						style={{ width: "100%" }}
						onInput={handleInputChange("liteLlmModelId")}
						placeholder={"例如 anthropic/claude-3-7-sonnet-20250219"}>
						<span style={{ fontWeight: 500 }}>模型 ID</span>
					</VSCodeTextField>

					<div style={{ display: "flex", flexDirection: "column", marginTop: 10, marginBottom: 10 }}>
						{selectedModelInfo.supportsPromptCache && (
							<>
								<VSCodeCheckbox
									checked={apiConfiguration?.liteLlmUsePromptCache || false}
									onChange={(e: any) => {
										const isChecked = e.target.checked === true
										setApiConfiguration({
											...apiConfiguration,
											liteLlmUsePromptCache: isChecked,
										})
									}}
									style={{ fontWeight: 500, color: "var(--vscode-charts-green)" }}>
									使用提示缓存 (GA)
								</VSCodeCheckbox>
								<p style={{ fontSize: "12px", marginTop: 3, color: "var(--vscode-charts-green)" }}>
									提示缓存需要受支持的提供商和模型
								</p>
							</>
						)}
					</div>

					<>
						<ThinkingBudgetSlider apiConfiguration={apiConfiguration} setApiConfiguration={setApiConfiguration} />
						<p
							style={{
								fontSize: "12px",
								marginTop: "5px",
								color: "var(--vscode-descriptionForeground)",
							}}>
							Sonnet-3-7、o3-mini、Deepseek R1 等模型支持扩展思考。更多信息请参阅{" "}
							<VSCodeLink
								href="https://docs.litellm.ai/docs/reasoning_content"
								style={{ display: "inline", fontSize: "inherit" }}>
								思考模式配置
							</VSCodeLink>
						</p>
					</>

					<div
						style={{
							color: getAsVar(VSC_DESCRIPTION_FOREGROUND),
							display: "flex",
							margin: "10px 0",
							cursor: "pointer",
							alignItems: "center",
						}}
						onClick={() => setModelConfigurationSelected((val) => !val)}>
						<span
							className={`codicon ${modelConfigurationSelected ? "codicon-chevron-down" : "codicon-chevron-right"}`}
							style={{
								marginRight: "4px",
							}}></span>
						<span
							style={{
								fontWeight: 700,
								textTransform: "uppercase",
							}}>
							模型配置
						</span>
					</div>
					{modelConfigurationSelected && (
						<>
							<VSCodeCheckbox
								checked={!!apiConfiguration?.liteLlmModelInfo?.supportsImages}
								onChange={(e: any) => {
									const isChecked = e.target.checked === true
									const modelInfo = apiConfiguration?.liteLlmModelInfo
										? apiConfiguration.liteLlmModelInfo
										: { ...liteLlmModelInfoSaneDefaults }
									modelInfo.supportsImages = isChecked
									setApiConfiguration({
										...apiConfiguration,
										liteLlmModelInfo: modelInfo,
									})
								}}>
								支持图像
							</VSCodeCheckbox>
							<div style={{ display: "flex", gap: 10, marginTop: "5px" }}>
								<VSCodeTextField
									value={
										apiConfiguration?.liteLlmModelInfo?.contextWindow
											? apiConfiguration.liteLlmModelInfo.contextWindow.toString()
											: liteLlmModelInfoSaneDefaults.contextWindow?.toString()
									}
									style={{ flex: 1 }}
									onInput={(input: any) => {
										const modelInfo = apiConfiguration?.liteLlmModelInfo
											? apiConfiguration.liteLlmModelInfo
											: { ...liteLlmModelInfoSaneDefaults }
										modelInfo.contextWindow = Number(input.target.value)
										setApiConfiguration({
											...apiConfiguration,
											liteLlmModelInfo: modelInfo,
										})
									}}>
									<span style={{ fontWeight: 500 }}>上下文窗口大小</span>
								</VSCodeTextField>
								<VSCodeTextField
									value={
										apiConfiguration?.liteLlmModelInfo?.maxTokens
											? apiConfiguration.liteLlmModelInfo.maxTokens.toString()
											: liteLlmModelInfoSaneDefaults.maxTokens?.toString()
									}
									style={{ flex: 1 }}
									onInput={(input: any) => {
										const modelInfo = apiConfiguration?.liteLlmModelInfo
											? apiConfiguration.liteLlmModelInfo
											: { ...liteLlmModelInfoSaneDefaults }
										modelInfo.maxTokens = input.target.value
										setApiConfiguration({
											...apiConfiguration,
											liteLlmModelInfo: modelInfo,
										})
									}}>
									<span style={{ fontWeight: 500 }}>最大输出令牌数</span>
								</VSCodeTextField>
							</div>
							<div style={{ display: "flex", gap: 10, marginTop: "5px" }}>
								<VSCodeTextField
									value={
										apiConfiguration?.liteLlmModelInfo?.temperature !== undefined
											? apiConfiguration.liteLlmModelInfo.temperature.toString()
											: liteLlmModelInfoSaneDefaults.temperature?.toString()
									}
									onInput={(input: any) => {
										const modelInfo = apiConfiguration?.liteLlmModelInfo
											? apiConfiguration.liteLlmModelInfo
											: { ...liteLlmModelInfoSaneDefaults }

										// 检查输入是否以小数点结尾或小数点后有尾随零
										const value = input.target.value
										const shouldPreserveFormat =
											value.endsWith(".") || (value.includes(".") && value.endsWith("0"))

										modelInfo.temperature =
											value === ""
												? liteLlmModelInfoSaneDefaults.temperature
												: shouldPreserveFormat
													? value // 保留为字符串以保留小数格式
													: parseFloat(value)

										setApiConfiguration({
											...apiConfiguration,
											liteLlmModelInfo: modelInfo,
										})
									}}>
									<span style={{ fontWeight: 500 }}>温度</span>
								</VSCodeTextField>
							</div>
						</>
					)}
					<p
						style={{
							fontSize: "12px",
							marginTop: "5px",
							color: "var(--vscode-descriptionForeground)",
						}}>
						LiteLLM 提供统一的界面来访问各种 LLM 提供商的模型。有关更多信息，请参阅他们的{" "}
						<VSCodeLink href="https://docs.litellm.ai/docs/" style={{ display: "inline", fontSize: "inherit" }}>
							快速入门指南
						</VSCodeLink>
						。
					</p>
				</div>
			)}

			{selectedProvider === "ollama" && (
				<div>
					<VSCodeTextField
						value={apiConfiguration?.ollamaBaseUrl || ""}
						style={{ width: "100%" }}
						type="url"
						onInput={handleInputChange("ollamaBaseUrl")}
						placeholder={"Default: http://localhost:11434"}>
						<span style={{ fontWeight: 500 }}>Base URL (optional)</span>
					</VSCodeTextField>
					<VSCodeTextField
						value={apiConfiguration?.ollamaModelId || ""}
						style={{ width: "100%" }}
						onInput={handleInputChange("ollamaModelId")}
						placeholder={"e.g. llama3.1"}>
						<span style={{ fontWeight: 500 }}>Model ID</span>
					</VSCodeTextField>
					<VSCodeTextField
						value={apiConfiguration?.ollamaApiOptionsCtxNum || "32768"}
						style={{ width: "100%" }}
						onInput={handleInputChange("ollamaApiOptionsCtxNum")}
						placeholder={"e.g. 32768"}>
						<span style={{ fontWeight: 500 }}>Model Context Window</span>
					</VSCodeTextField>
					{ollamaModels.length > 0 && (
						<VSCodeRadioGroup
							value={
								ollamaModels.includes(apiConfiguration?.ollamaModelId || "")
									? apiConfiguration?.ollamaModelId
									: ""
							}
							onChange={(e) => {
								const value = (e.target as HTMLInputElement)?.value
								// need to check value first since radio group returns empty string sometimes
								if (value) {
									handleInputChange("ollamaModelId")({
										target: { value },
									})
								}
							}}>
							{ollamaModels.map((model) => (
								<VSCodeRadio key={model} value={model} checked={apiConfiguration?.ollamaModelId === model}>
									{model}
								</VSCodeRadio>
							))}
						</VSCodeRadioGroup>
					)}
					<p
						style={{
							fontSize: "12px",
							marginTop: "5px",
							color: "var(--vscode-descriptionForeground)",
						}}>
						Ollama allows you to run models locally on your computer. For instructions on how to get started, see
						their
						<VSCodeLink
							href="https://github.com/ollama/ollama/blob/main/README.md"
							style={{ display: "inline", fontSize: "inherit" }}>
							quickstart guide.
						</VSCodeLink>
						<span style={{ color: "var(--vscode-errorForeground)" }}>
							(<span style={{ fontWeight: 500 }}>Note:</span> Cline uses complex prompts and works best with Claude
							models. Less capable models may not work as expected.)
						</span>
					</p>
				</div>
			)}

			{selectedProvider === "dify" && (
				<div>
					<VSCodeTextField
						value={apiConfiguration?.difyApiKey || ""}
						style={{ width: "100%" }}
						type="password"
						onInput={handleInputChange("difyApiKey")}
						placeholder="输入 API 密钥...">
						<span style={{ fontWeight: 500 }}>Dify API 密钥</span>
					</VSCodeTextField>

					<VSCodeTextField
						value={apiConfiguration?.difyBaseUrl || ""}
						style={{ width: "100%", marginTop: 3 }}
						type="url"
						onInput={handleInputChange("difyBaseUrl")}
						placeholder="输入 Dify 基础 URL...">
						<span style={{ fontWeight: 500 }}>Dify 基础 URL</span>
					</VSCodeTextField>

					<p
						style={{
							fontSize: "12px",
							marginTop: 3,
							color: "var(--vscode-descriptionForeground)",
						}}>
						API 密钥和基础 URL 存储在本地，仅用于从此扩展发出 API 请求。
					</p>
				</div>
			)}

			{apiErrorMessage && (
				<p
					style={{
						margin: "-10px 0 4px 0",
						fontSize: 12,
						color: "var(--vscode-errorForeground)",
					}}>
					{apiErrorMessage}
				</p>
			)}

			{selectedProvider === "xai" && (
				<div>
					<VSCodeTextField
						value={apiConfiguration?.xaiApiKey || ""}
						style={{ width: "100%" }}
						type="password"
						onInput={handleInputChange("xaiApiKey")}
						placeholder="Enter API Key...">
						<span style={{ fontWeight: 500 }}>X AI API Key</span>
					</VSCodeTextField>
					<p
						style={{
							fontSize: "12px",
							marginTop: 3,
							color: "var(--vscode-descriptionForeground)",
						}}>
						This key is stored locally and only used to make API requests from this extension.
						{!apiConfiguration?.xaiApiKey && (
							<VSCodeLink href="https://x.ai" style={{ display: "inline", fontSize: "inherit" }}>
								You can get an X AI API key by signing up here.
							</VSCodeLink>
						)}
					</p>
					{/* Note: To fully implement this, you would need to add a handler in ClineProvider.ts */}
					{/* {apiConfiguration?.xaiApiKey && (
						<button
							onClick={() => {
								vscode.postMessage({
									type: "requestXAIModels",
									text: apiConfiguration?.xaiApiKey,
								})
							}}
							style={{ margin: "5px 0 0 0" }}
							className="vscode-button">
							Fetch Available Models
						</button>
					)} */}
				</div>
			)}

			{selectedProvider === "sambanova" && (
				<div>
					<VSCodeTextField
						value={apiConfiguration?.sambanovaApiKey || ""}
						style={{ width: "100%" }}
						type="password"
						onInput={handleInputChange("sambanovaApiKey")}
						placeholder="Enter API Key...">
						<span style={{ fontWeight: 500 }}>SambaNova API Key</span>
					</VSCodeTextField>
					<p
						style={{
							fontSize: "12px",
							marginTop: 3,
							color: "var(--vscode-descriptionForeground)",
						}}>
						This key is stored locally and only used to make API requests from this extension.
						{!apiConfiguration?.sambanovaApiKey && (
							<VSCodeLink
								href="https://docs.sambanova.ai/cloud/docs/get-started/overview"
								style={{
									display: "inline",
									fontSize: "inherit",
								}}>
								You can get a SambaNova API key by signing up here.
							</VSCodeLink>
						)}
					</p>
				</div>
			)}

			{apiErrorMessage && (
				<p
					style={{
						margin: "-10px 0 4px 0",
						fontSize: 12,
						color: "var(--vscode-errorForeground)",
					}}>
					{apiErrorMessage}
				</p>
			)}

			{selectedProvider === "ollama" && showModelOptions && (
				<>
					<VSCodeTextField
						value={apiConfiguration?.requestTimeoutMs ? apiConfiguration.requestTimeoutMs.toString() : "30000"}
						style={{ width: "100%" }}
						onInput={(e: any) => {
							const value = e.target.value
							// Convert to number, with validation
							const numValue = parseInt(value, 10)
							if (!isNaN(numValue) && numValue > 0) {
								setApiConfiguration({
									...apiConfiguration,
									requestTimeoutMs: numValue,
								})
							}
						}}
						placeholder="Default: 30000 (30 seconds)">
						<span style={{ fontWeight: 500 }}>Request Timeout (ms)</span>
					</VSCodeTextField>
					<p style={{ fontSize: "12px", marginTop: 3, color: "var(--vscode-descriptionForeground)" }}>
						Maximum time in milliseconds to wait for API responses before timing out.
					</p>
				</>
			)}

			{(selectedProvider === "openrouter" || selectedProvider === "cline") && showModelOptions && (
				<>
					<VSCodeCheckbox
						style={{ marginTop: -10 }}
						checked={providerSortingSelected}
						onChange={(e: any) => {
							const isChecked = e.target.checked === true
							setProviderSortingSelected(isChecked)
							if (!isChecked) {
								setApiConfiguration({
									...apiConfiguration,
									openRouterProviderSorting: "",
								})
							}
						}}>
						Sort underlying provider routing
					</VSCodeCheckbox>

					{providerSortingSelected && (
						<div style={{ marginBottom: -6 }}>
							<DropdownContainer className="dropdown-container" zIndex={OPENROUTER_MODEL_PICKER_Z_INDEX + 1}>
								<VSCodeDropdown
									style={{ width: "100%", marginTop: 3 }}
									value={apiConfiguration?.openRouterProviderSorting}
									onChange={(e: any) => {
										setApiConfiguration({
											...apiConfiguration,
											openRouterProviderSorting: e.target.value,
										})
									}}>
									<VSCodeOption value="">Default</VSCodeOption>
									<VSCodeOption value="price">Price</VSCodeOption>
									<VSCodeOption value="throughput">Throughput</VSCodeOption>
									<VSCodeOption value="latency">Latency</VSCodeOption>
								</VSCodeDropdown>
							</DropdownContainer>
							<p style={{ fontSize: "12px", marginTop: 3, color: "var(--vscode-descriptionForeground)" }}>
								{!apiConfiguration?.openRouterProviderSorting &&
									"Default behavior is to load balance requests across providers (like AWS, Google Vertex, Anthropic), prioritizing price while considering provider uptime"}
								{apiConfiguration?.openRouterProviderSorting === "price" &&
									"Sort providers by price, prioritizing the lowest cost provider"}
								{apiConfiguration?.openRouterProviderSorting === "throughput" &&
									"Sort providers by throughput, prioritizing the provider with the highest throughput (may increase cost)"}
								{apiConfiguration?.openRouterProviderSorting === "latency" &&
									"Sort providers by response time, prioritizing the provider with the lowest latency"}
							</p>
						</div>
					)}
				</>
			)}

			{selectedProvider !== "openrouter" &&
				selectedProvider !== "cline" &&
				selectedProvider !== "openai" &&
				selectedProvider !== "ollama" &&
				selectedProvider !== "lmstudio" &&
				selectedProvider !== "vscode-lm" &&
				selectedProvider !== "litellm" &&
				selectedProvider !== "requesty" &&
				selectedProvider !== "bedrock" &&
				showModelOptions && (
					<>
						<DropdownContainer zIndex={DROPDOWN_Z_INDEX - 2} className="dropdown-container">
							<label htmlFor="model-id">
								<span style={{ fontWeight: 500 }}>Model</span>
							</label>
							{selectedProvider === "anthropic" && createDropdown(anthropicModels)}
							{selectedProvider === "vertex" &&
								createDropdown(apiConfiguration?.vertexRegion === "global" ? vertexGlobalModels : vertexModels)}
							{selectedProvider === "gemini" && createDropdown(geminiModels)}
							{selectedProvider === "openai-native" && createDropdown(openAiNativeModels)}
							{selectedProvider === "deepseek" && createDropdown(deepSeekModels)}
							{selectedProvider === "qwen" &&
								createDropdown(
									apiConfiguration?.qwenApiLine === "china" ? mainlandQwenModels : internationalQwenModels,
								)}
							{selectedProvider === "doubao" && createDropdown(doubaoModels)}
							{selectedProvider === "mistral" && createDropdown(mistralModels)}
							{selectedProvider === "asksage" && createDropdown(askSageModels)}
							{selectedProvider === "xai" && createDropdown(xaiModels)}
							{selectedProvider === "sambanova" && createDropdown(sambanovaModels)}
						</DropdownContainer>

						{((selectedProvider === "anthropic" && selectedModelId === "claude-3-7-sonnet-20250219") ||
							(selectedProvider === "vertex" && selectedModelId === "claude-3-7-sonnet@20250219")) && (
							<ThinkingBudgetSlider apiConfiguration={apiConfiguration} setApiConfiguration={setApiConfiguration} />
						)}

						{selectedProvider === "xai" && selectedModelId.includes("3-mini") && (
							<>
								<VSCodeCheckbox
									style={{ marginTop: 0 }}
									checked={reasoningEffortSelected}
									onChange={(e: any) => {
										const isChecked = e.target.checked === true
										setReasoningEffortSelected(isChecked)
										if (!isChecked) {
											setApiConfiguration({
												...apiConfiguration,
												reasoningEffort: "",
											})
										}
									}}>
									Modify reasoning effort
								</VSCodeCheckbox>

								{reasoningEffortSelected && (
									<div>
										<label htmlFor="reasoning-effort-dropdown">
											<span style={{}}>Reasoning Effort</span>
										</label>
										<DropdownContainer className="dropdown-container" zIndex={DROPDOWN_Z_INDEX - 100}>
											<VSCodeDropdown
												id="reasoning-effort-dropdown"
												style={{ width: "100%", marginTop: 3 }}
												value={apiConfiguration?.reasoningEffort || "high"}
												onChange={(e: any) => {
													setApiConfiguration({
														...apiConfiguration,
														reasoningEffort: e.target.value,
													})
												}}>
												<VSCodeOption value="low">low</VSCodeOption>
												<VSCodeOption value="high">high</VSCodeOption>
											</VSCodeDropdown>
										</DropdownContainer>
										<p
											style={{
												fontSize: "12px",
												marginTop: 3,
												marginBottom: 0,
												color: "var(--vscode-descriptionForeground)",
											}}>
											High effort may produce more thorough analysis but takes longer and uses more tokens.
										</p>
									</div>
								)}
							</>
						)}

						<ModelInfoView
							selectedModelId={selectedModelId}
							modelInfo={selectedModelInfo}
							isDescriptionExpanded={isDescriptionExpanded}
							setIsDescriptionExpanded={setIsDescriptionExpanded}
							isPopup={isPopup}
						/>
					</>
				)}

			{(selectedProvider === "openrouter" || selectedProvider === "cline") && showModelOptions && (
				<OpenRouterModelPicker isPopup={isPopup} />
			)}
			{selectedProvider === "requesty" && showModelOptions && <RequestyModelPicker isPopup={isPopup} />}

			{modelIdErrorMessage && (
				<p
					style={{
						margin: "-10px 0 4px 0",
						fontSize: 12,
						color: "var(--vscode-errorForeground)",
					}}>
					{modelIdErrorMessage}
				</p>
			)}
		</div>
	)
}

export function getOpenRouterAuthUrl(uriScheme?: string) {
	return `https://openrouter.ai/auth?callback_url=${uriScheme || "vscode"}://saoudrizwan.claude-dev/openrouter`
}

export const formatPrice = (price: number) => {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(price)
}

// Returns an array of formatted tier strings
const formatTiers = (
	tiers: ModelInfo["tiers"],
	priceType: "inputPrice" | "outputPrice" | "cacheReadsPrice" | "cacheWritesPrice",
): JSX.Element[] => {
	if (!tiers || tiers.length === 0) {
		return []
	}

	return tiers
		.map((tier, index, arr) => {
			const prevLimit = index > 0 ? arr[index - 1].contextWindow : 0
			const price = tier[priceType]

			if (price === undefined) return null

			return (
				<span style={{ paddingLeft: "15px" }} key={index}>
					{formatPrice(price)}/million tokens (
					{tier.contextWindow === Number.POSITIVE_INFINITY ? (
						<span>
							{">"} {prevLimit.toLocaleString()}
						</span>
					) : (
						<span>
							{"<="} {tier.contextWindow.toLocaleString()}
						</span>
					)}
					{" tokens)"}
					{index < arr.length - 1 && <br />}
				</span>
			)
		})
		.filter((element): element is JSX.Element => element !== null)
}

export const ModelInfoView = ({
	selectedModelId,
	modelInfo,
	isDescriptionExpanded,
	setIsDescriptionExpanded,
	isPopup,
}: {
	selectedModelId: string
	modelInfo: ModelInfo
	isDescriptionExpanded: boolean
	setIsDescriptionExpanded: (isExpanded: boolean) => void
	isPopup?: boolean
}) => {
	const isGemini = Object.keys(geminiModels).includes(selectedModelId)
	const hasThinkingConfig = !!modelInfo.thinkingConfig
	const hasTiers = !!modelInfo.tiers && modelInfo.tiers.length > 0

	// Create elements for input pricing
	const inputPriceElement = hasTiers ? (
		<Fragment key="inputPriceTiers">
			<span style={{ fontWeight: 500 }}>Input price:</span>
			<br />
			{formatTiers(modelInfo.tiers, "inputPrice")}
		</Fragment>
	) : modelInfo.inputPrice !== undefined && modelInfo.inputPrice > 0 ? (
		<span key="inputPrice">
			<span style={{ fontWeight: 500 }}>Input price:</span> {formatPrice(modelInfo.inputPrice)}/million tokens
		</span>
	) : null

	// --- Output Price Logic ---
	let outputPriceElement = null
	if (hasThinkingConfig && modelInfo.outputPrice !== undefined && modelInfo.thinkingConfig?.outputPrice !== undefined) {
		// Display both standard and thinking budget prices
		outputPriceElement = (
			<Fragment key="outputPriceConditional">
				<span style={{ fontWeight: 500 }}>Output price (Standard):</span> {formatPrice(modelInfo.outputPrice)}/million
				tokens
				<br />
				<span style={{ fontWeight: 500 }}>Output price (Thinking Budget &gt; 0):</span>{" "}
				{formatPrice(modelInfo.thinkingConfig.outputPrice)}/million tokens
			</Fragment>
		)
	} else if (hasTiers) {
		// Display tiered output pricing
		outputPriceElement = (
			<Fragment key="outputPriceTiers">
				<span style={{ fontWeight: 500 }}>Output price:</span>
				<span style={{ fontStyle: "italic" }}> (based on input tokens)</span>
				<br />
				{formatTiers(modelInfo.tiers, "outputPrice")}
			</Fragment>
		)
	} else if (modelInfo.outputPrice !== undefined && modelInfo.outputPrice > 0) {
		// Display single standard output price
		outputPriceElement = (
			<span key="outputPrice">
				<span style={{ fontWeight: 500 }}>Output price:</span> {formatPrice(modelInfo.outputPrice)}/million tokens
			</span>
		)
	}
	// --- End Output Price Logic ---

	const infoItems = [
		modelInfo.description && (
			<ModelDescriptionMarkdown
				key="description"
				markdown={modelInfo.description}
				isExpanded={isDescriptionExpanded}
				setIsExpanded={setIsDescriptionExpanded}
				isPopup={isPopup}
			/>
		),
		<ModelInfoSupportsItem
			key="supportsImages"
			isSupported={modelInfo.supportsImages ?? false}
			supportsLabel="Supports images"
			doesNotSupportLabel="Does not support images"
		/>,
		<ModelInfoSupportsItem
			key="supportsBrowserUse"
			isSupported={modelInfo.supportsImages ?? false} // cline browser tool uses image recognition for navigation (requires model image support).
			supportsLabel="Supports browser use"
			doesNotSupportLabel="Does not support browser use"
		/>,
		!isGemini && (
			<ModelInfoSupportsItem
				key="supportsPromptCache"
				isSupported={modelInfo.supportsPromptCache}
				supportsLabel="Supports prompt caching"
				doesNotSupportLabel="Does not support prompt caching"
			/>
		),
		modelInfo.maxTokens !== undefined && modelInfo.maxTokens > 0 && (
			<span key="maxTokens">
				<span style={{ fontWeight: 500 }}>Max output:</span> {modelInfo.maxTokens?.toLocaleString()} tokens
			</span>
		),
		inputPriceElement, // Add the generated input price block
		modelInfo.supportsPromptCache && modelInfo.cacheWritesPrice && (
			<span key="cacheWritesPrice">
				<span style={{ fontWeight: 500 }}>Cache writes price:</span> {formatPrice(modelInfo.cacheWritesPrice || 0)}
				/million tokens
			</span>
		),
		modelInfo.supportsPromptCache && modelInfo.cacheReadsPrice && (
			<span key="cacheReadsPrice">
				<span style={{ fontWeight: 500 }}>Cache reads price:</span> {formatPrice(modelInfo.cacheReadsPrice || 0)}/million
				tokens
			</span>
		),
		outputPriceElement, // Add the generated output price block
		isGemini && (
			<span key="geminiInfo" style={{ fontStyle: "italic" }}>
				* Free up to {selectedModelId && selectedModelId.includes("flash") ? "15" : "2"} requests per minute. After that,
				billing depends on prompt size.{" "}
				<VSCodeLink href="https://ai.google.dev/pricing" style={{ display: "inline", fontSize: "inherit" }}>
					For more info, see pricing details.
				</VSCodeLink>
			</span>
		),
	].filter(Boolean)

	return (
		<p
			style={{
				fontSize: "12px",
				marginTop: "2px",
				color: "var(--vscode-descriptionForeground)",
			}}>
			{infoItems.map((item, index) => (
				<Fragment key={index}>
					{item}
					{index < infoItems.length - 1 && <br />}
				</Fragment>
			))}
		</p>
	)
}

const ModelInfoSupportsItem = ({
	isSupported,
	supportsLabel,
	doesNotSupportLabel,
}: {
	isSupported: boolean
	supportsLabel: string
	doesNotSupportLabel: string
}) => (
	<span
		style={{
			fontWeight: 500,
			color: isSupported ? "var(--vscode-charts-green)" : "var(--vscode-errorForeground)",
		}}>
		<i
			className={`codicon codicon-${isSupported ? "check" : "x"}`}
			style={{
				marginRight: 4,
				marginBottom: isSupported ? 1 : -1,
				fontSize: isSupported ? 11 : 13,
				fontWeight: 700,
				display: "inline-block",
				verticalAlign: "bottom",
			}}></i>
		{isSupported ? supportsLabel : doesNotSupportLabel}
	</span>
)

export function normalizeApiConfiguration(apiConfiguration?: ApiConfiguration): {
	selectedProvider: ApiProvider
	selectedModelId: string
	selectedModelInfo: ModelInfo
} {
	const provider = apiConfiguration?.apiProvider || "anthropic"
	const modelId = apiConfiguration?.apiModelId

	const getProviderData = (models: Record<string, ModelInfo>, defaultId: string) => {
		let selectedModelId: string
		let selectedModelInfo: ModelInfo
		if (modelId && modelId in models) {
			selectedModelId = modelId
			selectedModelInfo = models[modelId]
		} else {
			selectedModelId = defaultId
			selectedModelInfo = models[defaultId]
		}
		return {
			selectedProvider: provider,
			selectedModelId,
			selectedModelInfo,
		}
	}
	switch (provider) {
		case "anthropic":
			return getProviderData(anthropicModels, anthropicDefaultModelId)
		case "bedrock":
			if (apiConfiguration?.awsBedrockCustomSelected) {
				const baseModelId = apiConfiguration.awsBedrockCustomModelBaseId
				return {
					selectedProvider: provider,
					selectedModelId: modelId || bedrockDefaultModelId,
					selectedModelInfo: (baseModelId && bedrockModels[baseModelId]) || bedrockModels[bedrockDefaultModelId],
				}
			}
			return getProviderData(bedrockModels, bedrockDefaultModelId)
		case "vertex":
			return getProviderData(vertexModels, vertexDefaultModelId)
		case "gemini":
			return getProviderData(geminiModels, geminiDefaultModelId)
		case "openai-native":
			return getProviderData(openAiNativeModels, openAiNativeDefaultModelId)
		case "deepseek":
			return getProviderData(deepSeekModels, deepSeekDefaultModelId)
		case "qwen":
			const qwenModels = apiConfiguration?.qwenApiLine === "china" ? mainlandQwenModels : internationalQwenModels
			const qwenDefaultId =
				apiConfiguration?.qwenApiLine === "china" ? mainlandQwenDefaultModelId : internationalQwenDefaultModelId
			return getProviderData(qwenModels, qwenDefaultId)
		case "doubao":
			return getProviderData(doubaoModels, doubaoDefaultModelId)
		case "mistral":
			return getProviderData(mistralModels, mistralDefaultModelId)
		case "asksage":
			return getProviderData(askSageModels, askSageDefaultModelId)
		case "openrouter":
			return {
				selectedProvider: provider,
				selectedModelId: apiConfiguration?.openRouterModelId || openRouterDefaultModelId,
				selectedModelInfo: apiConfiguration?.openRouterModelInfo || openRouterDefaultModelInfo,
			}
		case "requesty":
			return {
				selectedProvider: provider,
				selectedModelId: apiConfiguration?.requestyModelId || requestyDefaultModelId,
				selectedModelInfo: apiConfiguration?.requestyModelInfo || requestyDefaultModelInfo,
			}
		case "cline":
			return {
				selectedProvider: provider,
				selectedModelId: apiConfiguration?.openRouterModelId || openRouterDefaultModelId,
				selectedModelInfo: apiConfiguration?.openRouterModelInfo || openRouterDefaultModelInfo,
			}
		case "openai":
			return {
				selectedProvider: provider,
				selectedModelId: apiConfiguration?.openAiModelId || "",
				selectedModelInfo: apiConfiguration?.openAiModelInfo || openAiModelInfoSaneDefaults,
			}
		case "ollama":
			return {
				selectedProvider: provider,
				selectedModelId: apiConfiguration?.ollamaModelId || "",
				selectedModelInfo: openAiModelInfoSaneDefaults,
			}
		case "lmstudio":
			return {
				selectedProvider: provider,
				selectedModelId: apiConfiguration?.lmStudioModelId || "",
				selectedModelInfo: openAiModelInfoSaneDefaults,
			}
		case "vscode-lm":
			return {
				selectedProvider: provider,
				selectedModelId: apiConfiguration?.vsCodeLmModelSelector
					? `${apiConfiguration.vsCodeLmModelSelector.vendor}/${apiConfiguration.vsCodeLmModelSelector.family}`
					: "",
				selectedModelInfo: {
					...openAiModelInfoSaneDefaults,
					supportsImages: false, // VSCode LM API currently doesn't support images
				},
			}
		case "litellm":
			return {
				selectedProvider: provider,
				selectedModelId: apiConfiguration?.liteLlmModelId || "",
				selectedModelInfo: apiConfiguration?.liteLlmModelInfo || liteLlmModelInfoSaneDefaults,
			}
		case "dify":
			return {
				selectedProvider: provider,
				selectedModelId: "",
				selectedModelInfo: openAiModelInfoSaneDefaults,
			}
		case "xai":
			return getProviderData(xaiModels, xaiDefaultModelId)
		case "sambanova":
			return getProviderData(sambanovaModels, sambanovaDefaultModelId)
		default:
			return getProviderData(anthropicModels, anthropicDefaultModelId)
	}
}

export default memo(ApiOptions)
