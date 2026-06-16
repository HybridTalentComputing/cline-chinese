import { ModelFamily } from "@/shared/prompts"
import { ClineDefaultTool } from "@/shared/tools"
import { isZhCN } from "../i18n/getLocaleText"
import type { ClineToolSpec } from "../spec"
import type { SystemPromptContext } from "../types"

/**
 * ## act_mode_respond
Description: Provide a progress update or preamble to the user during ACT MODE execution. This tool allows you to communicate your thought process and what you're about to do, without interrupting the execution flow. After displaying your message, execution will automatically continue, allowing you to proceed with subsequent tool calls. This tool is only available in ACT MODE for OpenAI native models. The environment_details will specify the current mode; if it is not ACT_MODE then you should not use this tool.
Use this tool when you want to:
- Explain what you're about to do before executing tools
- Provide progress updates during long-running tasks
- Clarify your approach or reasoning
- Keep the user informed of your progress
Parameters:
- response: (required) The message to provide to the user. This should explain what you're about to do, your current progress, or your reasoning. (You MUST use the response parameter, do not simply place the response text directly within <act_mode_respond> tags.)
- task_progress: (optional) A checklist showing task progress after this tool use is completed. (See 'Updating Task Progress' section for more details)
Usage:
<act_mode_respond>
<response>Your message here</response>
<task_progress>Checklist here (optional)</task_progress>
</act_mode_respond>
 */

const id = ClineDefaultTool.ACT_MODE

const DESCRIPTION_EN = `Provide a progress update or preamble to the user during ACT MODE execution. This tool allows you to communicate your thought process and planned actions without interrupting the execution flow. After displaying your message, execution automatically continues, allowing you to proceed with subsequent tool calls immediately. This tool is only available in ACT MODE. This tool may not be called immediately after a previous act_mode_respond call.

IMPORTANT: Use this tool when it adds value to the user experience, but always follow it with an actual tool call - never call it twice in a row.

Use this tool when:
- After reading files and before making any edits - explain your analysis and what changes you plan to make
- When starting a new phase of work (e.g., transitioning from backend to frontend, or from one feature to another)
- During long sequences of operations to provide progress updates
- When your approach or strategy changes mid-task
- Before executing complex or potentially risky operations
- To explain why you're choosing one approach over another

Do NOT use this tool when you have completed all required actions and are ready to present the final output; in that case, use the attempt_completion tool instead.

CRITICAL CONSTRAINT: You MUST NOT call this tool more than once in a row. After using act_mode_respond, your next assistant message MUST either call a different tool or perform additional work without using act_mode_respond again. If you attempt to call act_mode_respond consecutively, the tool call will fail with an explicit error.`

const DESCRIPTION_ZH_CN = `在 ACT MODE 执行期间向用户提供进度更新或前言。此工具允许您在不中断执行流程的情况下交流您的思考过程和计划操作。显示您的消息后，执行会自动继续，允许您立即进行后续工具调用。此工具仅在 ACT MODE 中可用。此工具不能在上一次 act_mode_respond 调用后立即调用。

重要提示：仅当此工具能提升用户体验时使用，但始终在之后跟随实际的工具调用 - 永不要连续调用两次。

在以下情况下使用此工具：
- 在读取文件后进行任何编辑之前 - 说明您的分析和您计划进行的更改
- 当开始新的工作阶段时（例如，从后端过渡到前端，或从一个功能过渡到另一个功能）
- 在长时间操作序列中提供进度更新
- 当您的方法或策略在任务中途发生变化时
- 在执行复杂或潜在有风险的操作之前
- 解释为什么您选择一种方法而不是另一种方法

当您已完成所有必需的操作并准备呈现最终输出时，请勿使用此工具；在这种情况下，请改用 attempt_completion 工具。

关键约束：您绝不能连续多次调用此工具。在使用 act_mode_respond 后，您的下一条助手消息必须调用不同的工具或执行额外的工作而不再次使用 act_mode_respond。如果您尝试连续调用 act_mode_respond，工具调用将因显式错误而失败。`

const INSTRUCTION_RESPONSE_EN = `The message to provide to the user. This should explain what you're about to do, your current progress, or your reasoning. The response should be brief and conversational in tone, aiming to keep the user informed without overwhelming them with details.`

const INSTRUCTION_RESPONSE_ZH_CN = `提供给用户的消息。这应该解释您即将做什么、您的当前进度或您的推理。回复应简洁且语气对话化，旨在让用户了解情况而不会用细节压倒他们。`

const INSTRUCTION_TASK_PROGRESS_EN =
	"A checklist showing task progress with the latest status of each subtasks included previously if any."
const INSTRUCTION_TASK_PROGRESS_ZH_CN = "显示任务进度的检查清单，包含之前包含的每个子任务的最新状态（如果有）。"

const NATIVE_GPT_5: ClineToolSpec = {
	variant: ModelFamily.NATIVE_GPT_5,
	id,
	name: "act_mode_respond",
	description: (context: SystemPromptContext) => (isZhCN(context.locale) ? DESCRIPTION_ZH_CN : DESCRIPTION_EN),
	parameters: [
		{
			name: "response",
			required: true,
			instruction: (context: SystemPromptContext) =>
				isZhCN(context.locale) ? INSTRUCTION_RESPONSE_ZH_CN : INSTRUCTION_RESPONSE_EN,
			usage: "Your message here",
		},
		{
			name: "task_progress",
			required: false,
			instruction: (context: SystemPromptContext) =>
				isZhCN(context.locale) ? INSTRUCTION_TASK_PROGRESS_ZH_CN : INSTRUCTION_TASK_PROGRESS_EN,
		},
	],
}

const NATIVE_NEXT_GEN: ClineToolSpec = {
	...NATIVE_GPT_5,
	variant: ModelFamily.NATIVE_NEXT_GEN,
}

const GEMINI_3: ClineToolSpec = {
	...NATIVE_GPT_5,
	variant: ModelFamily.GEMINI_3,
}

export const act_mode_respond_variants = [NATIVE_GPT_5, NATIVE_NEXT_GEN, GEMINI_3]
