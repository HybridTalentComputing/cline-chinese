import { SystemPromptSection } from "../templates/placeholders"
import { TemplateEngine } from "../templates/TemplateEngine"
import type { PromptVariant, SystemPromptContext } from "../types"
import { getPromptTranslation } from "../../i18n"

export async function getFeedbackSection(variant: PromptVariant, context: SystemPromptContext): Promise<string | undefined> {
	if (!context.focusChainSettings?.enabled) {
		return undefined
	}

	const t = getPromptTranslation(context)
	const template = variant.componentOverrides?.[SystemPromptSection.FEEDBACK]?.template || t.feedback.template

	return new TemplateEngine().resolve(template, context, {})
}
