import { ModelFamily } from "@/shared/prompts"
import { ClineDefaultTool } from "@/shared/tools"
import { isZhCN } from "../i18n/getLocaleText"
import type { ClineToolSpec } from "../spec"
import type { SystemPromptContext } from "../types"

const id = ClineDefaultTool.ATTEMPT

const DESCRIPTION_GENERIC_EN = `After each tool use, the user will respond with the result of that tool use, i.e. if it succeeded or failed, along with any reasons for failure. Once you've received the results of tool uses and can confirm that the task is complete, use this tool to present the result of your work to the user. Optionally you may provide a CLI command to showcase the result of your work. The user may respond with feedback if they are not satisfied with the result, which you can use to make improvements and try again.
IMPORTANT NOTE: This tool CANNOT be used until you've confirmed from the user that any previous tool uses were successful. Failure to do so will result in code corruption and system failure. Before using this tool, you must ask yourself in <thinking></thinking> tags if you've confirmed from the user that any previous tool uses were successful. If not, then DO NOT use this tool.`

const DESCRIPTION_GENERIC_ZH_CN = `在每次工具使用后，用户将响应该工具使用的结果，即成功或失败，以及失败的任何原因。一旦您收到工具使用的结果并可以确认任务已完成，请使用此工具向用户展示您的工作结果。您可以选择提供 CLI 命令来展示您的工作结果。如果用户对结果不满意，可能会提供反馈，您可以使用这些反馈进行改进并重试。
重要提示：在您从用户确认之前的任何工具使用都成功之前，无法使用此工具。否则会导致代码损坏和系统故障。在使用此工具之前，您必须在 <thinking></thinking> 标签中问自己是否已从用户确认之前的任何工具使用都成功。如果没有，则不要使用此工具。`

const INSTRUCTION_RESULT_EN = "The result of the tool use. This should be a clear, specific description of the result."
const INSTRUCTION_RESULT_ZH_CN = "工具使用的结果。这应该是对结果的清晰、具体的描述。"

const INSTRUCTION_COMMAND_EN =
	"A CLI command to execute to show a live demo of the result to the user. For example, use `open index.html` to display a created html website, or `open localhost:3000` to display a locally running development server. But DO NOT use commands like `echo` or `cat` that merely print text. This command should be valid for the current operating system. Ensure the command is properly formatted and does not contain any harmful instructions"

const INSTRUCTION_COMMAND_ZH_CN =
	"用于执行以向用户显示结果的实时演示的 CLI 命令。例如，使用 `open index.html` 显示创建的 html 网站，或使用 `open localhost:3000` 显示本地运行的开发服务器。但不要使用仅打印文本的命令，如 `echo` 或 `cat`。此命令应适用于当前操作系统。确保命令格式正确且不包含任何有害指令"

const INSTRUCTION_TASK_PROGRESS_GENERIC_EN =
	"A checklist showing task progress after this tool use is completed. (See 'Updating Task Progress' section for more details)"

const INSTRUCTION_TASK_PROGRESS_GENERIC_ZH_CN =
	"显示此工具使用完成后任务进度的检查清单。（有关更多详细信息，请参阅「更新任务进度」部分）"

const generic: ClineToolSpec = {
	variant: ModelFamily.GENERIC,
	id,
	name: "attempt_completion",
	description: (context: SystemPromptContext) => (isZhCN(context.locale) ? DESCRIPTION_GENERIC_ZH_CN : DESCRIPTION_GENERIC_EN),
	parameters: [
		{
			name: "result",
			required: true,
			instruction: (context: SystemPromptContext) =>
				isZhCN(context.locale) ? INSTRUCTION_RESULT_ZH_CN : INSTRUCTION_RESULT_EN,
			usage: "Your final result description here",
		},
		{
			name: "command",
			required: false,
			instruction: (context: SystemPromptContext) =>
				isZhCN(context.locale) ? INSTRUCTION_COMMAND_ZH_CN : INSTRUCTION_COMMAND_EN,
			usage: "Your command here (optional)",
		},
		// Different than the vanilla ASK_PROGRESS_PARAMETER
		{
			name: "task_progress",
			required: false,
			instruction: (context: SystemPromptContext) =>
				isZhCN(context.locale) ? INSTRUCTION_TASK_PROGRESS_GENERIC_ZH_CN : INSTRUCTION_TASK_PROGRESS_GENERIC_EN,
			usage: "Checklist here (required if you used task_progress in previous tool uses)",
			dependencies: [ClineDefaultTool.TODO],
			description:
				"If you were using task_progress to update the task progress, you must include the completed list in the result as well.",
		},
	],
}

