import { ActionMetadata } from "./types"

export const ACTION_METADATA: ActionMetadata[] = [
	{
		id: "enableAutoApprove",
		label: "启用自动批准",
		shortName: "启用",
		description: "启用或禁用自动批准功能。",
		icon: "codicon-play-circle",
	},
	{
		id: "enableAll",
		label: "启用所有",
		shortName: "所有",
		description: "启用或禁用所有操作。",
		icon: "codicon-checklist",
	},
	{
		id: "readFiles",
		label: "读取项目文件",
		shortName: "读取",
		description: "允许 Cline 读取工作区内的文件。",
		icon: "codicon-search",
		subAction: {
			id: "readFilesExternally",
			label: "读取所有文件",
			shortName: "读取 (所有)",
			description: "允许 Cline 读取计算机上的任何文件。",
			icon: "codicon-folder-opened",
			parentActionId: "readFiles",
		},
	},
	{
		id: "editFiles",
		label: "编辑项目文件",
		shortName: "编辑",
		description: "允许 Cline 修改工作区内的文件。",
		icon: "codicon-edit",
		subAction: {
			id: "editFilesExternally",
			label: "编辑所有文件",
			shortName: "编辑 (所有)",
			description: "允许 Cline 修改计算机上的任何文件。",
			icon: "codicon-files",
			parentActionId: "editFiles",
		},
	},
	{
		id: "executeSafeCommands",
		label: "执行安全命令",
		shortName: "安全命令",
		description: "允许 Cline 执行安全的终端命令。如果模型判断某个命令可能具有破坏性，仍然需要获得批准。",
		icon: "codicon-terminal",
		subAction: {
			id: "executeAllCommands",
			label: "执行所有命令",
			shortName: "所有命令",
			description: "允许 Cline 执行所有终端命令。请自行承担风险。",
			icon: "codicon-terminal-bash",
			parentActionId: "executeSafeCommands",
		},
	},
	{
		id: "useBrowser",
		label: "使用浏览器",
		shortName: "浏览器",
		description: "允许 Cline 在浏览器中启动和与任何网站进行交互。",
		icon: "codicon-globe",
	},
	{
		id: "useMcp",
		label: "使用 MCP 服务器",
		shortName: "MCP",
		description: "允许 Cline 使用配置的 MCP 服务器，这些服务器可能会修改文件系统或与 API 进行交互。",
		icon: "codicon-server",
	},
]

export const NOTIFICATIONS_SETTING: ActionMetadata = {
	id: "enableNotifications",
	label: "启用通知",
	shortName: "通知",
	description: "当 Cline 需要批准才能继续或任务完成时接收系统通知。",
	icon: "codicon-bell",
}
