import { ModelFamily } from "@/shared/prompts"
import { ClineDefaultTool } from "@/shared/tools"
import { isZhCN } from "../i18n/getLocaleText"
import type { ClineToolSpec } from "../spec"
import type { SystemPromptContext } from "../types"
import { TASK_PROGRESS_PARAMETER } from "../types"

/**
 * ## search_files
Description: Request to perform a regex search across files in a specified directory, providing context-rich results. This tool searches for patterns or specific content across multiple files, displaying each match with encapsulating context.
Parameters:
- path: (required) The path of the directory to search in (relative to the current working directory ${cwd.toPosix()}). This directory will be recursively searched.
- regex: (required) The regular expression pattern to search for. Uses Rust regex syntax.
- file_pattern: (optional) Glob pattern to filter files (e.g., '*.ts' for TypeScript files). If not provided, it will search all files (*).
Usage:
<search_files>
<path>Directory path here</path>
<regex>Your regex pattern here</regex>
<file_pattern>file pattern here (optional)</file_pattern>
</search_files>
 */

const id = ClineDefaultTool.SEARCH

const DESCRIPTION_EN =
	"Request to perform a regex search across files in a specified directory, providing context-rich results. This tool searches for patterns or specific content across multiple files, displaying each match with encapsulating context."

const DESCRIPTION_ZH_CN =
	"请求在指定目录中的文件中执行正则表达式搜索，提供上下文丰富的结果。此工具在多个文件中搜索模式或特定内容，显示每个匹配项及其周围的上下文。"

const INSTRUCTION_PATH_EN =
	"The path of the directory to search in (relative to the current working directory {{CWD}}){{MULTI_ROOT_HINT}}. This directory will be recursively searched."

const INSTRUCTION_PATH_ZH_CN = "要搜索的目录的路径（相对于当前工作目录 {{CWD}}）{{MULTI_ROOT_HINT}}。此目录将被递归搜索。"

const INSTRUCTION_REGEX_EN = "The regular expression pattern to search for. Uses Rust regex syntax."
const INSTRUCTION_REGEX_ZH_CN = "要搜索的正则表达式模式。使用 Rust 正则表达式语法。"

const INSTRUCTION_FILE_PATTERN_EN =
	"Glob pattern to filter files (e.g., '*.ts' for TypeScript files). If not provided, it will search all files (*)."

const INSTRUCTION_FILE_PATTERN_ZH_CN =
	"用于过滤文件的 Glob 模式（例如，'*.ts' 用于 TypeScript 文件）。如果未提供，它将搜索所有文件 (*)。"

const generic: ClineToolSpec = {
	variant: ModelFamily.GENERIC,
	id,
	name: "search_files",
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
			name: "regex",
			required: true,
			instruction: (context: SystemPromptContext) =>
				isZhCN(context.locale) ? INSTRUCTION_REGEX_ZH_CN : INSTRUCTION_REGEX_EN,
			usage: "Your regex pattern here",
		},
		{
			name: "file_pattern",
			required: false,
			instruction: (context: SystemPromptContext) =>
				isZhCN(context.locale) ? INSTRUCTION_FILE_PATTERN_ZH_CN : INSTRUCTION_FILE_PATTERN_EN,
			usage: "file pattern here (optional)",
		},
		TASK_PROGRESS_PARAMETER,
	],
}

const NATIVE_NEXT_GEN: ClineToolSpec = {
	variant: ModelFamily.NATIVE_NEXT_GEN,
	id,
	name: "search_files",
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
			name: "regex",
			required: true,
			instruction: (context: SystemPromptContext) =>
				isZhCN(context.locale) ? INSTRUCTION_REGEX_ZH_CN : INSTRUCTION_REGEX_EN,
			usage: "Your regex pattern here",
		},
		{
			name: "file_pattern",
			required: false,
			instruction: (context: SystemPromptContext) =>
				isZhCN(context.locale) ? INSTRUCTION_FILE_PATTERN_ZH_CN : INSTRUCTION_FILE_PATTERN_EN,
			usage: "file pattern here (optional)",
		},
		TASK_PROGRESS_PARAMETER,
	],
}

const NATIVE_GPT_5: ClineToolSpec = {
	...NATIVE_NEXT_GEN,
	variant: ModelFamily.NATIVE_GPT_5,
}

export const search_files_variants = [generic, NATIVE_GPT_5, NATIVE_NEXT_GEN]
