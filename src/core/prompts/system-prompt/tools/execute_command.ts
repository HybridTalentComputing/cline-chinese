import { ModelFamily } from "@/shared/prompts"
import { ClineDefaultTool } from "@/shared/tools"
import { isZhCN } from "../i18n/getLocaleText"
import type { ClineToolSpec } from "../spec"
import type { SystemPromptContext } from "../types"

const DESCRIPTION_GENERIC_EN = `Request to execute a CLI command on the system. Use this when you need to perform system operations or run specific commands to accomplish any step in the user's task. You must tailor your command to the user's system and provide a clear explanation of what the command does. For command chaining, use the appropriate chaining syntax for the user's shell. Prefer to execute complex CLI commands over creating executable scripts, as they are more flexible and easier to run. Commands will be executed in the current working directory: {{CWD}}{{MULTI_ROOT_HINT}}`

const DESCRIPTION_GENERIC_ZH_CN =
	"请求在系统上执行 CLI 命令。当您需要执行系统操作或运行特定命令以完成用户任务的任何步骤时，请使用此命令。您必须根据用户的系统定制您的命令，并清楚解释该命令的作用。对于命令链，请使用适合用户 shell 的链接语法。优先执行复杂的 CLI 命令而不是创建可执行脚本，因为它们更灵活且更易于运行。命令将在当前工作目录中执行：{{CWD}}{{MULTI_ROOT_HINT}}"

const INSTRUCTION_COMMAND_GENERIC_EN =
	"The CLI command to execute. This should be valid for the current operating system. Ensure the command is properly formatted and does not contain any harmful instructions."

const INSTRUCTION_COMMAND_GENERIC_ZH_CN = "要执行的 CLI 命令。这应适用于当前操作系统。确保命令格式正确且不包含任何有害指令。"

const INSTRUCTION_REQUIRES_APPROVAL_GENERIC_EN =
	"A boolean indicating whether this command requires explicit user approval before execution in case the user has auto-approve mode enabled. Set to 'true' for potentially impactful operations like installing/uninstalling packages, deleting/overwriting files, system configuration changes, network operations, or any commands that could have unintended side effects. Set to 'false' for safe operations like reading files/directories, running development servers, building projects, and other non-destructive operations."

const INSTRUCTION_REQUIRES_APPROVAL_GENERIC_ZH_CN =
	"一个布尔值，指示在用户启用自动批准模式的情况下，此命令在执行前是否需要明确的用户批准。对于可能产生影响的操作（如安装/卸载软件包、删除/覆盖文件、系统配置更改、网络操作或任何可能产生意外副作用的命令），设置为 'true'。对于安全操作（如读取文件/目录、运行开发服务器、构建项目和其他非破坏性操作），设置为 'false'。"

const INSTRUCTION_TIMEOUT_GENERIC_EN =
	"Integer representing the timeout in seconds for how long to run the terminal command, before timing out and continuing the task."

const INSTRUCTION_TIMEOUT_GENERIC_ZH_CN = "表示终端命令运行超时时间（秒）的整数，超时后将继续任务。"

const GENERIC: ClineToolSpec = {
	variant: ModelFamily.GENERIC,
	id: ClineDefaultTool.BASH,
	name: "execute_command",
	description: (context: SystemPromptContext) => (isZhCN(context.locale) ? DESCRIPTION_GENERIC_ZH_CN : DESCRIPTION_GENERIC_EN),
	parameters: [
		{
			name: "command",
			required: true,
			instruction: (context: SystemPromptContext) =>
				isZhCN(context.locale) ? INSTRUCTION_COMMAND_GENERIC_ZH_CN : INSTRUCTION_COMMAND_GENERIC_EN,
			usage: "Your command here",
		},
		{
			name: "requires_approval",
			required: true,
			instruction: (context: SystemPromptContext) =>
				isZhCN(context.locale) ? INSTRUCTION_REQUIRES_APPROVAL_GENERIC_ZH_CN : INSTRUCTION_REQUIRES_APPROVAL_GENERIC_EN,
			usage: "true or false",
			type: "boolean",
		},
		{
			name: "timeout",
			required: false,
			type: "integer",
			contextRequirements: (context) => context.yoloModeToggled === true,
			instruction: (context: SystemPromptContext) =>
				isZhCN(context.locale) ? INSTRUCTION_TIMEOUT_GENERIC_ZH_CN : INSTRUCTION_TIMEOUT_GENERIC_EN,
			usage: "30",
		},
	],
}

const DESCRIPTION_NATIVE_EN =
	"Request to execute a CLI command on the system. Use this when you need to perform system operations or run specific commands to accomplish any step in the user's task."

const DESCRIPTION_NATIVE_ZH_CN =
	"请求在系统上执行 CLI 命令。当您需要执行系统操作或运行特定命令以完成用户任务的任何步骤时，请使用此命令。"

const INSTRUCTION_COMMAND_NATIVE_EN =
	"The CLI command to execute. This should be valid for the current operating system. Do not use the ~ character or $HOME to refer to the home directory. Always use absolute paths. The command will be executed from the current workspace, you do not need to cd to the workspace."

