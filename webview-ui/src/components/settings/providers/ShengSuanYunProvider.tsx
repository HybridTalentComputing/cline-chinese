import { Mode } from "@shared/storage/types"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { ApiKeyField } from "../common/ApiKeyField"
import ShengSuanYunModelPicker from "../ShengSuanYunModelPicker"
import { useApiConfigurationHandlers } from "../utils/useApiConfigurationHandlers"

interface ShengSuanYunProviderProps {
	showModelOptions: boolean
	isPopup?: boolean
	currentMode: Mode
}

export const ShengSuanYunProvider = ({ showModelOptions, isPopup, currentMode }: ShengSuanYunProviderProps) => {
	const { apiConfiguration } = useExtensionState()
	const { handleFieldChange } = useApiConfigurationHandlers()

	return (
		<div>
			<ApiKeyField
				initialValue={apiConfiguration?.shengSuanYunApiKey || ""}
				onChange={(value) => handleFieldChange("shengSuanYunApiKey", value)}
				providerName="胜算云"
				signupUrl="https://console.shengsuanyun.com/user/keys"
			/>
			{showModelOptions && <ShengSuanYunModelPicker currentMode={currentMode} isPopup={isPopup} />}
		</div>
	)
}
