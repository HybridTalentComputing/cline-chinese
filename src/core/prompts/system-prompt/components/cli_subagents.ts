import { SystemPromptSection } from "../templates/placeholders"
import { TemplateEngine } from "../templates/TemplateEngine"
import type { PromptVariant, SystemPromptContext } from "../types"
import { getPromptTranslation } from "../../i18n"

export async function getCliSubagentsSection(variant: PromptVariant, context: SystemPromptContext): Promise<string | undefined> {
	// If this is a CLI subagent, don't include CLI subagent instructions to prevent nesting/allignment concerns
	if (context.isCliSubagent) {
		return undefined
	}

	// Only include this section if CLI is installed and subagents are enabled
	if (!context.isSubagentsEnabledAndCliInstalled) {
		return undefined
	}

	const t = getPromptTranslation(context)
	const template = variant.componentOverrides?.[SystemPromptSection.CLI_SUBAGENTS]?.template || t.cliSubagents.template

	return new TemplateEngine().resolve(template, context, {})
}
