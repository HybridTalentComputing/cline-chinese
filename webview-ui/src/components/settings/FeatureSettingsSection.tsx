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
		mcpRichDisplayEnabled,
		setMcpRichDisplayEnabled,
		mcpResponsesCollapsed,
		setMcpResponsesCollapsed,
		chatSettings,
		setChatSettings,
	} = useExtensionState()

	return (
		<div style={{ marginBottom: 20 }}>
			<div>
				<VSCodeCheckbox
					checked={enableCheckpointsSetting}
					onChange={(e: any) => {
						const checked = e.target.checked === true
						setEnableCheckpointsSetting(checked)
					}}>
					启用检查点
				</VSCodeCheckbox>
				<p className="text-xs text-[var(--vscode-descriptionForeground)]">
					启用扩展以在任务过程中保存工作区的检查点。使用 git 作为底层工具，可能无法很好地处理大型工作区。
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
				<p className="text-xs text-[var(--vscode-descriptionForeground)]">启用 MCP 市场选项卡以发现和安装 MCP 服务器。</p>
			</div>
			<div style={{ marginTop: 10 }}>
				<VSCodeCheckbox
					checked={mcpRichDisplayEnabled}
					onChange={(e: any) => {
						const checked = e.target.checked === true
						setMcpRichDisplayEnabled(checked)
					}}>
					启用 MCP 恢复附件显示样式
				</VSCodeCheckbox>
				<p className="text-xs text-[var(--vscode-descriptionForeground)]">
					为 MCP 回复启用富文本格式。禁用后，回复将以纯文本显示。
				</p>
			</div>
			<div style={{ marginTop: 10 }}>
				<VSCodeCheckbox
					checked={mcpResponsesCollapsed}
					onChange={(e: any) => {
						const checked = e.target.checked === true
						setMcpResponsesCollapsed(checked)
					}}>
					折叠 MCP 消息
				</VSCodeCheckbox>
				<p className="text-xs text-[var(--vscode-descriptionForeground)]">设置 MCP 响应面板的默认显示模式</p>
			</div>
			<div style={{ marginTop: 10 }}>
				<label
					htmlFor="openai-reasoning-effort-dropdown"
					className="block text-sm font-medium text-[var(--vscode-foreground)] mb-1">
					OpenAI 推理效果
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
					<VSCodeOption value="low">低</VSCodeOption>
					<VSCodeOption value="medium">中</VSCodeOption>
					<VSCodeOption value="high">高</VSCodeOption>
				</VSCodeDropdown>
				<p className="text-xs mt-[5px] text-[var(--vscode-descriptionForeground)]">
					OpenAI 模型系列的推理效果（适用于所有 OpenAI 模型提供者）
				</p>
			</div>
		</div>
	)
}

export default memo(FeatureSettingsSection)
