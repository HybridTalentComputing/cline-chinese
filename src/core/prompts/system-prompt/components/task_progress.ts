import { ModelFamily } from "@/shared/prompts"
import { PromptVariant, SystemPromptContext, SystemPromptSection, TemplateEngine } from ".."
import { isZhCN } from "../i18n/getLocaleText"

const UPDATING_TASK_PROGRESS = `UPDATING TASK PROGRESS

You can track and communicate your progress on the overall task using the task_progress parameter supported by every tool call. Using task_progress ensures you remain on task, and stay focused on completing the user's objective. This parameter can be used in any mode, and with any tool call.

- When switching from PLAN MODE to ACT MODE, you must create a comprehensive todo list for the task using the task_progress parameter
- Todo list updates should be done silently using the task_progress parameter - do not announce these updates to the user
- Use standard Markdown checklist format: "- [ ]" for incomplete items and "- [x]" for completed items
- Keep items focused on meaningful progress milestones rather than minor technical details. The checklist should not be so granular that minor implementation details clutter the progress tracking.
- For simple tasks, short checklists with even a single item are acceptable. For complex tasks, avoid making the checklist too long or verbose.
- If you are creating this checklist for the first time, and the tool use completes the first step in the checklist, make sure to mark it as completed in your task_progress parameter.
- Provide the whole checklist of steps you intend to complete in the task, and keep the checkboxes updated as you make progress. It's okay to rewrite this checklist as needed if it becomes invalid due to scope changes or new information.
- If a checklist is being used, be sure to update it any time a step has been completed.
- The system will automatically include todo list context in your prompts when appropriate - these reminders are important.

Example:
<execute_command>
<command>npm install react</command>
<requires_approval>false</requires_approval>
<task_progress>
- [x] Set up project structure
- [x] Install dependencies
- [ ] Create components
- [ ] Test application
</task_progress>
</execute_command>`

const UPDATING_TASK_PROGRESS_NATIVE_NEXT_GEN = `UPDATING TASK PROGRESS

You can track and communicate your progress on the overall task using the task_progress parameter supported by every tool call. Using task_progress ensures you remain on task, and stay focused on completing the user's objective. This parameter can be used in any mode, and with any tool call.

- When switching from PLAN MODE to ACT MODE, you must create a comprehensive todo list for the task using the task_progress parameter
- Todo list updates should be done silently using the task_progress parameter - do not announce these updates to the user
- Keep items focused on meaningful progress milestones rather than minor technical details. The checklist should not be so granular that minor implementation details clutter the progress tracking.
- For simple tasks, short checklists with even a single item are acceptable. For complex tasks, avoid making the checklist too long or verbose.
- If you are creating this checklist for the first time, and the tool use completes the first step in the checklist, make sure to mark it as completed in your task_progress parameter.
- Provide the whole checklist of steps you intend to complete in the task, and keep the checkboxes updated as you make progress. It's okay to rewrite this checklist as needed if it becomes invalid due to scope changes or new information.
- If a checklist is being used, be sure to update it any time a step has been completed.
- The system will automatically include todo list context in your prompts when appropriate - these reminders are important.

**How to use task_progress:**
- include the task_progress parameter in your tool calls to provide an updated checklist
- Use standard Markdown checklist format: "- [ ]" for incomplete items and "- [x]" for completed items
- The task_progress parameter MUST be included as a separate parameter in the tool, it should not be included inside other content or argument blocks.`

const UPDATING_TASK_PROGRESS_NATIVE_GPT5 = `UPDATING TASK PROGRESS

You can track and communicate your progress on the overall task using the task_progress parameter supported by every tool call. Using task_progress ensures you remain on task, and stay focused on completing the user's objective. This parameter can be used in any mode, and with any tool call.

- When switching from PLAN MODE to ACT MODE, you MUST create a comprehensive todo list for the task using the task_progress parameter
- Todo list updates should be done silently using the task_progress parameter, without announcing these updates to the user through content parameters
- Keep items focused on meaningful progress milestones rather than minor technical details. The checklist should avoid being so granular that minor implementation details clutter the progress tracking.
- For simple tasks, short checklists with even a single item are acceptable.
- If you are creating this checklist for the first time, and the tool use completes the first step in the checklist, make sure to mark it as completed in your task_progress parameter.
- Provide the whole checklist of steps you intend to complete in the task, and keep the checkboxes updated as you make progress. It's okay to rewrite this checklist as needed if it becomes invalid due to scope changes or new information.
- Be sure to update the list any time a step has been completed.
- The system may include todo list context in your prompts when appropriate - these reminders are important, and serve as a validation of your successful task execution.

**How to use task_progress:**
- include the task_progress parameter in your tool calls to provide an updated checklist
- Use standard Markdown checklist format: "- [ ]" for incomplete items and "- [x]" for completed items
- The task_progress parameter MUST be included as a separate parameter in the tool, it should NOT be included inside other content or argument blocks.`

