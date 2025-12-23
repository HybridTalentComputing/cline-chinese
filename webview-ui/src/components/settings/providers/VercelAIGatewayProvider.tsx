import { Mode } from "@shared/storage/types"
import { VSCodeLink } from "@vscode/webview-ui-toolkit/react"
import { Trans, useTranslation } from "react-i18next"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { DebouncedTextField } from "../common/DebouncedTextField"
import OpenRouterModelPicker from "../OpenRouterModelPicker"
import { useApiConfigurationHandlers } from "../utils/useApiConfigurationHandlers"

/**
 * Props for the VercelAIGatewayProvider component
 */
interface VercelAIGatewayProviderProps {
	showModelOptions: boolean
	isPopup?: boolean
	currentMode: Mode
}

/**
 * The Vercel AI Gateway provider configuration component
 */
export const VercelAIGatewayProvider = ({ showModelOptions, isPopup, currentMode }: VercelAIGatewayProviderProps) => {
	const { t } = useTranslation()
	const { apiConfiguration } = useExtensionState()
	const { handleFieldChange } = useApiConfigurationHandlers()

	return (
		<div>
			<div>
				<DebouncedTextField
					initialValue={apiConfiguration?.vercelAiGatewayApiKey || ""}
					onChange={(value) => handleFieldChange("vercelAiGatewayApiKey", value)}
					placeholder={t("settings.apiConfig.apiKeyPlaceholder")}
					style={{ width: "100%" }}
					type="password">
					<span style={{ fontWeight: 500 }}>{t("settings.apiConfig.vercelAiGatewayApiKey")}</span>
				</DebouncedTextField>
				<p
					style={{
						fontSize: "12px",
						marginTop: "5px",
						color: "var(--vscode-descriptionForeground)",
					}}>
					{t("settings.apiConfig.apiKeyStoredLocally")}
					{!apiConfiguration?.vercelAiGatewayApiKey && (
						<>
							{" "}
							<Trans
								components={{
									signupLink: (
										<VSCodeLink
											href="https://vercel.com/d?to=%2F%5Bteam%5D%2F%7E%2Fai"
											style={{ display: "inline", fontSize: "inherit" }}>
											{t("settings.apiConfig.signingUpHere")}
										</VSCodeLink>
									),
								}}
								i18nKey="settings.apiConfig.getVercelAiGatewayApiKey"
							/>
						</>
					)}
				</p>
			</div>

			{showModelOptions && <OpenRouterModelPicker currentMode={currentMode} isPopup={isPopup} />}
		</div>
	)
}