const DESCRIPTION_GPT_5_EN = `After each tool use, the user will respond with the result of that tool use, i.e. if it succeeded or failed, along with any reasons for failure. Once you've received the results of tool uses and can confirm that the task is complete, use this tool to present the result of your work to the user. Optionally you may provide a CLI command to showcase the result of your work. The user may respond with feedback if they are not satisfied with the result, which you can use to make improvements and try again.
IMPORTANT NOTE: This tool CANNOT be used until you've confirmed from the user that any previous tool uses were successful and all tasks have been completed in full. Failure to do so will result in code corruption and system failure. Before using this tool, you must ask yourself in <thinking></thinking> tags if you've confirmed from the user that any previous tool uses were successful and all goals defined by the user have been completed. If not, then DO NOT use this tool.`

const DESCRIPTION_GPT_5_ZH_CN = `在每次工具使用后，用户将响应该工具使用的结果，即成功或失败，以及失败的任何原因。一旦您收到工具使用的结果并可以确认任务已完成，请使用此工具向用户展示您的工作结果。您可以选择提供 CLI 命令来展示您的工作结果。如果用户对结果不满意，可能会提供反馈，您可以使用这些反馈进行改进并重试。
重要提示：在您从用户确认之前的任何工具使用都成功并完成所有任务之前，无法使用此工具。否则会导致代码损坏和系统故障。在使用此工具之前，您必须在 <thinking></thinking> 标签中问自己是否已从用户确认之前的任何工具使用都成功并且用户定义的所有目标都已完成。如果没有，则不要使用此工具。`

const INSTRUCTION_TASK_PROGRESS_DEPENDENCY_EN =
	"If you were using task_progress to update the task progress, you must include the completed list in the result as well."
const INSTRUCTION_TASK_PROGRESS_DEPENDENCY_ZH_CN = "如果您使用 task_progress 更新任务进度，则必须在结果中也包含已完成的列表。"

const GPT_5: ClineToolSpec = {
	variant: ModelFamily.GPT_5,
	id,
	name: "attempt_completion",
	description: (context: SystemPromptContext) => (isZhCN(context.locale) ? DESCRIPTION_GPT_5_ZH_CN : DESCRIPTION_GPT_5_EN),
	parameters: [
		{
			name: "result",
			required: true,
			instruction: (context: SystemPromptContext) =>
				isZhCN(context.locale) ? INSTRUCTION_RESULT_ZH_CN : INSTRUCTION_RESULT_EN,
			usage: "Your final result description here",
		},
		{
			name: "command",
			required: false,
			instruction: (context: SystemPromptContext) =>
				isZhCN(context.locale) ? INSTRUCTION_COMMAND_ZH_CN : INSTRUCTION_COMMAND_EN,
			usage: "Your command here (optional)",
		},
		// Different than the vanilla ASK_PROGRESS_PARAMETER
		{
			name: "task_progress",
			required: false,
			instruction: (context: SystemPromptContext) =>
				isZhCN(context.locale) ? INSTRUCTION_TASK_PROGRESS_GENERIC_ZH_CN : INSTRUCTION_TASK_PROGRESS_GENERIC_EN,
			usage: "Checklist here (required if you used task_progress in previous tool uses)",
			dependencies: [ClineDefaultTool.TODO],
			description: (context: SystemPromptContext) =>
				isZhCN(context.locale) ? INSTRUCTION_TASK_PROGRESS_DEPENDENCY_ZH_CN : INSTRUCTION_TASK_PROGRESS_DEPENDENCY_EN,
		},
	],
}

