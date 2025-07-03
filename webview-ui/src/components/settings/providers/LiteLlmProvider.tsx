import { useState } from "react"
import { liteLlmModelInfoSaneDefaults } from "@shared/api"
import { VSCodeCheckbox, VSCodeLink } from "@vscode/webview-ui-toolkit/react"
import { DebouncedTextField } from "../common/DebouncedTextField"
import { getAsVar, VSC_DESCRIPTION_FOREGROUND } from "@/utils/vscStyles"
import { normalizeApiConfiguration } from "../utils/providerUtils"
import { ModelInfoView } from "../common/ModelInfoView"
import ThinkingBudgetSlider from "../ThinkingBudgetSlider"
import { useApiConfigurationHandlers } from "../utils/useApiConfigurationHandlers"
import { useExtensionState } from "@/context/ExtensionStateContext"

/**
 * Props for the LiteLlmProvider component
 */
interface LiteLlmProviderProps {
	showModelOptions: boolean
	isPopup?: boolean
}

/**
 * The LiteLLM provider configuration component
 */
export const LiteLlmProvider = ({ showModelOptions, isPopup }: LiteLlmProviderProps) => {
	const { apiConfiguration } = useExtensionState()
	const { handleFieldChange } = useApiConfigurationHandlers()

	// Get the normalized configuration
	const { selectedModelId, selectedModelInfo } = normalizeApiConfiguration(apiConfiguration)

	// Local state for collapsible model configuration section
	const [modelConfigurationSelected, setModelConfigurationSelected] = useState(false)

	return (
		<div>
			<DebouncedTextField
				initialValue={apiConfiguration?.liteLlmBaseUrl || ""}
				onChange={(value) => handleFieldChange("liteLlmBaseUrl", value)}
				style={{ width: "100%" }}
				type="url"
				placeholder={"Default: http://localhost:4000"}>
				<span style={{ fontWeight: 500 }}>Base URL (optional)</span>
			</DebouncedTextField>
			<DebouncedTextField
				initialValue={apiConfiguration?.liteLlmApiKey || ""}
				onChange={(value) => handleFieldChange("liteLlmApiKey", value)}
				style={{ width: "100%" }}
				type="password"
				placeholder="Default: noop">
				<span style={{ fontWeight: 500 }}>API Key</span>
			</DebouncedTextField>
			<DebouncedTextField
				initialValue={apiConfiguration?.liteLlmModelId || ""}
				onChange={(value) => handleFieldChange("liteLlmModelId", value)}
				style={{ width: "100%" }}
				placeholder={"e.g. anthropic/claude-sonnet-4-20250514"}>
				<span style={{ fontWeight: 500 }}>Model ID</span>
			</DebouncedTextField>

			<div style={{ display: "flex", flexDirection: "column", marginTop: 10, marginBottom: 10 }}>
				{selectedModelInfo.supportsPromptCache && (
					<>
						<VSCodeCheckbox
							checked={apiConfiguration?.liteLlmUsePromptCache || false}
							onChange={(e: any) => {
								const isChecked = e.target.checked === true

								handleFieldChange("liteLlmUsePromptCache", isChecked)
							}}
							style={{ fontWeight: 500, color: "var(--vscode-charts-green)" }}>
							使用提示词缓存 (GA)
						</VSCodeCheckbox>
						<p style={{ fontSize: "12px", marginTop: 3, color: "var(--vscode-charts-green)" }}>
							提示词缓存功能需要供应商支持
						</p>
					</>
				)}
			</div>

			<>
				<ThinkingBudgetSlider />
				<p
					style={{
						fontSize: "12px",
						marginTop: "5px",
						color: "var(--vscode-descriptionForeground)",
					}}>
					扩展思维可用于 Sonnet-4、o3-mini、Deepseek R1 等模型。更多信息{" "}
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

							handleFieldChange("liteLlmModelInfo", modelInfo)
						}}>
						支持图片
					</VSCodeCheckbox>
					<div style={{ display: "flex", gap: 10, marginTop: "5px" }}>
						<DebouncedTextField
							initialValue={
								apiConfiguration?.liteLlmModelInfo?.contextWindow
									? apiConfiguration.liteLlmModelInfo.contextWindow.toString()
									: (liteLlmModelInfoSaneDefaults.contextWindow?.toString() ?? "")
							}
							style={{ flex: 1 }}
							onChange={(value) => {
								const modelInfo = apiConfiguration?.liteLlmModelInfo
									? apiConfiguration.liteLlmModelInfo
									: { ...liteLlmModelInfoSaneDefaults }
								modelInfo.contextWindow = Number(value)

								handleFieldChange("liteLlmModelInfo", modelInfo)
							}}>
							<span style={{ fontWeight: 500 }}>最大输入</span>
						</DebouncedTextField>
						<DebouncedTextField
							initialValue={
								apiConfiguration?.liteLlmModelInfo?.maxTokens
									? apiConfiguration.liteLlmModelInfo.maxTokens.toString()
									: (liteLlmModelInfoSaneDefaults.maxTokens?.toString() ?? "")
							}
							style={{ flex: 1 }}
							onChange={(value) => {
								const modelInfo = apiConfiguration?.liteLlmModelInfo
									? apiConfiguration.liteLlmModelInfo
									: { ...liteLlmModelInfoSaneDefaults }
								modelInfo.maxTokens = Number(value)

								handleFieldChange("liteLlmModelInfo", modelInfo)
							}}>
							<span style={{ fontWeight: 500 }}>最大输出</span>
						</DebouncedTextField>
					</div>
					<div style={{ display: "flex", gap: 10, marginTop: "5px" }}>
						<DebouncedTextField
							initialValue={
								apiConfiguration?.liteLlmModelInfo?.temperature !== undefined
									? apiConfiguration.liteLlmModelInfo.temperature.toString()
									: (liteLlmModelInfoSaneDefaults.temperature?.toString() ?? "")
							}
							onChange={(value) => {
								const modelInfo = apiConfiguration?.liteLlmModelInfo
									? apiConfiguration.liteLlmModelInfo
									: { ...liteLlmModelInfoSaneDefaults }

								// Check if the input ends with a decimal point or has trailing zeros after decimal
								const shouldPreserveFormat = value.endsWith(".") || (value.includes(".") && value.endsWith("0"))

								modelInfo.temperature =
									value === "" ? liteLlmModelInfoSaneDefaults.temperature : parseFloat(value)

								handleFieldChange("liteLlmModelInfo", modelInfo)
							}}>
							<span style={{ fontWeight: 500 }}>温度</span>
						</DebouncedTextField>
					</div>
				</>
			)}
			<p
				style={{
					fontSize: "12px",
					marginTop: "5px",
					color: "var(--vscode-descriptionForeground)",
				}}>
				LiteLLM 提供统一的接口，方便访问各种 LLM 提供商的模型。请参阅他们的{" "}
				<VSCodeLink href="https://docs.litellm.ai/docs/" style={{ display: "inline", fontSize: "inherit" }}>
					快速入门指南
				</VSCodeLink>{" "}
			</p>

			{showModelOptions && (
				<ModelInfoView selectedModelId={selectedModelId} modelInfo={selectedModelInfo} isPopup={isPopup} />
			)}
		</div>
	)
}
