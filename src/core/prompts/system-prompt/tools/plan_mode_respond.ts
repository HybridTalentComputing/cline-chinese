import { ModelFamily } from "@/shared/prompts"
import { ClineDefaultTool } from "@/shared/tools"
import { isZhCN } from "../i18n/getLocaleText"
import type { ClineToolSpec } from "../spec"
import type { SystemPromptContext } from "../types"

const id = ClineDefaultTool.PLAN_MODE

const DESCRIPTION_GENERIC_EN = `Respond to the user's inquiry in an effort to plan a solution to the user's task. This tool should ONLY be used when you have already explored the relevant files and are ready to present a concrete plan. DO NOT use this tool to announce what files you're going to read - just read them first. This tool is only available in PLAN MODE. The environment_details will specify the current mode; if it is not PLAN_MODE then you should not use this tool.
However, if while writing your response you realize you actually need to do more exploration before providing a complete plan, you can add the optional needs_more_exploration parameter to indicate this. This allows you to acknowledge that you should have done more exploration first, and signals that your next message will use exploration tools instead.`

const DESCRIPTION_GENERIC_ZH_CN = `响应用户的询问，以规划用户任务的解决方案。此工具仅应在您已探索相关文件并准备展示具体计划时使用。不要使用此工具来宣布您将要读取的文件 - 只需先读取它们。此工具仅在 PLAN MODE 中可用。environment_details 将指定当前模式；如果不是 PLAN_MODE，则不应使用此工具。
但是，如果在编写响应时您意识到在提供完整计划之前实际上需要做更多的探索，您可以添加可选的 needs_more_exploration 参数来指示这一点。这允许您承认您应该先进行更多的探索，并表明您的下一条消息将使用探索工具。`

const DESCRIPTION_NATIVE_EN =
	"Respond to the user's inquiry in an effort to plan a solution to the user's task. This tool should ONLY be used when you have already explored the relevant files and are ready to present a concrete plan. DO NOT use this tool to announce what files you're going to read - just read them first. This tool is only available in PLAN MODE. The environment_details will specify the current mode; if it is not PLAN_MODE then you should not use this tool.\n\tHowever, if while writing your response you realize you actually need to do more exploration before providing a complete plan, you can add the optional needs_more_exploration parameter to indicate this. This allows you to acknowledge that you should have done more exploration first, and signals that your next message will use exploration tools instead."

const DESCRIPTION_NATIVE_ZH_CN =
	"响应用户的询问，以规划用户任务的解决方案。此工具仅应在您已探索相关文件并准备展示具体计划时使用。不要使用此工具来宣布您将要读取的文件 - 只需先读取它们。此工具仅在 PLAN MODE 中可用。environment_details 将指定当前模式；如果不是 PLAN_MODE，则不应使用此工具。\n\t但是，如果在编写响应时您意识到在提供完整计划之前实际上需要做更多的探索，您可以添加可选的 needs_more_exploration 参数来指示这一点。这允许您承认您应该先进行更多的探索，并表明您的下一条消息将使用探索工具。"

const DESCRIPTION_GEMINI_EN = `Respond with a plan that outlines a solution to the user's request. This tool should ONLY be used when you have already explored the relevant files and are ready to present a concrete plan. Only use this tool after you have explored relevant files and collected sufficient context to create a detailed, accurate plan. This tool is only available in PLAN MODE, as indicated by the environment_details.
If it becomes apparent that additional exploration is required while the plan_mode_respond response is being generated, the optional needs_more_exploration parameter can be toggled to enable further research. This allows you to acknowledge that more exploration is required before the final plan_mode_respond is generated, and signals that your next message will use exploration tools instead.`

const DESCRIPTION_GEMINI_ZH_CN = `响应一个概述用户请求解决方案的计划。此工具仅应在您已探索相关文件并准备展示具体计划时使用。只有在您探索了相关文件并收集了足够的上下文以创建详细、准确的计划后，才使用此工具。此工具仅在 PLAN MODE 中可用，如 environment_details 所示。
如果在生成 plan_mode_respond 响应时显然需要额外的探索，可以切换可选的 needs_more_exploration 参数以启用进一步的研究。这允许您承认在生成最终的 plan_mode_respond 之前需要更多的探索，并表明您的下一条消息将使用探索工具。`

