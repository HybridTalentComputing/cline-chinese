import { claudeCodeModels } from "@shared/api"
import { Mode } from "@shared/storage/types"
import { useTranslation } from "react-i18next"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { DebouncedTextField } from "../common/DebouncedTextField"
import { ModelInfoView } from "../common/ModelInfoView"
import { ModelSelector } from "../common/ModelSelector"
import ThinkingBudgetSlider from "../ThinkingBudgetSlider"
import { normalizeApiConfiguration } from "../utils/providerUtils"
import { useApiConfigurationHandlers } from "../utils/useApiConfigurationHandlers"
import { SUPPORTED_ANTHROPIC_THINKING_MODELS } from "./AnthropicProvider"

const SUPPORTED_CLAUDE_CODE_THINKING_MODELS = [
	...SUPPORTED_ANTHROPIC_THINKING_MODELS,
	"sonnet",
	"sonnet[1m]",
	"claude-opus-4-7[1m]",
	"claude-sonnet-4-6[1m]",
	"claude-sonnet-4-5-20250929[1m]",
	"claude-opus-4-6[1m]",
	"opus",
	"opus[1m]",
]

/**
 * Props for the ClaudeCodeProvider component
 */
interface ClaudeCodeProviderProps {
	showModelOptions: boolean
	isPopup?: boolean
	currentMode: Mode
}

/**
 * The Claude Code provider configuration component
 */
export const ClaudeCodeProvider = ({ showModelOptions, isPopup, currentMode }: ClaudeCodeProviderProps) => {
	const { t } = useTranslation("settings")
	const { apiConfiguration } = useExtensionState()
	const { handleFieldChange, handleModeFieldChange } = useApiConfigurationHandlers()

	// Get the normalized configuration
	const { selectedModelId, selectedModelInfo } = normalizeApiConfiguration(apiConfiguration, currentMode)

	return (
		<div>
			<DebouncedTextField
				initialValue={apiConfiguration?.claudeCodePath || ""}
				onChange={(value) => handleFieldChange("claudeCodePath", value)}
				placeholder={t("providers.claudeCode.defaultClaudePlaceholder")}
				style={{ width: "100%", marginTop: 3 }}
				type="text">
				<span style={{ fontWeight: 500 }}>{t("providers.claudeCode.cliPath")}</span>
			</DebouncedTextField>

			<p
				style={{
					fontSize: "12px",
					marginTop: 3,
					color: "var(--vscode-descriptionForeground)",
				}}>
				{t("providers.claudeCode.cliPathDescription")}
			</p>

			{showModelOptions && (
				<>
					<ModelSelector
						label={t("settings.model")}
						models={claudeCodeModels}
						onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
							handleModeFieldChange(
								{ plan: "planModeApiModelId", act: "actModeApiModelId" },
								e.target.value,
								currentMode,
							)
						}
						selectedModelId={selectedModelId}
					/>

					{(selectedModelId === "sonnet" || selectedModelId === "opus") && (
						<p
							style={{
								fontSize: "12px",
								marginBottom: 2,
								marginTop: 2,
								color: "var(--vscode-descriptionForeground)",
							}}>
							{t("providers.lmStudio.useLatestVersion")} {selectedModelId} {t("providers.lmStudio.byDefault")}
						</p>
					)}

					{SUPPORTED_CLAUDE_CODE_THINKING_MODELS.includes(selectedModelId) && (
						<ThinkingBudgetSlider currentMode={currentMode} maxBudget={selectedModelInfo.thinkingConfig?.maxBudget} />
					)}

					<ModelInfoView isPopup={isPopup} modelInfo={selectedModelInfo} selectedModelId={selectedModelId} />
				</>
			)}
		</div>
	)
}
