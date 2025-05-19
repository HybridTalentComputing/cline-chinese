import { VSCodeButton, VSCodeLink } from "@vscode/webview-ui-toolkit/react"
import { CSSProperties, memo } from "react"
import { getAsVar, VSC_DESCRIPTION_FOREGROUND, VSC_INACTIVE_SELECTION_BACKGROUND } from "@/utils/vscStyles"
import { Accordion, AccordionItem } from "@heroui/react"

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
const accountIconStyle: CSSProperties = { fontSize: 11 }
const hrStyle: CSSProperties = {
	height: "1px",
	background: getAsVar(VSC_DESCRIPTION_FOREGROUND),
	opacity: 0.1,
	margin: "8px 0",
}
const linkContainerStyle: CSSProperties = { margin: "0" }
const linkStyle: CSSProperties = { display: "inline" }

/*
你必须在 ClineProvider 中更新 latestAnnouncementId 才能向用户显示新的公告。这个新的 id 将与状态中的"最后显示的公告"进行比较，如果不同，则公告将被渲染。一旦公告显示，id 将在状态中更新。这确保了公告不会显示多次，即使用户没有自己关闭它。
*/
const Announcement = ({ version, hideAnnouncement }: AnnouncementProps) => {
	const minorVersion = version.split(".").slice(0, 2).join(".") // 2.0.0 -> 2.0
	return (
		<div style={containerStyle}>
			<VSCodeButton appearance="icon" onClick={hideAnnouncement} style={closeIconStyle}>
				<span className="codicon codicon-close"></span>
			</VSCodeButton>
			<h3 style={h3TitleStyle}>
				🎉{"  "}v{minorVersion} 版本新功能
			</h3>
			<ul style={ulStyle}>
				<li>
					<b>工作流：</b> 创建和管理工作流文件，可以通过斜杠命令注入到对话中，使自动化重复任务变得简单。
				</li>
				<li>
					<b>可折叠任务列表：</b> 在共享屏幕时隐藏最近的任务，以保护你的提示词隐私。
				</li>
				<li>
					<b>Vertex AI 全局端点：</b> 为 Vertex AI 用户提供更好的可用性和减少速率限制错误。
				</li>
				<li>
					<b>新用户体验：</b> 为新用户提供特殊组件和指导，帮助他们开始使用 Cline。
				</li>
				<li>
					<b>UI 改进：</b> 修复加载状态并改进设置组织，提供更流畅的体验。
				</li>
			</ul>
			<Accordion isCompact className="pl-0">
				<AccordionItem
					key="1"
					aria-label="Previous Updates"
					title="Previous Updates:"
					classNames={{
						trigger: "bg-transparent border-0 pl-0 pb-0 w-fit",
						title: "font-bold text-[var(--vscode-foreground)]",
						indicator:
							"text-[var(--vscode-foreground)] mb-0.5 -rotate-180 data-[open=true]:-rotate-90 rtl:rotate-0 rtl:data-[open=true]:-rotate-90",
					}}>
					<ul style={ulStyle}>
						<li>
							<b>任务时间线：</b> 通过检查点的可视化时间线查看你的编码历程历史。
						</li>
						<li>
							<b>用户体验改进：</b> 在 Cline 工作时可以继续输入，更智能的自动滚动，以及任务标题和消息的复制按钮。
						</li>
						<li>
							<b>Gemini 提示词缓存：</b> Gemini 和 Vertex 提供商现在支持提示词缓存和价格跟踪。
						</li>
						<li>
							<b>全局 Cline 规则：</b> 在 Documents/Cline/Rules 中存储多个规则文件，以便在项目之间共享。
						</li>
					</ul>
				</AccordionItem>
			</Accordion>
			<div style={hrStyle} />
			<p style={linkContainerStyle}>
				在{" "}
				<VSCodeLink style={linkStyle} href="https://x.com/cline">
					X,
				</VSCodeLink>{" "}
				<VSCodeLink style={linkStyle} href="https://discord.gg/cline">
					discord,
				</VSCodeLink>{" "}
				或{" "}
				<VSCodeLink style={linkStyle} href="https://www.reddit.com/r/cline/">
					r/cline
				</VSCodeLink>
				上关注我们，获取更多更新！
			</p>
		</div>
	)
}

export default memo(Announcement)
