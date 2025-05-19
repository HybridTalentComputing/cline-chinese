import { useRef, useState } from "react" // 导入 React 相关钩子
import { vscode } from "@/utils/vscode" // 导入 VSCode API 的封装
import { VSCodeButton, VSCodeLink, VSCodeTextField } from "@vscode/webview-ui-toolkit/react" // 导入 VSCode UI 组件
import { LINKS } from "@/constants" // 导入常量
import { McpServiceClient } from "@/services/grpc-client" // 导入 gRPC 服务客户端
import { convertProtoMcpServersToMcpServers } from "@shared/proto-conversions/mcp/mcp-server-conversion" // 导入 MCP 服务器转换函数
import { useExtensionState } from "@/context/ExtensionStateContext" // 导入扩展状态上下文钩子

// 添加远程服务器表单组件
const AddRemoteServerForm = ({ onServerAdded }: { onServerAdded: () => void }) => {
	const [serverName, setServerName] = useState("") // 服务器名称状态
	const [serverUrl, setServerUrl] = useState("") // 服务器 URL 状态
	const [isSubmitting, setIsSubmitting] = useState(false) // 是否正在提交状态
	const [error, setError] = useState("") // 错误信息状态
	const [showConnectingMessage, setShowConnectingMessage] = useState(false) // 是否显示连接中消息状态
	const { setMcpServers } = useExtensionState() // 获取设置 MCP 服务器列表的函数

	// 处理表单提交事件
	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault() // 阻止表单默认提交行为

		// 校验服务器名称
		if (!serverName.trim()) {
			setError("服务器名称是必需的")
			return
		}

		// 校验服务器 URL
		if (!serverUrl.trim()) {
			setError("服务器 URL 是必需的")
			return
		}

		// 校验 URL 格式
		try {
			new URL(serverUrl)
		} catch (err) {
			setError("无效的 URL 格式")
			return
		}

		setError("") // 清除错误信息
		setIsSubmitting(true) // 设置为正在提交状态
		setShowConnectingMessage(true) // 显示连接中消息

		try {
			// 调用 gRPC 服务添加远程 MCP 服务器
			const servers = await McpServiceClient.addRemoteMcpServer({
				serverName: serverName.trim(),
				serverUrl: serverUrl.trim(),
			})

			setIsSubmitting(false) // 取消正在提交状态

			const mcpServers = convertProtoMcpServersToMcpServers(servers) // 转换服务器数据格式
			setMcpServers(mcpServers) // 更新 MCP 服务器列表

			setServerName("") // 清空服务器名称输入框
			setServerUrl("") // 清空服务器 URL 输入框
			onServerAdded() // 调用服务器添加成功回调
			setShowConnectingMessage(false) // 隐藏连接中消息
		} catch (error) {
			setIsSubmitting(false) // 取消正在提交状态
			// 设置错误信息，如果是 Error 实例则使用其 message，否则使用通用错误信息
			setError(error instanceof Error ? error.message : "添加服务器失败")
			setShowConnectingMessage(false) // 隐藏连接中消息
		}
	}

	return (
		<div className="p-4 px-5">
			<div className="text-[var(--vscode-foreground)] mb-2">
				通过提供名称及其 URL 端点来添加远程 MCP 服务器。了解更多{" "}
				<VSCodeLink href={LINKS.DOCUMENTATION.REMOTE_MCP_SERVER_DOCS} style={{ display: "inline" }}>
					此处。
				</VSCodeLink>
			</div>

			<form onSubmit={handleSubmit}>
				<div className="mb-2">
					<VSCodeTextField
						value={serverName}
						onChange={(e) => {
							setServerName((e.target as HTMLInputElement).value)
							setError("") // 清除错误信息
						}}
						disabled={isSubmitting}
						className="w-full"
						placeholder="mcp-server">
						服务器名称
					</VSCodeTextField>
				</div>

				<div className="mb-2">
					<VSCodeTextField
						value={serverUrl}
						onChange={(e) => {
							setServerUrl((e.target as HTMLInputElement).value)
							setError("") // 清除错误信息
						}}
						disabled={isSubmitting}
						placeholder="https://example.com/mcp-server"
						className="w-full mr-4">
						服务器 URL
					</VSCodeTextField>
				</div>

				{error && <div className="mb-3 text-[var(--vscode-errorForeground)]">{error}</div>}

				<div className="flex items-center mt-3 w-full">
					<VSCodeButton type="submit" disabled={isSubmitting} className="w-full">
						{isSubmitting ? "正在添加..." : "添加服务器"}
					</VSCodeButton>

					{showConnectingMessage && (
						<div className="ml-3 text-[var(--vscode-notificationsInfoIcon-foreground)] text-sm">
							正在连接到服务器... 这可能需要几秒钟。
						</div>
					)}
				</div>

				<VSCodeButton
					appearance="secondary"
					style={{ width: "100%", marginBottom: "5px", marginTop: 15 }}
					onClick={() => {
						vscode.postMessage({ type: "openMcpSettings" }) // 发送消息打开 MCP 设置
					}}>
					编辑配置
				</VSCodeButton>
			</form>
		</div>
	)
}

export default AddRemoteServerForm // 导出组件
