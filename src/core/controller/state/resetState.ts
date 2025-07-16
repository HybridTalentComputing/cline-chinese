import { Controller } from ".."
import { Empty } from "../../../shared/proto/common"
import { ResetStateRequest } from "../../../shared/proto/state"
import { resetGlobalState, resetWorkspaceState } from "../../../core/storage/state"
import { sendChatButtonClickedEvent } from "../ui/subscribeToChatButtonClicked"
import { ShowMessageRequest, ShowMessageType } from "@/shared/proto/host/window"
import { getHostBridgeProvider } from "@/hosts/host-providers"

/**
 * Resets the extension state to its defaults
 * @param controller The controller instance
 * @param request The reset state request containing the global flag
 * @returns An empty response
 */
export async function resetState(controller: Controller, request: ResetStateRequest): Promise<Empty> {
	try {
		if (request.global) {
			getHostBridgeProvider().windowClient.showMessage(
				ShowMessageRequest.create({
					type: ShowMessageType.INFORMATION,
					message: "重置全局状态...",
				}),
			)
			await resetGlobalState(controller.context)
		} else {
			getHostBridgeProvider().windowClient.showMessage(
				ShowMessageRequest.create({
					type: ShowMessageType.INFORMATION,
					message: "重置工作区状态...",
				}),
			)
			await resetWorkspaceState(controller.context)
		}

		if (controller.task) {
			controller.task.abortTask()
			controller.task = undefined
		}

		getHostBridgeProvider().windowClient.showMessage(
			ShowMessageRequest.create({
				type: ShowMessageType.INFORMATION,
				message: "重置状态",
			}),
		)
		await controller.postStateToWebview()

		await sendChatButtonClickedEvent(controller.id)

		return Empty.create()
	} catch (error) {
		console.error("Error resetting state:", error)
		getHostBridgeProvider().windowClient.showMessage(
			ShowMessageRequest.create({
				type: ShowMessageType.ERROR,
				message: `重置状态失败: ${error instanceof Error ? error.message : String(error)}`,
			}),
		)
		throw error
	}
}
