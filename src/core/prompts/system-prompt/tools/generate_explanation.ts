import { ModelFamily } from "@/shared/prompts"
import { ClineDefaultTool } from "@/shared/tools"
import { isZhCN } from "../i18n/getLocaleText"
import type { ClineToolSpec } from "../spec"
import type { SystemPromptContext } from "../types"

const id = ClineDefaultTool.GENERATE_EXPLANATION

const DESCRIPTION_EN =
	"Opens a multi-file diff view and generates AI-powered inline comments explaining the changes between two git references. Use this tool to help users understand code changes from git commits, pull requests, branches, or any git refs. The tool uses git to retrieve file contents and displays a side-by-side diff view with explanatory comments."

const DESCRIPTION_ZH_CN =
	"打开多文件差异视图并生成 AI 驱动的内联注释，解释两个 git 引用之间的更改。使用此工具帮助用户理解来自 git 提交、拉取请求、分支或任何 git 引用的代码更改。该工具使用 git 检索文件内容并显示带有解释性注释的并排差异视图。"

const INSTRUCTION_TITLE_EN =
	"A descriptive title for the diff view (e.g., 'Changes in commit abc123', 'PR #42: Add authentication', 'Changes between main and feature-branch')"

const INSTRUCTION_TITLE_ZH_CN =
	"差异视图的描述性标题（例如，「提交 abc123 中的更改」、「PR #42：添加身份验证」、「main 和 feature-branch 之间的更改」）"

const INSTRUCTION_FROM_REF_EN =
	"The git reference for the 'before' state. Can be a commit hash, branch name, tag, or relative reference like HEAD~1, HEAD^, origin/main, etc."

const INSTRUCTION_FROM_REF_ZH_CN =
	"「之前」状态的 git 引用。可以是提交哈希、分支名称、标签或相对引用，如 HEAD~1、HEAD^、origin/main 等。"

const INSTRUCTION_TO_REF_EN =
	"The git reference for the 'after' state. Can be a commit hash, branch name, tag, or relative reference. If not provided, compares to the current working directory (including uncommitted changes)."

const INSTRUCTION_TO_REF_ZH_CN =
	"「之后」状态的 git 引用。可以是提交哈希、分支名称、标签或相对引用。如果未提供，则与当前工作目录（包括未提交的更改）进行比较。"

const GENERIC: ClineToolSpec = {
	variant: ModelFamily.GENERIC,
	id,
	name: "generate_explanation",
	description: (context: SystemPromptContext) => (isZhCN(context.locale) ? DESCRIPTION_ZH_CN : DESCRIPTION_EN),
	contextRequirements: (context) => context.isCliEnvironment !== true,
	parameters: [
		{
			name: "title",
			required: true,
			instruction: (context: SystemPromptContext) =>
				isZhCN(context.locale) ? INSTRUCTION_TITLE_ZH_CN : INSTRUCTION_TITLE_EN,
			usage: "Changes in last commit",
		},
		{
			name: "from_ref",
			required: true,
			instruction: (context: SystemPromptContext) =>
				isZhCN(context.locale) ? INSTRUCTION_FROM_REF_ZH_CN : INSTRUCTION_FROM_REF_EN,
			usage: "HEAD~1",
		},
		{
			name: "to_ref",
			required: false,
			instruction: (context: SystemPromptContext) =>
				isZhCN(context.locale) ? INSTRUCTION_TO_REF_ZH_CN : INSTRUCTION_TO_REF_EN,
			usage: "HEAD",
		},
	],
}

export const generate_explanation_variants = [GENERIC]
