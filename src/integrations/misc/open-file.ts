import { writeFile } from "@utils/fs"
import * as os from "os"
import * as path from "path"
import { HostProvider } from "@/hosts/host-provider"
import { ShowMessageType } from "@/shared/proto/host/window"

export async function openImage(dataUri: string) {
	const matches = dataUri.match(/^data:image\/([a-zA-Z]+);base64,(.+)$/)
	if (!matches) {
		HostProvider.window.showMessage({
			type: ShowMessageType.ERROR,
			message: "无效的 Data URI 格式",
		})
		return
	}
	const [, format, base64Data] = matches
	const imageBuffer = Buffer.from(base64Data, "base64")
	const tempFilePath = path.join(os.tmpdir(), `temp_image_${Date.now()}.${format}`)
	try {
		await writeFile(tempFilePath, new Uint8Array(imageBuffer))
		await HostProvider.window.openFile({
			filePath: tempFilePath,
		})
	} catch (error) {
		HostProvider.window.showMessage({
			type: ShowMessageType.ERROR,
			message: `打开图片错误: ${error}`,
		})
	}
}

export async function openFile(absolutePath: string, preserveFocus: boolean = false, preview: boolean = false) {
	try {
		await HostProvider.window.showTextDocument({
			path: absolutePath,
			options: { preserveFocus, preview },
		})
	} catch (_error) {
		HostProvider.window.showMessage({
			type: ShowMessageType.ERROR,
			message: `打开文件错误!`,
		})
	}
}
