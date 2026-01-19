import { geminiModels } from "@shared/api"
import { Mode } from "@shared/storage/types"
import { VSCodeDropdown, VSCodeOption } from "@vscode/webview-ui-toolkit/react"
import { useTranslation } from "react-i18next"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { ApiKeyField } from "../common/ApiKeyField"
import { BaseUrlField } from "../common/BaseUrlField"
import { ModelInfoView } from "../common/ModelInfoView"
import { DropdownContainer, ModelSelector } from "../common/ModelSelector"
import ThinkingBudgetSlider from "../ThinkingBudgetSlider"
import { normalizeApiConfiguration } from "../utils/providerUtils"
import { useApiConfigurationHandlers } from "../utils/useApiConfigurationHandlers"

// Gemini models that support thinking/reasoning mode
const SUPPORTED_THINKING_MODELS = [
	"gemini-3-pro-preview",
	"gemini-2.5-pro",
	"gemini-2.5-flash",
	"gemini-2.5-flash-lite-preview-06-17",
]

/**
 * Props for the GeminiProvider component
 */
interface GeminiProviderProps {
	showModelOptions: boolean
	isPopup?: boolean
	currentMode: Mode
}

/**
 * The Gemini provider configuration component
 */
export const GeminiProvider = ({ showModelOptions, isPopup, currentMode }: GeminiProviderProps) => {
	const { t } = useTranslation()
	const { apiConfiguration } = useExtensionState()
	const { handleFieldChange, handleModeFieldChange } = useApiConfigurationHandlers()

	// Get the normalized configuration
	const { selectedModelId, selectedModelInfo } = normalizeApiConfiguration(apiConfiguration, currentMode)

	const geminiThinkingLevel =
		currentMode === "plan" ? apiConfiguration?.geminiPlanModeThinkingLevel : apiConfiguration?.geminiActModeThinkingLevel

	return (
		<div>
			<ApiKeyField
				initialValue={apiConfiguration?.geminiApiKey || ""}
				onChange={(value) => handleFieldChange("geminiApiKey", value)}
				providerName="Gemini"
				signupUrl="https://aistudio.google.com/apikey"
			/>

			<BaseUrlField
				initialValue={apiConfiguration?.geminiBaseUrl}
				label="自定义 base URL"
				onChange={(value) => handleFieldChange("geminiBaseUrl", value)}
				placeholder={t("settings.apiConfig.geminiBaseUrlPlaceholder")}
			/>

			{showModelOptions && (
				<>
					<ModelSelector
						label={t("settings.providers.model")}
						models={geminiModels}
						onChange={(e: any) =>
							handleModeFieldChange(
								{ plan: "planModeApiModelId", act: "actModeApiModelId" },
								e.target.value,
								currentMode,
							)
						}
						selectedModelId={selectedModelId}
					/>

					{/* When ThinkLevel is set, thinking budget cannot be adjusted and must be enabled */}
					{SUPPORTED_THINKING_MODELS.includes(selectedModelId) &&
						!selectedModelInfo.thinkingConfig?.geminiThinkingLevel && (
							<ThinkingBudgetSlider
								currentMode={currentMode}
								maxBudget={selectedModelInfo.thinkingConfig?.maxBudget}
							/>
						)}

					{selectedModelInfo.thinkingConfig?.supportsThinkingLevel && (
						<DropdownContainer className="dropdown-container" style={{ marginTop: "8px" }} zIndex={1}>
							<label htmlFor="thinking-level">
								<span className="font-medium">{t("settings.apiConfig.thinkingLevel")}</span>
							</label>
							<VSCodeDropdown
								className="w-full"
								id="thinking-level"
								onChange={(e: any) =>
									handleModeFieldChange(
										{ plan: "geminiPlanModeThinkingLevel", act: "geminiActModeThinkingLevel" },
										e.target.value,
										currentMode,
									)
								}
								value={geminiThinkingLevel || "high"}>
								<VSCodeOption value="low">{t("settings.apiConfig.low")}</VSCodeOption>
								<VSCodeOption value="high">{t("settings.apiConfig.high")}</VSCodeOption>
							</VSCodeDropdown>
						</DropdownContainer>
					)}

					<ModelInfoView isPopup={isPopup} modelInfo={selectedModelInfo} selectedModelId={selectedModelId} />
				</>
			)}
		</div>
	)
}
