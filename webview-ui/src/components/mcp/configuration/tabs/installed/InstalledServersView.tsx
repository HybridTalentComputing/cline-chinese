import { useExtensionState } from "@/context/ExtensionStateContext"
import { VSCodeButton, VSCodeLink } from "@vscode/webview-ui-toolkit/react"

import { McpServiceClient, UiServiceClient } from "@/services/grpc-client"

import { EmptyRequest, StringRequest } from "@shared/proto/common"
import ServersToggleList from "./ServersToggleList"
const InstalledServersView = () => {
	const { mcpServers: servers, navigateToSettings } = useExtensionState()

	return (
		<div style={{ padding: "16px 20px" }}>
			<div
				style={{
					color: "var(--vscode-foreground)",
					fontSize: "13px",
					marginBottom: "16px",
					marginTop: "5px",
				}}>
				The{" "}
				<VSCodeLink href="https://github.com/modelcontextprotocol" style={{ display: "inline" }}>
					模型上下文协议
				</VSCodeLink>{" "}
				能够与本地运行的 MCP 服务器进行通信，这些服务器提供额外的工具和资源来扩展 Cline 的功能。您可以使用{" "}
				<VSCodeLink href="https://github.com/modelcontextprotocol/servers" style={{ display: "inline" }}>
					社区制作的服务器
				</VSCodeLink>{" "}
				或者要求 Cline 创建适合您工作流程的新工具 (如., "添加获取最新 npm 文档的工具").{" "}
				<VSCodeLink href="https://x.com/sdrzn/status/1867271665086074969" style={{ display: "inline" }}>
					在此处查看演示。
				</VSCodeLink>
			</div>

			<ServersToggleList servers={servers} isExpandable={true} hasTrashIcon={false} />

			{/* Settings Section */}
			<div style={{ marginBottom: "20px", marginTop: 10 }}>
				<VSCodeButton
					appearance="secondary"
					style={{ width: "100%", marginBottom: "5px" }}
					onClick={() => {
						McpServiceClient.openMcpSettings(EmptyRequest.create({})).catch((error) => {
							console.error("Error opening MCP settings:", error)
						})
					}}>
					<span className="codicon codicon-server" style={{ marginRight: "6px" }}></span>
					配置 MCP 服务器
				</VSCodeButton>

				<div style={{ textAlign: "center" }}>
					<VSCodeLink
						onClick={() => {
							// First open the settings panel using direct navigation
							navigateToSettings()

							// After a short delay, send a message to scroll to browser settings
							setTimeout(async () => {
								try {
									await UiServiceClient.scrollToSettings(StringRequest.create({ value: "features" }))
								} catch (error) {
									console.error("Error scrolling to mcp settings:", error)
								}
							}, 300)
						}}
						style={{ fontSize: "12px" }}>
						高级 MCP 设置
					</VSCodeLink>
				</div>
			</div>
		</div>
	)
}

export default InstalledServersView
