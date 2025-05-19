const McpSubmitCard = () => {
	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				gap: "12px",
				padding: "15px",
				margin: "20px",
				backgroundColor: "var(--vscode-textBlockQuote-background)",
				borderRadius: "6px",
			}}>
			{/* 图标 */}
			<i className="codicon codicon-add" style={{ fontSize: "18px" }} />

			{/* 内容 */}
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					gap: "4px",
					textAlign: "center",
					maxWidth: "480px",
				}}>
				<h3
					style={{
						margin: 0,
						fontSize: "14px",
						fontWeight: 600,
						color: "var(--vscode-foreground)",
					}}>
					提交 MCP 服务器
				</h3>
				<p style={{ fontSize: "13px", margin: 0, color: "var(--vscode-descriptionForeground)" }}>
					通过向{" "}
					<a href="https://github.com/cline/mcp-marketplace">github.com/cline/mcp-marketplace</a> 提交 issue
					来帮助他人发现优秀的 MCP 服务器
				</p>
			</div>
		</div>
	)
}

export default McpSubmitCard
