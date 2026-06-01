import { ModelFamily } from "@/shared/prompts"
import { ClineDefaultTool } from "@/shared/tools"
import { isZhCN } from "../i18n/getLocaleText"
import type { ClineToolSpec } from "../spec"
import type { SystemPromptContext } from "../types"
import { TASK_PROGRESS_PARAMETER } from "../types"

/**
 * ## access_mcp_resource
Description: Request to access a resource provided by a connected MCP server. Resources represent data sources that can be used as context, such as files, API responses, or system information.
Parameters:
- server_name: (required) The name of the MCP server providing the resource
- uri: (required) The URI identifying the specific resource to access
- task_progress: (optional) A checklist showing task progress after this tool use is completed. (See 'Updating Task Progress' section for more details)
Usage:
<access_mcp_resource>
<server_name>server name here</server_name>
<uri>resource URI here</uri>
<task_progress>
Checklist here (optional)
</task_progress>
</access_mcp_resource>
 */

const DESCRIPTION_EN =
	"Request to access a resource provided by a connected MCP server. Resources represent data sources that can be used as context, such as files, API responses, or system information."

const DESCRIPTION_ZH_CN = "请求访问已连接的 MCP 服务器提供的资源。资源代表可用作上下文的数据源，例如文件、API 响应或系统信息。"

const INSTRUCTION_SERVER_NAME_EN = "The name of the MCP server providing the resource"
const INSTRUCTION_SERVER_NAME_ZH_CN = "提供资源的 MCP 服务器名称"

const INSTRUCTION_URI_EN = "The URI identifying the specific resource to access"
const INSTRUCTION_URI_ZH_CN = "标识要访问的特定资源的 URI"

const generic: ClineToolSpec = {
	variant: ModelFamily.GENERIC,
	id: ClineDefaultTool.MCP_ACCESS,
	name: "access_mcp_resource",
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
			name: "uri",
			required: true,
			instruction: (context: SystemPromptContext) => (isZhCN(context.locale) ? INSTRUCTION_URI_ZH_CN : INSTRUCTION_URI_EN),
			usage: "resource URI here",
		},
		TASK_PROGRESS_PARAMETER,
	],
}

const DESCRIPTION_NATIVE_EN =
	"Request to access a resource provided by a connected MCP server. Resources represent data sources that can be used as context, such as files, API responses, or system information. You must only use this tool if you have been informed of the MCP server and the resource you are trying to access."

const DESCRIPTION_NATIVE_ZH_CN =
	"请求访问已连接的 MCP 服务器提供的资源。资源代表可用作上下文的数据源，例如文件、API 响应或系统信息。仅当您已获知 MCP 服务器和您尝试访问的资源时，才应使用此工具。"

const NATIVE_GPT_5: ClineToolSpec = {
	variant: ModelFamily.NATIVE_GPT_5,
	id: ClineDefaultTool.MCP_ACCESS,
	name: "access_mcp_resource",
	description: (context: SystemPromptContext) => (isZhCN(context.locale) ? DESCRIPTION_NATIVE_ZH_CN : DESCRIPTION_NATIVE_EN),
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
			name: "uri",
			required: true,
			instruction: (context: SystemPromptContext) => (isZhCN(context.locale) ? INSTRUCTION_URI_ZH_CN : INSTRUCTION_URI_EN),
			usage: "resource URI here",
		},
		TASK_PROGRESS_PARAMETER,
	],
}

const nextGen = { ...generic, variant: ModelFamily.NEXT_GEN }
const gpt = { ...generic, variant: ModelFamily.GPT }

const NATIVE_NEXT_GEN: ClineToolSpec = {
	...NATIVE_GPT_5,
	variant: ModelFamily.NATIVE_NEXT_GEN,
}

export const access_mcp_resource_variants = [generic, nextGen, gpt, NATIVE_GPT_5, NATIVE_NEXT_GEN]
