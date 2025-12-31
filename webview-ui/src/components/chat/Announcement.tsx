import { VSCodeLink } from "@vscode/webview-ui-toolkit/react"
import { XIcon } from "lucide-react"
import { CSSProperties, memo } from "react"
import { useMount } from "react-use"
import { Button } from "@/components/ui/button"
import { PLATFORM_CONFIG, PlatformType } from "@/config/platform.config"
// import { useClineAuth, useClineSignIn } from "@/context/ClineAuthContext"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { getAsVar, VSC_DESCRIPTION_FOREGROUND, VSC_INACTIVE_SELECTION_BACKGROUND } from "@/utils/vscStyles"

// import { useApiConfigurationHandlers } from "../settings/utils/useApiConfigurationHandlers"

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
// const h2TitleStyle: CSSProperties = { margin: "0 0 8px", fontWeight: "bold" }
const ulStyle: CSSProperties = { margin: "0 0 8px", paddingLeft: "12px", listStyleType: "disc" }
// const _accountIconStyle: CSSProperties = { fontSize: 11 }
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
	// const { clineUser } = useClineAuth()
	const { refreshOpenRouterModels } = useExtensionState()
	// const user = clineUser || undefined
	// const { handleFieldsChange } = useApiConfigurationHandlers()
	// const { isLoginLoading, handleSignIn } = useClineSignIn()

	// const [didClickDevstralButton, setDidClickDevstralButton] = useState(false)
	// Need to get latest model list in case user hits shortcut button to set model
	useMount(refreshOpenRouterModels)

	// const setDevstral = () => {
	// 	const modelId = "mistralai/devstral-2512"
	// 	// set both plan and act modes to use code-supernova-1-million
	// 	handleFieldsChange({
	// 		planModeOpenRouterModelId: modelId,
	// 		actModeOpenRouterModelId: modelId,
	// 		planModeOpenRouterModelInfo: openRouterModels[modelId],
	// 		actModeOpenRouterModelInfo: openRouterModels[modelId],
	// 		planModeApiProvider: "cline",
	// 		actModeApiProvider: "cline",
	// 	})

	// 	setTimeout(() => {
	// 		setDidClickDevstralButton(true)
	// 		setShowChatModelSelector(true)
	// 	}, 10)
	// }

	const isVscode = PLATFORM_CONFIG.type === PlatformType.VSCODE

	return (
		<div style={containerStyle}>
			<Button
				className="absolute top-2.5 right-2"
				data-testid="close-announcement-button"
				onClick={hideAnnouncement}
				size="icon"
				variant="icon">
				<XIcon />
			</Button>
			<h4 style={{ fontWeight: 7 }}>
				🎉{"  "}新特性 v{version}
			</h4>
			<ul style={ulStyle}>
				<li>
					<strong>钩子</strong>允许您将自定义逻辑注入到 Cline 的工作流程中。&nbsp; (
					<a href="https://docs.cline.bot/features/hooks" style={linkStyle}>
						钩子文档
					</a>
					)
				</li>
				<li>
					错误修复和改进，包括对以下功能的支持 <code>&lt;think&gt;</code> 标签，更好地兼容开源模型，改进 GLM-4.6
					系统提示符，更新 CLI 身份验证和提供程序，并修复 OpenAI 兼容提供程序的问题。&nbsp; (
					<a href="https://github.com/cline/cline/blob/main/CHANGELOG.md" style={linkStyle}>
						查看完整的变更日志
					</a>
					)
				</li>
			</ul>
			{isVscode && (
				<p style={{ margin: "0" }}>
					See a{" "}
					<VSCodeLink href="https://x.com/sdrzn/status/1995840893816111246" style={linkStyle}>
						demo of "Explain Changes"
					</VSCodeLink>
				</p>
			)}
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
