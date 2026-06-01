import { ModelFamily } from "@/shared/prompts"
import { ClineDefaultTool } from "@/shared/tools"
import { isZhCN } from "../i18n/getLocaleText"
import type { ClineToolSpec } from "../spec"
import type { SystemPromptContext } from "../types"
import { TASK_PROGRESS_PARAMETER } from "../types"

const id = ClineDefaultTool.LIST_FILES

const DESCRIPTION_EN =
	"Request to list files and directories within the specified directory. If recursive is true, it will list all files and directories recursively. If recursive is false or not provided, it will only list the top-level contents. Do not use this tool to confirm the existence of files you may have created, as the user will let you know if the files were created successfully or not."

const DESCRIPTION_ZH_CN =
	"请求列出指定目录中的文件和目录。如果 recursive 为 true，它将递归列出所有文件和目录。如果 recursive 为 false 或未提供，它将仅列出顶层内容。不要使用此工具来确认您可能创建的文件是否存在，因为用户会告诉您文件是否成功创建。"

const INSTRUCTION_PATH_EN =
	"The path of the directory to list contents for (relative to the current working directory {{CWD}}){{MULTI_ROOT_HINT}}"

const INSTRUCTION_PATH_ZH_CN = "要列出其内容的目录的路径（相对于当前工作目录 {{CWD}}）{{MULTI_ROOT_HINT}}"

const INSTRUCTION_RECURSIVE_EN =
	"Whether to list files recursively. Use true for recursive listing, false or omit for top-level only."
const INSTRUCTION_RECURSIVE_ZH_CN = "是否递归列出文件。使用 true 进行递归列出，使用 false 或省略以仅列出顶层内容。"

const generic: ClineToolSpec = {
	variant: ModelFamily.GENERIC,
	id,
	name: "list_files",
	description: (context: SystemPromptContext) => (isZhCN(context.locale) ? DESCRIPTION_ZH_CN : DESCRIPTION_EN),
	parameters: [
		{
			name: "path",
			required: true,
			instruction: (context: SystemPromptContext) =>
				isZhCN(context.locale) ? INSTRUCTION_PATH_ZH_CN : INSTRUCTION_PATH_EN,
			usage: "Directory path here",
		},
		{
			name: "recursive",
			required: false,
			instruction: (context: SystemPromptContext) =>
				isZhCN(context.locale) ? INSTRUCTION_RECURSIVE_ZH_CN : INSTRUCTION_RECURSIVE_EN,
			usage: "true or false (optional)",
			type: "boolean",
		},
		TASK_PROGRESS_PARAMETER,
	],
}

const INSTRUCTION_PATH_NATIVE_EN = "The path of the directory to list contents for."
const INSTRUCTION_PATH_NATIVE_ZH_CN = "要列出其内容的目录的路径。"

const INSTRUCTION_RECURSIVE_NATIVE_EN =
	"Whether to list files recursively. Use true for recursive listing, false or omit for top-level only."
const INSTRUCTION_RECURSIVE_NATIVE_ZH_CN = "是否递归列出文件。使用 true 进行递归列出，使用 false 或省略以仅列出顶层内容。"

const NATIVE_GPT_5: ClineToolSpec = {
	variant: ModelFamily.NATIVE_GPT_5,
	id,
	name: "list_files",
	description: (context: SystemPromptContext) => (isZhCN(context.locale) ? DESCRIPTION_ZH_CN : DESCRIPTION_EN),
	parameters: [
		{
			name: "path",
			required: true,
			instruction: (context: SystemPromptContext) =>
				isZhCN(context.locale) ? INSTRUCTION_PATH_NATIVE_ZH_CN : INSTRUCTION_PATH_NATIVE_EN,
		},
		{
			name: "recursive",
			required: false,
			instruction: (context: SystemPromptContext) =>
				isZhCN(context.locale) ? INSTRUCTION_RECURSIVE_NATIVE_ZH_CN : INSTRUCTION_RECURSIVE_NATIVE_EN,
			type: "boolean",
		},
		TASK_PROGRESS_PARAMETER,
	],
}

const NATIVE_NEXT_GEN: ClineToolSpec = {
	...NATIVE_GPT_5,
	variant: ModelFamily.NATIVE_NEXT_GEN,
}

export const list_files_variants = [generic, NATIVE_GPT_5, NATIVE_NEXT_GEN]
