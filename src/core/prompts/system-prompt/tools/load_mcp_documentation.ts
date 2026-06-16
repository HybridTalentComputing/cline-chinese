import { ModelFamily } from "@/shared/prompts"
import { ClineDefaultTool } from "@/shared/tools"
import { isZhCN } from "../i18n/getLocaleText"
import type { ClineToolSpec } from "../spec"
import type { SystemPromptContext } from "../types"

/**
 * ## load_mcp_documentation
Description: Load documentation about creating MCP servers. This tool should be used when the user requests to create or install an MCP server (the user may ask you something along the lines of "add a tool" that does some function, in other words to create an MCP server that provides tools and resources that may connect to external APIs for example. You have the ability to create an MCP server and add it to a configuration file that will then expose the tools and resources for you to use with \`use_mcp_tool\` and \`access_mcp_resource\`). The documentation provides detailed information about the MCP server creation process, including setup instructions, best practices, and examples.
Parameters: None
Usage:
<load_mcp_documentation>
</load_mcp_documentation>
 */

const id = ClineDefaultTool.MCP_DOCS

const DESCRIPTION_EN = `Load documentation about creating MCP servers. This tool should be used when the user requests to create or install an MCP server (the user may ask you something along the lines of "add a tool" that does some function, in other words to create an MCP server that provides tools and resources that may connect to external APIs for example. You have the ability to create an MCP server and add it to a configuration file that will then expose the tools and resources for you to use with \`use_mcp_tool\` and \`access_mcp_resource\`). The documentation provides detailed information about the MCP server creation process, including setup instructions, best practices, and examples.`

const DESCRIPTION_ZH_CN =
	"加载有关创建 MCP 服务器的文档。当用户请求创建或安装 MCP 服务器时，应使用此工具（用户可能会要求您「添加工具」来执行某些功能，换句话说，创建一个 MCP 服务器，提供可以连接到外部 API 的工具和资源。您有能力创建 MCP 服务器并将其添加到配置文件中，然后将向您的`use_mcp_tool`和`access_mcp_resource`公开这些工具和资源）。文档提供了有关 MCP 服务器创建过程的详细信息，包括设置说明、最佳实践和示例。"

const generic: ClineToolSpec = {
	id,
	variant: ModelFamily.GENERIC,
	name: "load_mcp_documentation",
	description: (context: SystemPromptContext) => (isZhCN(context.locale) ? DESCRIPTION_ZH_CN : DESCRIPTION_EN),
	contextRequirements: (context) => context.mcpHub !== undefined && context.mcpHub !== null,
}

export const load_mcp_documentation_variants = [generic]
