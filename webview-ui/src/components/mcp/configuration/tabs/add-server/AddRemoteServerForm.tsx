import { EmptyRequest } from "@shared/proto/cline/common"
import { AddRemoteMcpServerRequest, McpServers } from "@shared/proto/cline/mcp"
import { convertProtoMcpServersToMcpServers } from "@shared/proto-conversions/mcp/mcp-server-conversion"
import { VSCodeButton, VSCodeLink, VSCodeTextField } from "@vscode/webview-ui-toolkit/react"
import { useState } from "react"
import { LINKS } from "@/constants"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { McpServiceClient } from "@/services/grpc-client"

const AddRemoteServerForm = ({ onServerAdded }: { onServerAdded: () => void }) => {
	const [serverName, setServerName] = useState("")
	const [serverUrl, setServerUrl] = useState("")
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [error, setError] = useState("")
	const [showConnectingMessage, setShowConnectingMessage] = useState(false)
	const { setMcpServers } = useExtensionState()

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()

		if (!serverName.trim()) {
			setError("Server name is required")
			return
		}

		if (!serverUrl.trim()) {
			setError("Server URL is required")
			return
		}

		try {
			new URL(serverUrl)
		} catch (_err) {
			setError("Invalid URL format")
			return
		}

		setError("")
		setIsSubmitting(true)
		setShowConnectingMessage(true)

		try {
			const servers: McpServers = await McpServiceClient.addRemoteMcpServer(
				AddRemoteMcpServerRequest.create({
					serverName: serverName.trim(),
					serverUrl: serverUrl.trim(),
				}),
			)

			setIsSubmitting(false)

			const mcpServers = convertProtoMcpServersToMcpServers(servers.mcpServers)
			setMcpServers(mcpServers)

			setServerName("")
			setServerUrl("")
			onServerAdded()
			setShowConnectingMessage(false)
		} catch (error) {
			setIsSubmitting(false)
			setError(error instanceof Error ? error.message : "Failed to add server")
			setShowConnectingMessage(false)
		}
	}

	return (
		<div className="p-4 px-5">
			<div className="text-(--vscode-foreground) mb-2">
				通过提供名称及其 URL 端点来添加远程 MCP 服务器。{" "}
				<VSCodeLink href={LINKS.DOCUMENTATION.REMOTE_MCP_SERVER_DOCS} style={{ display: "inline" }}>
					了解更多信息
				</VSCodeLink>
			</div>

			<form onSubmit={handleSubmit}>
				<div className="mb-2">
					<VSCodeTextField
						className="w-full"
						disabled={isSubmitting}
						onChange={(e) => {
							setServerName((e.target as HTMLInputElement).value)
							setError("")
						}}
						placeholder="mcp-server"
						value={serverName}>
						服务名称
					</VSCodeTextField>
				</div>

				<div className="mb-2">
					<VSCodeTextField
						className="w-full mr-4"
						disabled={isSubmitting}
						onChange={(e) => {
							setServerUrl((e.target as HTMLInputElement).value)
							setError("")
						}}
						placeholder="https://example.com/mcp-server"
						value={serverUrl}>
						服务URL
					</VSCodeTextField>
				</div>

				{error && <div className="mb-3 text-(--vscode-errorForeground)">{error}</div>}

				<div className="flex items-center mt-3 w-full">
					<VSCodeButton className="w-full" disabled={isSubmitting} type="submit">
						{isSubmitting ? "添加..." : "添加服务"}
					</VSCodeButton>

					{showConnectingMessage && (
						<div className="ml-3 text-(--vscode-notificationsInfoIcon-foreground) text-sm">
							正在连接服务... 可能需要几秒钟.
						</div>
					)}
				</div>

				<VSCodeButton
					appearance="secondary"
					onClick={() => {
						McpServiceClient.openMcpSettings(EmptyRequest.create({})).catch((error) => {
							console.error("Error opening MCP settings:", error)
						})
					}}
					style={{ width: "100%", marginBottom: "5px", marginTop: 15 }}>
					编辑配置
				</VSCodeButton>
			</form>
		</div>
	)
}

export default AddRemoteServerForm
