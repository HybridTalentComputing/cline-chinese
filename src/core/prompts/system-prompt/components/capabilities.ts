import { SystemPromptSection } from "../templates/placeholders"
import { TemplateEngine } from "../templates/TemplateEngine"
import type { PromptVariant, SystemPromptContext } from "../types"
import { getPromptTranslation } from "../../i18n"

export async function getCapabilitiesSection(variant: PromptVariant, context: SystemPromptContext): Promise<string> {
	const t = getPromptTranslation(context)
	const template = variant.componentOverrides?.[SystemPromptSection.CAPABILITIES]?.template || t.capabilities.template

	const browserSupport = context.supportsBrowserUse ? t.capabilities.browserSupport : ""
	const browserCapabilities = context.supportsBrowserUse ? t.capabilities.browserCapabilities : ""

	const templateEngine = new TemplateEngine()
	return templateEngine.resolve(template, context, {
		BROWSER_SUPPORT: browserSupport,
		BROWSER_CAPABILITIES: browserCapabilities,
		CWD: context.cwd || process.cwd(),
	})
}
