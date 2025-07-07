import { ApiConfiguration, internationalQwenModels, mainlandQwenModels } from "@shared/api"
import { VSCodeDropdown, VSCodeOption } from "@vscode/webview-ui-toolkit/react"
import { ApiKeyField } from "../common/ApiKeyField"
import { ModelSelector, DropdownContainer } from "../common/ModelSelector"
import { ModelInfoView } from "../common/ModelInfoView"
import { normalizeApiConfiguration } from "../utils/providerUtils"
import ThinkingBudgetSlider from "../ThinkingBudgetSlider"
import { DROPDOWN_Z_INDEX } from "../ApiOptions"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { useApiConfigurationHandlers } from "../utils/useApiConfigurationHandlers"

const SUPPORTED_THINKING_MODELS = [
	"qwen3-235b-a22b",
	"qwen3-32b",
	"qwen3-30b-a3b",
	"qwen3-14b",
	"qwen3-8b",
	"qwen3-4b",
	"qwen3-1.7b",
	"qwen3-0.6b",
	"qwen-plus-latest",
	"qwen-turbo-latest",
]

/**
 * Props for the QwenProvider component
 */
interface QwenProviderProps {
	showModelOptions: boolean
	isPopup?: boolean
}

/**
 * The Alibaba Qwen provider configuration component
 */
export const QwenProvider = ({ showModelOptions, isPopup }: QwenProviderProps) => {
	const { apiConfiguration } = useExtensionState()
	const { handleFieldChange } = useApiConfigurationHandlers()

	// Get the normalized configuration
	const { selectedModelId, selectedModelInfo } = normalizeApiConfiguration(apiConfiguration)

	// Determine which models to use based on API line selection
	const qwenModels = apiConfiguration?.qwenApiLine === "china" ? mainlandQwenModels : internationalQwenModels

	return (
		<div>
			<DropdownContainer className="dropdown-container" style={{ position: "inherit" }}>
				<label htmlFor="qwen-line-provider">
					<span style={{ fontWeight: 500, marginTop: 5 }}>Alibaba API Line</span>
				</label>
				<VSCodeDropdown
					id="qwen-line-provider"
					value={apiConfiguration?.qwenApiLine || "china"}
					onChange={(e: any) => handleFieldChange("qwenApiLine", e.target.value)}
					style={{
						minWidth: 130,
						position: "relative",
					}}>
					<VSCodeOption value="china">中国大陆 API</VSCodeOption>
					<VSCodeOption value="international">国际版 API</VSCodeOption>
				</VSCodeDropdown>
			</DropdownContainer>
			<p
				style={{
					fontSize: "12px",
					marginTop: 3,
					color: "var(--vscode-descriptionForeground)",
				}}>
				请根据您的位置选择合适的 API 接口。如果您在中国，请选择“中国 API 接口”。否则，请选择“国际 API 接口”。
			</p>

			<ApiKeyField
				initialValue={apiConfiguration?.qwenApiKey || ""}
				onChange={(value) => handleFieldChange("qwenApiKey", value)}
				providerName="Qwen"
				signupUrl="https://bailian.console.aliyun.com/"
			/>

			{showModelOptions && (
				<>
					<ModelSelector
						models={qwenModels}
						selectedModelId={selectedModelId}
						onChange={(e: any) => handleFieldChange("apiModelId", e.target.value)}
						label="Model"
						zIndex={DROPDOWN_Z_INDEX - 2}
					/>

					{SUPPORTED_THINKING_MODELS.includes(selectedModelId) && (
						<ThinkingBudgetSlider maxBudget={selectedModelInfo.thinkingConfig?.maxBudget} />
					)}

					<ModelInfoView selectedModelId={selectedModelId} modelInfo={selectedModelInfo} isPopup={isPopup} />
				</>
			)}
		</div>
	)
}
