import { getPromptTranslation } from "../../i18n"
import { SystemPromptSection } from "../templates/placeholders"
import { TemplateEngine } from "../templates/TemplateEngine"
import type { PromptVariant, SystemPromptContext } from "../types"

export async function getAgentRoleSection(variant: PromptVariant, context: SystemPromptContext): Promise<string> {
	const t = getPromptTranslation(context)
	const template = variant.componentOverrides?.[SystemPromptSection.AGENT_ROLE]?.template || t.agentRole

	return new TemplateEngine().resolve(template, context, {})
}
