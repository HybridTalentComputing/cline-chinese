import { EmptyRequest } from "@shared/proto/cline/common"
import { Mode } from "@shared/storage/types"
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react"
import { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { AccountServiceClient } from "@/services/grpc-client"
import { DebouncedTextField } from "../common/DebouncedTextField"
import { ModelInfoView } from "../common/ModelInfoView"
import HicapModelPicker from "../HicapModelPicker"
import { getModeSpecificFields, normalizeApiConfiguration } from "../utils/providerUtils"
import { useApiConfigurationHandlers } from "../utils/useApiConfigurationHandlers"

/**
 * Props for the HicapProvider component
 */
interface HicapProviderProps {
	showModelOptions: boolean
	isPopup?: boolean
	currentMode: Mode
}

/**
 * The Hicap provider configuration component
 */
export const HicapProvider = ({ showModelOptions, isPopup, currentMode }: HicapProviderProps) => {
	const { t } = useTranslation("settings")
	const { apiConfiguration, refreshHicapModels } = useExtensionState()
	const { handleFieldChange, handleModeFieldChange } = useApiConfigurationHandlers()
	const { selectedModelId, selectedModelInfo } = normalizeApiConfiguration(apiConfiguration, currentMode)
	const { hicapModelInfo } = getModeSpecificFields(apiConfiguration, currentMode)

	useEffect(() => {
		if (apiConfiguration?.hicapApiKey && apiConfiguration?.hicapApiKey.length === 32) {
			refreshHicapModels()
		}
	}, [apiConfiguration?.hicapApiKey, refreshHicapModels])

	return (
		<div>
			<div>
				<DebouncedTextField
					initialValue={apiConfiguration?.hicapApiKey || ""}
					onChange={(value) => {
						handleFieldChange("hicapApiKey", value)
						if (value.length === 32) {
							refreshHicapModels()
						}
					}}
					placeholder={t("commonFields.enterApiKey")}
					style={{ width: "100%" }}
					type="password">
					<div
						style={{
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
							width: "100%",
							margin: "10px 0 0 0",
						}}>
						<span style={{ fontWeight: 500 }}>{t("providers.hicap.apiKey")}</span>
					</div>
				</DebouncedTextField>

				{!apiConfiguration?.hicapApiKey && (
					<VSCodeButton
						appearance="secondary"
						onClick={async () => {
							try {
								await AccountServiceClient.hicapAuthClicked(EmptyRequest.create())
							} catch (error) {
								console.error("Failed to open Hicap auth:", error)
							}
						}}
						style={{ margin: "5px 0 0 0" }}>
						Generate API Key
					</VSCodeButton>
				)}
			</div>

			{showModelOptions && (
				<div style={{ margin: "10px 0 0 0" }}>
					<HicapModelPicker currentMode={currentMode} isPopup={isPopup} />

					<ModelInfoView isPopup={isPopup} modelInfo={selectedModelInfo} selectedModelId={selectedModelId} />

					<div style={{ display: "flex", gap: 10, marginTop: "5px" }}>
						<DebouncedTextField
							initialValue={selectedModelInfo.contextWindow?.toString() ?? ""}
							onChange={(value) => {
								const modelInfo = hicapModelInfo ? { ...hicapModelInfo } : { ...selectedModelInfo }
								modelInfo.contextWindow = Number(value)
								handleModeFieldChange(
									{ plan: "planModeHicapModelInfo", act: "actModeHicapModelInfo" },
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
								const modelInfo = hicapModelInfo ? { ...hicapModelInfo } : { ...selectedModelInfo }
								modelInfo.maxTokens = Number(value)
								handleModeFieldChange(
									{ plan: "planModeHicapModelInfo", act: "actModeHicapModelInfo" },
									modelInfo,
									currentMode,
								)
							}}
							style={{ flex: 1 }}>
							<span style={{ fontWeight: 500 }}>{t("providers.openaiCompatible.maxOutputTokens")}</span>
						</DebouncedTextField>
					</div>
				</div>
			)}
		</div>
	)
}
