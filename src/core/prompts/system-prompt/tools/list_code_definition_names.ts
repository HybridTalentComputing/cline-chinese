import { ModelFamily } from "@/shared/prompts"
import { ClineDefaultTool } from "@/shared/tools"
import { isZhCN } from "../i18n/getLocaleText"
import type { ClineToolSpec } from "../spec"
import type { SystemPromptContext } from "../types"
import { TASK_PROGRESS_PARAMETER } from "../types"

const id = ClineDefaultTool.LIST_CODE_DEF

const DESCRIPTION_EN =
	"Request to list definition names (classes, functions, methods, etc.) used in source code files at the top level of the specified directory. This tool provides insights into the codebase structure and important constructs, encapsulating high-level concepts and relationships that are crucial for understanding the overall architecture."

const DESCRIPTION_ZH_CN =
	"请求列出指定目录顶层源代码文件中使用的定义名称（类、函数、方法等）。此工具提供有关代码库结构和重要构造的见解，封装了对于理解整体架构至关重要的高级概念和关系。"

const INSTRUCTION_PATH_GENERIC_EN =
	"The path of a directory (not a file) relative to the current working directory {{CWD}}{{MULTI_ROOT_HINT}}. Lists definitions across all source files in that directory. To inspect a single file, use read_file instead."

const INSTRUCTION_PATH_GENERIC_ZH_CN =
	"目录（而非文件）相对于当前工作目录 {{CWD}}{{MULTI_ROOT_HINT}} 的路径。列出该目录中所有源文件的定义。要检查单个文件，请改用 read_file。"

const INSTRUCTION_PATH_NATIVE_EN =
	"The path of a directory (not a file) relative to the current working directory {{CWD}}{{MULTI_ROOT_HINT}}. Lists definitions across all source files in that directory. To inspect a single file, use read_file instead."

const INSTRUCTION_PATH_NATIVE_ZH_CN =
	"目录（而非文件）相对于当前工作目录 {{CWD}}{{MULTI_ROOT_HINT}} 的路径。列出该目录中所有源文件的定义。要检查单个文件，请改用 read_file。"

const generic: ClineToolSpec = {
	variant: ModelFamily.GENERIC,
	id,
	name: "list_code_definition_names",
	description: (context: SystemPromptContext) => (isZhCN(context.locale) ? DESCRIPTION_ZH_CN : DESCRIPTION_EN),
	parameters: [
		{
			name: "path",
			required: true,
			instruction: (context: SystemPromptContext) =>
				isZhCN(context.locale) ? INSTRUCTION_PATH_GENERIC_ZH_CN : INSTRUCTION_PATH_GENERIC_EN,
			usage: "Directory path here",
		},
		TASK_PROGRESS_PARAMETER,
	],
}

const NATIVE_GPT_5: ClineToolSpec = {
	variant: ModelFamily.NATIVE_GPT_5,
	id,
	name: "list_code_definition_names",
	description: (context: SystemPromptContext) => (isZhCN(context.locale) ? DESCRIPTION_ZH_CN : DESCRIPTION_EN),
	parameters: [
		{
			name: "path",
			required: true,
			instruction: (context: SystemPromptContext) =>
				isZhCN(context.locale) ? INSTRUCTION_PATH_NATIVE_ZH_CN : INSTRUCTION_PATH_NATIVE_EN,
		},
		TASK_PROGRESS_PARAMETER,
	],
}

const NATIVE_NEXT_GEN: ClineToolSpec = {
	...NATIVE_GPT_5,
	variant: ModelFamily.NATIVE_NEXT_GEN,
}

export const list_code_definition_names_variants = [generic, NATIVE_GPT_5, NATIVE_NEXT_GEN]
