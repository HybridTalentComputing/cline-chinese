import { SystemPromptSection } from "../templates/placeholders"
import { TemplateEngine } from "../templates/TemplateEngine"
import type { PromptVariant, SystemPromptContext } from "../types"
import { getPromptTranslation } from "../../i18n"

export async function getEditingFilesSection(variant: PromptVariant, context: SystemPromptContext): Promise<string> {
	const t = getPromptTranslation(context)
	const template = variant.componentOverrides?.[SystemPromptSection.EDITING_FILES]?.template || t.editingFiles.template

	return new TemplateEngine().resolve(template, context, {})
}
