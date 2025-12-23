import { PromptBuilder } from "../../registry/PromptBuilder"
import { TemplateEngine } from "../../templates/TemplateEngine"
import type { PromptVariant, SystemPromptContext } from "../../types"
import { getPromptTranslation } from "../../../i18n"

export async function getToolUseToolsSection(variant: PromptVariant, context: SystemPromptContext): Promise<string> {
	const focusChainEnabled = context.focusChainSettings?.enabled
	const t = getPromptTranslation(context)

	// Build the tools section
	const toolSections: string[] = [t.toolsComponent.title]

	// Get the enabled tool templates for this model family
	const toolsTemplates = await PromptBuilder.getToolsPrompts(variant, context)

	toolSections.push(...toolsTemplates)
	const template = toolSections.join("\n\n")

	// Include task_progress related placeholders when focus chain is enabled
	// (TODO tool is now dynamically added when focusChainEnabled is true)
	const shouldIncludeTaskProgress = focusChainEnabled

	// Define multi-root hint based on feature flag
	const multiRootHint = context.isMultiRootEnabled ? t.toolsComponent.multiRootHint : ""
	return new TemplateEngine().resolve(template, context, {
		TASK_PROGRESS: shouldIncludeTaskProgress ? t.toolsComponent.taskProgress : "",
		FOCUS_CHAIN_ATTEMPT: shouldIncludeTaskProgress ? t.toolsComponent.focusChainAttempt : "",
		FOCUS_CHAIN_USAGE: shouldIncludeTaskProgress ? FOCUS_CHAIN_USAGE : "",
		BROWSER_VIEWPORT_WIDTH: context.browserSettings?.viewport?.width || 0,
		BROWSER_VIEWPORT_HEIGHT: context.browserSettings?.viewport?.height || 0,
		CWD: context.cwd,
		MULTI_ROOT_HINT: multiRootHint,
	})
}

// Focus chain related constants
const FOCUS_CHAIN_USAGE = `<task_progress>
Checklist here (optional)
</task_progress>
`
