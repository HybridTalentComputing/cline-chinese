import { ModelFamily } from "@/shared/prompts"
import { ClineDefaultTool } from "@/shared/tools"
import { isZhCN } from "../i18n/getLocaleText"
import type { ClineToolSpec } from "../spec"
import type { SystemPromptContext } from "../types"
import { TASK_PROGRESS_PARAMETER } from "../types"

const id = ClineDefaultTool.FILE_EDIT

const getOpenOrVisibleTabPaths = (context: SystemPromptContext) => {
	return [...(context.editorTabs?.open ?? []), ...(context.editorTabs?.visible ?? [])]
}

const shouldIncludeNotebookInstructions = (context: SystemPromptContext) => {
	return getOpenOrVisibleTabPaths(context).some((p) => p.endsWith(".ipynb"))
}

const BASE_DIFF_INSTRUCTIONS_EN = `One or more SEARCH/REPLACE blocks following this exact format:
  \`\`\`
  ------- SEARCH
  [exact content to find]
  =======
  [new content to replace with]
  +++++++ REPLACE
  \`\`\`
  Critical rules:
  1. SEARCH content must match the associated file section to find EXACTLY:
     * Match character-for-character including whitespace, indentation, line endings
     * Include all comments, docstrings, etc.
  2. SEARCH/REPLACE blocks will ONLY replace the first match occurrence.
     * Including multiple unique SEARCH/REPLACE blocks if you need to make multiple changes.
     * Include *just* enough lines in each SEARCH section to uniquely match each set of lines that need to change.
     * When using multiple SEARCH/REPLACE blocks, list them in the order they appear in the file.
  3. Keep SEARCH/REPLACE blocks concise:
     * Break large SEARCH/REPLACE blocks into a series of smaller blocks that each change a small portion of the file.
     * Include just the changing lines, and a few surrounding lines if needed for uniqueness.
     * Do not include long runs of unchanging lines in SEARCH/REPLACE blocks.
     * Each line must be complete. Never truncate lines mid-way through as this can cause matching failures.
  4. Special operations:
     * To move code: Use two SEARCH/REPLACE blocks (one to delete from original + one to insert at new location)
     * To delete code: Use empty REPLACE section
  5. If your source context came from read_file and includes line labels (for example, "42 | const x = 1"), do NOT include the "42 | " prefix in SEARCH or REPLACE content. Match only the raw file text.`

const BASE_DIFF_INSTRUCTIONS_ZH_CN = `一个或多个遵循此确切格式的 SEARCH/REPLACE 块：
  \`\`\`
  ------- SEARCH
  [要查找的确切内容]
  =======
  [要替换的新内容]
  +++++++ REPLACE
  \`\`\`
  关键规则：
  1. SEARCH 内容必须完全匹配要查找的关联文件部分：
     * 逐个字符匹配，包括空白、缩进、行结尾
     * 包括所有注释、文档字符串等
  2. SEARCH/REPLACE 块将仅替换第一个匹配项。
     * 如果您需要进行多个更改，请包括多个唯一的 SEARCH/REPLACE 块。
     * 在每个 SEARCH 部分中仅包含足够的行以唯一匹配需要更改的每组行。
     * 使用多个 SEARCH/REPLACE 块时，按它们在文件中出现的顺序列出。
  3. 保持 SEARCH/REPLACE 块简洁：
     * 将大型 SEARCH/REPLACE 块分解为一系列较小的块，每个块更改文件的一小部分。
     * 仅包括更改的行，如果需要唯一性，请包括几行周围的行。
     * 不要在 SEARCH/REPLACE 块中包含长段不变的行。
     * 每一行都必须完整。永远不要中途截断行，因为这可能导致匹配失败。
  4. 特殊操作：
     * 要移动代码：使用两个 SEARCH/REPLACE 块（一个从原位置删除 + 一个在新位置插入）
     * 要删除代码：使用空的 REPLACE 部分
  5. 如果您的源上下文来自 read_file 并且包含行标签（例如，"42 | const x = 1"），请不要在 SEARCH 或 REPLACE 内容中包含 "42 | " 前缀。仅匹配原始文件文本。`

const NOTEBOOK_INSTRUCTIONS_EN = `
  6. For Jupyter Notebook (.ipynb) files:
     * Match the exact JSON structure including quotes, commas, and \\n characters
     * Each line in "source" array (except last) must end with "\\n"
     * Each source line is a separate JSON string in the array
     * Example SEARCH block for notebook:
       ------- SEARCH
         "source": [
           "x = 10\\n",
           "print(x)"
         ]
       =======
         "source": [
           "x = 100\\n",
           "print(x)"
         ]
       +++++++ REPLACE`

