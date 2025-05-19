import { useEffect, useMemo, useState } from "react"
import {
	VSCodeButton,
	VSCodeProgressRing,
	VSCodeRadioGroup,
	VSCodeRadio,
	VSCodeDropdown,
	VSCodeOption,
	VSCodeTextField,
} from "@vscode/webview-ui-toolkit/react"
import { McpMarketplaceItem } from "@shared/mcp"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { vscode } from "@/utils/vscode"
import McpMarketplaceCard from "./McpMarketplaceCard"
import McpSubmitCard from "./McpSubmitCard"

const McpMarketplaceView = () => {
	const { mcpServers } = useExtensionState()
	const [items, setItems] = useState<McpMarketplaceItem[]>([])
	const [isLoading, setIsLoading] = useState(true) // 是否正在加载
	const [error, setError] = useState<string | null>(null) // 错误信息
	const [isRefreshing, setIsRefreshing] = useState(false) // 是否正在刷新
	const [searchQuery, setSearchQuery] = useState("") // 搜索查询
	const [selectedCategory, setSelectedCategory] = useState<string | null>(null) // 选中的分类
	const [sortBy, setSortBy] = useState<"newest" | "stars" | "name" | "downloadCount">("downloadCount") // 排序方式

	// 提取所有唯一的分类并排序
	const categories = useMemo(() => {
		const uniqueCategories = new Set(items.map((item) => item.category))
		return Array.from(uniqueCategories).sort()
	}, [items])

	// 根据搜索、分类和排序条件过滤和排序 MCP 条目
	const filteredItems = useMemo(() => {
		return items
			.filter((item) => {
				const matchesSearch = // 检查是否匹配搜索查询
					searchQuery === "" ||
					item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
					item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
					item.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
				const matchesCategory = !selectedCategory || item.category === selectedCategory // 检查是否匹配选中分类
				return matchesSearch && matchesCategory
			})
			.sort((a, b) => { // 根据排序条件排序
				switch (sortBy) {
					case "downloadCount":
						return b.downloadCount - a.downloadCount
					case "stars":
						return b.githubStars - a.githubStars
					case "name":
						return a.name.localeCompare(b.name)
					case "newest":
						return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
					default:
						return 0
				}
			})
	}, [items, searchQuery, selectedCategory, sortBy])

	// 处理来自扩展的消息，并获取市场目录
	useEffect(() => {
		const handleMessage = (event: MessageEvent) => {
			const message = event.data
			if (message.type === "mcpMarketplaceCatalog") { // 处理市场目录消息
				if (message.error) {
					setError(message.error)
				} else {
					setItems(message.mcpMarketplaceCatalog?.items || [])
					setError(null)
				}
				setIsLoading(false)
				setIsRefreshing(false)
			} else if (message.type === "mcpDownloadDetails") { // 处理 MCP 下载详情消息
				if (message.error) {
					setError(message.error) // 注意：这里可能需要更具体的错误处理，例如针对特定 MCP 卡片显示错误
				}
			}
		}

		window.addEventListener("message", handleMessage)

		// 获取市场目录
		fetchMarketplace()

		return () => {
			window.removeEventListener("message", handleMessage)
		}
	}, [])

	// 获取市场目录数据
	const fetchMarketplace = (forceRefresh: boolean = false) => {
		if (forceRefresh) {
			setIsRefreshing(true)
		} else {
			setIsLoading(true)
		}
		setError(null)
		vscode.postMessage({ type: "fetchMcpMarketplace", bool: forceRefresh })
	}

	// 加载或刷新状态显示
	if (isLoading || isRefreshing) {
		return (
			<div
				style={{
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					height: "100%",
					padding: "20px",
				}}>
				<VSCodeProgressRing />
			</div>
		)
	}

	// 错误状态显示
	if (error) {
		return (
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					justifyContent: "center",
					alignItems: "center",
					height: "100%",
					padding: "20px",
					gap: "12px",
				}}>
				<div style={{ color: "var(--vscode-errorForeground)" }}>{error}</div>
				<VSCodeButton appearance="secondary" onClick={() => fetchMarketplace(true)}>
					<span className="codicon codicon-refresh" style={{ marginRight: "6px" }} />
					重试
				</VSCodeButton>
			</div>
		)
	}

	// 主视图渲染
	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				width: "100%",
			}}>
			{/* 搜索、筛选和排序区域 */}
			<div style={{ padding: "20px 20px 5px", display: "flex", flexDirection: "column", gap: "16px" }}>
				{/* 搜索行 */}
				<VSCodeTextField
					style={{ width: "100%" }}
					placeholder="搜索 MCP..."
					value={searchQuery}
					onInput={(e) => setSearchQuery((e.target as HTMLInputElement).value)}>
					<div
						slot="start"
						className="codicon codicon-search"
						style={{
							fontSize: 13,
							opacity: 0.8,
						}}
					/>
					{searchQuery && (
						<div
							className="codicon codicon-close"
							aria-label="清除搜索"
							onClick={() => setSearchQuery("")}
							slot="end"
							style={{
								display: "flex",
								justifyContent: "center",
								alignItems: "center",
								height: "100%",
								cursor: "pointer",
							}}
						/>
					)}
				</VSCodeTextField>

				{/* 筛选行 */}
				<div
					style={{
						display: "flex",
						alignItems: "center",
						gap: "8px",
					}}>
					<span
						style={{
							fontSize: "11px",
							color: "var(--vscode-descriptionForeground)",
							textTransform: "uppercase",
							fontWeight: 500,
							flexShrink: 0,
						}}>
						筛选:
					</span>
					<div
						style={{
							position: "relative",
							zIndex: 2, // 确保下拉菜单在其他元素之上
							flex: 1,
						}}>
						<VSCodeDropdown
							style={{
								width: "100%",
							}}
							value={selectedCategory || ""}
							onChange={(e) => setSelectedCategory((e.target as HTMLSelectElement).value || null)}>
							<VSCodeOption value="">所有分类</VSCodeOption>
							{categories.map((category) => (
								<VSCodeOption key={category} value={category}>
									{category}
								</VSCodeOption>
							))}
						</VSCodeDropdown>
					</div>
				</div>

				{/* 排序行 */}
				<div
					style={{
						display: "flex",
						gap: "8px",
					}}>
					<span
						style={{
							fontSize: "11px",
							color: "var(--vscode-descriptionForeground)",
							textTransform: "uppercase",
							fontWeight: 500,
							marginTop: "3px", // 垂直对齐
						}}>
						排序:
					</span>
					<VSCodeRadioGroup
						style={{
							display: "flex",
							flexWrap: "wrap", // 允许换行
							marginTop: "-2.5px", // 微调垂直对齐
						}}
						value={sortBy}
						onChange={(e) => setSortBy((e.target as HTMLInputElement).value as typeof sortBy)}>
						<VSCodeRadio value="downloadCount">最多安装</VSCodeRadio>
						<VSCodeRadio value="newest">最新</VSCodeRadio>
						<VSCodeRadio value="stars">GitHub 星标</VSCodeRadio>
						<VSCodeRadio value="name">名称</VSCodeRadio>
					</VSCodeRadioGroup>
				</div>
			</div>

			{/* 自定义样式，确保输入框和下拉框样式统一 */}
			<style>
				{`
				.mcp-search-input,
				.mcp-select {
				box-sizing: border-box; /* 确保 padding 和 border 不会增加元素的总宽度/高度 */
				}
				.mcp-search-input {
				min-width: 140px; /* 搜索框最小宽度 */
				}
				.mcp-search-input:focus,
				.mcp-select:focus {
				border-color: var(--vscode-focusBorder) !important; /* 聚焦时边框颜色 */
				}
				.mcp-search-input:hover,
				.mcp-select:hover {
				opacity: 0.9; /* 悬停时透明度 */
				}
			`}
			</style>
			{/* MCP 条目列表 */}
			<div style={{ display: "flex", flexDirection: "column" }}>
				{filteredItems.length === 0 ? (
					<div
						style={{
							display: "flex",
							justifyContent: "center",
							alignItems: "center",
							height: "100%",
							padding: "20px",
							color: "var(--vscode-descriptionForeground)",
						}}>
						{searchQuery || selectedCategory
							? "未找到匹配的 MCP 服务器"
							: "市场中未找到 MCP 服务器"}
					</div>
				) : (
					filteredItems.map((item) => <McpMarketplaceCard key={item.mcpId} item={item} installedServers={mcpServers} />)
				)}
				<McpSubmitCard />
			</div>
		</div>
	)
}

export default McpMarketplaceView
