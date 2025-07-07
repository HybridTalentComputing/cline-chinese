import { vertexGlobalModels, vertexModels } from "@shared/api"
import { VSCodeDropdown, VSCodeOption, VSCodeLink } from "@vscode/webview-ui-toolkit/react"
import { DebouncedTextField } from "../common/DebouncedTextField"
import { ModelSelector } from "../common/ModelSelector"
import { ModelInfoView } from "../common/ModelInfoView"
import { normalizeApiConfiguration } from "../utils/providerUtils"
import { DropdownContainer, DROPDOWN_Z_INDEX } from "../ApiOptions"
import ThinkingBudgetSlider from "../ThinkingBudgetSlider"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { useApiConfigurationHandlers } from "../utils/useApiConfigurationHandlers"

/**
 * Props for the VertexProvider component
 */
interface VertexProviderProps {
	showModelOptions: boolean
	isPopup?: boolean
}

// Vertex models that support thinking
const SUPPORTED_THINKING_MODELS = [
	"claude-3-7-sonnet@20250219",
	"claude-sonnet-4@20250514",
	"claude-opus-4@20250514",
	"gemini-2.5-flash",
	"gemini-2.5-pro",
]

/**
 * The GCP Vertex AI provider configuration component
 */
export const VertexProvider = ({ showModelOptions, isPopup }: VertexProviderProps) => {
	const { apiConfiguration } = useExtensionState()
	const { handleFieldChange } = useApiConfigurationHandlers()

	// Get the normalized configuration
	const { selectedModelId, selectedModelInfo } = normalizeApiConfiguration(apiConfiguration)

	// Determine which models to use based on region
	const modelsToUse = apiConfiguration?.vertexRegion === "global" ? vertexGlobalModels : vertexModels

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				gap: 5,
			}}>
			<DebouncedTextField
				initialValue={apiConfiguration?.vertexProjectId || ""}
				onChange={(value) => handleFieldChange("vertexProjectId", value)}
				style={{ width: "100%" }}
				placeholder="Enter Project ID...">
				<span style={{ fontWeight: 500 }}>Google Cloud 项目 ID</span>
			</DebouncedTextField>

			<DropdownContainer zIndex={DROPDOWN_Z_INDEX - 1} className="dropdown-container">
				<label htmlFor="vertex-region-dropdown">
					<span style={{ fontWeight: 500 }}>Google Cloud 地域</span>
				</label>
				<VSCodeDropdown
					id="vertex-region-dropdown"
					value={apiConfiguration?.vertexRegion || ""}
					style={{ width: "100%" }}
					onChange={(e: any) => handleFieldChange("vertexRegion", e.target.value)}>
					<VSCodeOption value="">选择地域...</VSCodeOption>
					<VSCodeOption value="us-east5">美东5</VSCodeOption>
					<VSCodeOption value="us-central1">美中1</VSCodeOption>
					<VSCodeOption value="europe-west1">西欧1</VSCodeOption>
					<VSCodeOption value="europe-west4">西欧4</VSCodeOption>
					<VSCodeOption value="asia-southeast1">东南亚1</VSCodeOption>
					<VSCodeOption value="global">全球</VSCodeOption>
				</VSCodeDropdown>
			</DropdownContainer>

			<p
				style={{
					fontSize: "12px",
					marginTop: "5px",
					color: "var(--vscode-descriptionForeground)",
				}}>
				要使用 Google Cloud Vertex AI，您需要
				<VSCodeLink
					href="https://cloud.google.com/vertex-ai/generative-ai/docs/partner-models/use-claude#before_you_begin"
					style={{ display: "inline", fontSize: "inherit" }}>
					{"1)创建 Google Cloud 帐户 › 启用 Vertex AI API › 启用所需的 Claude 模型，"}
				</VSCodeLink>{" "}
				<VSCodeLink
					href="https://cloud.google.com/docs/authentication/provide-credentials-adc#google-idp"
					style={{ display: "inline", fontSize: "inherit" }}>
					{"2)安装 Google Cloud CLI › 配置应用程序默认凭据."}
				</VSCodeLink>
			</p>

			{showModelOptions && (
				<>
					<ModelSelector
						models={modelsToUse}
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
