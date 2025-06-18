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
You must update the latestAnnouncementId in ClineProvider for new announcements to show to users. This new id will be compared with what's in state for the 'last announcement shown', and if it's different then the announcement will render. As soon as an announcement is shown, the id will be updated in state. This ensures that announcements are not shown more than once, even if the user doesn't close it themselves.
*/
const Announcement = ({ version, hideAnnouncement }: AnnouncementProps) => {
	const minorVersion = version.split(".").slice(0, 2).join(".") // 2.0.0 -> 2.0
	return (
		<div style={containerStyle}>
			<VSCodeButton data-testid="close-button" appearance="icon" onClick={hideAnnouncement} style={closeIconStyle}>
				<span className="codicon codicon-close"></span>
			</VSCodeButton>
			<h3 style={h3TitleStyle}>
				🎉{"  "}v{minorVersion} 新功能
			</h3>
			<ul style={ulStyle}>
				<li>
					Cline Chinese与胜算云Router达成合作啦！ 🚀 Cline
					Chinese与胜算云Router强强联手，极速开启AI编程新时代！全球模型快速调用， 1-2秒首字符狂写3000+行代码，
					o3（最新低价）、Gemini 2.5 pro 0605、Claude sonnet4 与
					opus4注册可用，非逆向，支付宝/微信、充值折扣，可发票，可试用，实名/邀请好友享更多代金券，点击此处进行注册：
					<VSCodeLink
						href="https://router.shengsuanyun.com/auth?from=cline-chinese&callback_url=vscode://HybridTalentComputing.cline-chinese/ssy"
						className="inline">
						胜算云Router
					</VSCodeLink>
				</li>
				<li>
					<b>Claude 4 模型:</b> 现在支持 Anthropic Claude Sonnet 4 和 Claude Opus 4，可在 Anthropic 和 Vertex
					提供商中使用。
				</li>
				<li>
					<b>全新设置页面:</b> 重新设计的设置界面，现在分为多个标签页，导航更便捷，体验更清爽。
				</li>
				<li>
					<b>Nebius AI Studio:</b> 新增 Nebius AI Studio 作为新的提供商。(感谢 @Aktsvigun!)
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
							<b>工作流:</b> 创建和管理工作流文件，可通过斜杠命令注入到对话中，轻松实现重复任务自动化。
						</li>
						<li>
							<b>可折叠任务列表:</b> 在分享屏幕时隐藏最近的任务，保护您的提示词隐私。
						</li>
						<li>
							<b>Vertex AI 全局端点:</b> 提高了 Vertex AI 用户的可用性并减少了速率限制错误。
						</li>
						<li>
							<b>新用户体验:</b> 为新用户提供特殊组件和指导，帮助他们开始使用 Cline。
						</li>
						<li>
							<b>UI 改进:</b> 修复了加载状态并改进了设置组织，提供更流畅的体验。
						</li>
						<li>
							<b>任务时间线:</b> 通过检查点的可视化时间线查看您的编码历程。
						</li>
						<li>
							<b>用户体验改进:</b> Cline 工作时可以继续输入，更智能的自动滚动，以及任务标题和消息的复制按钮。
						</li>
						<li>
							<b>Gemini 提示词缓存:</b> Gemini 和 Vertex 提供商现在支持提示词缓存和价格追踪。
						</li>
						<li>
							<b>全局 Cline 规则:</b> 在 Documents/Cline/Rules 中存储多个规则文件以在项目间共享。
						</li>
					</ul>
				</AccordionItem>
			</Accordion>
			<div style={hrStyle} />
			<p style={linkContainerStyle}>
				加入我们{" "}
				<VSCodeLink style={linkStyle} href="https://x.com/cline">
					X,
				</VSCodeLink>{" "}
				<VSCodeLink style={linkStyle} href="https://discord.gg/cline">
					discord,
				</VSCodeLink>{" "}
				or{" "}
				<VSCodeLink style={linkStyle} href="https://www.reddit.com/r/cline/">
					r/cline
				</VSCodeLink>
				关注更新!
			</p>
		</div>
	)
}

export default memo(Announcement)
