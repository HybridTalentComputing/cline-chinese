import { ActionMetadata } from "./types"

export const ACTION_METADATA: ActionMetadata[] = [
	{
		id: "readFiles",
		label: "读取项目文件",
		shortName: "读取",
		icon: "codicon-search",
		subAction: {
			id: "readFilesExternally",
			label: "读取所有文件",
			shortName: "读取 (所有)",
			icon: "codicon-folder-opened",
			parentActionId: "readFiles",
		},
	},
	{
		id: "editFiles",
		label: "编辑项目文件",
		shortName: "Edit",
		icon: "codicon-edit",
		subAction: {
			id: "editFilesExternally",
			label: "编辑所有文件",
			shortName: "编辑 (所有)",
			icon: "codicon-files",
			parentActionId: "editFiles",
		},
	},
	{
		id: "executeSafeCommands",
		label: "执行安全命令",
		shortName: "安全命令",
		icon: "codicon-terminal",
		subAction: {
			id: "executeAllCommands",
			label: "执行所有命令",
			shortName: "所有命令",
			icon: "codicon-terminal-bash",
			parentActionId: "executeSafeCommands",
		},
	},
	{
		id: "useBrowser",
		label: "使用浏览器",
		shortName: "Browser",
		icon: "codicon-globe",
	},
	{
		id: "useMcp",
		label: "使用 MCP 服务器",
		shortName: "MCP",
		icon: "codicon-server",
	},
]

export const NOTIFICATIONS_SETTING: ActionMetadata = {
	id: "enableNotifications",
	label: "启用通知",
	shortName: "通知",
	icon: "codicon-bell",
}
