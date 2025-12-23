import { TemplateEngine } from "../../templates/TemplateEngine"
import type { PromptVariant, SystemPromptContext } from "../../types"
import { getPromptTranslation } from "../../../i18n"

export async function getToolUseGuidelinesSection(_variant: PromptVariant, context: SystemPromptContext): Promise<string> {
	const t = getPromptTranslation(context)
	const template = [
		t.toolUseGuidelines.title,
		"",
		t.toolUseGuidelines.step1,
		t.toolUseGuidelines.step2,
		t.toolUseGuidelines.step3,
		t.toolUseGuidelines.step4,
		t.toolUseGuidelines.step5,
		t.toolUseGuidelines.step6,
		"",
		t.toolUseGuidelines.footer,
	].join("\n")

	return new TemplateEngine().resolve(template, context, {})
}
