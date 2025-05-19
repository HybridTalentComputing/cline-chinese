import { VSCodeButton, VSCodeLink } from "@vscode/webview-ui-toolkit/react"
import { vscode } from "@/utils/vscode"
import { useExtensionState } from "@/context/ExtensionStateContext"
import ServersToggleList from "./ServersToggleList"

// 已安装服务器视图组件
const InstalledServersView = () => {
	// 从扩展状态中获取已安装的 MCP 服务器列表
	const { mcpServers: servers } = useExtensionState()

	return (
		<div style={{ padding: "16px 20px" }}>
			{/* MCP 协议描述区域 */}
			<div
				style={{
					color: "var(--vscode-foreground)",
					fontSize: "13px",
					marginBottom: "16px",
					marginTop: "5px",
				}}>
				{/* 模型上下文协议链接 */}
				<VSCodeLink href="https://github.com/modelcontextprotocol" style={{ display: "inline" }}>
					模型上下文协议 (MCP)
				</VSCodeLink>{" "}
				支持与本地运行的 MCP 服务器通信，这些服务器提供额外的工具和资源来扩展 Cline
				的功能。您可以使用{" "}
				{/* 社区制作的服务器链接 */}
				<VSCodeLink href="https://github.com/modelcontextprotocol/servers" style={{ display: "inline" }}>
					社区创建的服务器
				</VSCodeLink>{" "}
				或要求 Cline 创建特定于您工作流程的新工具（例如，"add a tool that gets the latest npm docs"）。{" "}
				{/* 演示链接 */}
				<VSCodeLink href="https://x.com/sdrzn/status/1867271665086074969" style={{ display: "inline" }}>
					在此处查看演示。
				</VSCodeLink>
			</div>

			{/* 服务器切换列表组件，显示已安装的服务器 */}
			<ServersToggleList servers={servers} isExpandable={true} hasTrashIcon={false} />

			{/* 设置区域 */}
			<div style={{ marginBottom: "20px", marginTop: 10 }}>
				{/* 配置 MCP 服务器按钮 */}
				<VSCodeButton
					appearance="secondary"
					style={{ width: "100%", marginBottom: "5px" }}
					onClick={() => {
						// 打开 MCP 设置
						vscode.postMessage({ type: "openMcpSettings" })
					}}>
					<span className="codicon codicon-server" style={{ marginRight: "6px" }}></span>
					配置 MCP 服务器
				</VSCodeButton>

				<div style={{ textAlign: "center" }}>
					{/* 高级 MCP 设置链接 */}
					<VSCodeLink
						onClick={() => {
							// 打开扩展设置中的 MCP 相关配置
							vscode.postMessage({
								type: "openExtensionSettings",
								text: "cline.mcp", // 此为设置ID，保持英文
							})
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
