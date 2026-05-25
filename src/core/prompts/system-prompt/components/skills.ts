import { isZhCN } from "../i18n/getLocaleText"
import type { PromptVariant, SystemPromptContext } from "../types"

/**
 * Generate the skills section for the system prompt.
 */
export async function getSkillsSection(_variant: PromptVariant, context: SystemPromptContext): Promise<string | undefined> {
	const skills = context.skills
	if (!skills || skills.length === 0) return undefined

	const skillsList = skills.map((skill) => `  - "${skill.name}": ${skill.description}`).join("\n")

	if (isZhCN(context.locale)) {
		return `SKILLS

以下技能为特定任务提供专业指导。当用户的请求与技能描述匹配时，使用 use_skill 工具加载并激活该技能。

可用技能：
${skillsList}

使用技能的方法：
1. 根据描述将用户的请求匹配到一个技能
2. 调用 use_skill，将 skill_name 参数设置为确切的技能名称
3. 遵循工具返回的指令`
	}

	return `SKILLS

The following skills provide specialized instructions for specific tasks. When a user's request matches a skill description, use the use_skill tool to load and activate the skill.

Available skills:
${skillsList}

To use a skill:
1. Match the user's request to a skill based on its description
2. Call use_skill with the skill_name parameter set to the exact skill name
3. Follow the instructions returned by the tool`
}
