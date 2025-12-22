import { EmptyRequest } from "@shared/proto/cline/common"
import { VSCodeButton, VSCodeLink } from "@vscode/webview-ui-toolkit/react"
import { useTranslation, Trans } from "react-i18next"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { McpServiceClient } from "@/services/grpc-client"
import ServersToggleList from "./ServersToggleList"

const ConfigureServersView = () => {
	const { t } = useTranslation()
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
				<Trans
					i18nKey="mcp.configure.description"
					components={{
						mcpLink: (
							<VSCodeLink href="https://github.com/modelcontextprotocol" style={{ display: "inline" }}>
								Model Context Protocol
							</VSCodeLink>
						),
						communityServersLink: (
							<VSCodeLink href="https://github.com/modelcontextprotocol/servers" style={{ display: "inline" }}>
								community-made servers
							</VSCodeLink>
						),
					}}
				/>{" "}
				<VSCodeLink href="https://x.com/sdrzn/status/1867271665086074969" style={{ display: "inline" }}>
					{t("mcp.configure.seeDemo")}
				</VSCodeLink>
			</div>

			<ServersToggleList hasTrashIcon={false} isExpandable={true} servers={servers} />

			{/* Settings Section */}
			<div style={{ marginBottom: "20px", marginTop: 10 }}>
				<VSCodeButton
					appearance="secondary"
					onClick={() => {
						McpServiceClient.openMcpSettings(EmptyRequest.create({})).catch((error) => {
							console.error("Error opening MCP settings:", error)
						})
					}}
					style={{ width: "100%", marginBottom: "5px" }}>
					<span className="codicon codicon-server" style={{ marginRight: "6px" }}></span>
					{t("mcp.configure.configureServers")}
				</VSCodeButton>

				<div style={{ textAlign: "center" }}>
					<VSCodeLink onClick={() => navigateToSettings("features")} style={{ fontSize: "12px" }}>
						{t("mcp.configure.advancedSettings")}
					</VSCodeLink>
				</div>
			</div>
		</div>
	)
}

export default ConfigureServersView