const DESCRIPTION_NATIVE_EN =
	"Once you've completed the user's task, use this tool to present the final result to the user, including a brief and very short (1-2 paragraph) summary of the task and what was done to resolve it. Provide the basics, hitting the highlights, but do delve into the specifics. You should only call this tool when you have completed all tasks in the task_progress list, and completed all changes that are necessary to satisfy the user's request. You should not provide the contents of the task_progress list in the result parameter, it must be included in the task_progress parameter."

const DESCRIPTION_NATIVE_ZH_CN =
	"完成用户的任务后，使用此工具向用户展示最终结果，包括任务的简短摘要（1-2 段）以及为解决任务所做的工作。提供基本信息，突出重点，但不要深入细节。只有当您完成了 task_progress 列表中的所有任务并完成满足用户请求所需的所有更改时，才应调用此工具。您不应在 result 参数中提供 task_progress 列表的内容，它必须包含在 task_progress 参数中。"

const INSTRUCTION_RESULT_NATIVE_EN = "A clear, brief and very short (1-2 paragraph) summary of the final result of the task."
const INSTRUCTION_RESULT_NATIVE_ZH_CN = "任务最终结果的清晰、简短摘要（1-2 段）。"

const INSTRUCTION_COMMAND_NATIVE_EN =
	"An actionable terminal command that is non-verbose that allows user to review the result of your work. For example, use `start localhost:3000` to start a locally running development server. Commands like `echo` or `cat` that merely print text or open a file are not allowed. Ensure the command is properly formatted for user's OS and does not contain any harmful instructions"

const INSTRUCTION_COMMAND_NATIVE_ZH_CN =
	"一个简洁的可执行终端命令，允许用户查看您的工作结果。例如，使用 `start localhost:3000` 启动本地运行的开发服务器。不允许使用仅打印文本或打开文件的命令，如 `echo` 或 `cat`。确保命令适合用户的操作系统格式正确且不包含任何有害指令"

const INSTRUCTION_TASK_PROGRESS_NATIVE_EN =
	"A checklist showing task progress with the latest status of each subtasks included previously, if any. If you are calling attempt completion, and all items in this list have been completed, they must be marked as completed in this response."

const INSTRUCTION_TASK_PROGRESS_NATIVE_ZH_CN =
	"显示任务进度的检查清单，包含之前包含的每个子任务的最新状态（如果有）。如果您正在调用 attempt completion，并且此列表中的所有项目都已完成，则在此响应中必须将它们标记为已完成。"

const NATIVE_NEXT_GEN: ClineToolSpec = {
	variant: ModelFamily.NATIVE_NEXT_GEN,
	id,
	name: "attempt_completion",
	description: (context: SystemPromptContext) => (isZhCN(context.locale) ? DESCRIPTION_NATIVE_ZH_CN : DESCRIPTION_NATIVE_EN),
	parameters: [
		{
			name: "result",
			required: true,
			instruction: (context: SystemPromptContext) =>
				isZhCN(context.locale) ? INSTRUCTION_RESULT_NATIVE_ZH_CN : INSTRUCTION_RESULT_NATIVE_EN,
		},
		{
			name: "command",
			required: false,
			instruction: (context: SystemPromptContext) =>
				isZhCN(context.locale) ? INSTRUCTION_COMMAND_NATIVE_ZH_CN : INSTRUCTION_COMMAND_NATIVE_EN,
		},
		{
			name: "task_progress",
			required: false,
			dependencies: [ClineDefaultTool.TODO],
			instruction: (context: SystemPromptContext) =>
				isZhCN(context.locale) ? INSTRUCTION_TASK_PROGRESS_NATIVE_ZH_CN : INSTRUCTION_TASK_PROGRESS_NATIVE_EN,
		},
	],
}

const NATIVE_GPT_5: ClineToolSpec = {
	...NATIVE_NEXT_GEN,
	variant: ModelFamily.NATIVE_GPT_5,
}

export const attempt_completion_variants = [generic, GPT_5, NATIVE_NEXT_GEN, NATIVE_GPT_5]
