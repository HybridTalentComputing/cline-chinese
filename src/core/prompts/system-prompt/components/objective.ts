import { SystemPromptSection } from "../templates/placeholders"
import { TemplateEngine } from "../templates/TemplateEngine"
import type { PromptVariant, SystemPromptContext } from "../types"
import { getPromptTranslation } from "../../i18n"

export async function getObjectiveSection(variant: PromptVariant, context: SystemPromptContext): Promise<string> {
	const t = getPromptTranslation(context)
	const template = variant.componentOverrides?.[SystemPromptSection.OBJECTIVE]?.template || t.objective.template

	return new TemplateEngine().resolve(template, context, {})
}
