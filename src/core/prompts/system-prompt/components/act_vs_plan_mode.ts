import { SystemPromptSection } from "../templates/placeholders"
import { TemplateEngine } from "../templates/TemplateEngine"
import type { PromptVariant, SystemPromptContext } from "../types"
import { getPromptTranslation } from "../../i18n"

export async function getActVsPlanModeSection(variant: PromptVariant, context: SystemPromptContext): Promise<string> {
	const t = getPromptTranslation(context)
	const template = variant.componentOverrides?.[SystemPromptSection.ACT_VS_PLAN]?.template || t.actVsPlanMode.template

	return new TemplateEngine().resolve(template, context, {})
}
