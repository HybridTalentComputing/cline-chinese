import { Anthropic } from "@anthropic-ai/sdk"
import * as diff from "diff"
import * as path from "path"
import { ClineIgnoreController, LOCK_TEXT_SYMBOL } from "../ignore/ClineIgnoreController"

export const formatResponse = {
	duplicateFileReadNotice: () =>
		`[[注意] 此文件读取已被删除以节省上下文窗口空间。请参阅最新的文件读取以获取此文件的最新版本。]`,

	contextTruncationNotice: () =>
		`[注意] 为了保持最佳的上下文窗口长度，已删除部分与用户的先前对话历史。初始用户任务和最近的交流已保留以确保连续性，而中间的对话历史已被删除。在继续协助用户时，请记住这一点。`,

	condense: () =>
		`用户已接受您生成的精简对话摘要。此摘要涵盖了与用户历史对话中被截断的重要细节。\n<explicit_instructions type="condense_response">至关重要的是，您的回复只能询问用户接下来应该做什么。您不应主动采取任何行动或对继续工作做出任何假设。例如，您不应建议更改文件或尝试读取任何文件。\n在询问用户接下来应该做什么时，您可以参考刚刚生成的摘要中的信息。但是，您的回复不应引用摘要内容之外的信息。请保持此回复简洁。</explicit_instructions>`,

	toolDenied: () => `用户拒绝了此操作。`,

	toolError: (error?: string) => `工具执行失败，错误如下：\n<error>\n${error}\n</error>`,

	clineIgnoreError: (path: string) =>
		`对 ${path} 的访问已被 .clineignore 文件设置阻止。您必须尝试在不使用此文件的情况下继续任务，或者请求用户更新 .clineignore 文件。`,

	noToolsUsed: () =>
		`[错误] 您在先前的回复中未使用工具！请重试并使用工具。

${toolUseInstructionsReminder}

# 后续步骤

如果您已完成用户任务，请使用 attempt_completion 工具。
如果您需要用户提供更多信息，请使用 ask_followup_question 工具。
否则，如果您尚未完成任务且不需要其他信息，请继续执行任务的下一步。
(这是一条自动消息，请勿以对话方式回复。)`,

	tooManyMistakes: (feedback?: string) =>
		`您似乎在继续操作时遇到了困难。用户提供了以下反馈来指导您：\n<feedback>\n${feedback}\n</feedback>`,

	missingToolParameterError: (paramName: string) =>
		`必需参数 '${paramName}' 缺少值。请重试并提供完整的响应。\n\n${toolUseInstructionsReminder}`,

	invalidMcpToolArgumentError: (serverName: string, toolName: string) =>
		`为 ${toolName} 使用的 ${serverName} 的 JSON 参数无效。请重试并使用格式正确的 JSON 参数。`,

	toolResult: (text: string, images?: string[]): string | Array<Anthropic.TextBlockParam | Anthropic.ImageBlockParam> => {
		if (images && images.length > 0) {
			const textBlock: Anthropic.TextBlockParam = { type: "text", text }
			const imageBlocks: Anthropic.ImageBlockParam[] = formatImagesIntoBlocks(images)
			// Placing images after text leads to better results
			return [textBlock, ...imageBlocks]
		} else {
			return text
		}
	},

	imageBlocks: (images?: string[]): Anthropic.ImageBlockParam[] => {
		return formatImagesIntoBlocks(images)
	},

	formatFilesList: (
		absolutePath: string,
		files: string[],
		didHitLimit: boolean,
		clineIgnoreController?: ClineIgnoreController,
	): string => {
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
			return `${clineIgnoreParsed.join(
				"\n",
			)}\n\n(文件列表已截断。如果需要进一步浏览，请对特定子目录使用 list_files 命令。)`
		} else if (clineIgnoreParsed.length === 0 || (clineIgnoreParsed.length === 1 && clineIgnoreParsed[0] === "")) {
			return "未找到文件。"
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
		mode: "plan" | "act",
		agoText: string,
		cwd: string,
		wasRecent: boolean | 0 | undefined,
		responseText?: string,
	): [string, string] => {
		const taskResumptionMessage = `[任务恢复] ${
			mode === "plan"
				? `此任务在 ${agoText} 被中断。对话可能不完整。请注意，项目状态可能自那时起已发生变化。当前工作目录现在是 '${cwd.toPosix()}'。\n\n注意：如果您之前尝试使用的工具用户未提供结果，则应假定工具使用未成功。但是，您正处于计划模式，因此您必须响应用户的消息，而不是继续执行任务。`
				: `此任务在 ${agoText} 被中断。它可能已完成，也可能未完成，因此请重新评估任务上下文。请注意，项目状态可能自那时起已发生变化。当前工作目录现在是 '${cwd.toPosix()}'。如果任务尚未完成，请重试中断前的最后一步，然后继续完成任务。\n\n注意：如果您之前尝试使用的工具用户未提供结果，则应假定工具使用未成功，并评估是否应重试。如果最后一个工具是 browser_action，则浏览器已关闭，如果需要，您必须启动新浏览器。`
		}${
			wasRecent
				? "\n\n重要提示：如果最后一次工具使用是 replace_in_file 或 write_to_file 并且被中断，文件已恢复到中断编辑之前的原始状态，您不需要重新读取文件，因为您已经拥有其最新内容。"
				: ""
		}`

		const userResponseMessage = `${
			responseText
				? `${mode === "plan" ? "使用 plan_mode_respond 工具响应的新消息 (请确保在 <response> 参数中提供您的回复)" : "任务继续的新指令"}:\n<user_message>\n${responseText}\n</user_message>`
				: mode === "plan"
					? "(用户未提供新消息。请考虑询问他们希望如何进行，或建议他们切换到“行动”模式以继续任务。)"
					: ""
		}`

		return [taskResumptionMessage, userResponseMessage]
	},

	planModeInstructions: () => {
		return `在此模式下，您应专注于信息收集、提问和构建解决方案。制定计划后，使用 plan_mode_respond 工具与用户进行对话式来回交流。在收集到所有需要的信息（例如通过 read_file 或 ask_followup_question）之前，请勿使用 plan_mode_respond 工具。\n(请记住：如果用户似乎想使用仅在“行动模式”下可用的工具，您应该请用户“切换到行动模式”（请使用这些确切的词语）——他们需要使用下方的“计划/行动”切换按钮手动执行此操作。您自己无法切换到“行动模式”，必须等待用户在对计划满意后自行切换。您也不能提供切换到“行动模式”的选项，因为这需要您引导用户手动操作。)`
	},

	fileEditWithUserChanges: (
		relPath: string,
		userEdits: string,
		autoFormattingEdits: string | undefined,
		finalContent: string | undefined,
		newProblemsMessage: string | undefined,
	) =>
		`用户对您的内容进行了以下更新：\n\n${userEdits}\n\n` +
		(autoFormattingEdits
			? `用户的编辑器还对您的内容应用了以下自动格式化：\n\n${autoFormattingEdits}\n\n(注意：请密切关注诸如单引号转换成双引号、分号被移除或添加、长行被拆分成多行、调整缩进样式、添加/删除尾随逗号等更改。这将帮助您确保将来对此文件的 SEARCH/REPLACE 操作准确无误。)\n\n`
			: "") +
		`包含您的原始修改和附加编辑的更新内容已成功保存到 ${relPath.toPosix()}。以下是已保存文件的完整更新内容：\n\n` +
		`<final_file_content path="${relPath.toPosix()}">\n${finalContent}\n</final_file_content>\n\n` +
		`请注意：\n` +
		`1. 您无需使用这些更改重新编写文件，因为它们已被应用。\n` +
		`2. 使用此更新的文件内容作为新的基准继续执行任务。\n` +
		`3. 如果用户的编辑已解决部分任务或更改了需求，请相应调整您的方法。\n` + // Added newline for consistency
		`4. 重要提示：对于此文件的任何未来更改，请使用上面显示的 final_file_content 作为参考。此内容反映了文件的当前状态，包括用户编辑和任何自动格式化（例如，如果您使用了单引号但格式化程序将其转换为双引号）。始终基于此最终版本执行 SEARCH/REPLACE 操作以确保准确性。\n` +
		`${newProblemsMessage}`,

	fileEditWithoutUserChanges: (
		relPath: string,
		autoFormattingEdits: string | undefined,
		finalContent: string | undefined,
		newProblemsMessage: string | undefined,
	) =>
		`内容已成功保存到 ${relPath.toPosix()}。\n\n` +
		(autoFormattingEdits
			? `除了您的编辑之外，用户的编辑器还对您的内容应用了以下自动格式化：\n\n${autoFormattingEdits}\n\n(注意：请密切关注诸如单引号转换成双引号、分号被移除或添加、长行被拆分成多行、调整缩进样式、添加/删除尾随逗号等更改。这将帮助您确保将来对此文件的 SEARCH/REPLACE 操作准确无误。)\n\n`
			: "") +
		`以下是已保存文件的完整更新内容：\n\n` +
		`<final_file_content path="${relPath.toPosix()}">\n${finalContent}\n</final_file_content>\n\n` +
		`重要提示：对于此文件的任何未来更改，请使用上面显示的 final_file_content 作为参考。此内容反映了文件的当前状态，包括任何自动格式化（例如，如果您使用了单引号但格式化程序将其转换为双引号）。始终基于此最终版本执行 SEARCH/REPLACE 操作以确保准确性。\n\n` +
		`${newProblemsMessage}`,

	diffError: (relPath: string, originalContent: string | undefined) =>
		`这很可能是因为 SEARCH 块内容与文件中的内容不完全匹配，或者如果您使用了多个 SEARCH/REPLACE 块，它们可能未按其在文件中出现的顺序排列。\n\n` +
		`文件已恢复到其原始状态：\n\n` +
		`<file_content path="${relPath.toPosix()}">\n${originalContent}\n</file_content>\n\n` +
		`既然您已拥有文件的最新状态，请尝试使用更少、更精确的 SEARCH 块再次执行该操作。特别是对于大文件，谨慎的做法可能是尝试将自己限制在一次最多使用 <5 个 SEARCH/REPLACE 块，然后等待用户响应操作结果，再进行另一次 replace_in_file 调用以进行其他编辑。\n(如果连续 3 次遇到此错误，您可以使用 write_to_file 工具作为备选方案。)`,

	toolAlreadyUsed: (toolName: string) =>
		`工具 [${toolName}] 未执行，因为此消息中已使用过一个工具。每条消息只能使用一个工具。您必须评估第一个工具的结果，然后才能继续使用下一个工具。`,

	clineIgnoreInstructions: (content: string) =>
		`# .clineignore\n\n(以下内容由根级别的 .clineignore 文件提供，用户在该文件中指定了不应访问的文件和目录。使用 list_files 时，您会注意到被阻止的文件旁边有一个 ${LOCK_TEXT_SYMBOL} 符号。尝试访问文件内容（例如通过 read_file）将导致错误。)\n\n${content}\n.clineignore`,

	clineRulesGlobalDirectoryInstructions: (globalClineRulesFilePath: string, content: string) =>
		`# .clinerules/\n\n以下内容由位于 ${globalClineRulesFilePath.toPosix()} 的全局 .clinerules/ 目录提供，用户在该目录中为所有工作目录指定了指令：\n\n${content}`,

	clineRulesLocalDirectoryInstructions: (cwd: string, content: string) =>
		`# .clinerules/\n\n以下内容由根级别的 .clinerules/ 目录提供，用户在该目录中为此工作目录 (${cwd.toPosix()}) 指定了指令：\n\n${content}`,

	clineRulesLocalFileInstructions: (cwd: string, content: string) =>
		`# .clinerules\n\n以下内容由根级别的 .clinerules 文件提供，用户在该文件中为此工作目录 (${cwd.toPosix()}) 指定了指令：\n\n${content}`,

	windsurfRulesLocalFileInstructions: (cwd: string, content: string) =>
		`# .windsurfrules\n\n以下内容由根级别的 .windsurfrules 文件提供，用户在该文件中为此工作目录 (${cwd.toPosix()}) 指定了指令：\n\n${content}`,

	cursorRulesLocalFileInstructions: (cwd: string, content: string) =>
		`# .cursorrules\n\n以下内容由根级别的 .cursorrules 文件提供，用户在该文件中为此工作目录 (${cwd.toPosix()}) 指定了指令：\n\n${content}`,

	cursorRulesLocalDirectoryInstructions: (cwd: string, content: string) =>
		`# .cursor/rules\n\n以下内容由根级别的 .cursor/rules 目录提供，用户在该目录中为此工作目录 (${cwd.toPosix()}) 指定了指令：\n\n${content}`,
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

const toolUseInstructionsReminder = `# 提醒：工具使用说明

工具使用采用 XML 风格的标签进行格式化。工具名称包含在开始和结束标签中，每个参数也类似地包含在其自己的一组标签中。结构如下：

<tool_name>
<parameter1_name>value1</parameter1_name>
<parameter2_name>value2</parameter2_name>
...
</tool_name>

例如：

<attempt_completion>
<result>
我已完成任务...
</result>
</attempt_completion>

请始终遵守此格式以进行所有工具使用，以确保正确解析和执行。`
