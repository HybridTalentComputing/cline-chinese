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
Announcements are automatically shown when the major.minor version changes (for ex 3.19.x → 3.20.x or 4.0.x). 
The latestAnnouncementId is now automatically generated from the extension's package.json version. 
Patch releases (3.19.1 → 3.19.2) will not trigger new announcements.
*/
const Announcement = ({ version, hideAnnouncement }: AnnouncementProps) => {
	const minorVersion = version.split(".").slice(0, 2).join(".") // 2.0.0 -> 2.0
	return (
		<div style={containerStyle}>
			<VSCodeButton data-testid="close-button" appearance="icon" onClick={hideAnnouncement} style={closeIconStyle}>
				<span className="codicon codicon-close"></span>
			</VSCodeButton>
			<h3 style={h3TitleStyle}>
				🎉{"  "} 更新 v{minorVersion}
			</h3>
			<ul style={ulStyle}>
				<li>
					<b>针对 Claude 4 进行了优化:</b>Cline 现已针对 Claude 4
					系列模型进行了优化，从而提升了性能、可靠性并增加了新功能。
				</li>
				<li>
					<b>Gemini CLI 提供商:</b> 添加了新的 Gemini CLI 提供程序，允许您使用本地 Gemini CLI 身份验证免费访问 Gemini
					模型。
				</li>
				<li>
					<b>网页抓取工具:</b> Gemini 2.5 Pro 和 Claude 4 型号现已支持 WebFetch 工具，允许 Cline
					直接在对话中检索和汇总网页内容。
				</li>
				<li>
					<b>自我认识:</b>在使用前沿模型时，Cline 对自己的能力和特性集有清晰的认识。
				</li>
				<li>
					<b>改进的差异编辑:</b>改进了差别编辑功能，使前沿模型的差别编辑失败率创下新低。
					<b>Cerebras API 支持:</b> 通过更新模型选择（仅限 Qwen 和 Llama 3.3 70B）增强了性能，并将 Qwen 3 32B
					的上下文窗口从 16K 令牌增加到 64K token。
				</li>
				<li>
					<b>Claude Code for Windows:</b> 改进了系统提示处理，以修复 E2BIG
					错误并改进了错误消息，并提供常见设置问题的指导。
				</li>
				<li>
					<b>Hugging Face API 支持:</b> 添加为新的 API 提供商，支持其推理 API 模型。
				</li>
				<li>
					<b>Moonshot 中国特供API支持:</b>增加了为 Moonshot 提供商选择中国终端的功能，并添加了 Moonshot AI
					作为新提供商。
				</li>
				<li>
					<b>增强稳定性:</b> 强大的检查点超时处理，修复了 MCP 服务器在禁用时启动的问题，并改进了跨多个 VSCode
					窗口的身份验证同步。
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
							<b>Claude 4 优化:</b> Cline 现已针对 Claude 4
							系列模型进行了优化，从而提升了性能、可靠性并增加了新功能。
						</li>
						<li>
							<b>Gemini CLI 支持:</b> 添加了新的 Gemini CLI 提供程序，允许您使用本地 Gemini CLI 身份验证免费访问
							Gemini 模型。
						</li>
						<li>
							<b>网页获取工具:</b> Gemini 2.5 Pro 和 Claude 4 模型现已支持 WebFetch 工具，允许 Cline
							直接在对话中检索和汇总网页内容。
						</li>
						<li>
							<b>自我认识:</b>在使用前沿模型时，Cline 对自己的能力和功能集有着清晰的认识。
						</li>
						<li>
							<b>改进了差异编辑:</b> 改进了差速器编辑功能，使 Frontier 车型的差速器编辑失败率创下新低。
						</li>
						<li>
							<b>Claude 4 模型:</b> 现支持 Anthropic 和 Vertex 提供商的 Anthropic Claude Sonnet 4 和 Claude Opus 4。
						</li>
						<li>
							<b>全新设置页面：</b> 设置页面经过重新设计，现在分为多个标签页，便于导航，界面更清晰。
						</li>
						<li>
							<b>Nebius AI Studio：</b> 新增 Nebius AI Studio 作为支持的供应商。（感谢 @Aktsvigun！）
						</li>
						<li>
							<b>工作流：</b> 可创建和管理工作流文件，并通过斜杠命令将其注入对话中，轻松实现重复性任务的自动化。
						</li>
						<li>
							<b>可折叠任务列表：</b> 在共享屏幕时可以隐藏最近任务，保护您的提示内容隐私。
						</li>
						<li>
							<b>Vertex AI 全球接口：</b> 提升了 Vertex AI 用户的可用性，并减少了限速错误的发生。
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
