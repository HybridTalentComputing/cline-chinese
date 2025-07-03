import { ApiKeyField } from "../common/ApiKeyField"
import { DebouncedTextField } from "../common/DebouncedTextField"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { useApiConfigurationHandlers } from "../utils/useApiConfigurationHandlers"
import { ApiConfiguration } from "@shared/api"

/**
 * Props for the FireworksProvider component
 */
interface FireworksProviderProps {
	showModelOptions: boolean
	isPopup?: boolean
}

/**
 * The Fireworks provider configuration component
 */
export const FireworksProvider = ({ showModelOptions, isPopup }: FireworksProviderProps) => {
	const { apiConfiguration } = useExtensionState()
	const { handleFieldChange } = useApiConfigurationHandlers()

	// Handler for number input fields with validation
	const handleNumberInputChange = (field: keyof ApiConfiguration, value: string) => {
		if (!value) {
			return
		}
		const num = parseInt(value, 10)
		if (isNaN(num)) {
			return
		}
		handleFieldChange(field, num)
	}

	return (
		<div>
			<ApiKeyField
				initialValue={apiConfiguration?.fireworksApiKey || ""}
				onChange={(value) => handleFieldChange("fireworksApiKey", value)}
				providerName="Fireworks"
				signupUrl="https://fireworks.ai/settings/users/api-keys"
			/>

			{showModelOptions && (
				<>
					<DebouncedTextField
						initialValue={apiConfiguration?.fireworksModelId || ""}
						onChange={(value) => handleFieldChange("fireworksModelId", value)}
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
							(<span style={{ fontWeight: 500 }}>注意:</span> Cline 使用复杂的提示，与 Claude
							模型配合使用效果最佳。性能较差的模型可能无法达到预期效果。)
						</span>
					</p>
					<DebouncedTextField
						initialValue={apiConfiguration?.fireworksModelMaxCompletionTokens?.toString() || ""}
						onChange={(value) => handleNumberInputChange("fireworksModelMaxCompletionTokens", value)}
						style={{ width: "100%", marginBottom: 8 }}
						placeholder={"2000"}>
						<span style={{ fontWeight: 500 }}>最大输出 Tokens</span>
					</DebouncedTextField>
					<DebouncedTextField
						initialValue={apiConfiguration?.fireworksModelMaxTokens?.toString() || ""}
						onChange={(value) => handleNumberInputChange("fireworksModelMaxTokens", value)}
						style={{ width: "100%", marginBottom: 8 }}
						placeholder={"4000"}>
						<span style={{ fontWeight: 500 }}>最大输入 Tokens</span>
					</DebouncedTextField>
				</>
			)}
		</div>
	)
}
