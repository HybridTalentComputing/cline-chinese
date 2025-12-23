import { ModelFamily } from "@/shared/prompts"
import { PromptVariant, SystemPromptContext, SystemPromptSection, TemplateEngine } from ".."
import { getPromptTranslation } from "../../i18n"

export async function getUpdatingTaskProgress(variant: PromptVariant, context: SystemPromptContext): Promise<string | undefined> {
	if (!context.focusChainSettings?.enabled) {
		return undefined
	}

	const t = getPromptTranslation(context)

	// Check for component override first
	if (variant.componentOverrides?.[SystemPromptSection.TASK_PROGRESS]?.template) {
		const template = variant.componentOverrides[SystemPromptSection.TASK_PROGRESS].template
		return new TemplateEngine().resolve(template, context, {})
	}

	// Select template based on model family
	let template = t.taskProgress.generic
	if (variant.id === ModelFamily.NATIVE_NEXT_GEN) {
		template = t.taskProgress.nativeNextGen
	}
	if (variant.id === ModelFamily.NATIVE_GPT_5) {
		template = t.taskProgress.nativeGpt5
	}

	return new TemplateEngine().resolve(template, context, {})
}
