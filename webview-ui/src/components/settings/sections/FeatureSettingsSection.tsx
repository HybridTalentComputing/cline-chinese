import { VSCodeCheckbox, VSCodeDropdown, VSCodeOption, VSCodeTextField } from "@vscode/webview-ui-toolkit/react"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { memo } from "react"
import { OpenaiReasoningEffort } from "@shared/storage/types"
import { updateSetting } from "../utils/settingsHandlers"
import { McpDisplayMode } from "@shared/McpDisplayMode"
import McpDisplayModeDropdown from "@/components/mcp/chat-display/McpDisplayModeDropdown"
import Section from "../Section"

interface FeatureSettingsSectionProps {
	renderSectionHeader: (tabId: string) => JSX.Element | null
}

const FeatureSettingsSection = ({ renderSectionHeader }: FeatureSettingsSectionProps) => {
	const {
		enableCheckpointsSetting,
		mcpMarketplaceEnabled,
		mcpDisplayMode,
		mcpResponsesCollapsed,
		openaiReasoningEffort,
		strictPlanModeEnabled,
		focusChainSettings,
		focusChainFeatureFlagEnabled,
	} = useExtensionState()

	const handleReasoningEffortChange = (newValue: OpenaiReasoningEffort) => {
		updateSetting("openaiReasoningEffort", newValue)
	}

	return (
		<div>
			{renderSectionHeader("features")}
			<Section>
				<div style={{ marginBottom: 20 }}>
					<div>
						<VSCodeCheckbox
							checked={enableCheckpointsSetting}
							onChange={(e: any) => {
								const checked = e.target.checked === true
								updateSetting("enableCheckpointsSetting", checked)
							}}>
							启用检查点
						</VSCodeCheckbox>
						<p className="text-xs text-[var(--vscode-descriptionForeground)]">
							启用扩展程序以在整个任务过程中保存工作区的检查点。底层使用 Git，因此可能不适用于大型工作区。
						</p>
					</div>
					<div style={{ marginTop: 10 }}>
						<VSCodeCheckbox
							checked={mcpMarketplaceEnabled}
							onChange={(e: any) => {
								const checked = e.target.checked === true
								updateSetting("mcpMarketplaceEnabled", checked)
							}}>
							启用 MCP 市场
						</VSCodeCheckbox>
						<p className="text-xs text-[var(--vscode-descriptionForeground)]">
							启用 MCP 市场选项卡以发现和安装 MCP 服务器。
						</p>
					</div>
					<div style={{ marginTop: 10 }}>
						<label
							htmlFor="mcp-display-mode-dropdown"
							className="block text-sm font-medium text-[var(--vscode-foreground)] mb-1">
							MCP 显示模式
						</label>
						<McpDisplayModeDropdown
							id="mcp-display-mode-dropdown"
							value={mcpDisplayMode}
							onChange={(newMode: McpDisplayMode) => updateSetting("mcpDisplayMode", newMode)}
							className="w-full"
						/>
						<p className="text-xs mt-[5px] text-[var(--vscode-descriptionForeground)]">
							控制怎么显示 MCP 返回: 纯文本, 富文本和链接/图片或 markdown 渲染
						</p>
					</div>
					<div style={{ marginTop: 10 }}>
						<VSCodeCheckbox
							checked={mcpResponsesCollapsed}
							onChange={(e: any) => {
								const checked = e.target.checked === true
								updateSetting("mcpResponsesCollapsed", checked)
							}}>
							折叠 MCP 响应
						</VSCodeCheckbox>
						<p className="text-xs text-[var(--vscode-descriptionForeground)]">设置 MCP 响应面板的默认显示模式</p>
					</div>
					<div style={{ marginTop: 10 }}>
						<label
							htmlFor="openai-reasoning-effort-dropdown"
							className="block text-sm font-medium text-[var(--vscode-foreground)] mb-1">
							OpenAI 推理强度
						</label>
						<VSCodeDropdown
							id="openai-reasoning-effort-dropdown"
							currentValue={openaiReasoningEffort || "medium"}
							onChange={(e: any) => {
								const newValue = e.target.currentValue as OpenaiReasoningEffort
								handleReasoningEffortChange(newValue)
							}}
							className="w-full">
							<VSCodeOption value="low">低</VSCodeOption>
							<VSCodeOption value="medium">中</VSCodeOption>
							<VSCodeOption value="high">高</VSCodeOption>
						</VSCodeDropdown>
						<p className="text-xs mt-[5px] text-[var(--vscode-descriptionForeground)]">
							OpenAI 模型系列的推理工作（适用于所有 OpenAI 模型提供商）
						</p>
					</div>
					<div style={{ marginTop: 10 }}>
						<VSCodeCheckbox
							checked={strictPlanModeEnabled}
							onChange={(e: any) => {
								const checked = e.target.checked === true
								updateSetting("strictPlanModeEnabled", checked)
							}}>
							Enable strict plan mode
						</VSCodeCheckbox>
						<p className="text-xs text-[var(--vscode-descriptionForeground)]">
							Enforces strict tool use while in plan mode, preventing file edits.
						</p>
					</div>
					{focusChainFeatureFlagEnabled && (
						<div style={{ marginTop: 10 }}>
							<VSCodeCheckbox
								checked={focusChainSettings?.enabled || false}
								onChange={(e: any) => {
									const checked = e.target.checked === true
									updateSetting("focusChainSettings", { ...focusChainSettings, enabled: checked })
								}}>
								Enable Focus Chain
							</VSCodeCheckbox>
							<p className="text-xs text-[var(--vscode-descriptionForeground)]">
								Enables enhanced task progress tracking and automatic focus chain list management throughout
								tasks.
							</p>
						</div>
					)}
					{focusChainFeatureFlagEnabled && focusChainSettings?.enabled && (
						<div style={{ marginTop: 10, marginLeft: 20 }}>
							<label
								htmlFor="focus-chain-remind-interval"
								className="block text-sm font-medium text-[var(--vscode-foreground)] mb-1">
								Focus Chain Reminder Interval
							</label>
							<VSCodeTextField
								id="focus-chain-remind-interval"
								value={String(focusChainSettings?.remindClineInterval || 6)}
								onChange={(e: any) => {
									const value = parseInt(e.target.value, 10)
									if (!isNaN(value) && value >= 1 && value <= 100) {
										updateSetting("focusChainSettings", {
											...focusChainSettings,
											remindClineInterval: value,
										})
									}
								}}
								className="w-20"
							/>
							<p className="text-xs mt-[5px] text-[var(--vscode-descriptionForeground)]">
								Interval (in messages) to remind Cline about it's focus chain checklist (1-100). Lower values
								provide more frequent reminders.
							</p>
						</div>
					)}
				</div>
			</Section>
		</div>
	)
}

export default memo(FeatureSettingsSection)
