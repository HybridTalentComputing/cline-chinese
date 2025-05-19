import { McpServer } from "@shared/mcp"
import ServerRow from "./server-row/ServerRow"

const ServersToggleList = ({
	servers, // 服务器列表
	isExpandable, // 是否可展开
	hasTrashIcon, // 是否显示垃圾桶图标
	listGap = "medium", // 列表间距，默认为中等
}: {
	servers: McpServer[]
	isExpandable: boolean
	hasTrashIcon: boolean
	listGap?: "small" | "medium" | "large" // 列表间距大小选项
}) => {
	// 定义不同间距大小对应的 CSS 类
	const gapClasses = {
		small: "gap-0", // 小间距
		medium: "gap-2.5", // 中间距
		large: "gap-5", // 大间距
	}

	// 获取当前列表间距对应的 CSS 类
	const gapClass = gapClasses[listGap]

	return servers.length > 0 ? ( // 如果服务器列表不为空
		<div className={`flex flex-col ${gapClass}`}>
			{/* 遍历服务器列表并渲染每个服务器行 */}
			{servers.map((server) => (
				<ServerRow key={server.name} server={server} isExpandable={isExpandable} hasTrashIcon={hasTrashIcon} />
			))}
		</div>
	) : (
		// 如果服务器列表为空，显示提示信息
		<div className="flex flex-col items-center gap-3 my-5 text-[var(--vscode-descriptionForeground)]">
			未安装 MCP 服务器
		</div>
	)
}

export default ServersToggleList
