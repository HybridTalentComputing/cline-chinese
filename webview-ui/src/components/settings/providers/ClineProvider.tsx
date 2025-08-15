import { ApiConfiguration } from "@shared/api"
import { VSCodeCheckbox, VSCodeDropdown, VSCodeOption } from "@vscode/webview-ui-toolkit/react"
import { useState } from "react"
import { ClineAccountInfoCard } from "../ClineAccountInfoCard"
import OpenRouterModelPicker, { OPENROUTER_MODEL_PICKER_Z_INDEX } from "../OpenRouterModelPicker"
import { DropdownContainer } from "../common/ModelSelector"
import { useApiConfigurationHandlers } from "../utils/useApiConfigurationHandlers"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { Mode } from "@shared/storage/types"
/**
 * Props for the ClineProvider component
 */
interface ClineProviderProps {
	showModelOptions: boolean
	isPopup?: boolean
	currentMode: Mode
}

/**
 * The Cline provider configuration component
 */
export const ClineProvider = ({ showModelOptions, isPopup, currentMode }: ClineProviderProps) => {
	const { apiConfiguration } = useExtensionState()
	const { handleFieldChange } = useApiConfigurationHandlers()

	const [providerSortingSelected, setProviderSortingSelected] = useState(!!apiConfiguration?.openRouterProviderSorting)

	return (
		<div>
			{/* Cline Account Info Card */}
			<div style={{ marginBottom: 14, marginTop: 4 }}>
				<ClineAccountInfoCard />
			</div>

			{showModelOptions && (
				<>
					{/* Provider Sorting Options */}
					<VSCodeCheckbox
						style={{ marginTop: -10 }}
						checked={providerSortingSelected}
						onChange={(e: any) => {
							const isChecked = e.target.checked === true
							setProviderSortingSelected(isChecked)
							if (!isChecked) {
								handleFieldChange("openRouterProviderSorting", "")
							}
						}}>
						排序底层提供商路由
					</VSCodeCheckbox>

					{providerSortingSelected && (
						<div style={{ marginBottom: -6 }}>
							<DropdownContainer className="dropdown-container" zIndex={OPENROUTER_MODEL_PICKER_Z_INDEX + 1}>
								<VSCodeDropdown
									style={{ width: "100%", marginTop: 3 }}
									value={apiConfiguration?.openRouterProviderSorting}
									onChange={(e: any) => {
										handleFieldChange("openRouterProviderSorting", e.target.value)
									}}>
									<VSCodeOption value="">默认</VSCodeOption>
									<VSCodeOption value="price">价格</VSCodeOption>
									<VSCodeOption value="throughput">吞吐量</VSCodeOption>
									<VSCodeOption value="latency">延迟</VSCodeOption>
								</VSCodeDropdown>
							</DropdownContainer>
							<p style={{ fontSize: "12px", marginTop: 3, color: "var(--vscode-descriptionForeground)" }}>
								{!apiConfiguration?.openRouterProviderSorting &&
									"默认行为是在提供商之间（如 AWS、Google Vertex、Anthropic）负载均衡请求，优先考虑价格同时考虑提供商正常运行时间"}
								{apiConfiguration?.openRouterProviderSorting === "price" &&
									"按价格排序提供商，优先选择成本最低的提供商"}
								{apiConfiguration?.openRouterProviderSorting === "throughput" &&
									"按吞吐量排序提供商，优先选择吞吐量最高的提供商（可能增加成本）"}
								{apiConfiguration?.openRouterProviderSorting === "latency" &&
									"按响应时间排序提供商，优先选择延迟最低的提供商"}
							</p>
						</div>
					)}

					{/* OpenRouter Model Picker */}
					<OpenRouterModelPicker isPopup={isPopup} currentMode={currentMode} />
				</>
			)}
		</div>
	)
}
