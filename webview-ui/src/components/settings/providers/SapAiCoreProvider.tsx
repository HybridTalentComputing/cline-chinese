import { sapAiCoreModels } from "@shared/api"
import { VSCodeLink } from "@vscode/webview-ui-toolkit/react"
import { DebouncedTextField } from "../common/DebouncedTextField"
import { ModelSelector } from "../common/ModelSelector"
import { ModelInfoView } from "../common/ModelInfoView"
import { normalizeApiConfiguration } from "../utils/providerUtils"
import { useApiConfigurationHandlers } from "../utils/useApiConfigurationHandlers"
import { useExtensionState } from "@/context/ExtensionStateContext"

/**
 * Props for the SapAiCoreProvider component
 */
interface SapAiCoreProviderProps {
	showModelOptions: boolean
	isPopup?: boolean
}

/**
 * The SAP AI Core provider configuration component
 */
export const SapAiCoreProvider = ({ showModelOptions, isPopup }: SapAiCoreProviderProps) => {
	const { apiConfiguration } = useExtensionState()
	const { handleFieldChange } = useApiConfigurationHandlers()

	const { selectedModelId, selectedModelInfo } = normalizeApiConfiguration(apiConfiguration)

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
			<DebouncedTextField
				initialValue={apiConfiguration?.sapAiCoreClientId || ""}
				onChange={(value) => handleFieldChange("sapAiCoreClientId", value)}
				style={{ width: "100%" }}
				type="password"
				placeholder="Enter AI Core Client Id...">
				<span style={{ fontWeight: 500 }}>AI Core Client Id</span>
			</DebouncedTextField>
			{apiConfiguration?.sapAiCoreClientId && (
				<p style={{ fontSize: "12px", color: "var(--vscode-descriptionForeground)" }}>
					客户端 ID 已设置。如需更改，请重新输入该值。
				</p>
			)}

			<DebouncedTextField
				initialValue={apiConfiguration?.sapAiCoreClientSecret ? "********" : ""}
				onChange={(value) => handleFieldChange("sapAiCoreClientSecret", value)}
				style={{ width: "100%" }}
				type="password"
				placeholder="Enter AI Core Client Secret...">
				<span style={{ fontWeight: 500 }}>AI Core Client Secret</span>
			</DebouncedTextField>
			{apiConfiguration?.sapAiCoreClientSecret && (
				<p style={{ fontSize: "12px", color: "var(--vscode-descriptionForeground)" }}>
					客户端密钥已设置。如需更改，请重新输入该值。
				</p>
			)}

			<DebouncedTextField
				initialValue={apiConfiguration?.sapAiCoreBaseUrl || ""}
				onChange={(value) => handleFieldChange("sapAiCoreBaseUrl", value)}
				style={{ width: "100%" }}
				placeholder="Enter AI Core Base URL...">
				<span style={{ fontWeight: 500 }}>AI Core Base URL</span>
			</DebouncedTextField>

			<DebouncedTextField
				initialValue={apiConfiguration?.sapAiCoreTokenUrl || ""}
				onChange={(value) => handleFieldChange("sapAiCoreTokenUrl", value)}
				style={{ width: "100%" }}
				placeholder="Enter AI Core Auth URL...">
				<span style={{ fontWeight: 500 }}>AI Core Auth URL</span>
			</DebouncedTextField>

			<DebouncedTextField
				initialValue={apiConfiguration?.sapAiResourceGroup || ""}
				onChange={(value) => handleFieldChange("sapAiResourceGroup", value)}
				style={{ width: "100%" }}
				placeholder="Enter AI Core Resource Group...">
				<span style={{ fontWeight: 500 }}>AI Core Resource Group</span>
			</DebouncedTextField>

			<p
				style={{
					fontSize: "12px",
					marginTop: "5px",
					color: "var(--vscode-descriptionForeground)",
				}}>
				这些凭证存储在本地，仅用于从此扩展发出 API 请求。
				<VSCodeLink
					href="https://help.sap.com/docs/sap-ai-core/sap-ai-core-service-guide/access-sap-ai-core-via-api"
					style={{ display: "inline" }}>
					您可以在此处找到有关 SAP AI Core API 访问的更多信息。
				</VSCodeLink>
			</p>

			{showModelOptions && (
				<>
					<ModelSelector
						models={sapAiCoreModels}
						selectedModelId={selectedModelId}
						onChange={(e: any) => handleFieldChange("apiModelId", e.target.value)}
						label="Model"
					/>

					<ModelInfoView selectedModelId={selectedModelId} modelInfo={selectedModelInfo} isPopup={isPopup} />
				</>
			)}
		</div>
	)
}
