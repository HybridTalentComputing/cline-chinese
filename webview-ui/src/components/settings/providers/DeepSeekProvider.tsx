import { deepSeekModels } from "@shared/api"
import { Mode } from "@shared/storage/types"
import { useTranslation } from "react-i18next"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { ApiKeyField } from "../common/ApiKeyField"
import { DebouncedTextField } from "../common/DebouncedTextField"
import { ModelInfoView } from "../common/ModelInfoView"
import { ModelSelector } from "../common/ModelSelector"
import { getModeSpecificFields, normalizeApiConfiguration } from "../utils/providerUtils"
import { useApiConfigurationHandlers } from "../utils/useApiConfigurationHandlers"

/**
 * Props for the DeepSeekProvider component
 */
interface DeepSeekProviderProps {
	showModelOptions: boolean
	isPopup?: boolean
	currentMode: Mode
}

/**
 * The DeepSeek provider configuration component
 */
export const DeepSeekProvider = ({ showModelOptions, isPopup, currentMode }: DeepSeekProviderProps) => {
	const { t } = useTranslation("settings")
	const { apiConfiguration } = useExtensionState()
	const { handleFieldChange, handleModeFieldChange, handleModeFieldsChange } = useApiConfigurationHandlers()

	// Get the normalized configuration
	const { selectedModelId, selectedModelInfo } = normalizeApiConfiguration(apiConfiguration, currentMode)
	const { deepSeekModelInfo } = getModeSpecificFields(apiConfiguration, currentMode)

	return (
		<div>
			<ApiKeyField
				initialValue={apiConfiguration?.deepSeekApiKey || ""}
				onChange={(value) => handleFieldChange("deepSeekApiKey", value)}
				providerName="DeepSeek"
				signupUrl="https://www.deepseek.com/"
			/>

			{showModelOptions && (
				<>
					<ModelSelector
						label={t("settings.model")}
						models={deepSeekModels}
						onChange={(e: any) => {
							const modelId = e.target.value as keyof typeof deepSeekModels
							handleModeFieldsChange(
								{
									modelId: { plan: "planModeApiModelId", act: "actModeApiModelId" },
									modelInfo: { plan: "planModeDeepSeekModelInfo", act: "actModeDeepSeekModelInfo" },
								},
								{ modelId, modelInfo: deepSeekModels[modelId] },
								currentMode,
							)
						}}
						selectedModelId={selectedModelId}
					/>

					<ModelInfoView isPopup={isPopup} modelInfo={selectedModelInfo} selectedModelId={selectedModelId} />

					<div style={{ display: "flex", gap: 10, marginTop: "5px" }}>
						<DebouncedTextField
							initialValue={selectedModelInfo.contextWindow?.toString() ?? ""}
							onChange={(value) => {
								const modelInfo = deepSeekModelInfo ? { ...deepSeekModelInfo } : { ...selectedModelInfo }
								modelInfo.contextWindow = Number(value)
								handleModeFieldChange(
									{ plan: "planModeDeepSeekModelInfo", act: "actModeDeepSeekModelInfo" },
									modelInfo,
									currentMode,
								)
							}}
							style={{ flex: 1 }}>
							<span style={{ fontWeight: 500 }}>{t("providers.openaiCompatible.contextWindowSize")}</span>
						</DebouncedTextField>

						<DebouncedTextField
							initialValue={selectedModelInfo.maxTokens?.toString() ?? ""}
							onChange={(value) => {
								const modelInfo = deepSeekModelInfo ? { ...deepSeekModelInfo } : { ...selectedModelInfo }
								modelInfo.maxTokens = Number(value)
								handleModeFieldChange(
									{ plan: "planModeDeepSeekModelInfo", act: "actModeDeepSeekModelInfo" },
									modelInfo,
									currentMode,
								)
							}}
							style={{ flex: 1 }}>
							<span style={{ fontWeight: 500 }}>{t("providers.openaiCompatible.maxOutputTokens")}</span>
						</DebouncedTextField>
					</div>
				</>
			)}
		</div>
	)
}
