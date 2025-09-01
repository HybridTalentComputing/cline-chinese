import { liteLlmModelInfoSaneDefaults } from "@shared/api"
import { Mode } from "@shared/storage/types"
import { VSCodeCheckbox, VSCodeLink } from "@vscode/webview-ui-toolkit/react"
import { useState } from "react"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { getAsVar, VSC_DESCRIPTION_FOREGROUND } from "@/utils/vscStyles"
import { DebouncedTextField } from "../common/DebouncedTextField"
import { ModelInfoView } from "../common/ModelInfoView"
import ThinkingBudgetSlider from "../ThinkingBudgetSlider"
import { getModeSpecificFields, normalizeApiConfiguration } from "../utils/providerUtils"
import { useApiConfigurationHandlers } from "../utils/useApiConfigurationHandlers"

/**
 * Props for the LiteLlmProvider component
 */
interface LiteLlmProviderProps {
	showModelOptions: boolean
	isPopup?: boolean
	currentMode: Mode
}

/**
 * The LiteLLM provider configuration component
 */
export const LiteLlmProvider = ({ showModelOptions, isPopup, currentMode }: LiteLlmProviderProps) => {
	const { apiConfiguration } = useExtensionState()
	const { handleFieldChange, handleModeFieldChange } = useApiConfigurationHandlers()

	// Get the normalized configuration
	const { selectedModelId, selectedModelInfo } = normalizeApiConfiguration(apiConfiguration, currentMode)

	// Get mode-specific fields
	const { liteLlmModelId, liteLlmModelInfo } = getModeSpecificFields(apiConfiguration, currentMode)

	// Local state for collapsible model configuration section
	const [modelConfigurationSelected, setModelConfigurationSelected] = useState(false)

	return (
		<div>
			<DebouncedTextField
				initialValue={apiConfiguration?.liteLlmBaseUrl || ""}
				onChange={(value) => handleFieldChange("liteLlmBaseUrl", value)}
				placeholder={"Default: http://localhost:4000"}
				style={{ width: "100%" }}
				type="url">
				<span style={{ fontWeight: 500 }}>Base URL (optional)</span>
			</DebouncedTextField>
			<DebouncedTextField
				initialValue={apiConfiguration?.liteLlmApiKey || ""}
				onChange={(value) => handleFieldChange("liteLlmApiKey", value)}
				placeholder="Default: noop"
				style={{ width: "100%" }}
				type="password">
				<span style={{ fontWeight: 500 }}>API Key</span>
			</DebouncedTextField>
			<DebouncedTextField
				initialValue={liteLlmModelId || ""}
				onChange={(value) =>
					handleModeFieldChange({ plan: "planModeLiteLlmModelId", act: "actModeLiteLlmModelId" }, value, currentMode)
				}
				placeholder={"e.g. anthropic/claude-sonnet-4-20250514"}
				style={{ width: "100%" }}>
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

			<ThinkingBudgetSlider currentMode={currentMode} />
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
					思维模式配置
				</VSCodeLink>
			</p>

			<div
				onClick={() => setModelConfigurationSelected((val) => !val)}
				style={{
					color: getAsVar(VSC_DESCRIPTION_FOREGROUND),
					display: "flex",
					margin: "10px 0",
					cursor: "pointer",
					alignItems: "center",
				}}>
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
						checked={!!liteLlmModelInfo?.supportsImages}
						onChange={(e: any) => {
							const isChecked = e.target.checked === true
							const modelInfo = liteLlmModelInfo ? liteLlmModelInfo : { ...liteLlmModelInfoSaneDefaults }
							modelInfo.supportsImages = isChecked

							handleModeFieldChange(
								{ plan: "planModeLiteLlmModelInfo", act: "actModeLiteLlmModelInfo" },
								modelInfo,
								currentMode,
							)
						}}>
						支持图片
					</VSCodeCheckbox>
					<div style={{ display: "flex", gap: 10, marginTop: "5px" }}>
						<DebouncedTextField
							initialValue={
								liteLlmModelInfo?.contextWindow
									? liteLlmModelInfo.contextWindow.toString()
									: (liteLlmModelInfoSaneDefaults.contextWindow?.toString() ?? "")
							}
							onChange={(value) => {
								const modelInfo = liteLlmModelInfo ? liteLlmModelInfo : { ...liteLlmModelInfoSaneDefaults }
								modelInfo.contextWindow = Number(value)

								handleModeFieldChange(
									{ plan: "planModeLiteLlmModelInfo", act: "actModeLiteLlmModelInfo" },
									modelInfo,
									currentMode,
								)
							}}
							style={{ flex: 1 }}>
							<span style={{ fontWeight: 500 }}>上下文窗口</span>
						</DebouncedTextField>
						<DebouncedTextField
							initialValue={
								liteLlmModelInfo?.maxTokens
									? liteLlmModelInfo.maxTokens.toString()
									: (liteLlmModelInfoSaneDefaults.maxTokens?.toString() ?? "")
							}
							onChange={(value) => {
								const modelInfo = liteLlmModelInfo ? liteLlmModelInfo : { ...liteLlmModelInfoSaneDefaults }
								modelInfo.maxTokens = Number(value)

								handleModeFieldChange(
									{ plan: "planModeLiteLlmModelInfo", act: "actModeLiteLlmModelInfo" },
									modelInfo,
									currentMode,
								)
							}}
							style={{ flex: 1 }}>
							<span style={{ fontWeight: 500 }}>最大输出 Tokens</span>
						</DebouncedTextField>
					</div>
					<div style={{ display: "flex", gap: 10, marginTop: "5px" }}>
						<DebouncedTextField
							initialValue={
								liteLlmModelInfo?.temperature !== undefined
									? liteLlmModelInfo.temperature.toString()
									: (liteLlmModelInfoSaneDefaults.temperature?.toString() ?? "")
							}
							onChange={(value) => {
								const modelInfo = liteLlmModelInfo ? liteLlmModelInfo : { ...liteLlmModelInfoSaneDefaults }

								// Check if the input ends with a decimal point or has trailing zeros after decimal
								const _shouldPreserveFormat = value.endsWith(".") || (value.includes(".") && value.endsWith("0"))

								modelInfo.temperature =
									value === "" ? liteLlmModelInfoSaneDefaults.temperature : parseFloat(value)

								handleModeFieldChange(
									{ plan: "planModeLiteLlmModelInfo", act: "actModeLiteLlmModelInfo" },
									modelInfo,
									currentMode,
								)
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
				<ModelInfoView isPopup={isPopup} modelInfo={selectedModelInfo} selectedModelId={selectedModelId} />
			)}
		</div>
	)
}