const NOTEBOOK_INSTRUCTIONS_ZH_CN = `
  6. 对于 Jupyter Notebook (.ipynb) 文件：
     * 匹配确切的 JSON 结构，包括引号、逗号和 \\n 字符
     * "source" 数组中的每一行（最后一行除外）必须以 "\\n" 结尾
     * 每个 source 行是数组中的一个单独的 JSON 字符串
     * 笔记本的 SEARCH 块示例：
       ------- SEARCH
         "source": [
           "x = 10\\n",
           "print(x)"
         ]
       =======
         "source": [
           "x = 100\\n",
           "print(x)"
         ]
       +++++++ REPLACE`

const diffInstruction = (context: SystemPromptContext) => {
	if (isZhCN(context.locale)) {
		return shouldIncludeNotebookInstructions(context)
			? BASE_DIFF_INSTRUCTIONS_ZH_CN + NOTEBOOK_INSTRUCTIONS_ZH_CN
			: BASE_DIFF_INSTRUCTIONS_ZH_CN
	}
	return shouldIncludeNotebookInstructions(context)
		? BASE_DIFF_INSTRUCTIONS_EN + NOTEBOOK_INSTRUCTIONS_EN
		: BASE_DIFF_INSTRUCTIONS_EN
}

const DESCRIPTION_GENERIC_EN =
	"Request to replace sections of content in an existing file using SEARCH/REPLACE blocks that define exact changes to specific parts of the file. This tool should be used when you need to make targeted changes to specific parts of a file."

const DESCRIPTION_GENERIC_ZH_CN =
	"请求使用 SEARCH/REPLACE 块替换现有文件中的内容部分，这些块定义对文件特定部分的确切更改。当您需要对文件的特定部分进行定向更改时，应使用此工具。"

const DESCRIPTION_NATIVE_EN =
	"[IMPORTANT: Always output the absolutePath first] Request to replace sections of content in an existing file using SEARCH/REPLACE blocks that define exact changes to specific parts of the file. This tool should be used when you need to make targeted changes to specific parts of a file."

const DESCRIPTION_NATIVE_ZH_CN =
	"[重要提示：始终先输出 absolutePath] 请求使用 SEARCH/REPLACE 块替换现有文件中的内容部分，这些块定义对文件特定部分的确切更改。当您需要对文件的特定部分进行定向更改时，应使用此工具。"

const INSTRUCTION_PATH_GENERIC_EN = `The path of the file to modify (relative to the current working directory {{CWD}})`
const INSTRUCTION_PATH_GENERIC_ZH_CN = `要修改的文件的路径（相对于当前工作目录 {{CWD}}）`

const INSTRUCTION_ABSOLUTE_PATH_NATIVE_EN = "The absolute path to the file to write to."
const INSTRUCTION_ABSOLUTE_PATH_NATIVE_ZH_CN = "要写入的文件的绝对路径。"

const generic: ClineToolSpec = {
	variant: ModelFamily.GENERIC,
	id,
	name: "replace_in_file",
	description: (context: SystemPromptContext) => (isZhCN(context.locale) ? DESCRIPTION_GENERIC_ZH_CN : DESCRIPTION_GENERIC_EN),
	parameters: [
		{
			name: "path",
			required: true,
			instruction: (context: SystemPromptContext) =>
				isZhCN(context.locale) ? INSTRUCTION_PATH_GENERIC_ZH_CN : INSTRUCTION_PATH_GENERIC_EN,
			usage: "File path here",
		},
		{
			name: "diff",
			required: true,
			instruction: diffInstruction,
			usage: "Search and replace blocks here",
		},
		TASK_PROGRESS_PARAMETER,
	],
}

const NATIVE_NEXT_GEN: ClineToolSpec = {
	variant: ModelFamily.NATIVE_NEXT_GEN,
	id,
	name: "replace_in_file",
	description: (context: SystemPromptContext) => (isZhCN(context.locale) ? DESCRIPTION_NATIVE_ZH_CN : DESCRIPTION_NATIVE_EN),
	parameters: [
		{
			name: "absolutePath",
			required: true,
			instruction: (context: SystemPromptContext) =>
				isZhCN(context.locale) ? INSTRUCTION_ABSOLUTE_PATH_NATIVE_ZH_CN : INSTRUCTION_ABSOLUTE_PATH_NATIVE_EN,
		},
		{
			name: "diff",
			required: true,
			instruction: diffInstruction,
		},
		TASK_PROGRESS_PARAMETER,
	],
}

const NATIVE_GPT_5: ClineToolSpec = {
	...NATIVE_NEXT_GEN,
	variant: ModelFamily.NATIVE_GPT_5,
}

export const replace_in_file_variants = [generic, NATIVE_NEXT_GEN, NATIVE_GPT_5]
