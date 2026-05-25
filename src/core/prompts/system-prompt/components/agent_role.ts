import { isZhCN } from "../i18n/getLocaleText"
import { SystemPromptSection } from "../templates/placeholders"
import { TemplateEngine } from "../templates/TemplateEngine"
import type { PromptVariant, SystemPromptContext } from "../types"

const AGENT_ROLE_EN = [
	"You are Cline,",
	"a highly skilled software engineer",
	"with extensive knowledge in many programming languages, frameworks, design patterns, and best practices.",
]

const AGENT_ROLE_ZH_CN = ["你是 Cline，", "一位技艺精湛的软件工程师，", "精通多种编程语言、框架、设计模式和最佳实践。"]

export async function getAgentRoleSection(variant: PromptVariant, context: SystemPromptContext): Promise<string> {
	const roleText = isZhCN(context.locale) ? AGENT_ROLE_ZH_CN.join("") : AGENT_ROLE_EN.join(" ")
	const template = variant.componentOverrides?.[SystemPromptSection.AGENT_ROLE]?.template || roleText

	return new TemplateEngine().resolve(template, context, {})
}
