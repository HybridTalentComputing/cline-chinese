import { UpdateBrowserSettingsRequest } from "../../../shared/proto/browser"
import { Boolean } from "../../../shared/proto/common"
import { Controller } from "../index"
import { updateGlobalState, getGlobalState } from "../../storage/state"
import { BrowserSettings as SharedBrowserSettings, DEFAULT_BROWSER_SETTINGS } from "../../../shared/BrowserSettings"

/**
 * 更新浏览器设置
 * @param controller 控制器实例
 * @param request 浏览器设置请求消息
 * @returns 成功响应
 */
export async function updateBrowserSettings(controller: Controller, request: UpdateBrowserSettingsRequest): Promise<Boolean> {
	try {
		// 获取当前浏览器设置以保留请求中未包含的字段
		const currentSettings = (await getGlobalState(controller.context, "browserSettings")) as SharedBrowserSettings | undefined
		const mergedWithDefaults = { ...DEFAULT_BROWSER_SETTINGS, ...currentSettings }

		// 从 protobuf 格式转换为共享格式，并与现有设置合并
		const newBrowserSettings: SharedBrowserSettings = {
			...mergedWithDefaults, // 从现有设置（和默认设置）开始
			viewport: {
				// 应用请求中的更新
				width: request.viewport?.width || mergedWithDefaults.viewport.width,
				height: request.viewport?.height || mergedWithDefaults.viewport.height,
			},
			// 显式处理请求中的可选布尔值和字符串字段
			remoteBrowserEnabled:
				request.remoteBrowserEnabled === undefined
					? mergedWithDefaults.remoteBrowserEnabled
					: request.remoteBrowserEnabled,
			remoteBrowserHost:
				request.remoteBrowserHost === undefined ? mergedWithDefaults.remoteBrowserHost : request.remoteBrowserHost,
			chromeExecutablePath:
				// 如果 chromeExecutablePath 显式存在于请求中（即使为空字符串""），则使用它。
				// 否则，回退到 mergedWithDefaults。
				"chromeExecutablePath" in request ? request.chromeExecutablePath : mergedWithDefaults.chromeExecutablePath,
			disableToolUse: request.disableToolUse === undefined ? mergedWithDefaults.disableToolUse : request.disableToolUse,
		}

		// 使用新设置更新全局状态
		await updateGlobalState(controller.context, "browserSettings", newBrowserSettings)

		// 如果任务存在，则更新任务浏览器设置
		if (controller.task) {
			controller.task.browserSettings = newBrowserSettings
			controller.task.browserSession.browserSettings = newBrowserSettings
		}

		// 将更新后的状态发送到 webview
		await controller.postStateToWebview()

		return {
			value: true,
		}
	} catch (error) {
		console.error("Error updating browser settings:", error)
		return {
			value: false,
		}
	}
}
