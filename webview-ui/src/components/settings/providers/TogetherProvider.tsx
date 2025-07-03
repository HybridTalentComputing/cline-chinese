import { ApiConfiguration } from "@shared/api"
import { DebouncedTextField } from "../common/DebouncedTextField"
import { ApiKeyField } from "../common/ApiKeyField"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { useApiConfigurationHandlers } from "../utils/useApiConfigurationHandlers"

/**
 * Props for the TogetherProvider component
 */
interface TogetherProviderProps {
	showModelOptions: boolean
	isPopup?: boolean
}

/**
 * The Together provider configuration component
 */
export const TogetherProvider = ({ showModelOptions, isPopup }: TogetherProviderProps) => {
	const { apiConfiguration } = useExtensionState()
	const { handleFieldChange } = useApiConfigurationHandlers()

	return (
		<div>
			<ApiKeyField
				initialValue={apiConfiguration?.togetherApiKey || ""}
				onChange={(value) => handleFieldChange("togetherApiKey", value)}
				providerName="Together"
			/>
			<DebouncedTextField
				initialValue={apiConfiguration?.togetherModelId || ""}
				onChange={(value) => handleFieldChange("togetherModelId", value)}
				style={{ width: "100%" }}
				placeholder={"Enter Model ID..."}>
				<span style={{ fontWeight: 500 }}>模型 ID</span>
			</DebouncedTextField>
			<p
				style={{
					fontSize: "12px",
					marginTop: 3,
					color: "var(--vscode-descriptionForeground)",
				}}>
				<span style={{ color: "var(--vscode-errorForeground)" }}>
					(<span style={{ fontWeight: 500 }}>注意:</span> Cline 使用复杂的提示，与 Claude 模型配合使用效果最佳。
					性能较差的模型可能无法达到预期效果。)
				</span>
			</p>
		</div>
	)
}
