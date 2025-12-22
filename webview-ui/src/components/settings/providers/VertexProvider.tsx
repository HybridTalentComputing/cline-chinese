import { vertexGlobalModels, vertexModels } from "@shared/api"
import VertexData from "@shared/providers/vertex.json"
import { Mode } from "@shared/storage/types"
import { VSCodeDropdown, VSCodeLink, VSCodeOption } from "@vscode/webview-ui-toolkit/react"
import { useTranslation, Trans } from "react-i18next"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { DROPDOWN_Z_INDEX, DropdownContainer } from "../ApiOptions"
import { DebouncedTextField } from "../common/DebouncedTextField"
import { ModelInfoView } from "../common/ModelInfoView"
import { ModelSelector } from "../common/ModelSelector"
import ThinkingBudgetSlider from "../ThinkingBudgetSlider"
import { normalizeApiConfiguration } from "../utils/providerUtils"
import { useApiConfigurationHandlers } from "../utils/useApiConfigurationHandlers"

/**
 * Props for the VertexProvider component
 */
interface VertexProviderProps {
	showModelOptions: boolean
	isPopup?: boolean
	currentMode: Mode
}

// Vertex models that support thinking
const SUPPORTED_THINKING_MODELS = [
	"claude-haiku-4-5@20251001",
	"claude-sonnet-4-5@20250929",
	"claude-3-7-sonnet@20250219",
	"claude-sonnet-4@20250514",
	"claude-opus-4-5@20251101",
	"claude-opus-4@20250514",
	"claude-opus-4-1@20250805",
	"gemini-2.5-flash",
	"gemini-2.5-pro",
	"gemini-2.5-flash-lite-preview-06-17",
]

const REGIONS = VertexData.regions

/**
 * The GCP Vertex AI provider configuration component
 */
export const VertexProvider = ({ showModelOptions, isPopup, currentMode }: VertexProviderProps) => {
	const { t } = useTranslation()
	const { apiConfiguration } = useExtensionState()
	const { handleFieldChange, handleModeFieldChange } = useApiConfigurationHandlers()

	// Get the normalized configuration
	const { selectedModelId, selectedModelInfo } = normalizeApiConfiguration(apiConfiguration, currentMode)

	// Determine which models to use based on region
	const modelsToUse = apiConfiguration?.vertexRegion === "global" ? vertexGlobalModels : vertexModels

	const geminiThinkingLevel =
		currentMode === "plan" ? apiConfiguration?.geminiPlanModeThinkingLevel : apiConfiguration?.geminiActModeThinkingLevel

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				gap: 5,
			}}>
			<DebouncedTextField
				initialValue={apiConfiguration?.vertexProjectId || ""}
				onChange={(value) => handleFieldChange("vertexProjectId", value)}
				placeholder={t("settings.apiConfig.projectIdPlaceholder")}
				style={{ width: "100%" }}>
				<span style={{ fontWeight: 500 }}>{t("settings.providers.projectId")}</span>
			</DebouncedTextField>

			<DropdownContainer className="dropdown-container" zIndex={DROPDOWN_Z_INDEX - 1}>
				<label htmlFor="vertex-region-dropdown">
					<span style={{ fontWeight: 500 }}>{t("settings.providers.region")}</span>
				</label>
				<VSCodeDropdown
					id="vertex-region-dropdown"
					onChange={(e: any) => handleFieldChange("vertexRegion", e.target.value)}
					style={{ width: "100%" }}
					value={apiConfiguration?.vertexRegion || ""}>
					<VSCodeOption value="">{t("settings.providers.selectRegion")}</VSCodeOption>
					{REGIONS.map((region) => (
						<VSCodeOption key={region} value={region}>
							{region}
						</VSCodeOption>
					))}
				</VSCodeDropdown>
			</DropdownContainer>

			<p
				style={{
					fontSize: "12px",
					marginTop: "5px",
					color: "var(--vscode-descriptionForeground)",
				}}>
				<Trans
					i18nKey="settings.providers.vertexDescription"
					components={{
						step1: (
							<VSCodeLink
								href="https://cloud.google.com/vertex-ai/generative-ai/docs/partner-models/use-claude#before_you_begin"
								style={{ display: "inline", fontSize: "inherit" }}>
								{t("settings.providers.vertexStep1")}
							</VSCodeLink>
						),
						step2: (
							<VSCodeLink
								href="https://cloud.google.com/docs/authentication/provide-credentials-adc#google-idp"
								style={{ display: "inline", fontSize: "inherit" }}>
								{t("settings.providers.vertexStep2")}
							</VSCodeLink>
						),
					}}
				/>
			</p>

			{showModelOptions && (
				<>
					<ModelSelector
						label={t("settings.providers.model")}
						models={modelsToUse}
						onChange={(e: any) =>
							handleModeFieldChange(
								{ plan: "planModeApiModelId", act: "actModeApiModelId" },
								e.target.value,
								currentMode,
							)
						}
						selectedModelId={selectedModelId}
						zIndex={DROPDOWN_Z_INDEX - 2}
					/>

					{SUPPORTED_THINKING_MODELS.includes(selectedModelId) && (
						<ThinkingBudgetSlider currentMode={currentMode} maxBudget={selectedModelInfo.thinkingConfig?.maxBudget} />
					)}

					{selectedModelInfo.thinkingConfig?.supportsThinkingLevel && (
						<DropdownContainer className="dropdown-container" style={{ marginTop: "8px" }} zIndex={1}>
							<label htmlFor="thinking-level">
								<span style={{ fontWeight: 500 }}>{t("settings.providers.thinkingLevel")}</span>
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
								<VSCodeOption value="low">{t("settings.providers.low")}</VSCodeOption>
								<VSCodeOption value="high">{t("settings.providers.high")}</VSCodeOption>
							</VSCodeDropdown>
						</DropdownContainer>
					)}

					<ModelInfoView isPopup={isPopup} modelInfo={selectedModelInfo} selectedModelId={selectedModelId} />
				</>
			)}
		</div>
	)
}
