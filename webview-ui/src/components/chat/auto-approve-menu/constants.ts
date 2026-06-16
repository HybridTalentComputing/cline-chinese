import i18next from "i18next"
import { ActionMetadata } from "./types"

export function getActionMetadata(): ActionMetadata[] {
	return [
		{
			id: "readFiles",
			label: i18next.t("autoApprove.readProjectFiles"),
			shortName: i18next.t("autoApprove.read"),
			icon: "codicon-search",
			subAction: {
				id: "readFilesExternally",
				label: i18next.t("autoApprove.readAllFiles"),
				shortName: i18next.t("autoApprove.readAll"),
				icon: "codicon-folder-opened",
				parentActionId: "readFiles",
			},
		},
		{
			id: "editFiles",
			label: i18next.t("autoApprove.editProjectFiles"),
			shortName: i18next.t("autoApprove.edit"),
			icon: "codicon-edit",
			subAction: {
				id: "editFilesExternally",
				label: i18next.t("autoApprove.editAllFiles"),
				shortName: i18next.t("autoApprove.editAll"),
				icon: "codicon-files",
				parentActionId: "editFiles",
			},
		},
		{
			id: "executeSafeCommands",
			label: i18next.t("autoApprove.executeSafeCommands"),
			shortName: i18next.t("autoApprove.safeCommands"),
			icon: "codicon-terminal",
			subAction: {
				id: "executeAllCommands",
				label: i18next.t("autoApprove.executeAllCommands"),
				shortName: i18next.t("autoApprove.allCommands"),
				icon: "codicon-terminal-bash",
				parentActionId: "executeSafeCommands",
			},
		},
		{
			id: "useBrowser",
			label: i18next.t("autoApprove.useBrowser"),
			shortName: i18next.t("autoApprove.browser"),
			icon: "codicon-globe",
		},
		{
			id: "useMcp",
			label: i18next.t("autoApprove.useMcpServers"),
			shortName: i18next.t("autoApprove.mcp"),
			icon: "codicon-server",
		},
	]
}

export function getNotificationsSetting(): ActionMetadata {
	return {
		id: "enableNotifications",
		label: i18next.t("autoApprove.enableNotifications"),
		shortName: i18next.t("autoApprove.notifications"),
		icon: "codicon-bell",
	}
}
