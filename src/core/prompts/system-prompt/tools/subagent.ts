import { ModelFamily } from "@/shared/prompts"
import { ClineDefaultTool } from "@/shared/tools"
import { isZhCN } from "../i18n/getLocaleText"
import type { ClineToolSpec } from "../spec"
import type { SystemPromptContext } from "../types"

const id = ClineDefaultTool.USE_SUBAGENTS

const DESCRIPTION_EN =
	"Run up to five focused in-process subagents in parallel. Each subagent gets its own prompt and returns a comprehensive research result with tool and token stats. Use this for broad exploration when reading many files would consume the main agent's context window. You do not need to launch multiple subagents every time; using one subagent is valid when it avoids unnecessary context usage for light discovery work."

const DESCRIPTION_ZH_CN =
	"并行运行最多五个专注的进程内子代理。每个子代理都有自己的提示，并返回包含工具和令牌统计信息的综合研究结果。当读取许多文件会消耗主代理的上下文窗口时，使用此工具进行广泛探索。您不需要每次都启动多个子代理；当使用一个子代理可以避免轻量级发现工作的不必要上下文使用时，使用一个子代理是有效的。"

const INSTRUCTION_PROMPT_1_EN = "First subagent prompt."
const INSTRUCTION_PROMPT_1_ZH_CN = "第一个子代理提示。"

const INSTRUCTION_PROMPT_2_EN = "Optional second subagent prompt."
const INSTRUCTION_PROMPT_2_ZH_CN = "可选的第二个子代理提示。"

const INSTRUCTION_PROMPT_3_EN = "Optional third subagent prompt."
const INSTRUCTION_PROMPT_3_ZH_CN = "可选的第三个子代理提示。"

const INSTRUCTION_PROMPT_4_EN = "Optional fourth subagent prompt."
const INSTRUCTION_PROMPT_4_ZH_CN = "可选的第四个子代理提示。"

const INSTRUCTION_PROMPT_5_EN = "Optional fifth subagent prompt."
const INSTRUCTION_PROMPT_5_ZH_CN = "可选的第五个子代理提示。"

const generic: ClineToolSpec = {
	variant: ModelFamily.GENERIC,
	id,
	name: "use_subagents",
	description: (context: SystemPromptContext) => (isZhCN(context.locale) ? DESCRIPTION_ZH_CN : DESCRIPTION_EN),
	contextRequirements: (context) => context.subagentsEnabled === true && !context.isSubagentRun,
	parameters: [
		{
			name: "prompt_1",
			required: true,
			instruction: (context: SystemPromptContext) =>
				isZhCN(context.locale) ? INSTRUCTION_PROMPT_1_ZH_CN : INSTRUCTION_PROMPT_1_EN,
		},
		{
			name: "prompt_2",
			required: false,
			instruction: (context: SystemPromptContext) =>
				isZhCN(context.locale) ? INSTRUCTION_PROMPT_2_ZH_CN : INSTRUCTION_PROMPT_2_EN,
		},
		{
			name: "prompt_3",
			required: false,
			instruction: (context: SystemPromptContext) =>
				isZhCN(context.locale) ? INSTRUCTION_PROMPT_3_ZH_CN : INSTRUCTION_PROMPT_3_EN,
		},
		{
			name: "prompt_4",
			required: false,
			instruction: (context: SystemPromptContext) =>
				isZhCN(context.locale) ? INSTRUCTION_PROMPT_4_ZH_CN : INSTRUCTION_PROMPT_4_EN,
		},
		{
			name: "prompt_5",
			required: false,
			instruction: (context: SystemPromptContext) =>
				isZhCN(context.locale) ? INSTRUCTION_PROMPT_5_ZH_CN : INSTRUCTION_PROMPT_5_EN,
		},
	],
}

export const subagent_variants = [generic]
