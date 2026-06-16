import { ModelFamily } from "@/shared/prompts"
import { ClineDefaultTool } from "@/shared/tools"
import { isZhCN } from "../i18n/getLocaleText"
import type { ClineToolSpec } from "../spec"
import type { SystemPromptContext } from "../types"

const id = ClineDefaultTool.USE_SKILL

const DESCRIPTION_EN =
	"Load and activate a skill by name. Skills provide specialized instructions for specific tasks. Use this tool ONCE when a user's request matches one of the available skill descriptions shown in the SKILLS section of your system prompt. After activation, follow the skill's instructions directly - do not call use_skill again."

const DESCRIPTION_ZH_CN =
	"按名称加载并激活技能。技能为特定任务提供专门的说明。当用户的请求与系统提示的 SKILLS 部分中显示的可用技能描述之一匹配时，请使用此工具一次。激活后，直接遵循技能的说明 - 不要再次调用 use_skill。"

const INSTRUCTION_SKILL_NAME_EN = "The name of the skill to activate (must match exactly one of the available skill names)"
const INSTRUCTION_SKILL_NAME_ZH_CN = "要激活的技能的名称（必须与可用技能名称之一完全匹配）"

const generic: ClineToolSpec = {
	id,
	variant: ModelFamily.GENERIC,
	name: "use_skill",
	description: (context: SystemPromptContext) => (isZhCN(context.locale) ? DESCRIPTION_ZH_CN : DESCRIPTION_EN),
	contextRequirements: (context) => context.skills !== undefined && context.skills.length > 0,
	parameters: [
		{
			name: "skill_name",
			required: true,
			instruction: (context: SystemPromptContext) =>
				isZhCN(context.locale) ? INSTRUCTION_SKILL_NAME_ZH_CN : INSTRUCTION_SKILL_NAME_EN,
		},
	],
}

export const use_skill_variants = [generic]
