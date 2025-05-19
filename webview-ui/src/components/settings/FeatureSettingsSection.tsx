import { VSCodeCheckbox, VSCodeDropdown, VSCodeOption } from "@vscode/webview-ui-toolkit/react"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { memo } from "react"
import { OpenAIReasoningEffort } from "@shared/ChatSettings"

const FeatureSettingsSection = () => {
	const {
		enableCheckpointsSetting,
		setEnableCheckpointsSetting,
		mcpMarketplaceEnabled,
		setMcpMarketplaceEnabled,
		chatSettings,
		setChatSettings,
	} = useExtensionState()

	return (
		<div style={{ marginBottom: 20, borderTop: "1px solid var(--vscode-panel-border)", paddingTop: 15 }}>
			{/* 功能设置标题 */}
			<h3 style={{ color: "var(--vscode-foreground)", margin: "0 0 10px 0", fontSize: "14px" }}>功能设置</h3>
			<div>
				<VSCodeCheckbox
					checked={enableCheckpointsSetting}
					onChange={(e: any) => {
						const checked = e.target.checked === true
						setEnableCheckpointsSetting(checked)
					}}>
					启用检查点
				</VSCodeCheckbox>
				{/* 启用检查点描述 */}
				<p className="text-xs text-[var(--vscode-descriptionForeground)]">
					允许扩展在整个任务过程中保存工作区的检查点。底层使用 git，可能不适用于大型工作区。
				</p>
			</div>
			<div style={{ marginTop: 10 }}>
				<VSCodeCheckbox
					checked={mcpMarketplaceEnabled}
					onChange={(e: any) => {
						const checked = e.target.checked === true
						setMcpMarketplaceEnabled(checked)
					}}>
					启用 MCP 市场
				</VSCodeCheckbox>
				{/* 启用 MCP 市场描述 */}
				<p className="text-xs text-[var(--vscode-descriptionForeground)]">
					启用 MCP 市场选项卡，用于发现和安装 MCP 服务器。
				</p>
			</div>
			<div style={{ marginTop: 10 }}>
				{/* OpenAI 推理强度标签 */}
				<label
					htmlFor="openai-reasoning-effort-dropdown"
					className="block text-sm font-medium text-[var(--vscode-foreground)] mb-1">
					OpenAI 推理强度
				</label>
				<VSCodeDropdown
					id="openai-reasoning-effort-dropdown"
					currentValue={chatSettings.openAIReasoningEffort || "medium"}
					onChange={(e: any) => {
						const newValue = e.target.currentValue as OpenAIReasoningEffort
						setChatSettings({
							...chatSettings,
							openAIReasoningEffort: newValue,
						})
					}}
					className="w-full">
					{/* OpenAI 推理强度选项 */}
					<VSCodeOption value="low">低</VSCodeOption>
					<VSCodeOption value="medium">中</VSCodeOption>
					<VSCodeOption value="high">高</VSCodeOption>
				</VSCodeDropdown>
				{/* OpenAI 推理强度描述 */}
				<p className="text-xs mt-[5px] text-[var(--vscode-descriptionForeground)]">
					OpenAI 系列模型的推理强度（适用于所有 OpenAI 模型提供商）
				</p>
			</div>
		</div>
	)
}

export default memo(FeatureSettingsSection)
