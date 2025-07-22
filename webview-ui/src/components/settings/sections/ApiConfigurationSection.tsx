import { VSCodeCheckbox } from "@vscode/webview-ui-toolkit/react"
import { TabButton } from "../../mcp/configuration/McpConfigurationView"
import ApiOptions from "../ApiOptions"
import Section from "../Section"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { StateServiceClient } from "@/services/grpc-client"
import { UpdateSettingsRequest } from "@shared/proto/state"
import { useState } from "react"
import { syncModeConfigurations } from "../utils/providerUtils"
import { useApiConfigurationHandlers } from "../utils/useApiConfigurationHandlers"
import { Mode } from "@shared/ChatSettings"

interface ApiConfigurationSectionProps {
	renderSectionHeader: (tabId: string) => JSX.Element | null
}

const ApiConfigurationSection = ({ renderSectionHeader }: ApiConfigurationSectionProps) => {
	const { planActSeparateModelsSetting, chatSettings, apiConfiguration } = useExtensionState()
	const [currentTab, setCurrentTab] = useState<Mode>(chatSettings.mode)
	const { handleFieldsChange } = useApiConfigurationHandlers()
	return (
		<div>
			{renderSectionHeader("api-config")}
			<Section>
				{/* Tabs container */}
				{planActSeparateModelsSetting ? (
					<div className="rounded-md mb-5 bg-[var(--vscode-panel-background)]">
						<div className="flex gap-[1px] mb-[10px] -mt-2 border-0 border-b border-solid border-[var(--vscode-panel-border)]">
							<TabButton
								isActive={currentTab === "plan"}
								onClick={() => setCurrentTab("plan")}
								disabled={currentTab === "plan"}
								style={{
									opacity: 1,
									cursor: "pointer",
								}}>
								计划模式
							</TabButton>
							<TabButton
								isActive={currentTab === "act"}
								onClick={() => setCurrentTab("act")}
								disabled={currentTab === "act"}
								style={{
									opacity: 1,
									cursor: "pointer",
								}}>
								执行模式
							</TabButton>
						</div>

						{/* Content container */}
						<div className="-mb-3">
							<ApiOptions showModelOptions={true} currentMode={currentTab} />
						</div>
					</div>
				) : (
					<ApiOptions showModelOptions={true} currentMode={chatSettings.mode} />
				)}

				<div className="mb-[5px]">
					<VSCodeCheckbox
						className="mb-[5px]"
						checked={planActSeparateModelsSetting}
						onChange={async (e: any) => {
							const checked = e.target.checked === true
							try {
								// If unchecking the toggle, wait a bit for state to update, then sync configurations
								if (!checked) {
									await syncModeConfigurations(apiConfiguration, currentTab, handleFieldsChange)
								}
								await StateServiceClient.updateSettings(
									UpdateSettingsRequest.create({
										planActSeparateModelsSetting: checked,
									}),
								)
							} catch (error) {
								console.error("Failed to update separate models setting:", error)
							}
						}}>
						对计划和行动模式使用不同的模型
					</VSCodeCheckbox>
					<p className="text-xs mt-[5px] text-[var(--vscode-descriptionForeground)]">
						在“计划”和“行动”模式之间切换将保留前一个模式中使用的 API
						和模型。这可能会有所帮助，例如，在使用强推理模型构建计划以用于更低成本的编码模型时。
					</p>
				</div>
			</Section>
		</div>
	)
}

export default ApiConfigurationSection
