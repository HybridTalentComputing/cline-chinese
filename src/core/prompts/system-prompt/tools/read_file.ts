import { ModelFamily } from "@/shared/prompts"
import { ClineDefaultTool } from "@/shared/tools"
import { isZhCN } from "../i18n/getLocaleText"
import type { ClineToolSpec } from "../spec"
import type { SystemPromptContext } from "../types"
import { TASK_PROGRESS_PARAMETER } from "../types"

const id = ClineDefaultTool.FILE_READ

const READ_FILE_DESCRIPTION_EN =
	"Request to read the contents of a file at the specified path. Use this when you need to examine the contents of an existing file you do not know the contents of, for example to analyze code, review text files, or extract information from configuration files. Returned text lines are prefixed with line labels (e.g. `1 |`, `2 |`). These labels are metadata, not part of the file content. For large files, output is automatically limited to 1000 lines. Use start_line and end_line to read specific sections. Automatically extracts raw text from PDF and DOCX files. May not be suitable for other types of binary files, as it returns the raw content as a string. Do NOT use this tool to list the contents of a directory. Only use this tool on files."

const READ_FILE_DESCRIPTION_ZH_CN =
	"请求读取指定路径的文件内容。当您需要检查您不知道内容的现有文件的内容时，请使用此工具，例如分析代码、查看文本文件或从配置文件中提取信息。返回的文本行带有行前缀（例如 `1 |`、`2 |`）。这些前缀是元数据，不是文件内容的一部分。对于大文件，输出自动限制为 1000 行。使用 start_line 和 end_line 读取特定部分。自动从 PDF 和 DOCX 文件中提取原始文本。可能不适用于其他类型的二进制文件，因为它以字符串形式返回原始内容。不要使用此工具列出目录的内容。仅对此工具用于文件。"

const INSTRUCTION_PATH_EN = "The path of the file to read (relative to the current working directory {{CWD}}){{MULTI_ROOT_HINT}}"

const INSTRUCTION_PATH_ZH_CN = "要读取的文件的路径（相对于当前工作目录 {{CWD}}）{{MULTI_ROOT_HINT}}"

const INSTRUCTION_START_LINE_EN = "The 1-based line number to start reading from (inclusive). Defaults to 1."
const INSTRUCTION_START_LINE_ZH_CN = "开始读取的基于 1 的行号（包含）。默认为 1。"

const INSTRUCTION_END_LINE_EN =
	"The 1-based line number to stop reading at (inclusive). Defaults to start_line + 1000. Use with start_line to read specific sections of large files."

const INSTRUCTION_END_LINE_ZH_CN =
	"停止读取的基于 1 的行号（包含）。默认为 start_line + 1000。与 start_line 一起使用以读取大文件的特定部分。"

const getReadFileParameters = (): ClineToolSpec["parameters"] => [
	{
		name: "path",
		required: true,
		instruction: (context: SystemPromptContext) => (isZhCN(context.locale) ? INSTRUCTION_PATH_ZH_CN : INSTRUCTION_PATH_EN),
		usage: "File path here",
	},
	{
		name: "start_line",
		required: false,
		type: "integer",
		instruction: (context: SystemPromptContext) =>
			isZhCN(context.locale) ? INSTRUCTION_START_LINE_ZH_CN : INSTRUCTION_START_LINE_EN,
		usage: "1",
	},
	{
		name: "end_line",
		required: false,
		type: "integer",
		instruction: (context: SystemPromptContext) =>
			isZhCN(context.locale) ? INSTRUCTION_END_LINE_ZH_CN : INSTRUCTION_END_LINE_EN,
		usage: "1000",
	},
	TASK_PROGRESS_PARAMETER,
]

const generic: ClineToolSpec = {
	variant: ModelFamily.GENERIC,
	id,
	name: "read_file",
	description: (context: SystemPromptContext) =>
		isZhCN(context.locale) ? READ_FILE_DESCRIPTION_ZH_CN : READ_FILE_DESCRIPTION_EN,
	parameters: getReadFileParameters(),
}

const NATIVE_GPT_5: ClineToolSpec = {
	variant: ModelFamily.NATIVE_GPT_5,
	id,
	name: "read_file",
	description: (context: SystemPromptContext) =>
		isZhCN(context.locale) ? READ_FILE_DESCRIPTION_ZH_CN : READ_FILE_DESCRIPTION_EN,
	parameters: getReadFileParameters(),
}

const NATIVE_NEXT_GEN: ClineToolSpec = {
	...NATIVE_GPT_5,
	variant: ModelFamily.NATIVE_NEXT_GEN,
}

export const read_file_variants = [generic, NATIVE_NEXT_GEN, NATIVE_GPT_5]