const INSTRUCTION_RESPONSE_GENERIC_EN = `The response to provide to the user. Do not try to use tools in this parameter, this is simply a chat response. (You MUST use the response parameter, do not simply place the response text directly within <plan_mode_respond> tags.)`

const INSTRUCTION_RESPONSE_GENERIC_ZH_CN =
	"提供给用户的响应。不要尝试在此参数中使用工具，这只是一个聊天响应。（您必须使用 response 参数，不要简单地将响应文本直接放在 <plan_mode_respond> 标签内。）"

const INSTRUCTION_RESPONSE_NATIVE_EN = "The response to provide to the user."
const INSTRUCTION_RESPONSE_NATIVE_ZH_CN = "提供给用户的响应。"

const INSTRUCTION_RESPONSE_GEMINI_EN = "A chat message response to the user."
const INSTRUCTION_RESPONSE_GEMINI_ZH_CN = "给用户的聊天消息响应。"

const INSTRUCTION_NEEDS_MORE_EXPLORATION_GENERIC_EN =
	"Set to true if while formulating your response that you found you need to do more exploration with tools, for example reading files. (Remember, you can explore the project with tools like read_file in PLAN MODE without the user having to toggle to ACT MODE.) Defaults to false if not specified."

const INSTRUCTION_NEEDS_MORE_EXPLORATION_GENERIC_ZH_CN =
	"如果在制定响应时发现您需要使用工具进行更多的探索（例如读取文件），则设置为 true。（请记住，您可以在 PLAN MODE 中使用 read_file 等工具探索项目，而无需用户切换到 ACT MODE。）如果未指定，默认为 false。"

const INSTRUCTION_NEEDS_MORE_EXPLORATION_GEMINI_EN =
	"needs_more_exploration can be set to true if it is determined that further exploration with read_file/search tools is necessary to formulate a complete plan. This determination can be reached during the response generation process, but should not be acknowledged until this parameter is set to true if required."

const INSTRUCTION_NEEDS_MORE_EXPLORATION_GEMINI_ZH_CN =
	"如果确定需要使用 read_file/search 工具进行进一步的探索以制定完整的计划，可以将 needs_more_exploration 设置为 true。此确定可以在响应生成过程中达成，但如果需要，应在此参数设置为 true 之前不予确认。"

const INSTRUCTION_TASK_PROGRESS_GENERIC_EN =
	" A checklist showing task progress after this tool use is completed. (See 'Updating Task Progress' section for more details)"

const INSTRUCTION_TASK_PROGRESS_GENERIC_ZH_CN =
	" 显示此工具使用完成后任务进度的检查清单。（有关更多详细信息，请参阅「更新任务进度」部分）"

const INSTRUCTION_TASK_PROGRESS_NATIVE_EN =
	"A checklist showing task progress with the latest status of each subtasks included previously if any."

const INSTRUCTION_TASK_PROGRESS_NATIVE_ZH_CN = "显示任务进度的检查清单，包含之前包含的每个子任务的最新状态（如果有）。"

const INSTRUCTION_TASK_PROGRESS_GEMINI_EN =
	"A checklist showing task progress after this tool use is completed. If you are presenting a final implementation plan to the user with needs_more_exploration set to false, you should include a checklist of items to be completed during Act Mode when implementation is underway. (See 'Updating Task Progress' section for more details)"

const INSTRUCTION_TASK_PROGRESS_GEMINI_ZH_CN =
	"显示此工具使用完成后任务进度的检查清单。如果您向用户展示最终实施计划并将 needs_more_exploration 设置为 false，您应该包括在 Act MODE 实施期间要完成的项目检查清单。（有关更多详细信息，请参阅「更新任务进度」部分）"

