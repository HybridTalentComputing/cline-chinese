import { VSCodeButton, VSCodeLink } from "@vscode/webview-ui-toolkit/react"
import { CSSProperties, memo } from "react"
import { getAsVar, VSC_DESCRIPTION_FOREGROUND, VSC_INACTIVE_SELECTION_BACKGROUND } from "@/utils/vscStyles"

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
			<VSCodeButton appearance="icon" onClick={hideAnnouncement} style={closeIconStyle}>
				<span className="codicon codicon-close"></span>
			</VSCodeButton>
			<h3 style={h3TitleStyle}>
				🎉{"  "}New in v{minorVersion}
			</h3>
			<ul style={ulStyle}>
				<li>
					<b>全局 Cline 规则:</b> 存储在 Documents/Cline/Rules 的多个文件中，在所有项目中共享。
				</li>
				<li>
					<b>Cline 规则对话框:</b> 聊天区域中的新按钮，用于查看工作区和要插入的全局 cline 规则文件并针对任务应用特定规则
				</li>
				<li>
					<b>Slash 命令:</b> 对话窗口插入 <code>/</code> 查看快捷命令列表, 例如：开启新任务 (更多功能!)
				</li>
				<li>
					<b>编辑消息:</b> 可以通过单击之前发送的消息来编辑它。（可选）恢复发送消息时的项目！
				</li>
			</ul>
			<h4 style={{ margin: "5px 0 5px" }}>以前的更新:</h4>
			<ul style={ulStyle}>
				<li>
					<b>模型收藏夹:</b> 您现在可以在使用Cline和OpenRouter提供商时标记您最喜欢的模型，快速访问它!
				</li>
				<li>
					<b>快速差别编辑:</b> 改进了大文件的动画性能，并在聊天中添加了新的提示，显示 Cline 所做的编辑次数.
				</li>
				<li>
					<b>新的自动批准选项:</b> 关闭 Cline 读取和编辑项目文件夹外文件的能力.
				</li>
			</ul>
			{/*
			// Leave this here for an example of how to structure the announcement
			<ul style={{ margin: "0 0 8px", paddingLeft: "12px" }}>
				 <li>
					OpenRouter now supports prompt caching! They also have much higher rate limits than other providers,
					so I recommend trying them out.
					<br />
					{!apiConfiguration?.openRouterApiKey && (
						<VSCodeButtonLink
							href={getOpenRouterAuthUrl(vscodeUriScheme)}
							style={{
								transform: "scale(0.85)",
								transformOrigin: "left center",
								margin: "4px -30px 2px 0",
							}}>
							Get OpenRouter API Key
						</VSCodeButtonLink>
					)}
					{apiConfiguration?.openRouterApiKey && apiConfiguration?.apiProvider !== "openrouter" && (
						<VSCodeButton
							onClick={() => {
								vscode.postMessage({
									type: "apiConfiguration",
									apiConfiguration: { ...apiConfiguration, apiProvider: "openrouter" },
								})
							}}
							style={{
								transform: "scale(0.85)",
								transformOrigin: "left center",
								margin: "4px -30px 2px 0",
							}}>
							Switch to OpenRouter
						</VSCodeButton>
					)}
				</li>
				<li>
					<b>Edit Cline's changes before accepting!</b> When he creates or edits a file, you can modify his
					changes directly in the right side of the diff view (+ hover over the 'Revert Block' arrow button in
					the center to undo "<code>{"// rest of code here"}</code>" shenanigans)
				</li>
				<li>
					New <code>search_files</code> tool that lets Cline perform regex searches in your project, letting
					him refactor code, address TODOs and FIXMEs, remove dead code, and more!
				</li>
				<li>
					When Cline runs commands, you can now type directly in the terminal (+ support for Python
					environments)
				</li>
			</ul>*/}
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
