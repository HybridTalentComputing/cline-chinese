import { access, constants, mkdir } from "fs/promises"
import os from "os"
import * as path from "path"
import { getCwd, getDesktopDir } from "@/utils/path"

/**
 * Gets the path to the shadow Git repository in globalStorage.
 *
 * Checkpoints path structure:
 * globalStorage/
 *   checkpoints/
 *     {cwdHash}/
 *       .git/
 *
 * @param globalStoragePath - The VS Code global storage path
 * @param taskId - The ID of the task
 * @param cwdHash - Hash of the working directory path
 * @returns Promise<string> The absolute path to the shadow git directory
 * @throws Error if global storage path is invalid
 */
export async function getShadowGitPath(globalStoragePath: string, _taskId: string, cwdHash: string): Promise<string> {
	if (!globalStoragePath) {
		throw new Error("全局存储 uri 无效")
	}
	const checkpointsDir = path.join(globalStoragePath, "checkpoints", cwdHash)
	await mkdir(checkpointsDir, { recursive: true })
	const gitPath = path.join(checkpointsDir, ".git")
	return gitPath
}

/**
 * Gets the current working directory from the VS Code workspace.
 * Validates that checkpoints are not being used in protected directories
 * like home, Desktop, Documents, or Downloads. Checks to confirm that the workspace
 * is accessible and that we will not encounter breaking permissions issues when
 * creating checkpoints.
 *
 * Protected directories:
 * - User's home directory
 * - Desktop
 * - Documents
 * - Downloads
 *
 * @returns Promise<string> The absolute path to the current working directory
 * @throws Error if no workspace is detected, if in a protected directory, or if no read access
 */
export async function getWorkingDirectory(): Promise<string> {
	const cwd = await getCwd()
	if (!cwd) {
		throw new Error("未检测到工作区。请在工作区中打开 Cline 以使用检查点。")
	}

	// Check if directory exists and we have read permissions
	try {
		await access(cwd, constants.R_OK)
	} catch (error) {
		throw new Error(
			`无法访问工作区目录。请确保 VS Code 有权访问您的工作区。错误: ${error instanceof Error ? error.message : String(error)}`,
		)
	}

	const homedir = os.homedir()
	const desktopPath = getDesktopDir()
	const documentsPath = path.join(homedir, "Documents")
	const downloadsPath = path.join(homedir, "Downloads")

	switch (cwd) {
		case homedir:
			throw new Error("不能在主目录中使用检查点")
		case desktopPath:
			throw new Error("无法使用 Desktop 目录中的检查点")
		case documentsPath:
			throw new Error("无法使用 Documents 目录中的检查点")
		case downloadsPath:
			throw new Error("无法使用 Downloads 目录中的检查点")
		default:
			return cwd
	}
}

/**
 * Hashes the current working directory to a 13-character numeric hash.
 * @param workingDir - The absolute path to the working directory
 * @returns A 13-character numeric hash string used to identify the workspace
 * @throws {Error} If the working directory path is empty or invalid
 */
export function hashWorkingDir(workingDir: string): string {
	if (!workingDir) {
		throw new Error("工作目录路径不能为空")
	}
	let hash = 0
	for (let i = 0; i < workingDir.length; i++) {
		hash = (hash * 31 + workingDir.charCodeAt(i)) >>> 0
	}
	const bigHash = BigInt(hash)
	const numericHash = bigHash.toString().slice(0, 13)
	return numericHash
}
