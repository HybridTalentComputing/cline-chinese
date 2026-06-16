import { MULTI_ROOT_HINT } from "../../constants"
import { isZhCN } from "../../i18n/getLocaleText"
import { PromptBuilder } from "../../registry/PromptBuilder"
import { TemplateEngine } from "../../templates/TemplateEngine"
import type { PromptVariant, SystemPromptContext } from "../../types"

export async function getToolUseToolsSection(variant: PromptVariant, context: SystemPromptContext): Promise<string> {
	const focusChainEnabled = context.focusChainSettings?.enabled
	const isZh = isZhCN(context.locale)

	// Build the tools section
	const toolSections: string[] = [isZh ? "# 工具" : "# Tools"]

	// Get the enabled tool templates for this model family
	const toolsTemplates = await PromptBuilder.getToolsPrompts(variant, context)

	toolSections.push(...toolsTemplates)
	const template = toolSections.join("\n\n")

	// Include task_progress related placeholders when focus chain is enabled
	// (TODO tool is now dynamically added when focusChainEnabled is true)
	const shouldIncludeTaskProgress = focusChainEnabled

	// Define multi-root hint based on feature flag
	const multiRootHint = context.isMultiRootEnabled ? MULTI_ROOT_HINT : ""

	const taskProgress = isZh
		? "- task_progress:（可选）显示此工具使用完成后任务进度的清单。（参见「更新任务进度」部分了解更多详情）"
		: TASK_PROGRESS
	const focusChainAttempt = isZh
		? "如果你正在使用 task_progress 更新任务进度，你必须在结果中也包含已完成的清单。"
		: FOCUS_CHAIN_ATTEMPT

	return new TemplateEngine().resolve(template, context, {
		TASK_PROGRESS: shouldIncludeTaskProgress ? taskProgress : "",
		FOCUS_CHAIN_ATTEMPT: shouldIncludeTaskProgress ? focusChainAttempt : "",
		FOCUS_CHAIN_USAGE: shouldIncludeTaskProgress ? FOCUS_CHAIN_USAGE : "",
		BROWSER_VIEWPORT_WIDTH: context.browserSettings?.viewport?.width || 0,
		BROWSER_VIEWPORT_HEIGHT: context.browserSettings?.viewport?.height || 0,
		CWD: context.cwd,
		MULTI_ROOT_HINT: multiRootHint,
	})
}

// Focus chain related constants
const TASK_PROGRESS = `- task_progress: (optional) A checklist showing task progress after this tool use is completed. (See 'Updating Task Progress' section for more details)`
const FOCUS_CHAIN_ATTEMPT = `If you were using task_progress to update the task progress, you must include the completed list in the result as well.`
const FOCUS_CHAIN_USAGE = `<task_progress>
Checklist here (optional)
</task_progress>
`