const INSTRUCTION_COMMAND_NATIVE_ZH_CN =
	"要执行的 CLI 命令。这应适用于当前操作系统。不要使用 ~ 字符或 $HOME 来引用主目录。始终使用绝对路径。命令将从当前工作区执行，您不需要 cd 到工作区。"

const INSTRUCTION_REQUIRES_APPROVAL_NATIVE_EN =
	"To indicate whether this command requires explicit user approval or interaction before it should be executed. For system/file altering operations like installing/uninstalling packages, removing/overwriting files, system configuration changes, network operations, or any commands that are considered potentially dangerous must be set to true. False for safe operations like running development servers, building projects, and other non-destructive operations."

const INSTRUCTION_REQUIRES_APPROVAL_NATIVE_ZH_CN =
	"指示此命令在执行前是否需要明确的用户批准或交互。对于系统/文件更改操作，如安装/卸载软件包、删除/覆盖文件、系统配置更改、网络操作或任何被认为具有潜在危险的命令，必须设置为 true。对于安全操作（如运行开发服务器、构建项目和其他非破坏性操作），设置为 false。"

const NATIVE_GPT_5: ClineToolSpec = {
	variant: ModelFamily.NATIVE_GPT_5,
	id: ClineDefaultTool.BASH,
	name: ClineDefaultTool.BASH,
	description: (context: SystemPromptContext) => (isZhCN(context.locale) ? DESCRIPTION_NATIVE_ZH_CN : DESCRIPTION_NATIVE_EN),
	parameters: [
		{
			name: "command",
			required: true,
			instruction: (context: SystemPromptContext) =>
				isZhCN(context.locale) ? INSTRUCTION_COMMAND_NATIVE_ZH_CN : INSTRUCTION_COMMAND_NATIVE_EN,
		},
		{
			name: "requires_approval",
			required: true,
			instruction: (context: SystemPromptContext) =>
				isZhCN(context.locale) ? INSTRUCTION_REQUIRES_APPROVAL_NATIVE_ZH_CN : INSTRUCTION_REQUIRES_APPROVAL_NATIVE_EN,
			type: "boolean",
		},
	],
}

const DESCRIPTION_GEMINI_EN =
	"Request to execute a CLI command on the system. Use this when you need to perform system operations or run specific commands to accomplish any step in the user's task. When chaining commands, use the shell operator && (not the HTML entity &amp;&amp;). If using search/grep commands, be careful to not use vague search terms that may return thousands of results. When in PLAN MODE, you may use the execute_command tool, but only in a non-destructive manner and in a way that does not alter any files."

const DESCRIPTION_GEMINI_ZH_CN =
	"请求在系统上执行 CLI 命令。当您需要执行系统操作或运行特定命令以完成用户任务的任何步骤时，请使用此命令。链接命令时，请使用 shell 运算符 &&（而不是 HTML 实体 &amp;&amp;）。如果使用搜索/grep 命令，请注意不要使用可能返回数千个结果的模糊搜索词。在 PLAN MODE 中，您可以使用 execute_command 工具，但只能以非破坏性的方式和不更改任何文件的方式使用。"

const INSTRUCTION_COMMAND_GEMINI_EN =
	"The CLI command to execute. This should be valid for the current operating system. For command chaining, use proper shell operators like && to chain commands (e.g., 'cd path && command'). Do not use the ~ character or $HOME to refer to the home directory. Always use absolute paths. Do not run search/grep commands that may return thousands of results."

const INSTRUCTION_COMMAND_GEMINI_ZH_CN =
	"要执行的 CLI 命令。这应适用于当前操作系统。对于命令链，请使用适当的 shell 运算符（如 &&）来链接命令（例如，'cd path && command'）。不要使用 ~ 字符或 $HOME 来引用主目录。始终使用绝对路径。不要运行可能返回数千个结果的搜索/grep 命令。"

const GEMINI_3: ClineToolSpec = {
	variant: ModelFamily.GEMINI_3,
	id: ClineDefaultTool.BASH,
	name: ClineDefaultTool.BASH,
	description: (context: SystemPromptContext) => (isZhCN(context.locale) ? DESCRIPTION_GEMINI_ZH_CN : DESCRIPTION_GEMINI_EN),
	parameters: [
		{
			name: "command",
			required: true,
			instruction: (context: SystemPromptContext) =>
				isZhCN(context.locale) ? INSTRUCTION_COMMAND_GEMINI_ZH_CN : INSTRUCTION_COMMAND_GEMINI_EN,
		},
		{
			name: "requires_approval",
			required: true,
			instruction: (context: SystemPromptContext) =>
				isZhCN(context.locale) ? INSTRUCTION_REQUIRES_APPROVAL_NATIVE_ZH_CN : INSTRUCTION_REQUIRES_APPROVAL_NATIVE_EN,
			type: "boolean",
		},
	],
}

const NATIVE_NEXT_GEN: ClineToolSpec = {
	...NATIVE_GPT_5,
	variant: ModelFamily.NATIVE_NEXT_GEN,
}

export const execute_command_variants: ClineToolSpec[] = [GENERIC, NATIVE_GPT_5, NATIVE_NEXT_GEN, GEMINI_3]
