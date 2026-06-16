import type { McpServer } from "@/shared/mcp"
import { isZhCN } from "../i18n/getLocaleText"
import { SystemPromptSection } from "../templates/placeholders"
import { TemplateEngine } from "../templates/TemplateEngine"
import type { PromptVariant, SystemPromptContext } from "../types"

/**
 * Checks if there are any enabled MCP servers in the context.
 * This is a utility function to standardize MCP server detection across all prompt variants.
 *
 * @param context - The system prompt context
 * @returns true if there are enabled MCP servers, false otherwise
 *
 * @example
 * const hasMcp = hasEnabledMcpServers(context)
 * if (hasMcp) {
 *   // Include MCP-specific instructions
 * }
 */
export function hasEnabledMcpServers(context: SystemPromptContext): boolean {
	return (context.mcpHub?.getServers() || []).length > 0
}

const MCP_TEMPLATE_TEXT = `MCP SERVERS

The Model Context Protocol (MCP) enables communication between the system and locally running MCP servers that provide additional tools, resources, and prompts to extend your capabilities.

# Connected MCP Servers

When a server is connected, you can use the server's tools via the \`use_mcp_tool\` tool, and access the server's resources via the \`access_mcp_resource\` tool.

Servers may also provide prompts - predefined templates that can be invoked by users to generate contextual messages.

{{MCP_SERVERS_LIST}}`

const MCP_TEMPLATE_TEXT_ZH_CN = `MCP SERVERS

模型上下文协议（MCP）支持系统与本地运行的 MCP 服务器之间的通信，这些服务器提供额外的工具、资源和提示，以扩展你的能力。

# 已连接的 MCP 服务器

当服务器连接后，你可以通过 \`use_mcp_tool\` 工具使用服务器的工具，通过 \`access_mcp_resource\` 工具访问服务器的资源。

服务器还可以提供提示——预定义的模板，用户可以调用它们来生成上下文消息。

{{MCP_SERVERS_LIST}}`

export async function getMcp(variant: PromptVariant, context: SystemPromptContext): Promise<string | undefined> {
	const servers = context.mcpHub?.getServers() || []
	// Skip the section if there are no servers connected / available
	if (servers.length === 0) {
		return undefined
	}
	return await getMcpServers(servers, variant, context)
}

async function getMcpServers(servers: McpServer[], variant: PromptVariant, context: SystemPromptContext): Promise<string> {
	const defaultTemplate = isZhCN(context.locale) ? MCP_TEMPLATE_TEXT_ZH_CN : MCP_TEMPLATE_TEXT
	const template = variant.componentOverrides?.[SystemPromptSection.MCP]?.template || defaultTemplate

	const serversList =
		servers.length > 0
			? formatMcpServersList(servers)
			: isZhCN(context.locale)
				? "（当前没有连接的 MCP 服务器）"
				: "(No MCP servers currently connected)"
	return new TemplateEngine().resolve(template, context, {
		MCP_SERVERS_LIST: serversList,
	})
}

function formatMcpServersList(servers: McpServer[]): string {
	return servers
		.filter((server) => server.status === "connected")
		.map((server) => {
			const tools = server.tools
				?.map((tool) => {
					const schemaStr = tool.inputSchema
						? `    Input Schema:
    ${JSON.stringify(tool.inputSchema, null, 2).split("\n").join("\n    ")}`
						: ""

					return `- ${tool.name}: ${tool.description}\n${schemaStr}`
				})
				.join("\n\n")

			const templates = server.resourceTemplates
				?.map((template) => `- ${template.uriTemplate} (${template.name}): ${template.description}`)
				.join("\n")

			const resources = server.resources
				?.map((resource) => `- ${resource.uri} (${resource.name}): ${resource.description}`)
				.join("\n")

			const prompts = server.prompts
				?.map((prompt) => {
					const argsStr = prompt.arguments?.length
						? `\n    Arguments: ${prompt.arguments
								.map(
									(arg) =>
										`${arg.name}${arg.required ? " (required)" : ""}${arg.description ? `: ${arg.description}` : ""}`,
								)
								.join(", ")}`
						: ""
					const title = prompt.title ? ` (${prompt.title})` : ""
					return `- ${prompt.name}${title}: ${prompt.description || "No description"}${argsStr}`
				})
				.join("\n")

			const config = JSON.parse(server.config)

			return (
				`## ${server.name}` +
				(config.command
					? ` (\`${config.command}${config.args && Array.isArray(config.args) ? ` ${config.args.join(" ")}` : ""}\`)`
					: "") +
				(tools ? `\n\n### Available Tools\n${tools}` : "") +
				(templates ? `\n\n### Resource Templates\n${templates}` : "") +
				(resources ? `\n\n### Direct Resources\n${resources}` : "") +
				(prompts ? `\n\n### Available Prompts\n${prompts}` : "")
			)
		})
		.join("\n\n")
}
