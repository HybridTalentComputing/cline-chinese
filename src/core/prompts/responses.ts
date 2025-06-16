import { Anthropic } from "@anthropic-ai/sdk"
import * as diff from "diff"
import * as path from "path"
import { ClineIgnoreController, LOCK_TEXT_SYMBOL } from "../ignore/ClineIgnoreController"

export const formatResponse = {
	duplicateFileReadNotice: () =>
		`[[NOTE] 此文件读取已被移除以节省上下文窗口空间。请参考最新的文件读取以获取此文件的最新版本。]`,

	contextTruncationNotice: () =>
		`[NOTE] 为了维持最佳上下文窗口长度，部分之前与用户的对话历史已被移除。为了保持连续性，已保留初始用户任务和最近的交流内容，而中间的对话历史已被移除。请在继续协助用户时记住这一点。`,

	condense: () =>
		`用户已接受你生成的对话摘要。此摘要涵盖了已被截断的历史对话中的重要细节。\n<explicit_instructions type="condense_response">至关重要的是，你的回应应该仅限于询问用户接下来应该做什么。你不应该主动采取行动或对继续工作做出任何假设。例如，你不应该建议文件更改或尝试读取任何文件。\n当询问用户接下来应该做什么时，你可以引用刚刚生成的摘要中的信息。但是，在此回应中，你不应该引用摘要之外的信息。保持回应简洁。</explicit_instructions>`,

	toolDenied: () => `用户拒绝了此操作。`,

	toolError: (error?: string) => `工具执行失败，错误如下：\n<error>\n${error}\n</error>`,

	clineIgnoreError: (path: string) =>
		`访问 ${path} 被 .clineignore 文件设置阻止。你必须尝试在不使用此文件的情况下继续任务，或者请用户更新 .clineignore 文件。`,

	noToolsUsed: () =>
		`[ERROR] 你在上一个回应中没有使用工具！请使用工具重试。

${toolUseInstructionsReminder}

# 下一步

如果你已完成用户的任务，请使用 attempt_completion 工具。
如果你需要用户提供更多信息，请使用 ask_followup_question 工具。
否则，如果你尚未完成任务且不需要额外信息，请继续执行任务的下一步。
(这是一条自动消息，请不要以对话方式回应它。)`,

	tooManyMistakes: (feedback?: string) =>
		`你似乎在继续进行时遇到了困难。用户提供了以下反馈来帮助指导你：\n<feedback>\n${feedback}\n</feedback>`,

	missingToolParameterError: (paramName: string) =>
		`缺少必需参数 '${paramName}' 的值。请使用完整的回应重试。\n\n${toolUseInstructionsReminder}`,

	invalidMcpToolArgumentError: (serverName: string, toolName: string) =>
		`${serverName} 的 ${toolName} 使用了无效的 JSON 参数。请使用格式正确的 JSON 参数重试。`,

	toolResult: (
		text: string,
		images?: string[],
		fileString?: string,
	): string | Array<Anthropic.TextBlockParam | Anthropic.ImageBlockParam> => {
		let toolResultOutput = []

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
	): string => {
		const sorted = files
			.map((file) => {
				// 将绝对路径转换为相对路径
				const relativePath = path.relative(absolutePath, file).toPosix()
				return file.endsWith("/") ? relativePath + "/" : relativePath
			})
			// 排序，使文件列在其各自目录下，清楚地表明哪些文件是哪些目录的子文件。由于我们自上而下构建文件列表，即使文件列表被截断，它也会显示cline可以进一步探索的目录。
			.sort((a, b) => {
				const aParts = a.split("/") // 仅在先使用toPosix时有效
				const bParts = b.split("/")
				for (let i = 0; i < Math.min(aParts.length, bParts.length); i++) {
					if (aParts[i] !== bParts[i]) {
						// 如果在此级别上一个是目录而另一个不是，则先排序目录
						if (i + 1 === aParts.length && i + 1 < bParts.length) {
							return -1
						}
						if (i + 1 === bParts.length && i + 1 < aParts.length) {
							return 1
						}
						// 否则，按字母顺序排序
						return aParts[i].localeCompare(bParts[i], undefined, {
							numeric: true,
							sensitivity: "base",
						})
					}
				}
				// 如果所有部分在较短路径的长度范围内都相同，
				// 较短的路径排在前面
				return aParts.length - bParts.length
			})

		const clineIgnoreParsed = clineIgnoreController
			? sorted.map((filePath) => {
					// 路径相对于绝对路径，而非cwd
					// validateAccess期望相对于cwd的路径或绝对路径
					// 否则，对于验证像"assets/icons"这样的忽略模式，我们最终只会得到"icons"，这会导致路径不被忽略。
					const absoluteFilePath = path.resolve(absolutePath, filePath)
					const isIgnored = !clineIgnoreController.validateAccess(absoluteFilePath)
					if (isIgnored) {
						return LOCK_TEXT_SYMBOL + " " + filePath
					}

					return filePath
				})
			: sorted

		if (didHitLimit) {
			return `${clineIgnoreParsed.join("\n")}\n\n(文件列表已截断。如果需要进一步探索，请对特定子目录使用list_files。)`
		} else if (clineIgnoreParsed.length === 0 || (clineIgnoreParsed.length === 1 && clineIgnoreParsed[0] === "")) {
			return "未找到文件。"
		} else {
			return clineIgnoreParsed.join("\n")
		}
	},

	createPrettyPatch: (filename = "file", oldStr?: string, newStr?: string) => {
		// 字符串不能为undefined，否则diff会抛出异常
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
				? `此任务在${agoText}前被中断。对话可能不完整。请注意，项目状态可能已经发生变化。当前工作目录现在是'${cwd.toPosix()}'。\n\n注意：如果你之前尝试使用了某个工具但用户没有提供结果，你应该假设该工具使用不成功。但是你现在处于规划模式，所以不要继续任务，而是必须回应用户的消息。`
				: `此任务在${agoText}前被中断。它可能已完成也可能未完成，请重新评估任务上下文。请注意，项目状态可能已经发生变化。当前工作目录现在是'${cwd.toPosix()}'。如果任务尚未完成，请重试中断前的最后一步，然后继续完成任务。\n\n注意：如果你之前尝试使用了某个工具但用户没有提供结果，你应该假设该工具使用不成功并评估是否应该重试。如果最后一个工具是browser_action，浏览器已关闭，如果需要，你必须启动一个新的浏览器。`
		}${
			wasRecent
				? "\n\n重要：如果最后一个工具使用是被中断的replace_in_file或write_to_file，文件已恢复到编辑前的原始状态，你不需要重新读取文件，因为你已经有了其最新内容。"
				: ""
		}`

		const userResponseMessage = `${
			responseText
				? `${mode === "plan" ? "需要使用plan_mode_respond工具回应的新消息（确保在<response>参数中提供你的回应）" : "任务继续的新指示"}:\n<user_message>\n${responseText}\n</user_message>`
				: mode === "plan"
					? "（用户没有提供新消息。考虑询问他们希望你如何继续，或建议他们切换到执行模式以继续任务。）"
					: ""
		}`

		return [taskResumptionMessage, userResponseMessage]
	},

	planModeInstructions: () => {
		return `在此模式下，你应该专注于信息收集、提问和设计解决方案。一旦你有了计划，使用plan_mode_respond工具与用户进行对话交流。在收集完所有需要的信息（例如通过read_file或ask_followup_question）之前，不要使用plan_mode_respond工具。
（记住：如果用户似乎想要你使用只在执行模式下可用的工具，你应该请用户"切换到执行模式"（使用这些词）- 他们将需要使用下方的规划/执行切换按钮手动执行此操作。你没有自行切换到执行模式的能力，必须等待用户在对计划满意后自行切换。你也不能提供切换到执行模式的选项，因为这是用户需要自行手动完成的事情。）`
	},

	fileEditWithUserChanges: (
		relPath: string,
		userEdits: string,
		autoFormattingEdits: string | undefined,
		finalContent: string | undefined,
		newProblemsMessage: string | undefined,
	) =>
		`用户对你的内容进行了以下更新：\n\n${userEdits}\n\n` +
		(autoFormattingEdits
			? `用户的编辑器还对你的内容应用了以下自动格式化：\n\n${autoFormattingEdits}\n\n（注意：请密切关注诸如单引号转换为双引号、分号被移除或添加、长行被分成多行、调整缩进样式、添加/删除尾随逗号等变化。这将帮助你确保对此文件的未来搜索/替换操作准确无误。）\n\n`
			: "") +
		`更新后的内容（包括你的原始修改和额外的编辑）已成功保存到${relPath.toPosix()}。以下是保存的文件的完整更新内容：\n\n` +
		`<final_file_content path="${relPath.toPosix()}">\n${finalContent}\n</final_file_content>\n\n` +
		`请注意：\n` +
		`1. 你不需要用这些更改重写文件，因为它们已经被应用。\n` +
		`2. 使用此更新的文件内容作为新的基准继续任务。\n` +
		`3. 如果用户的编辑已解决了部分任务或改变了需求，请相应调整你的方法。` +
		`4. 重要：对于此文件的任何未来更改，请使用上面显示的final_file_content作为参考。此内容反映了文件的当前状态，包括用户编辑和任何自动格式化（例如，如果你使用了单引号但格式化器将其转换为双引号）。始终基于此最终版本进行搜索/替换操作，以确保准确性。\n` +
		`${newProblemsMessage}`,

	fileEditWithoutUserChanges: (
		relPath: string,
		autoFormattingEdits: string | undefined,
		finalContent: string | undefined,
		newProblemsMessage: string | undefined,
	) =>
		`内容已成功保存到${relPath.toPosix()}。\n\n` +
		(autoFormattingEdits
			? `除了你的编辑外，用户的编辑器还对你的内容应用了以下自动格式化：\n\n${autoFormattingEdits}\n\n（注意：请密切关注诸如单引号转换为双引号、分号被移除或添加、长行被分成多行、调整缩进样式、添加/删除尾随逗号等变化。这将帮助你确保对此文件的未来搜索/替换操作准确无误。）\n\n`
			: "") +
		`以下是保存的文件的完整更新内容：\n\n` +
		`<final_file_content path="${relPath.toPosix()}">\n${finalContent}\n</final_file_content>\n\n` +
		`重要：对于此文件的任何未来更改，请使用上面显示的final_file_content作为参考。此内容反映了文件的当前状态，包括任何自动格式化（例如，如果你使用了单引号但格式化器将其转换为双引号）。始终基于此最终版本进行搜索/替换操作，以确保准确性。\n\n` +
		`${newProblemsMessage}`,

	diffError: (relPath: string, originalContent: string | undefined) =>
		`这可能是因为搜索块内容与文件中的内容不完全匹配，或者如果你使用了多个搜索/替换块，它们可能不是按照它们在文件中出现的顺序排列的。（还请确保在使用replace_in_file工具时，不要向标记添加额外字符（例如，------- SEARCH>是无效的）。不要忘记使用结束的+++++++ REPLACE标记。不要以任何方式修改标记格式。格式错误的XML将导致工具完全失败并破坏整个编辑过程。）\n\n` +
		`文件已恢复到其原始状态：\n\n` +
		`<file_content path="${relPath.toPosix()}">\n${originalContent}\n</file_content>\n\n` +
		`现在你已经有了文件的最新状态，请尝试使用更少、更精确的搜索块重新操作。特别是对于大文件，限制自己一次使用<5个搜索/替换块可能是明智的，然后等待用户对操作结果做出回应，再跟进另一个replace_in_file调用进行额外编辑。\n（如果你连续3次遇到此错误，你可以使用write_to_file工具作为备选方案。）`,

	toolAlreadyUsed: (toolName: string) =>
		`工具[${toolName}]未执行，因为此消息中已经使用了一个工具。每条消息只能使用一个工具。你必须评估第一个工具的结果，然后再继续使用下一个工具。`,

	clineIgnoreInstructions: (content: string) =>
		`# .clineignore\n\n（以下内容由根级.clineignore文件提供，用户在其中指定了不应访问的文件和目录。使用list_files时，你会注意到被阻止的文件旁边有${LOCK_TEXT_SYMBOL}。尝试通过read_file等方式访问文件内容将导致错误。）\n\n${content}\n.clineignore`,

	clineRulesGlobalDirectoryInstructions: (globalClineRulesFilePath: string, content: string) =>
		`# .clinerules/\n\n以下内容由全局.clinerules/目录提供，位于${globalClineRulesFilePath.toPosix()}，用户在其中为所有工作目录指定了指示：\n\n${content}`,

	clineRulesLocalDirectoryInstructions: (cwd: string, content: string) =>
		`# .clinerules/\n\n以下内容由根级.clinerules/目录提供，用户在其中为此工作目录(${cwd.toPosix()})指定了指示\n\n${content}`,

	clineRulesLocalFileInstructions: (cwd: string, content: string) =>
		`# .clinerules\n\n以下内容由根级.clinerules文件提供，用户在其中为此工作目录(${cwd.toPosix()})指定了指示\n\n${content}`,

	windsurfRulesLocalFileInstructions: (cwd: string, content: string) =>
		`# .windsurfrules\n\n以下内容由根级.windsurfrules文件提供，用户在其中为此工作目录(${cwd.toPosix()})指定了指示\n\n${content}`,

	cursorRulesLocalFileInstructions: (cwd: string, content: string) =>
		`# .cursorrules\n\n以下内容由根级.cursorrules文件提供，用户在其中为此工作目录(${cwd.toPosix()})指定了指示\n\n${content}`,

	cursorRulesLocalDirectoryInstructions: (cwd: string, content: string) =>
		`# .cursor/rules\n\n以下内容由根级.cursor/rules目录提供，用户在其中为此工作目录(${cwd.toPosix()})指定了指示\n\n${content}`,
}

// 避免循环依赖
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

工具使用采用XML风格的标签格式。工具名称包含在开始和结束标签中，每个参数同样包含在自己的标签集中。结构如下：

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

始终遵循此格式进行所有工具使用，以确保正确解析和执行。`
