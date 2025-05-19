import { VSCodeButton } from "@vscode/webview-ui-toolkit/react"
import { useEffect, useRef, useState } from "react"
import styled from "styled-components"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { vscode } from "@/utils/vscode"
import { CODE_BLOCK_BG_COLOR } from "../common/CodeBlock"
import { BrowserServiceClient } from "../../services/grpc-client"

interface ConnectionInfo {
	isConnected: boolean
	isRemote: boolean
	host?: string
}

export const BrowserSettingsMenu = () => {
	const { browserSettings } = useExtensionState()
	const containerRef = useRef<HTMLDivElement>(null)
	const [showInfoPopover, setShowInfoPopover] = useState(false)
	const [connectionInfo, setConnectionInfo] = useState<ConnectionInfo>({
		isConnected: false,
		isRemote: !!browserSettings.remoteBrowserEnabled,
		host: browserSettings.remoteBrowserHost,
	})
	const popoverRef = useRef<HTMLDivElement>(null)

	// 使用 gRPC 从浏览器会话中获取实际连接信息
	useEffect(() => {
		// 获取连接信息的函数
		;(async () => {
			try {
				console.log("[DEBUG] SENDING BROWSER CONNECTION INFO REQUEST")
				const info = await BrowserServiceClient.getBrowserConnectionInfo({})
				console.log("[DEBUG] GOT BROWSER REPLY:", info, typeof info)
				setConnectionInfo({
					isConnected: info.isConnected,
					isRemote: info.isRemote,
					host: info.host,
				})
			} catch (error) {
				console.error("Error fetching browser connection info:", error)
			}
		})()

		// 不再需要消息事件监听器！
	}, [browserSettings.remoteBrowserHost, browserSettings.remoteBrowserEnabled])

	// 点击外部时关闭弹出框
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				popoverRef.current &&
				!popoverRef.current.contains(event.target as Node) &&
				!event.composedPath().some((el) => (el as HTMLElement).classList?.contains("browser-info-icon"))
			) {
				setShowInfoPopover(false)
			}
		}

		if (showInfoPopover) {
			document.addEventListener("mousedown", handleClickOutside)
		}
		return () => {
			document.removeEventListener("mousedown", handleClickOutside)
		}
	}, [showInfoPopover])

	const openBrowserSettings = () => {
		// 首先打开设置面板
		vscode.postMessage({
			type: "openSettings",
		})

		// 短暂延迟后，发送消息以滚动到浏览器设置
		setTimeout(() => {
			vscode.postMessage({
				type: "scrollToSettings",
				text: "browser-settings-section", // 这是一个ID，保持英文
			})
		}, 300) // 给设置面板打开的时间
	}

	const toggleInfoPopover = () => {
		setShowInfoPopover(!showInfoPopover)

		// 使用 gRPC 打开弹出框时请求更新连接信息
		if (!showInfoPopover) {
			const fetchConnectionInfo = async () => {
				try {
					const info = await BrowserServiceClient.getBrowserConnectionInfo({})
					setConnectionInfo({
						isConnected: info.isConnected,
						isRemote: info.isRemote,
						host: info.host,
					})
				} catch (error) {
					console.error("Error fetching browser connection info:", error)
				}
			}

			fetchConnectionInfo()
		}
	}

	// 根据连接状态确定图标
	const getIconClass = () => {
		if (connectionInfo.isRemote) {
			return "codicon-remote"
		} else {
			return connectionInfo.isConnected ? "codicon-vm-running" : "codicon-info"
		}
	}

	// 根据连接状态确定图标颜色
	const getIconColor = () => {
		if (connectionInfo.isRemote) {
			return connectionInfo.isConnected ? "var(--vscode-charts-blue)" : "var(--vscode-foreground)"
		} else if (connectionInfo.isConnected) {
			return "var(--vscode-charts-green)"
		} else {
			return "var(--vscode-foreground)"
		}
	}

	// 每秒检查连接状态以使用 gRPC 保持图标同步
	useEffect(() => {
		// 获取连接信息的函数
		const fetchConnectionInfo = async () => {
			try {
				const info = await BrowserServiceClient.getBrowserConnectionInfo({})
				setConnectionInfo({
					isConnected: info.isConnected,
					isRemote: info.isRemote,
					host: info.host,
				})
			} catch (error) {
				console.error("Error fetching browser connection info:", error)
			}
		}

		// 立即请求连接信息
		fetchConnectionInfo()

		// 设置每秒刷新一次的间隔
		const intervalId = setInterval(fetchConnectionInfo, 1000)

		return () => clearInterval(intervalId)
	}, [])

	return (
		<div ref={containerRef} style={{ position: "relative", marginTop: "-1px", display: "flex" }}>
			<VSCodeButton
				appearance="icon"
				className="browser-info-icon"
				onClick={toggleInfoPopover}
				title="浏览器连接信息"
				style={{ marginRight: "4px" }}>
				<i
					className={`codicon ${getIconClass()}`}
					style={{
						fontSize: "14.5px",
						color: getIconColor(),
					}}
				/>
			</VSCodeButton>

			{showInfoPopover && (
				<InfoPopover ref={popoverRef}>
					<h4 style={{ margin: "0 0 8px 0" }}>浏览器连接</h4>
					<InfoRow>
						<InfoLabel>状态:</InfoLabel>
						<InfoValue
							style={{
								color: connectionInfo.isConnected
									? "var(--vscode-charts-green)"
									: "var(--vscode-errorForeground)",
							}}>
							{connectionInfo.isConnected ? "已连接" : "已断开"}
						</InfoValue>
					</InfoRow>
					{connectionInfo.isConnected && (
						<InfoRow>
							<InfoLabel>类型:</InfoLabel>
							<InfoValue>{connectionInfo.isRemote ? "远程" : "本地"}</InfoValue>
						</InfoRow>
					)}
					{connectionInfo.isConnected && connectionInfo.isRemote && connectionInfo.host && (
						<InfoRow>
							<InfoLabel>远程主机:</InfoLabel>
							<InfoValue>{connectionInfo.host}</InfoValue>
						</InfoRow>
					)}
				</InfoPopover>
			)}

			<VSCodeButton appearance="icon" onClick={openBrowserSettings}>
				<i className="codicon codicon-settings-gear" style={{ fontSize: "14.5px" }} />
			</VSCodeButton>
		</div>
	)
}

const InfoPopover = styled.div`
	position: absolute;
	top: 30px;
	right: 0;
	background-color: var(--vscode-editorWidget-background);
	border: 1px solid var(--vscode-widget-border);
	border-radius: 4px;
	padding: 10px;
	z-index: 100;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
	width: 60dvw;
	max-width: 250px;
`

const InfoRow = styled.div`
	display: flex;
	margin-bottom: 4px;
	flex-wrap: wrap;
	white-space: nowrap;
`

const InfoLabel = styled.div`
	flex: 0 0 90px;
	font-weight: 500;
`

const InfoValue = styled.div`
	flex: 1;
	word-break: break-word;
`

export default BrowserSettingsMenu