const generic: ClineToolSpec = {
	variant: ModelFamily.GENERIC,
	id,
	name: "plan_mode_respond",
	description: (context: SystemPromptContext) => (isZhCN(context.locale) ? DESCRIPTION_GENERIC_ZH_CN : DESCRIPTION_GENERIC_EN),
	parameters: [
		{
			name: "response",
			required: true,
			instruction: (context: SystemPromptContext) =>
				isZhCN(context.locale) ? INSTRUCTION_RESPONSE_GENERIC_ZH_CN : INSTRUCTION_RESPONSE_GENERIC_EN,
			usage: "Your response here",
		},
		{
			name: "needs_more_exploration",
			required: false,
			instruction: (context: SystemPromptContext) =>
				isZhCN(context.locale)
					? INSTRUCTION_NEEDS_MORE_EXPLORATION_GENERIC_ZH_CN
					: INSTRUCTION_NEEDS_MORE_EXPLORATION_GENERIC_EN,
			usage: "true or false (optional, but you MUST set to true if in <response> you need to read files or use other exploration tools)",
			type: "boolean",
		},
		// Different than the vanilla TASK_PROGRESS_PARAMETER
		{
			name: "task_progress",
			required: false,
			instruction: (context: SystemPromptContext) =>
				isZhCN(context.locale) ? INSTRUCTION_TASK_PROGRESS_GENERIC_ZH_CN : INSTRUCTION_TASK_PROGRESS_GENERIC_EN,
			usage: "Checklist here (If you have presented the user with concrete steps or requirements, you can optionally include a todo list outlining these steps.)",
			dependencies: [ClineDefaultTool.TODO],
		},
	],
}

const NATIVE_GPT_5: ClineToolSpec = {
	variant: ModelFamily.NATIVE_GPT_5,
	id,
	name: "plan_mode_respond",
	description: (context: SystemPromptContext) => (isZhCN(context.locale) ? DESCRIPTION_NATIVE_ZH_CN : DESCRIPTION_NATIVE_EN),
	parameters: [
		{
			name: "response",
			required: true,
			instruction: (context: SystemPromptContext) =>
				isZhCN(context.locale) ? INSTRUCTION_RESPONSE_NATIVE_ZH_CN : INSTRUCTION_RESPONSE_NATIVE_EN,
		},
		{
			name: "task_progress",
			required: false,
			instruction: (context: SystemPromptContext) =>
				isZhCN(context.locale) ? INSTRUCTION_TASK_PROGRESS_NATIVE_ZH_CN : INSTRUCTION_TASK_PROGRESS_NATIVE_EN,
		},
	],
}

const GEMINI_3: ClineToolSpec = {
	variant: ModelFamily.GEMINI_3,
	id,
	name: "plan_mode_respond",
	description: (context: SystemPromptContext) => (isZhCN(context.locale) ? DESCRIPTION_GEMINI_ZH_CN : DESCRIPTION_GEMINI_EN),
	parameters: [
		{
			name: "response",
			required: true,
			instruction: (context: SystemPromptContext) =>
				isZhCN(context.locale) ? INSTRUCTION_RESPONSE_GEMINI_ZH_CN : INSTRUCTION_RESPONSE_GEMINI_EN,
			usage: "Your response here",
		},
		{
			name: "needs_more_exploration",
			required: false,
			instruction: (context: SystemPromptContext) =>
				isZhCN(context.locale)
					? INSTRUCTION_NEEDS_MORE_EXPLORATION_GEMINI_ZH_CN
					: INSTRUCTION_NEEDS_MORE_EXPLORATION_GEMINI_EN,
			usage: "true or false (optional, but you MUST set to true if in <response> you need to read files or use other exploration tools)",
			type: "boolean",
		},
		{
			name: "task_progress",
			required: false,
			instruction: (context: SystemPromptContext) =>
				isZhCN(context.locale) ? INSTRUCTION_TASK_PROGRESS_GEMINI_ZH_CN : INSTRUCTION_TASK_PROGRESS_GEMINI_EN,
			usage: "Checklist here (If you have presented the user with concrete steps or requirements, you can optionally include a todo list outlining these steps.)",
			dependencies: [ClineDefaultTool.TODO],
		},
	],
}

const NATIVE_NEXT_GEN: ClineToolSpec = {
	...NATIVE_GPT_5,
	variant: ModelFamily.NATIVE_NEXT_GEN,
}

export const plan_mode_respond_variants = [generic, NATIVE_GPT_5, NATIVE_NEXT_GEN, GEMINI_3]
