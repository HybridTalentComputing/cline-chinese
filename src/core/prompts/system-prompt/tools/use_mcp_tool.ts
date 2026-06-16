import { ModelFamily } from "@/shared/prompts"
import { ClineDefaultTool } from "@/shared/tools"
import { isZhCN } from "../i18n/getLocaleText"
import type { ClineToolSpec } from "../spec"
import type { SystemPromptContext } from "../types"
import { TASK_PROGRESS_PARAMETER } from "../types"

/**
## use_mcp_tool
Description: Request to use a tool provided by a connected MCP server. Each MCP server can provide multiple tools with different capabilities. Tools have defined input schemas that specify required and optional parameters.
Parameters:
- server_name: (required) The name of the MCP server providing the tool
- tool_name: (required) The name of the tool to execute
- arguments: (required) A JSON object containing the tool's input parameters, following the tool's input schema
${focusChainSettings.enabled ? `- task_progress: (optional) A checklist showing task progress after this tool use is completed. (See 'Updating Task Progress' section for more details)` : ""}
Usage:
<use_mcp_tool>
<server_name>server name here</server_name>
<tool_name>tool name here</tool_name>
<arguments>
{
  "param1": "value1",
  "param2": "value2"
}
</arguments>
${
	focusChainSettings.enabled
		? `<task_progress>
Checklist here (optional)
</task_progress>`
		: ""
}
</use_mcp_tool>
 */

const DESCRIPTION_EN =
	"Request to use a tool provided by a connected MCP server. Each MCP server can provide multiple tools with different capabilities. Tools have defined input schemas that specify required and optional parameters."

const DESCRIPTION_ZH_CN =
	"请求使用已连接的 MCP 服务器提供的工具。每个 MCP 服务器可以提供多个具有不同功能的工具。工具具有定义的输入模式，指定必需和可选参数。"

const INSTRUCTION_SERVER_NAME_EN = "The name of the MCP server providing the tool"
const INSTRUCTION_SERVER_NAME_ZH_CN = "提供工具的 MCP 服务器的名称"

const INSTRUCTION_TOOL_NAME_EN = "The name of the tool to execute"
const INSTRUCTION_TOOL_NAME_ZH_CN = "要执行的工具的名称"

const INSTRUCTION_ARGUMENTS_EN = "A JSON object containing the tool's input parameters, following the tool's input schema"
const INSTRUCTION_ARGUMENTS_ZH_CN = "包含工具输入参数的 JSON 对象，遵循工具的输入模式"

const generic: ClineToolSpec = {
	variant: ModelFamily.GENERIC,
	id: ClineDefaultTool.MCP_USE,
	name: "use_mcp_tool",
	description: (context: SystemPromptContext) => (isZhCN(context.locale) ? DESCRIPTION_ZH_CN : DESCRIPTION_EN),
	contextRequirements: (context) => context.mcpHub !== undefined && context.mcpHub !== null,
	parameters: [
		{
			name: "server_name",
			required: true,
			instruction: (context: SystemPromptContext) =>
				isZhCN(context.locale) ? INSTRUCTION_SERVER_NAME_ZH_CN : INSTRUCTION_SERVER_NAME_EN,
			usage: "server name here",
		},
		{
			name: "tool_name",
			required: true,
			instruction: (context: SystemPromptContext) =>
				isZhCN(context.locale) ? INSTRUCTION_TOOL_NAME_ZH_CN : INSTRUCTION_TOOL_NAME_EN,
			usage: "tool name here",
		},
		{
			name: "arguments",
			required: true,
			instruction: (context: SystemPromptContext) =>
				isZhCN(context.locale) ? INSTRUCTION_ARGUMENTS_ZH_CN : INSTRUCTION_ARGUMENTS_EN,
			usage: `
{
  "param1": "value1",
  "param2": "value2"
}
`,
		},
		TASK_PROGRESS_PARAMETER,
	],
}

export const use_mcp_tool_variants = [generic]
