import { isZhCN } from "../i18n/getLocaleText"
import { SystemPromptSection } from "../templates/placeholders"
import { TemplateEngine } from "../templates/TemplateEngine"
import type { PromptVariant, SystemPromptContext } from "../types"

const USER_CUSTOM_INSTRUCTIONS_TEMPLATE_TEXT = `USER'S CUSTOM INSTRUCTIONS

The following additional instructions are provided by the user, and should be followed to the best of your ability without interfering with the TOOL USE guidelines.

{{CUSTOM_INSTRUCTIONS}}`

const USER_CUSTOM_INSTRUCTIONS_TEMPLATE_TEXT_ZH_CN = `USER'S CUSTOM INSTRUCTIONS

用户提供了以下附加指令，应尽最大努力遵循这些指令，但不得干扰 TOOL USE 指南。

{{CUSTOM_INSTRUCTIONS}}`

export async function getUserInstructions(variant: PromptVariant, context: SystemPromptContext): Promise<string | undefined> {
	const customInstructions = buildUserInstructions(
		context.globalClineRulesFileInstructions,
		context.localClineRulesFileInstructions,
		context.localCursorRulesFileInstructions,
		context.localCursorRulesDirInstructions,
		context.localWindsurfRulesFileInstructions,
		context.localAgentsRulesFileInstructions,
		context.clineIgnoreInstructions,
		context.preferredLanguageInstructions,
	)

	if (!customInstructions) {
		return undefined
	}

	const template =
		variant.componentOverrides?.[SystemPromptSection.USER_INSTRUCTIONS]?.template ||
		(isZhCN(context.locale) ? USER_CUSTOM_INSTRUCTIONS_TEMPLATE_TEXT_ZH_CN : USER_CUSTOM_INSTRUCTIONS_TEMPLATE_TEXT)

	return new TemplateEngine().resolve(template, context, {
		CUSTOM_INSTRUCTIONS: customInstructions,
	})
}

function buildUserInstructions(
	globalClineRulesFileInstructions?: string,
	localClineRulesFileInstructions?: string,
	localCursorRulesFileInstructions?: string,
	localCursorRulesDirInstructions?: string,
	localWindsurfRulesFileInstructions?: string,
	localAgentsRulesFileInstructions?: string,
	clineIgnoreInstructions?: string,
	preferredLanguageInstructions?: string,
): string | undefined {
	const customInstructions = []
	if (preferredLanguageInstructions) {
		customInstructions.push(preferredLanguageInstructions)
	}
	if (globalClineRulesFileInstructions) {
		customInstructions.push(globalClineRulesFileInstructions)
	}
	if (localClineRulesFileInstructions) {
		customInstructions.push(localClineRulesFileInstructions)
	}
	if (localCursorRulesFileInstructions) {
		customInstructions.push(localCursorRulesFileInstructions)
	}
	if (localCursorRulesDirInstructions) {
		customInstructions.push(localCursorRulesDirInstructions)
	}
	if (localWindsurfRulesFileInstructions) {
		customInstructions.push(localWindsurfRulesFileInstructions)
	}
	if (localAgentsRulesFileInstructions) {
		customInstructions.push(localAgentsRulesFileInstructions)
	}
	if (clineIgnoreInstructions) {
		customInstructions.push(clineIgnoreInstructions)
	}
	if (customInstructions.length === 0) {
		return undefined
	}
	return customInstructions.join("\n\n")
}
