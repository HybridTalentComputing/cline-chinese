import { DeleteAllTaskHistoryCount } from "@shared/proto/cline/task"
import fs from "fs/promises"
import path from "path"
import { HostProvider } from "@/hosts/host-provider"
import { ShowMessageRequest, ShowMessageType } from "@/shared/proto/host/window"
import { fileExistsAtPath } from "../../../utils/fs"
import { Controller } from ".."

/**
 * Deletes all task history, with an option to preserve favorites
 * @param controller The controller instance
 * @param request Request with option to preserve favorites
 * @returns Results with count of deleted tasks
 */
export async function deleteAllTaskHistory(controller: Controller): Promise<DeleteAllTaskHistoryCount> {
	try {
		// Clear current task first
		await controller.clearTask()

		// Get existing task history
		const taskHistory = controller.stateManager.getGlobalStateKey("taskHistory")
		const totalTasks = taskHistory.length

		const userChoice = (
			await HostProvider.window.showMessage(
				ShowMessageRequest.create({
					type: ShowMessageType.WARNING,
					message: "您想删除什么?",
					options: {
						modal: true,
						items: ["删除除收藏夹以外的所有内容", "删除所有内容"],
					},
				}),
			)
		).selectedOption

		// Default VS Code Cancel button returns `undefined` - don't delete anything
		if (userChoice === undefined) {
			return DeleteAllTaskHistoryCount.create({
				tasksDeleted: 0,
			})
		}

		// If preserving favorites, filter out non-favorites
		if (userChoice === "删除除收藏夹以外的所有内容") {
			const favoritedTasks = taskHistory.filter((task) => task.isFavorited === true)

			// If there are favorited tasks, update state
			if (favoritedTasks.length > 0) {
				controller.stateManager.setGlobalState("taskHistory", favoritedTasks)

				// Delete non-favorited task directories
				const preserveTaskIds = favoritedTasks.map((task) => task.id)
				await cleanupTaskFiles(preserveTaskIds)

				// Update webview
				try {
					await controller.postStateToWebview()
				} catch (webviewErr) {
					console.error("Error posting to webview:", webviewErr)
				}

				return DeleteAllTaskHistoryCount.create({
					tasksDeleted: totalTasks - favoritedTasks.length,
				})
			} else {
				// No favorited tasks found - show warning and ask user what to do
				const answer = (
					await HostProvider.window.showMessage({
						type: ShowMessageType.WARNING,
						message: "未找到已收藏的任务。是否仍然要删除所有任务？?",
						options: {
							modal: true,
							items: ["删除所有任务"],
						},
					})
				).selectedOption

				// User cancelled - don't delete anything
				if (answer === undefined) {
					return DeleteAllTaskHistoryCount.create({
						tasksDeleted: 0,
					})
				}
				// If user chose "Delete All Tasks", fall through to the `delete everything` section below
			}
		}

		// Delete everything (not preserving favorites)
		controller.stateManager.setGlobalState("taskHistory", [])

		try {
			// Remove all contents of tasks directory
			const taskDirPath = path.join(HostProvider.get().globalStorageFsPath, "tasks")
			if (await fileExistsAtPath(taskDirPath)) {
				await fs.rm(taskDirPath, { recursive: true, force: true })
			}

			// Remove checkpoints directory contents
			const checkpointsDirPath = path.join(HostProvider.get().globalStorageFsPath, "checkpoints")
			if (await fileExistsAtPath(checkpointsDirPath)) {
				await fs.rm(checkpointsDirPath, { recursive: true, force: true })
			}
		} catch (error) {
			HostProvider.window.showMessage({
				type: ShowMessageType.ERROR,
				message: `删除任务历史记录时遇到错误，可能会残留一些文件。Error: ${error instanceof Error ? error.message : String(error)}`,
			})
		}

		// Update webview
		try {
			await controller.postStateToWebview()
		} catch (webviewErr) {
			console.error("Error posting to webview:", webviewErr)
		}

		return DeleteAllTaskHistoryCount.create({
			tasksDeleted: totalTasks,
		})
	} catch (error) {
		console.error("Error in deleteAllTaskHistory:", error)
		throw error
	}
}

/**
 * Helper function to cleanup task files while preserving specified tasks
 */
async function cleanupTaskFiles(preserveTaskIds: string[]) {
	const taskDirPath = path.join(HostProvider.get().globalStorageFsPath, "tasks")

	try {
		if (await fileExistsAtPath(taskDirPath)) {
			const taskDirs = await fs.readdir(taskDirPath)
			console.debug(`[cleanupTaskFiles] Found ${taskDirs.length} task directories`)

			// Delete only non-preserved task directories
			for (const dir of taskDirs) {
				if (!preserveTaskIds.includes(dir)) {
					// Task dir path is not workspace specific
					await fs.rm(path.join(taskDirPath, dir), {
						recursive: true,
						force: true,
					})
				}
			}
		}
	} catch (error) {
		console.error("Error cleaning up task files:", error)
	}

	return true
}
