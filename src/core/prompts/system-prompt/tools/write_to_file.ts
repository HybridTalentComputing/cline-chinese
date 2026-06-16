import { ModelFamily } from "@/shared/prompts"
import { ClineDefaultTool } from "@/shared/tools"
import { isZhCN } from "../i18n/getLocaleText"
import type { ClineToolSpec } from "../spec"
import type { SystemPromptContext } from "../types"
import { TASK_PROGRESS_PARAMETER } from "../types"

/**
 * ## write_to_file
Description: Request to write content to a file at the specified path. If the file exists, it will be overwritten with the provided content. If the file doesn't exist, it will be created. This tool will automatically create any directories needed to write the file.
Parameters:
- path: (required) The path of the file to write to (relative to the current working directory ${cwd.toPosix()})
- content: (required) The content to write to the file. ALWAYS provide the COMPLETE intended content of the file, without any truncation or omissions. You MUST include ALL parts of the file, even if they haven't been modified.
${focusChainSettings.enabled ? `- task_progress: (optional) A checklist showing task progress after this tool use is completed. (See 'Updating Task Progress' section for more details)` : "" }
Usage:
<write_to_file>
<path>File path here</path>
<content>
Your file content here
</content>
${focusChainSettings.enabled ? `<task_progress>
Checklist here (optional)
</task_progress>` : "" }
</write_to_file>
 */

const id = ClineDefaultTool.FILE_NEW

const DESCRIPTION_GENERIC_EN =
	"Request to write content to a file at the specified path. If the file exists, it will be overwritten with the provided content. If the file doesn't exist, it will be created. This tool will automatically create any directories needed to write the file."

const DESCRIPTION_GENERIC_ZH_CN =
	"请求将内容写入指定路径的文件。如果文件存在，它将被提供的内容覆盖。如果文件不存在，它将被创建。此工具将自动创建写入文件所需的任何目录。"

const DESCRIPTION_NATIVE_EN =
	"[IMPORTANT: Always output the absolutePath first] Request to write content to a file at the specified path. If the file exists, it will be overwritten with the provided content. If the file doesn't exist, it will be created. This tool will automatically create any directories needed to write the file."

const DESCRIPTION_NATIVE_ZH_CN =
	"[重要提示：始终先输出 absolutePath] 请求将内容写入指定路径的文件。如果文件存在，它将被提供的内容覆盖。如果文件不存在，它将被创建。此工具将自动创建写入文件所需的任何目录。"

const INSTRUCTION_PATH_GENERIC_EN =
	"The path of the file to write to (relative to the current working directory {{CWD}}){{MULTI_ROOT_HINT}}"

const INSTRUCTION_PATH_GENERIC_ZH_CN = "要写入的文件的路径（相对于当前工作目录 {{CWD}}）{{MULTI_ROOT_HINT}}"

const INSTRUCTION_CONTENT_GENERIC_EN =
	"The content to write to the file. ALWAYS provide the COMPLETE intended content of the file, without any truncation or omissions. You MUST include ALL parts of the file, even if they haven't been modified."

const INSTRUCTION_CONTENT_GENERIC_ZH_CN =
	"要写入文件的内容。始终提供文件的完整预期内容，不得有任何截断或遗漏。必须包含文件的所有部分，即使它们没有被修改。"

const INSTRUCTION_ABSOLUTE_PATH_NATIVE_EN = "The absolute path to the file to write to."
const INSTRUCTION_ABSOLUTE_PATH_NATIVE_ZH_CN = "要写入的文件的绝对路径。"

const INSTRUCTION_CONTENT_NATIVE_EN =
	"After providing the path so a file can be created, then use this to provide the content to write to the file."

const INSTRUCTION_CONTENT_NATIVE_ZH_CN = "在提供路径以便创建文件后，然后使用它来提供要写入文件的内容。"

const GENERIC: ClineToolSpec = {
	variant: ModelFamily.GENERIC,
	id,
	name: "write_to_file",
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
			name: "content",
			required: true,
			instruction: (context: SystemPromptContext) =>
				isZhCN(context.locale) ? INSTRUCTION_CONTENT_GENERIC_ZH_CN : INSTRUCTION_CONTENT_GENERIC_EN,
			usage: "Your file content here",
		},
		TASK_PROGRESS_PARAMETER,
	],
}

const NATIVE_NEXT_GEN: ClineToolSpec = {
	variant: ModelFamily.NATIVE_NEXT_GEN,
	id,
	name: "write_to_file",
	description: (context: SystemPromptContext) => (isZhCN(context.locale) ? DESCRIPTION_NATIVE_ZH_CN : DESCRIPTION_NATIVE_EN),
	parameters: [
		{
			name: "absolutePath",
			required: true,
			instruction: (context: SystemPromptContext) =>
				isZhCN(context.locale) ? INSTRUCTION_ABSOLUTE_PATH_NATIVE_ZH_CN : INSTRUCTION_ABSOLUTE_PATH_NATIVE_EN,
		},
		{
			name: "content",
			required: true,
			instruction: (context: SystemPromptContext) =>
				isZhCN(context.locale) ? INSTRUCTION_CONTENT_NATIVE_ZH_CN : INSTRUCTION_CONTENT_NATIVE_EN,
		},
		TASK_PROGRESS_PARAMETER,
	],
}

const NATIVE_GPT_5: ClineToolSpec = {
	...NATIVE_NEXT_GEN,
	variant: ModelFamily.NATIVE_GPT_5,
}

export const write_to_file_variants = [GENERIC, NATIVE_NEXT_GEN, NATIVE_GPT_5]
