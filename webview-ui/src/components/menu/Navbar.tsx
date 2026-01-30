import { BookOpenIcon, HistoryIcon, PlusIcon, SettingsIcon, UserCircleIcon } from "lucide-react"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { TaskServiceClient, UiServiceClient } from "@/services/grpc-client"
import { useExtensionState } from "../../context/ExtensionStateContext"

// Custom MCP Server Icon component using VSCode codicon
const McpServerIcon = ({ className, size }: { className?: string; size?: number }) => (
	<span
		className={`codicon codicon-server flex items-center ${className || ""}`}
		style={{ fontSize: size ? `${size}px` : "12.5px", marginBottom: "1px" }}
	/>
)

export const Navbar = () => {
	const { t } = useTranslation()
	const { navigateToHistory, navigateToSettings, navigateToAccount, navigateToMcp, navigateToChat } = useExtensionState()

	const SETTINGS_TABS = useMemo(
		() => [
			{
				id: "chat",
				name: t("chat.newTask.newTask"),
				tooltip: t("chat.newTask.newTask"),
				icon: PlusIcon,
				navigate: () => {
					// Close the current task, then navigate to the chat view
					TaskServiceClient.clearTask({})
						.catch((error) => {
							console.error("Failed to clear task:", error)
						})
						.finally(() => navigateToChat())
				},
			},
			{
				id: "docs",
				name: t("common.viewDocs"),
				tooltip: t("common.viewDocs"),
				icon: BookOpenIcon,
				navigate: () => {
					UiServiceClient.openUrl({ value: "https://hybridtalentcomputing.gitbook.io/cline-chinese-doc/" }).catch(
						(error) => {
							console.error("Failed to open docs:", error)
						},
					)
				},
			},
			{
				id: "mcp",
				name: t("mcp.title"),
				tooltip: t("mcp.title"),
				icon: McpServerIcon,
				navigate: navigateToMcp,
			},
			{
				id: "history",
				name: t("history.title"),
				tooltip: t("history.title"),
				icon: HistoryIcon,
				navigate: navigateToHistory,
			},
			{
				id: "account",
				name: t("account.view.title"),
				tooltip: t("account.view.title"),
				icon: UserCircleIcon,
				navigate: navigateToAccount,
			},
			{
				id: "settings",
				name: t("settings.title"),
				tooltip: t("settings.title"),
				icon: SettingsIcon,
				navigate: navigateToSettings,
			},
		],
		[navigateToAccount, navigateToChat, navigateToHistory, navigateToMcp, navigateToSettings, t],
	)

	return (
		<nav
			className="flex-none inline-flex justify-end bg-transparent gap-2 mb-1 z-10 border-none items-center mr-4!"
			id="cline-navbar-container">
			{SETTINGS_TABS.map((tab) => {
				// McpServerIcon is a custom codicon, others are lucide-react SVG icons
				const isCodicon = tab.icon === McpServerIcon

				return (
					<Tooltip key={`navbar-tooltip-${tab.id}`}>
						<TooltipContent side="bottom">{tab.tooltip}</TooltipContent>
						<TooltipTrigger asChild>
							<Button
								aria-label={tab.tooltip}
								className="p-0 h-7"
								data-testid={`tab-${tab.id}`}
								key={`navbar-button-${tab.id}`}
								onClick={() => tab.navigate()}
								size="icon"
								variant="icon">
								{isCodicon ? <tab.icon size={18} /> : <tab.icon className="stroke-1 [svg]:size-4" size={18} />}
							</Button>
						</TooltipTrigger>
					</Tooltip>
				)
			})}
		</nav>
	)
}
