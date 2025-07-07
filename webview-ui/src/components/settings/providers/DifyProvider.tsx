import { ApiKeyField } from "../common/ApiKeyField"
import { BaseUrlField } from "../common/BaseUrlField"
import { useApiConfigurationHandlers } from "../utils/useApiConfigurationHandlers"
import { useExtensionState } from "@/context/ExtensionStateContext"

/**
 * The Gemini provider configuration component
 */
export const DifyProvider = () => {
	const { apiConfiguration } = useExtensionState()
	const { handleFieldChange } = useApiConfigurationHandlers()
	return (
		<div>
			<ApiKeyField
				initialValue={apiConfiguration?.difyApiKey || ""}
				onChange={(value) => handleFieldChange("difyApiKey", value)}
				providerName="Dify"
				signupUrl="https://cloud.dify.ai/signin"
			/>

			<BaseUrlField
				initialValue={apiConfiguration?.difyBaseUrl}
				onChange={(value) => handleFieldChange("difyBaseUrl", value)}
				placeholder=""
				label="自定义 URL"
			/>
		</div>
	)
}
