import { Mode } from "@shared/storage/types"
import { Trans, useTranslation } from "react-i18next"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { DebouncedTextField } from "../common/DebouncedTextField"
import { HuggingFaceModelPicker } from "../HuggingFaceModelPicker"
import { useApiConfigurationHandlers } from "../utils/useApiConfigurationHandlers"

/**
 * Props for the HuggingFaceProvider component
 */
interface HuggingFaceProviderProps {
	showModelOptions: boolean
	isPopup?: boolean
	currentMode: Mode
}

/**
 * The Hugging Face provider configuration component
 */
export const HuggingFaceProvider = ({ showModelOptions, isPopup, currentMode }: HuggingFaceProviderProps) => {
	const { t } = useTranslation()
	const { apiConfiguration } = useExtensionState()
	const { handleFieldChange } = useApiConfigurationHandlers()

	return (
		<div>
			<DebouncedTextField
				initialValue={apiConfiguration?.huggingFaceApiKey || ""}
				onChange={(value) => handleFieldChange("huggingFaceApiKey", value)}
				placeholder={t("settings.apiConfig.apiKeyPlaceholder")}
				style={{ width: "100%" }}
				type="password">
				<span style={{ fontWeight: 500 }}>{t("settings.apiConfig.huggingFaceApiKey")}</span>
			</DebouncedTextField>
			<p
				style={{
					fontSize: "12px",
					marginTop: "5px",
					color: "var(--vscode-descriptionForeground)",
				}}>
				<Trans
					components={{
						apiKeyLink: (
							<a href="https://huggingface.co/settings/tokens" rel="noopener noreferrer" target="_blank">
								{t("settings.apiConfig.getHuggingFaceApiKey")}
							</a>
						),
					}}
					i18nKey="settings.apiConfig.huggingFaceDescription"
				/>
			</p>

			{showModelOptions && <HuggingFaceModelPicker currentMode={currentMode} isPopup={isPopup} />}
		</div>
	)
}
