import { Anthropic } from "@anthropic-ai/sdk"
import * as diff from "diff"
import * as path from "path"
import { Mode } from "@/shared/storage/types"
import { ClineIgnoreController, LOCK_TEXT_SYMBOL } from "../ignore/ClineIgnoreController"
import { enTranslations } from "./i18n/en"
import { zhCnTranslations } from "./i18n/zh-cn"

export function getT(language?: string) {
	const isChinese = language === "zh-CN" || language === "zh-TW"
	return isChinese ? zhCnTranslations : enTranslations
}

export const formatResponse = {
	duplicateFileReadNotice: (language?: string) => getT(language).responses.duplicateFileReadNotice,

	contextTruncationNotice: (language?: string) => getT(language).responses.contextTruncationNotice,

	processFirstUserMessageForTruncation: (language?: string) => {
		return getT(language).responses.processFirstUserMessageForTruncation
	},

	condense: (language?: string) => getT(language).responses.condense,

	toolDenied: (language?: string) => getT(language).responses.toolDenied,

	toolError: (error?: string, language?: string) => getT(language).responses.toolError(error),

	clineIgnoreError: (path: string, language?: string) => getT(language).responses.clineIgnoreError(path),

	noToolsUsed: (usingNativeToolCalls: boolean, language?: string) => {
		const t = getT(language)
		return usingNativeToolCalls
			? t.responses.noToolsUsed(usingNativeToolCalls)
			: `${t.responses.noToolsUsed(usingNativeToolCalls)}\n\n${t.responses.toolUseInstructionsReminder}`
	},

	tooManyMistakes: (feedback?: string, language?: string) => getT(language).responses.tooManyMistakes(feedback),

	missingToolParameterError: (paramName: string, language?: string) => {
		const t = getT(language)
		return `${t.responses.missingToolParameterError(paramName)}\n\n${t.responses.toolUseInstructionsReminder}`
	},

	invalidMcpToolArgumentError: (serverName: string, toolName: string, language?: string) =>
		getT(language).responses.invalidMcpToolArgumentError(serverName, toolName),

	toolResult: (
		text: string,
		images?: string[],
		fileString?: string,
	): string | Array<Anthropic.TextBlockParam | Anthropic.ImageBlockParam> => {
		const toolResultOutput = []

		if (!(images && images.length > 0) && !fileString) {
			return text
		}

		const textBlock: Anthropic.TextBlockParam = { type: "text", text }
		toolResultOutput.push(textBlock)

		if (images && images.length > 0) {
			const imageBlocks: Anthropic.ImageBlockParam[] = formatImagesIntoBlocks(images)
			toolResultOutput.push(...imageBlocks)
		}

		if (fileString) {
			const fileBlock: Anthropic.TextBlockParam = { type: "text", text: fileString }
			toolResultOutput.push(fileBlock)
		}

		return toolResultOutput
	},

	imageBlocks: (images?: string[]): Anthropic.ImageBlockParam[] => {
		return formatImagesIntoBlocks(images)
	},

	formatFilesList: (
		absolutePath: string,
		files: string[],
		didHitLimit: boolean,
		clineIgnoreController?: ClineIgnoreController,
		language?: string,
	): string => {
		const t = getT(language)
		const sorted = files
			.map((file) => {
				// convert absolute path to relative path
				const relativePath = path.relative(absolutePath, file).toPosix()
				return file.endsWith("/") ? relativePath + "/" : relativePath
			})
			// Sort so files are listed under their respective directories to make it clear what files are children of what directories. Since we build file list top down, even if file list is truncated it will show directories that cline can then explore further.
			.sort((a, b) => {
				const aParts = a.split("/") // only works if we use toPosix first
				const bParts = b.split("/")
				for (let i = 0; i < Math.min(aParts.length, bParts.length); i++) {
					if (aParts[i] !== bParts[i]) {
						// If one is a directory and the other isn't at this level, sort the directory first
						if (i + 1 === aParts.length && i + 1 < bParts.length) {
							return -1
						}
						if (i + 1 === bParts.length && i + 1 < aParts.length) {
							return 1
						}
						// Otherwise, sort alphabetically
						return aParts[i].localeCompare(bParts[i], undefined, {
							numeric: true,
							sensitivity: "base",
						})
					}
				}
				// If all parts are the same up to the length of the shorter path,
				// the shorter one comes first
				return aParts.length - bParts.length
			})

		const clineIgnoreParsed = clineIgnoreController
			? sorted.map((filePath) => {
					// path is relative to absolute path, not cwd
					// validateAccess expects either path relative to cwd or absolute path
					// otherwise, for validating against ignore patterns like "assets/icons", we would end up with just "icons", which would result in the path not being ignored.
					const absoluteFilePath = path.resolve(absolutePath, filePath)
					const isIgnored = !clineIgnoreController.validateAccess(absoluteFilePath)
					if (isIgnored) {
						return LOCK_TEXT_SYMBOL + " " + filePath
					}

					return filePath
				})
			: sorted

		if (didHitLimit) {
			return `${clineIgnoreParsed.join("\n")}\n\n${t.responses.formatFilesListTruncated}`
		} else if (clineIgnoreParsed.length === 0 || (clineIgnoreParsed.length === 1 && clineIgnoreParsed[0] === "")) {
			return t.responses.formatFilesListEmpty
		} else {
			return clineIgnoreParsed.join("\n")
		}
	},

	createPrettyPatch: (filename = "file", oldStr?: string, newStr?: string) => {
		// strings cannot be undefined or diff throws exception
		const patch = diff.createPatch(filename.toPosix(), oldStr || "", newStr || "")
		const lines = patch.split("\n")
		const prettyPatchLines = lines.slice(4)
		return prettyPatchLines.join("\n")
	},

	taskResumption: (
		mode: Mode,
		agoText: string,
		cwd: string,
		wasRecent: boolean | 0 | undefined,
		responseText?: string,
		hasPendingFileContextWarnings?: boolean,
		language?: string,
	): [string, string] => {
		const t = getT(language)
		const taskResumptionMessage = t.responses.taskResumption(
			mode,
			agoText,
			cwd.toPosix(),
			!!wasRecent,
			!!hasPendingFileContextWarnings,
		)
		const userResponseMessage = t.responses.userResponseMessage(mode, responseText)
		return [taskResumptionMessage, userResponseMessage]
	},

	planModeInstructions: (language?: string) => {
		return getT(language).responses.planModeInstructions
	},

	fileEditWithUserChanges: (
		relPath: string,
		userEdits: string,
		autoFormattingEdits: string | undefined,
		finalContent: string | undefined,
		newProblemsMessage: string | undefined,
		language?: string,
	) => {
		const t = getT(language)
		return (
			t.responses.userEditsNotice +
			`\n\n${userEdits}\n\n` +
		(autoFormattingEdits
				? t.responses.autoFormattingNotice.replace("\n\n(", `\n\n${autoFormattingEdits}\n\n(`)
			: "") +
			t.responses.fileEditWithUserChanges(relPath.toPosix()) +
			` ` +
			t.responses.finalFileContentNotice(relPath.toPosix()) +
			`${finalContent}\n</final_file_content>\n\n` +
			t.responses.fileEditInstructions +
			`${newProblemsMessage || ""}`
		)
	},

	fileEditWithoutUserChanges: (
		relPath: string,
		autoFormattingEdits: string | undefined,
		finalContent: string | undefined,
		newProblemsMessage: string | undefined,
		language?: string,
	) => {
		const t = getT(language)
		return (
			t.responses.fileEditWithoutUserChanges(relPath.toPosix()) +
			`\n\n` +
		(autoFormattingEdits
				? t.responses.autoFormattingNotice.replace("\n\n(", `\n\n${autoFormattingEdits}\n\n(`)
			: "") +
			t.responses.finalFileContentNotice(relPath.toPosix()) +
			`${finalContent}\n</final_file_content>\n\n` +
			t.responses.fileEditInstructions.split("\n").slice(3).join("\n") + // skip first 3 lines which are only for user edits
			`${newProblemsMessage || ""}`
		)
	},

	diffError: (relPath: string, originalContent: string | undefined, language?: string) => {
		const t = getT(language)
		return (
			t.responses.diffError(relPath.toPosix()) +
			`${originalContent}\n</file_content>\n\n` +
			t.responses.diffErrorInstructions
		)
	},

	toolAlreadyUsed: (toolName: string, language?: string) => getT(language).responses.toolAlreadyUsed(toolName),

	clineIgnoreInstructions: (content: string, language?: string) => {
		const t = getT(language)
		return (
			t.responses.clineIgnoreInstructionsTitle +
			"\n\n" +
			t.responses.clineIgnoreInstructions(LOCK_TEXT_SYMBOL) +
			"\n\n" +
			content +
			"\n.clineignore"
		)
	},

	clineRulesGlobalDirectoryInstructions: (globalClineRulesFilePath: string, content: string, language?: string) => {
		const t = getT(language)
		return t.responses.clineRulesGlobalDirectoryInstructions(globalClineRulesFilePath.toPosix()) + "\n\n" + content
	},

	clineRulesLocalDirectoryInstructions: (cwd: string, content: string, language?: string) => {
		const t = getT(language)
		return t.responses.clineRulesLocalDirectoryInstructions(cwd.toPosix()) + "\n\n" + content
	},

	clineRulesLocalFileInstructions: (cwd: string, content: string, language?: string) => {
		const t = getT(language)
		return t.responses.clineRulesLocalFileInstructions(cwd.toPosix()) + "\n\n" + content
	},

	windsurfRulesLocalFileInstructions: (cwd: string, content: string, language?: string) => {
		const t = getT(language)
		return t.responses.windsurfRulesLocalFileInstructions(cwd.toPosix()) + "\n\n" + content
	},

	cursorRulesLocalFileInstructions: (cwd: string, content: string, language?: string) => {
		const t = getT(language)
		return t.responses.cursorRulesLocalFileInstructions(cwd.toPosix()) + "\n\n" + content
	},

	cursorRulesLocalDirectoryInstructions: (cwd: string, content: string, language?: string) => {
		const t = getT(language)
		return t.responses.cursorRulesLocalDirectoryInstructions(cwd.toPosix()) + "\n\n" + content
	},

	agentsRulesLocalFileInstructions: (cwd: string, content: string, language?: string) => {
		const t = getT(language)
		return t.responses.agentsRulesLocalFileInstructions(cwd.toPosix()) + "\n\n" + content
	},

	fileContextWarning: (editedFiles: string[], language?: string): string => {
		const t = getT(language)
		const fileCount = editedFiles.length
		return (
			t.responses.fileContextWarning(
				fileCount,
				editedFiles.map((file) => ` ${path.resolve(file).toPosix()}`).join("\n"),
			)
		)
	},

	toolUseInstructionsReminder: (language?: string) => getT(language).responses.toolUseInstructionsReminder,
}

// to avoid circular dependency
const formatImagesIntoBlocks = (images?: string[]): Anthropic.ImageBlockParam[] => {
	return images
		? images.map((dataUrl) => {
				// data:image/png;base64,base64string
				const [rest, base64] = dataUrl.split(",")
				const mimeType = rest.split(":")[1].split(";")[0]
				return {
					type: "image",
					source: {
						type: "base64",
						media_type: mimeType,
						data: base64,
					},
				} as Anthropic.ImageBlockParam
			})
		: []
}
