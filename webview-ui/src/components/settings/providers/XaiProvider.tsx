import { xaiModels } from "@shared/api"
import { VSCodeCheckbox, VSCodeDropdown, VSCodeOption } from "@vscode/webview-ui-toolkit/react"
import { useState, useEffect } from "react"
import { ApiKeyField } from "../common/ApiKeyField"
import { ModelSelector, DropdownContainer } from "../common/ModelSelector"
import { ModelInfoView } from "../common/ModelInfoView"
import { normalizeApiConfiguration } from "../utils/providerUtils"
import { DROPDOWN_Z_INDEX } from "../ApiOptions"
import { useApiConfigurationHandlers } from "../utils/useApiConfigurationHandlers"
import { useExtensionState } from "@/context/ExtensionStateContext"

/**
 * Props for the XaiProvider component
 */
interface XaiProviderProps {
	showModelOptions: boolean
	isPopup?: boolean
}

export const XaiProvider = ({ showModelOptions, isPopup }: XaiProviderProps) => {
	const { apiConfiguration } = useExtensionState()
	const { handleFieldChange } = useApiConfigurationHandlers()

	// Get the normalized configuration
	const { selectedModelId, selectedModelInfo } = normalizeApiConfiguration(apiConfiguration)

	// Local state for reasoning effort toggle
	const [reasoningEffortSelected, setReasoningEffortSelected] = useState(!!apiConfiguration?.reasoningEffort)

	return (
		<div>
			<div>
				<ApiKeyField
					initialValue={apiConfiguration?.xaiApiKey || ""}
					onChange={(value) => handleFieldChange("xaiApiKey", value)}
					providerName="X AI"
					signupUrl="https://x.ai"
				/>
				<p
					style={{
						fontSize: "12px",
						marginTop: -10,
						color: "var(--vscode-descriptionForeground)",
					}}>
					<span style={{ color: "var(--vscode-errorForeground)" }}>
						(<span style={{ fontWeight: 500 }}>注意:</span> Cline 使用复杂的提示，与 Claude
						模型配合使用效果最佳。性能较差的模型可能无法达到预期效果。)
					</span>
				</p>
			</div>

			{showModelOptions && (
				<>
					<ModelSelector
						models={xaiModels}
						selectedModelId={selectedModelId}
						onChange={(e: any) => handleFieldChange("apiModelId", e.target.value)}
						label="Model"
					/>

					{selectedModelId && selectedModelId.includes("3-mini") && (
						<>
							<VSCodeCheckbox
								style={{ marginTop: 0 }}
								checked={reasoningEffortSelected}
								onChange={(e: any) => {
									const isChecked = e.target.checked === true
									setReasoningEffortSelected(isChecked)
									if (!isChecked) {
										handleFieldChange("reasoningEffort", "")
									}
								}}>
								修改推理强度
							</VSCodeCheckbox>

							{reasoningEffortSelected && (
								<div>
									<label htmlFor="reasoning-effort-dropdown">
										<span style={{}}>推理强度</span>
									</label>
									<DropdownContainer className="dropdown-container" zIndex={DROPDOWN_Z_INDEX - 100}>
										<VSCodeDropdown
											id="reasoning-effort-dropdown"
											style={{ width: "100%", marginTop: 3 }}
											value={apiConfiguration?.reasoningEffort || "high"}
											onChange={(e: any) => {
												handleFieldChange("reasoningEffort", e.target.value)
											}}>
											<VSCodeOption value="low">低</VSCodeOption>
											<VSCodeOption value="high">高</VSCodeOption>
										</VSCodeDropdown>
									</DropdownContainer>
									<p
										style={{
											fontSize: "12px",
											marginTop: 3,
											marginBottom: 0,
											color: "var(--vscode-descriptionForeground)",
										}}>
										付出更多努力可能会产生更彻底的分析，但需要更长的时间并使用更多的令牌。
									</p>
								</div>
							)}
						</>
					)}

					<ModelInfoView selectedModelId={selectedModelId} modelInfo={selectedModelInfo} isPopup={isPopup} />
				</>
			)}
		</div>
	)
}
