import { ModelFamily } from "@/shared/prompts"
import { ClineDefaultTool } from "@/shared/tools"
import { isZhCN } from "../i18n/getLocaleText"
import type { ClineToolSpec } from "../spec"
import type { SystemPromptContext } from "../types"
import { TASK_PROGRESS_PARAMETER } from "../types"

const DESCRIPTION_GENERIC_EN =
	"Ask the user a question to gather additional information needed to complete the task. This tool should be used when you encounter ambiguities, need clarification, or require more details to proceed effectively. It allows for interactive problem-solving by enabling direct communication with the user. Use this tool judiciously to maintain a balance between gathering necessary information and avoiding excessive back-and-forth."

const DESCRIPTION_GENERIC_ZH_CN =
	"向用户提问以收集完成任务所需的额外信息。当您遇到歧义、需要澄清或需要更多详细信息才能有效进行时，应使用此工具。它通过启用与用户的直接通信来实现交互式问题解决。明智地使用此工具，在收集必要信息和避免过多的来回沟通之间保持平衡。"

const INSTRUCTION_QUESTION_EN =
	"The question to ask the user. This should be a clear, specific question that addresses the information you need."
const INSTRUCTION_QUESTION_ZH_CN = "向用户提出的问题。这应该是一个清晰、具体的问题，解决您需要的信息。"

const INSTRUCTION_OPTIONS_EN =
	"An array of 2-5 options for the user to choose from. Each option should be a string describing a possible answer. You may not always need to provide options, but it may be helpful in many cases where it can save the user from having to type out a response manually. IMPORTANT: NEVER include an option to toggle to Act mode, as this would be something you need to direct the user to do manually themselves if needed."

const INSTRUCTION_OPTIONS_ZH_CN =
	"供用户选择的 2-5 个选项的数组。每个选项应该是一个描述可能答案的字符串。您可能并不总是需要提供选项，但在许多情况下它可能会有所帮助，可以使用户不必手动输入回复。重要提示：永远不要包含切换到 Act 模式的选项，因为如果需要，您需要指导用户自己手动执行此操作。"

const generic: ClineToolSpec = {
	variant: ModelFamily.GENERIC,
	id: ClineDefaultTool.ASK,
	name: "ask_followup_question",
	description: (context: SystemPromptContext) => (isZhCN(context.locale) ? DESCRIPTION_GENERIC_ZH_CN : DESCRIPTION_GENERIC_EN),
	contextRequirements: (context) => !context.yoloModeToggled,
	parameters: [
		{
			name: "question",
			required: true,
			instruction: (context: SystemPromptContext) =>
				isZhCN(context.locale) ? INSTRUCTION_QUESTION_ZH_CN : INSTRUCTION_QUESTION_EN,
			usage: "Your question here",
		},
		{
			name: "options",
			required: false,
			instruction: (context: SystemPromptContext) =>
				isZhCN(context.locale) ? INSTRUCTION_OPTIONS_ZH_CN : INSTRUCTION_OPTIONS_EN,
			usage: 'Array of options here (optional), e.g. ["Option 1", "Option 2", "Option 3"]',
		},
		TASK_PROGRESS_PARAMETER,
	],
}

const DESCRIPTION_NATIVE_EN =
	"Ask user a question for clarifying or gathering information needed to complete the task. For example, ask the user clarifying questions about a key implementation decision. You should only ask one question."

const DESCRIPTION_NATIVE_ZH_CN =
	"向用户提问以澄清或收集完成任务所需的信息。例如，向用户询问有关关键实施决策的澄清问题。您应该只问一个问题。"

const INSTRUCTION_QUESTION_NATIVE_EN = 'The single question to ask the user. E.g. "How can I help you?"'
const INSTRUCTION_QUESTION_NATIVE_ZH_CN = '向用户提出的单个问题。例如："我该如何帮助您？"'

const INSTRUCTION_OPTIONS_NATIVE_EN =
	'An array of 2-5 options (e.x: "["Option 1", "Option 2", "Option 3"]") for the user to choose from. Each option should be a string describing a possible answer to the single question. You may not always need to provide options, but it may be helpful in many cases where it can save the user from having to type out a response manually. IMPORTANT: NEVER include an option to toggle to Act mode, as this would be something you need to direct the user to do manually themselves if needed.'

const INSTRUCTION_OPTIONS_NATIVE_ZH_CN =
	'供用户选择的 2-5 个选项的数组（例如："["Option 1", "Option 2", "Option 3"]"）。每个选项应该是一个描述对单个问题的可能答案的字符串。您可能并不总是需要提供选项，但在许多情况下它可能会有所帮助，可以使用户不必手动输入回复。重要提示：永远不要包含切换到 Act 模式的选项，因为如果需要，您需要指导用户自己手动执行此操作。'

const NATIVE_NEXT_GEN: ClineToolSpec = {
	variant: ModelFamily.NATIVE_NEXT_GEN,
	id: ClineDefaultTool.ASK,
	name: "ask_followup_question",
	description: (context: SystemPromptContext) => (isZhCN(context.locale) ? DESCRIPTION_NATIVE_ZH_CN : DESCRIPTION_NATIVE_EN),
	contextRequirements: (context) => !context.yoloModeToggled,
	parameters: [
		{
			name: "question",
			required: true,
			instruction: (context: SystemPromptContext) =>
				isZhCN(context.locale) ? INSTRUCTION_QUESTION_NATIVE_ZH_CN : INSTRUCTION_QUESTION_NATIVE_EN,
		},
		{
			name: "options",
			required: true,
			instruction: (context: SystemPromptContext) =>
				isZhCN(context.locale) ? INSTRUCTION_OPTIONS_NATIVE_ZH_CN : INSTRUCTION_OPTIONS_NATIVE_EN,
		},
		TASK_PROGRESS_PARAMETER,
	],
}

const NATIVE_GPT_5: ClineToolSpec = {
	...NATIVE_NEXT_GEN,
	variant: ModelFamily.NATIVE_GPT_5,
}

export const ask_followup_question_variants = [generic, NATIVE_GPT_5, NATIVE_NEXT_GEN]
