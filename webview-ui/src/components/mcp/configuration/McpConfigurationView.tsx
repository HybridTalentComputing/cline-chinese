import { VSCodeButton } from "@vscode/webview-ui-toolkit/react"
import { useEffect, useState } from "react"
import styled from "styled-components"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { vscode } from "@/utils/vscode"
import AddRemoteServerForm from "./tabs/add-server/AddRemoteServerForm"
import McpMarketplaceView from "./tabs/marketplace/McpMarketplaceView"
import InstalledServersView from "./tabs/installed/InstalledServersView"
import { McpViewTab } from "@shared/mcp"

type McpViewProps = {
	onDone: () => void // 完成时的回调函数
	initialTab?: McpViewTab // 初始选项卡
}

const McpConfigurationView = ({ onDone, initialTab }: McpViewProps) => {
	const { mcpMarketplaceEnabled } = useExtensionState() // 获取 MCP 市场是否启用的状态
	// 设置当前激活的选项卡，如果初始选项卡未指定，则根据市场是否启用决定默认选项卡
	const [activeTab, setActiveTab] = useState<McpViewTab>(initialTab || (mcpMarketplaceEnabled ? "marketplace" : "installed"))

	// 处理选项卡切换的函数
	const handleTabChange = (tab: McpViewTab) => {
		setActiveTab(tab)
	}

	// 当市场启用状态或当前选项卡变化时执行的副作用
	useEffect(() => {
		if (!mcpMarketplaceEnabled && activeTab === "marketplace") {
			// 如果市场被禁用并且当前在市场选项卡，则切换到已安装选项卡
			setActiveTab("installed")
		}
	}, [mcpMarketplaceEnabled, activeTab])

	// 当市场启用状态变化时执行的副作用
	useEffect(() => {
		if (mcpMarketplaceEnabled) {
			// 如果市场已启用，则静默刷新 MCP 市场并从 Hub 获取最新的 MCP 服务器
			vscode.postMessage({ type: "silentlyRefreshMcpMarketplace" })
			vscode.postMessage({ type: "fetchLatestMcpServersFromHub" })
		}
	}, [mcpMarketplaceEnabled])

	return (
		<div
			style={{
				position: "fixed", // 固定定位
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
				display: "flex",
				flexDirection: "column", // 垂直布局
			}}>
			{/* 头部区域，包含标题和完成按钮 */}
			<div
				style={{
					display: "flex",
					justifyContent: "space-between", // 两端对齐
					alignItems: "center", // 垂直居中
					padding: "10px 17px 5px 20px", // 内边距
				}}>
				<h3 style={{ color: "var(--vscode-foreground)", margin: 0 }}>MCP服务器</h3>
				<VSCodeButton onClick={onDone}>完成</VSCodeButton>
			</div>

			{/* 主要内容区域，包含选项卡和选项卡对应的内容 */}
			<div style={{ flex: 1, overflow: "auto" }}>
				{/* 选项卡容器 */}
				<div
					style={{
						display: "flex",
						gap: "1px", // 选项卡之间的间距
						padding: "0 20px 0 20px", // 内边距
						borderBottom: "1px solid var(--vscode-panel-border)", // 底部边框
					}}>
					{/* 如果市场已启用，则显示市场选项卡 */}
					{mcpMarketplaceEnabled && (
						<TabButton isActive={activeTab === "marketplace"} onClick={() => handleTabChange("marketplace")}>
							市场
						</TabButton>
					)}
					{/* 远程服务器选项卡 */}
					<TabButton isActive={activeTab === "addRemote"} onClick={() => handleTabChange("addRemote")}>
						远程服务器
					</TabButton>
					{/* 已安装服务器选项卡 */}
					<TabButton isActive={activeTab === "installed"} onClick={() => handleTabChange("installed")}>
						已安装
					</TabButton>
				</div>

				{/* 内容容器 */}
				<div style={{ width: "100%" }}>
					{/* 根据当前激活的选项卡显示对应的内容 */}
					{mcpMarketplaceEnabled && activeTab === "marketplace" && <McpMarketplaceView />}
					{activeTab === "addRemote" && <AddRemoteServerForm onServerAdded={() => handleTabChange("installed")} />}
					{activeTab === "installed" && <InstalledServersView />}
				</div>
			</div>
		</div>
	)
}

// 样式化的选项卡按钮组件
const StyledTabButton = styled.button<{ isActive: boolean }>`
	background: none; // 无背景
	border: none; // 无边框
	border-bottom: 2px solid ${(props) => (props.isActive ? "var(--vscode-foreground)" : "transparent")}; // 激活时显示底部边框
	color: ${(props) => (props.isActive ? "var(--vscode-foreground)" : "var(--vscode-descriptionForeground)")}; // 激活时和非激活时的文字颜色
	padding: 8px 16px; // 内边距
	cursor: pointer; // 鼠标指针样式
	font-size: 13px; // 字体大小
	margin-bottom: -1px; // 底部外边距，用于对齐边框
	font-family: inherit; // 继承字体

	&:hover {
		color: var(--vscode-foreground); // 悬停时文字颜色
	}
`

// 选项卡按钮组件
export const TabButton = ({
	children, // 子元素
	isActive, // 是否激活
	onClick, // 点击事件处理函数
}: {
	children: React.ReactNode
	isActive: boolean
	onClick: () => void
}) => (
	<StyledTabButton isActive={isActive} onClick={onClick}>
		{children}
	</StyledTabButton>
)

export default McpConfigurationView
