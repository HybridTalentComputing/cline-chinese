import { wandbModels } from "@shared/api"
import { Mode } from "@shared/storage/types"
import { useTranslation } from "react-i18next"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { ApiKeyField } from "../common/ApiKeyField"
import { ModelInfoView } from "../common/ModelInfoView"
import { ModelSelector } from "../common/ModelSelector"
import { normalizeApiConfiguration } from "../utils/providerUtils"
import { useApiConfigurationHandlers } from "../utils/useApiConfigurationHandlers"

interface WandbProviderProps {
	showModelOptions: boolean
	isPopup?: boolean
	currentMode: Mode
}

export const WandbProvider = ({ showModelOptions, isPopup, currentMode }: WandbProviderProps) => {
	const { t } = useTranslation("settings")
	const { apiConfiguration } = useExtensionState()
	const { handleFieldChange, handleModeFieldChange } = useApiConfigurationHandlers()

	const { selectedModelId, selectedModelInfo } = normalizeApiConfiguration(apiConfiguration, currentMode)

	return (
		<div>
			<ApiKeyField
				helpText={t("commonFields.apiKeyStoredLocally")}
				initialValue={apiConfiguration?.wandbApiKey || ""}
				onChange={(value) => handleFieldChange("wandbApiKey", value)}
				providerName="W&B"
				signupUrl="https://wandb.ai"
			/>

			{showModelOptions && (
				<>
					<ModelSelector
						label={t("settings.model")}
						models={wandbModels}
						onChange={(e: any) =>
							handleModeFieldChange(
								{ plan: "planModeApiModelId", act: "actModeApiModelId" },
								e.target.value,
								currentMode,
							)
						}
						selectedModelId={selectedModelId}
					/>

					<ModelInfoView isPopup={isPopup} modelInfo={selectedModelInfo} selectedModelId={selectedModelId} />
				</>
			)}
		</div>
	)
}
