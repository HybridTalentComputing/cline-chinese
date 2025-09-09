import { Accordion, AccordionItem } from "@heroui/react"
import { EmptyRequest } from "@shared/proto/cline/common"
import { VSCodeButton, VSCodeLink } from "@vscode/webview-ui-toolkit/react"
import { CSSProperties, memo, useState } from "react"
// import { useClineAuth } from "@/context/ClineAuthContext"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { AccountServiceClient } from "@/services/grpc-client"
import { getAsVar, VSC_DESCRIPTION_FOREGROUND, VSC_INACTIVE_SELECTION_BACKGROUND } from "@/utils/vscStyles"
import { useApiConfigurationHandlers } from "../settings/utils/useApiConfigurationHandlers"

interface AnnouncementProps {
	version: string
	hideAnnouncement: () => void
}

const containerStyle: CSSProperties = {
	backgroundColor: getAsVar(VSC_INACTIVE_SELECTION_BACKGROUND),
	borderRadius: "3px",
	padding: "12px 16px",
	margin: "5px 15px 5px 15px",
	position: "relative",
	flexShrink: 0,
}
const closeIconStyle: CSSProperties = { position: "absolute", top: "8px", right: "8px" }
const h3TitleStyle: CSSProperties = { margin: "0 0 8px" }
const ulStyle: CSSProperties = { margin: "0 0 8px", paddingLeft: "12px" }
const _accountIconStyle: CSSProperties = { fontSize: 11 }
const hrStyle: CSSProperties = {
	height: "1px",
	background: getAsVar(VSC_DESCRIPTION_FOREGROUND),
	opacity: 0.1,
	margin: "8px 0",
}
const linkContainerStyle: CSSProperties = { margin: "0" }
const linkStyle: CSSProperties = { display: "inline" }

/*
Announcements are automatically shown when the major.minor version changes (for ex 3.19.x → 3.20.x or 4.0.x). 
The latestAnnouncementId is now automatically generated from the extension's package.json version. 
Patch releases (3.19.1 → 3.19.2) will not trigger new announcements.
*/
const Announcement = ({ version, hideAnnouncement }: AnnouncementProps) => {
	const minorVersion = version.split(".").slice(0, 2).join(".") // 2.0.0 -> 2.0
	// const { clineUser } = useClineAuth()
	const { apiConfiguration, openRouterModels, setShowChatModelSelector } = useExtensionState()
	const user = undefined
	const { handleFieldsChange } = useApiConfigurationHandlers()

	const [didClickGrokCodeButton, setDidClickGrokCodeButton] = useState(false)

	const setGrokCodeFast1 = () => {
		const modelId = "x-ai/grok-code-fast-1"
		// set both plan and act modes to use grok-code-fast-1
		handleFieldsChange({
			planModeOpenRouterModelId: modelId,
			actModeOpenRouterModelId: modelId,
			planModeOpenRouterModelInfo: openRouterModels[modelId],
			actModeOpenRouterModelInfo: openRouterModels[modelId],
			planModeApiProvider: "cline",
			actModeApiProvider: "cline",
		})

		setTimeout(() => {
			setDidClickGrokCodeButton(true)
			setShowChatModelSelector(true)
		}, 10)
	}

	const handleShowAccount = () => {
		AccountServiceClient.accountLoginClicked(EmptyRequest.create()).catch((err) =>
			console.error("Failed to get login URL:", err),
		)
	}

	return (
		<div style={containerStyle}>
			<VSCodeButton appearance="icon" data-testid="close-button" onClick={hideAnnouncement} style={closeIconStyle}>
				<span className="codicon codicon-close"></span>
			</VSCodeButton>
			<h3 style={h3TitleStyle}>
				🎉{"  "} 更新 v{minorVersion}
			</h3>
			<b>1M 上下文窗口:</b> Claude Sonnet 4 现已支持 100
			万个令牌上下文窗口，以处理更大的代码库和更复杂的任务。Cline/OpenRouter 用户可立即访问，Anthropic 用户需要 Tier 4
			权限，而 Bedrock 用户必须位于受支持的区域。选择{" "}
			<code>
				claude-sonnet-4<b>:1m</b>
			</code>{" "}
			针对 1M 上下文使用模型，或者针对 200K 使用原始模型。
			<Accordion className="pl-0" isCompact>
				<AccordionItem
					aria-label="Previous Updates"
					classNames={{
						trigger: "bg-transparent border-0 pl-0 pb-0 w-fit",
						title: "font-bold text-[var(--vscode-foreground)]",
						indicator:
							"text-[var(--vscode-foreground)] mb-0.5 -rotate-180 data-[open=true]:-rotate-90 rtl:rotate-0 rtl:data-[open=true]:-rotate-90",
					}}
					key="1"
					title="Previous Updates:">
					<ul style={ulStyle}>
						<li>
							<b>支持 Claude Sonnet 4 1M 上下文:</b>用户可立即访问，Anthropic 用户需要 Tier 4 级别的API.
						</li>
						<li>
							<b>Claude 4 优化:</b>Cline 现已针对 Claude 4
							系列模型进行了优化，从而提升了性能、可靠性并增加了新功能。
						</li>
						<li>
							<b>工作流:</b> 创建和管理可通过 / 命令注入对话的工作流文件，从而轻松实现重复性任务的自动化。
						</li>
					</ul>
				</AccordionItem>
			</Accordion>
			<div style={hrStyle} />
			<p style={linkContainerStyle}>
				加入我们{" "}
				<VSCodeLink href="https://x.com/cline" style={linkStyle}>
					X,
				</VSCodeLink>{" "}
				<VSCodeLink href="https://discord.gg/cline" style={linkStyle}>
					discord,
				</VSCodeLink>{" "}
				or{" "}
				<VSCodeLink href="https://www.reddit.com/r/cline/" style={linkStyle}>
					r/cline
				</VSCodeLink>
				关注更新!
			</p>
		</div>
	)
}

export default memo(Announcement)
