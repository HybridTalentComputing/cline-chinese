import { isZhCN } from "../../i18n/getLocaleText"
import { TemplateEngine } from "../../templates/TemplateEngine"
import type { PromptVariant, SystemPromptContext } from "../../types"

export const TOOL_USE_GUIDELINES_TEMPLATE_TEXT = `# Tool Use Guidelines

1. In <thinking> tags, assess what information you already have and what information you need to proceed with the task.
2. Choose the most appropriate tool based on the task and the tool descriptions provided. Assess if you need additional information to proceed, and which of the available tools would be most effective for gathering this information. For example using the list_files tool is more effective than running a command like \`ls\` in the terminal. It's critical that you think about each available tool and use the one that best fits the current step in the task.
3. If multiple actions are needed, use one tool at a time per message to accomplish the task iteratively, with each tool use being informed by the result of the previous tool use. Do not assume the outcome of any tool use. Each step must be informed by the previous step's result.
4. Formulate your tool use using the XML format specified for each tool.
5. After each tool use, the user will respond with the result of that tool use. This result will provide you with the necessary information to continue your task or make further decisions. This response may include:
  - Information about whether the tool succeeded or failed, along with any reasons for failure.
  - Linter errors that may have arisen due to the changes you made, which you'll need to address.
  - New terminal output in reaction to the changes, which you may need to consider or act upon.
  - Any other relevant feedback or information related to the tool use.
6. ALWAYS wait for user confirmation after each tool use before proceeding. Never assume the success of a tool use without explicit confirmation of the result from the user.

It is crucial to proceed step-by-step, waiting for the user's message after each tool use before moving forward with the task. This approach allows you to:
1. Confirm the success of each step before proceeding.
2. Address any issues or errors that arise immediately.
3. Adapt your approach based on new information or unexpected results.
4. Ensure that each action builds correctly on the previous ones.

By waiting for and carefully considering the user's response after each tool use, you can react accordingly and make informed decisions about how to proceed with the task. This iterative process helps ensure the overall success and accuracy of your work.`

export const TOOL_USE_GUIDELINES_TEMPLATE_TEXT_ZH_CN = `# 工具使用指南

	1. 在 <thinking> 标签中，评估你已有的信息和推进任务所需的信息。
	2. 根据任务和提供的工具描述选择最合适的工具。评估是否需要额外信息来推进，以及哪个可用工具对于收集这些信息最有效。例如，使用 list_files 工具比在终端中运行 \`ls\` 命令更有效。你必须考虑每个可用的工具，并使用最适合任务当前步骤的工具。
	3. 如果需要多个操作，每条消息一次使用一个工具来迭代完成任务，每次工具使用都应基于上一次工具使用的结果。不要假设任何工具使用的结果。每个步骤必须基于上一步骤的结果。
	4. 使用每个工具指定的 XML 格式来编写工具使用。
	5. 每次工具使用后，用户将回复该工具使用的结果。此结果将为你提供继续任务或做出进一步决策所需的信息。此响应可能包括：
	  - 工具是否成功或失败的信息，以及任何失败原因。
	  - 由于你所做的更改而可能出现的代码检查错误，你需要解决这些问题。
	  - 对更改的反应而产生的新的终端输出，你可能需要考虑或采取行动。
	  - 与工具使用相关的任何其他相关反馈或信息。
	6. 始终在每次工具使用后等待用户确认再继续。在没有用户明确确认结果的情况下，永远不要假设工具使用的成功。

	逐步推进至关重要，在每次工具使用后等待用户的消息再继续推进任务。这种方法使你能够：
	1. 在继续之前确认每个步骤的成功。
	2. 立即解决出现的任何问题或错误。
	3. 根据新信息或意外结果调整你的方法。
	4. 确保每个操作正确地建立在前一个操作之上。

	通过等待并仔细考虑每次工具使用后用户的响应，你可以做出相应的反应，并就如何继续任务做出明智的决策。这种迭代过程有助于确保你工作的整体成功和准确性。`
export async function getToolUseGuidelinesSection(_variant: PromptVariant, context: SystemPromptContext): Promise<string> {
	const template = isZhCN(context.locale) ? TOOL_USE_GUIDELINES_TEMPLATE_TEXT_ZH_CN : TOOL_USE_GUIDELINES_TEMPLATE_TEXT
	return new TemplateEngine().resolve(template, context, {})
}
