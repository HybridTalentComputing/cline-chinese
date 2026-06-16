import { ModelFamily } from "@/shared/prompts"
import { ClineDefaultTool } from "@/shared/tools"
import { isZhCN } from "../i18n/getLocaleText"
import type { ClineToolSpec } from "../spec"
import type { SystemPromptContext } from "../types"

const id = ClineDefaultTool.NEW_TASK

const DESCRIPTION_EN = `Request to create a new task with preloaded context covering the conversation with the user up to this point and key information for continuing with the new task. With this tool, you will create a detailed summary of the conversation so far, paying close attention to the user's explicit requests and your previous actions, with a focus on the most relevant information required for the new task.
Among other important areas of focus, this summary should be thorough in capturing technical details, code patterns, and architectural decisions that would be essential for continuing with the new task. The user will be presented with a preview of your generated context and can choose to create a new task or keep chatting in the current conversation. The user may choose to start a new task at any point.`

const DESCRIPTION_ZH_CN = `请求创建一个新任务，并预加载到目前为止与用户对话的上下文以及继续新任务所需的关键信息。使用此工具时，你将创建迄今为止对话的详细摘要，密切关注用户的明确请求和你之前的操作，重点关注新任务所需的最新相关信息。
在其他重要关注领域中，此摘要应全面捕获技术细节、代码模式和架构决策，这些对于继续新任务至关重要。用户将看到你生成的上下文预览，并可以选择创建新任务或在当前对话中继续聊天。用户可以随时选择开始新任务。`

const INSTRUCTION_EN = `The context to preload the new task with. If applicable based on the current task, this should include:
  1. Current Work: Describe in detail what was being worked on prior to this request to create a new task. Pay special attention to the more recent messages / conversation.
  2. Key Technical Concepts: List all important technical concepts, technologies, coding conventions, and frameworks discussed, which might be relevant for the new task.
  3. Relevant Files and Code: If applicable, enumerate specific files and code sections examined, modified, or created for the task continuation. Pay special attention to the most recent messages and changes.
  4. Problem Solving: Document problems solved thus far and any ongoing troubleshooting efforts.
  5. Pending Tasks and Next Steps: Outline all pending tasks that you have explicitly been asked to work on, as well as list the next steps you will take for all outstanding work, if applicable. Include code snippets where they add clarity. For any next steps, include direct quotes from the most recent conversation showing exactly what task you were working on and where you left off. This should be verbatim to ensure there's no information loss in context between tasks. It's important to be detailed here.`

const INSTRUCTION_ZH_CN = `预加载到新任务中的上下文。如果基于当前任务适用，这应包括：
  1. 当前工作：详细描述在创建此新任务请求之前正在进行的工作。特别注意较新的消息/对话。
  2. 关键技术概念：列出所有讨论过的重要技术概念、技术、编码约定和框架，这些可能与新任务相关。
  3. 相关文件和代码：如果适用，列举为任务延续而检查、修改或创建的特定文件和代码部分。特别注意最近的消息和更改。
  4. 问题解决：记录到目前为止已解决的问题和任何正在进行的故障排除工作。
  5. 待处理任务和后续步骤：概述你被明确要求处理的所有待处理任务，以及如果适用的话，列出所有未完成工作的后续步骤。在有助于说明的地方包含代码片段。对于任何后续步骤，包含最近对话中的直接引用，准确显示你正在处理什么任务以及你在哪里中断的。这应该是逐字的，以确保任务之间没有上下文信息丢失。在这里详细说明很重要。`

const generic: ClineToolSpec = {
	variant: ModelFamily.GENERIC,
	id,
	name: "new_task",
	description: (context: SystemPromptContext) => (isZhCN(context.locale) ? DESCRIPTION_ZH_CN : DESCRIPTION_EN),
	contextRequirements: (context) => !context.yoloModeToggled,
	parameters: [
		{
			name: "context",
			required: true,
			instruction: (context: SystemPromptContext) => (isZhCN(context.locale) ? INSTRUCTION_ZH_CN : INSTRUCTION_EN),
			usage: "context to preload new task with",
		},
	],
}

export const new_task_variants = [generic]