// Chinese translations
const UPDATING_TASK_PROGRESS_ZH_CN = `UPDATING TASK PROGRESS

你可以使用每个工具调用都支持的 task_progress 参数来跟踪和传达你在整体任务上的进度。使用 task_progress 可以确保你保持专注，集中精力完成用户的目标。此参数可以在任何模式下、任何工具调用中使用。

- 从 PLAN MODE 切换到 ACT MODE 时，你必须使用 task_progress 参数为任务创建一个全面的待办清单
- 待办清单更新应使用 task_progress 参数静默进行——不要向用户宣布这些更新
- 使用标准 Markdown 清单格式："- [ ]" 表示未完成项，"- [x]" 表示已完成项
- 保持项目聚焦于有意义进度里程碑，而不是次要的技术细节。清单不应过于细粒度，以至于次要的实现细节使进度跟踪变得杂乱。
- 对于简单任务，甚至只有单个项目的短清单也是可以接受的。对于复杂任务，避免让清单太长或太冗长。
- 如果你第一次创建此清单，并且工具使用完成了清单中的第一步，请确保在 task_progress 参数中将其标记为已完成。
- 提供你打算在任务中完成的整个步骤清单，并在取得进展时保持复选框更新。如果清单因范围变更或新信息而变得无效，可以根据需要重写此清单。
- 如果正在使用清单，请确保在任何步骤完成时更新它。
- 系统将在适当的时候自动在你的提示中包含待办清单上下文——这些提醒很重要。

示例：
<execute_command>
<command>npm install react</command>
<requires_approval>false</requires_approval>
<task_progress>
- [x] 搭建项目结构
- [x] 安装依赖
- [ ] 创建组件
- [ ] 测试应用
</task_progress>
</execute_command>`

const UPDATING_TASK_PROGRESS_NATIVE_NEXT_GEN_ZH_CN = `UPDATING TASK PROGRESS

你可以使用每个工具调用都支持的 task_progress 参数来跟踪和传达你在整体任务上的进度。使用 task_progress 可以确保你保持专注，集中精力完成用户的目标。此参数可以在任何模式下、任何工具调用中使用。

- 从 PLAN MODE 切换到 ACT MODE 时，你必须使用 task_progress 参数为任务创建一个全面的待办清单
- 待办清单更新应使用 task_progress 参数静默进行——不要向用户宣布这些更新
- 保持项目聚焦于有意义进度里程碑，而不是次要的技术细节。清单不应过于细粒度，以至于次要的实现细节使进度跟踪变得杂乱。
- 对于简单任务，甚至只有单个项目的短清单也是可以接受的。对于复杂任务，避免让清单太长或太冗长。
- 如果你第一次创建此清单，并且工具使用完成了清单中的第一步，请确保在 task_progress 参数中将其标记为已完成。
- 提供你打算在任务中完成的整个步骤清单，并在取得进展时保持复选框更新。如果清单因范围变更或新信息而变得无效，可以根据需要重写此清单。
- 如果正在使用清单，请确保在任何步骤完成时更新它。
- 系统将在适当的时候自动在你的提示中包含待办清单上下文——这些提醒很重要。

**如何使用 task_progress：**
- 在工具调用中包含 task_progress 参数以提供更新的清单
- 使用标准 Markdown 清单格式："- [ ]" 表示未完成项，"- [x]" 表示已完成项
- task_progress 参数必须作为工具中的单独参数包含，不应包含在其他内容或参数块中。`

const UPDATING_TASK_PROGRESS_NATIVE_GPT5_ZH_CN = `UPDATING TASK PROGRESS

你可以使用每个工具调用都支持的 task_progress 参数来跟踪和传达你在整体任务上的进度。使用 task_progress 可以确保你保持专注，集中精力完成用户的目标。此参数可以在任何模式下、任何工具调用中使用。

- 从 PLAN MODE 切换到 ACT MODE 时，你必须使用 task_progress 参数为任务创建一个全面的待办清单
- 待办清单更新应使用 task_progress 参数静默进行，不要通过内容参数向用户宣布这些更新
- 保持项目聚焦于有意义进度里程碑，而不是次要的技术细节。清单应避免过于细粒度，以至于次要的实现细节使进度跟踪变得杂乱。
- 对于简单任务，甚至只有单个项目的短清单也是可以接受的。
- 如果你第一次创建此清单，并且工具使用完成了清单中的第一步，请确保在 task_progress 参数中将其标记为已完成。
- 提供你打算在任务中完成的整个步骤清单，并在取得进展时保持复选框更新。如果清单因范围变更或新信息而变得无效，可以根据需要重写此清单。
- 确保在任何步骤完成时更新清单。
- 系统可能会在适当的时候在你的提示中包含待办清单上下文——这些提醒很重要，并且可以作为你成功执行任务的验证。

**如何使用 task_progress：**
- 在工具调用中包含 task_progress 参数以提供更新的清单
- 使用标准 Markdown 清单格式："- [ ]" 表示未完成项，"- [x]" 表示已完成项
- task_progress 参数必须作为工具中的单独参数包含，不应包含在其他内容或参数块中。`

export async function getUpdatingTaskProgress(variant: PromptVariant, context: SystemPromptContext): Promise<string | undefined> {
	if (!context.focusChainSettings?.enabled) {
		return undefined
	}

	// Check for component override first
	if (variant.componentOverrides?.[SystemPromptSection.TASK_PROGRESS]?.template) {
		const template = variant.componentOverrides[SystemPromptSection.TASK_PROGRESS].template
		return new TemplateEngine().resolve(template, context, {})
	}

	const isZh = isZhCN(context.locale)

	// Select template based on model family
	let template = isZh ? UPDATING_TASK_PROGRESS_ZH_CN : UPDATING_TASK_PROGRESS
	if (variant.id === ModelFamily.NATIVE_NEXT_GEN) {
		template = isZh ? UPDATING_TASK_PROGRESS_NATIVE_NEXT_GEN_ZH_CN : UPDATING_TASK_PROGRESS_NATIVE_NEXT_GEN
	}
	if (variant.id === ModelFamily.NATIVE_GPT_5) {
		template = isZh ? UPDATING_TASK_PROGRESS_NATIVE_GPT5_ZH_CN : UPDATING_TASK_PROGRESS_NATIVE_GPT5
	}

	return new TemplateEngine().resolve(template, context, {})
}
