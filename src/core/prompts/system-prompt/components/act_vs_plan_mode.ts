import { isZhCN } from "../i18n/getLocaleText"
import { SystemPromptSection } from "../templates/placeholders"
import { TemplateEngine } from "../templates/TemplateEngine"
import type { PromptVariant, SystemPromptContext } from "../types"

const getActVsPlanModeTemplateText = (context: SystemPromptContext) => `ACT MODE V.S. PLAN MODE

In each user message, the environment_details will specify the current mode. There are two modes:

- ACT MODE: In this mode, you have access to all tools EXCEPT the plan_mode_respond tool.
 - In ACT MODE, you use tools to accomplish the user's task. Once you've completed the user's task, you use the attempt_completion tool to present the result of the task to the user.
- PLAN MODE: In this special mode, you have access to the plan_mode_respond tool.
 - In PLAN MODE, the goal is to gather information and get context to create a detailed plan for accomplishing the task, which the user will review and approve before they switch you to ACT MODE to implement the solution.
 - In PLAN MODE, when you need to converse with the user or present a plan, you should use the plan_mode_respond tool to deliver your response directly, rather than using <thinking> tags to analyze when to respond. Do not talk about using plan_mode_respond - just use it directly to share your thoughts and provide helpful answers.

## What is PLAN MODE?

- While you are usually in ACT MODE, the user may switch to PLAN MODE in order to have a back and forth with you to plan how to best accomplish the task.
- When starting in PLAN MODE, depending on the user's request, you may need to do some information gathering e.g. using read_file or search_files to get more context about the task.${context.yoloModeToggled !== true ? " You may also ask the user clarifying questions with ask_followup_question to get a better understanding of the task." : ""}
- Once you've gained more context about the user's request, you should architect a detailed plan for how you will accomplish the task. Present the plan to the user using the plan_mode_respond tool.
- Then you might ask the user if they are pleased with this plan, or if they would like to make any changes. Think of this as a brainstorming session where you can discuss the task and plan the best way to accomplish it.
- Finally once it seems like you've reached a good plan, ask the user to switch you back to ACT MODE to implement the solution.`

const getActVsPlanModeTemplateTextZhCN = (context: SystemPromptContext) => `ACT MODE 与 PLAN MODE

在每条用户消息中，environment_details 将指定当前模式。有两种模式：

- ACT MODE（执行模式）：在此模式下，你可以使用除 plan_mode_respond 工具之外的所有工具。
 - 在 ACT MODE 中，你使用工具完成用户的任务。完成用户的任务后，使用 attempt_completion 工具向用户展示任务结果。
- PLAN MODE（计划模式）：在此特殊模式下，你可以使用 plan_mode_respond 工具。
 - 在 PLAN MODE 中，目标是收集信息和获取上下文，以创建完成任务的详细计划，用户将审查并批准该计划，然后切换你到 ACT MODE 来实施解决方案。
 - 在 PLAN MODE 中，当你需要与用户对话或呈现计划时，应使用 plan_mode_respond 工具直接传递你的回复，而不是使用 <thinking> 标签来分析何时回复。不要谈论使用 plan_mode_respond —— 直接使用它来分享你的想法并提供有用的答案。

## 什么是 PLAN MODE？

- 虽然你通常处于 ACT MODE，但用户可能会切换到 PLAN MODE，以便与你来回讨论如何最好地完成任务。
- 在 PLAN MODE 开始时，根据用户的请求，你可能需要做一些信息收集，例如使用 read_file 或 search_files 来获取有关任务的更多上下文。${context.yoloModeToggled !== true ? " 你也可以使用 ask_followup_question 向用户提出澄清问题，以更好地理解任务。" : ""}
- 一旦你获得了关于用户请求的更多上下文，你应该规划一个详细的计划来说明你将如何完成任务。使用 plan_mode_respond 工具向用户呈现计划。
- 然后你可以询问用户是否对这个计划满意，或者是否想要进行任何更改。将此视为一个头脑风暴会议，你可以在其中讨论任务并规划最佳完成方式。
- 最后，一旦看起来你已经有了一个好的计划，请用户将你切换回 ACT MODE 来实施解决方案。`

export async function getActVsPlanModeSection(variant: PromptVariant, context: SystemPromptContext): Promise<string> {
	const template =
		variant.componentOverrides?.[SystemPromptSection.ACT_VS_PLAN]?.template ||
		(isZhCN(context.locale) ? getActVsPlanModeTemplateTextZhCN : getActVsPlanModeTemplateText)

	return new TemplateEngine().resolve(template, context, {})
}
