import { ApiKeyField } from "../common/ApiKeyField"
import ShengSuanYunModelPicker from "../ShengSuanYunModelPicker"
import { useApiConfigurationHandlers } from "../utils/useApiConfigurationHandlers"
import { useExtensionState } from "@/context/ExtensionStateContext"

interface ShengSuanYunProviderProps {
	showModelOptions: boolean
	isPopup?: boolean
}

export const ShengSuanYunProvider = ({ showModelOptions, isPopup }: ShengSuanYunProviderProps) => {
	const { apiConfiguration } = useExtensionState()
	const { handleFieldChange } = useApiConfigurationHandlers()

	return (
		<div>
			<ApiKeyField
				initialValue={apiConfiguration?.shengSuanYunApiKey || ""}
				onChange={(value) => handleFieldChange("shengSuanYunApiKey", value)}
				providerName="胜算云"
				signupUrl="https://www.shengsuanyun.com/login"
			/>
			{showModelOptions && <ShengSuanYunModelPicker isPopup={isPopup} />}
		</div>
	)
}
