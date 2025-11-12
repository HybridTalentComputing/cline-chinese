import { HistoryIcon, PlusIcon, SettingsIcon, UserCircleIcon } from "lucide-react"
import { useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { TaskServiceClient } from "@/services/grpc-client"
import { useExtensionState } from "../../context/ExtensionStateContext"

// Custom MCP Server Icon component using VSCode codicon
const McpServerIcon = ({ className, size }: { className?: string; size?: number }) => (
	<span
		className={`codicon codicon-server flex items-center ${className || ""}`}
		style={{ fontSize: size ? `${size}px` : "12.5px", marginBottom: "1px" }}
	/>
)

export const Navbar = () => {
	const { navigateToHistory, navigateToSettings, navigateToAccount, navigateToMcp, navigateToChat } = useExtensionState()

	const SETTINGS_TABS = useMemo(
		() => [
			{
				id: "chat",
				name: "对话",
				tooltip: "新任务",
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
				id: "mcp",
				name: "MCP",
				tooltip: "MCP 服务",
				icon: McpServerIcon,
				navigate: navigateToMcp,
			},
			{
				id: "history",
				name: "历史",
				tooltip: "历史",
				icon: HistoryIcon,
				navigate: navigateToHistory,
			},
			{
				id: "account",
				name: "账户",
				tooltip: "账户",
				icon: UserCircleIcon,
				navigate: navigateToAccount,
			},
			{
				id: "settings",
				name: "设置",
				tooltip: "设置",
				icon: SettingsIcon,
				navigate: navigateToSettings,
			},
		],
		[navigateToAccount, navigateToChat, navigateToHistory, navigateToMcp, navigateToSettings],
	)

	return (
		<nav
			className="flex-none inline-flex justify-end bg-transparent gap-2 mb-1 z-10 border-none items-center mr-4!"
			id="cline-navbar-container">
			{SETTINGS_TABS.map((tab) => (
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
							<tab.icon className="stroke-1 [svg]:size-4" size={18} />
						</Button>
					</TooltipTrigger>
				</Tooltip>
			))}
		</nav>
	)
}
