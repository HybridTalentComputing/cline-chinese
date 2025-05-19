import React, { useState, useEffect, useCallback } from "react"
import { VSCodeButton, VSCodeCheckbox, VSCodeDropdown, VSCodeOption, VSCodeTextField } from "@vscode/webview-ui-toolkit/react"
import debounce from "debounce"
import { BROWSER_VIEWPORT_PRESETS } from "../../../../src/shared/BrowserSettings"
import { useExtensionState } from "../../context/ExtensionStateContext"
import { vscode } from "../../utils/vscode"
import styled from "styled-components"
import { BrowserServiceClient } from "../../services/grpc-client"

const ConnectionStatusIndicator = ({
	isChecking,
	isConnected,
	remoteBrowserEnabled,
}: {
	isChecking: boolean
	isConnected: boolean | null
	remoteBrowserEnabled?: boolean
}) => {
	if (!remoteBrowserEnabled) return null

	return (
		<StatusContainer>
			{isChecking ? (
				<>
					<Spinner />
					<StatusText>检查连接中...</StatusText>
				</>
			) : isConnected === true ? (
				<>
					<CheckIcon className="codicon codicon-check" />
					<StatusText style={{ color: "var(--vscode-terminal-ansiGreen)" }}>已连接</StatusText>
				</>
			) : isConnected === false ? (
				<StatusText style={{ color: "var(--vscode-errorForeground)" }}>未连接</StatusText>
			) : null}
		</StatusContainer>
	)
}

const CollapsibleContent = styled.div<{ isOpen: boolean }>`
	overflow: hidden;
	transition:
		max-height 0.3s ease-in-out,
		opacity 0.3s ease-in-out,
		margin-top 0.3s ease-in-out,
		visibility 0.3s ease-in-out;
	max-height: ${({ isOpen }) => (isOpen ? "1000px" : "0")}; // 足够大的高度
	opacity: ${({ isOpen }) => (isOpen ? 1 : 0)};
	margin-top: ${({ isOpen }) => (isOpen ? "15px" : "0")};
	visibility: ${({ isOpen }) => (isOpen ? "visible" : "hidden")};
`

export const BrowserSettingsSection: React.FC = () => {
	const { browserSettings } = useExtensionState()
	const [localChromePath, setLocalChromePath] = useState(browserSettings.chromeExecutablePath || "")
	const [isCheckingConnection, setIsCheckingConnection] = useState(false)
	const [connectionStatus, setConnectionStatus] = useState<boolean | null>(null)
	const [relaunchResult, setRelaunchResult] = useState<{ success: boolean; message: string } | null>(null)
	const [debugMode, setDebugMode] = useState(false)
	const [isBundled, setIsBundled] = useState(false)
	const [detectedChromePath, setDetectedChromePath] = useState<string | null>(null)

	// 监听浏览器连接测试结果和重启结果
	useEffect(() => {
		const handleMessage = (event: MessageEvent) => {
			const message = event.data
			if (message.type === "browserConnectionResult") {
				setConnectionStatus(message.success)
				setIsCheckingConnection(false)
			} else if (message.type === "browserRelaunchResult") {
				setRelaunchResult({
					success: message.success,
					message: message.text,
				})
				setDebugMode(false)
			}
		}

		window.addEventListener("message", handleMessage)
		return () => window.removeEventListener("message", handleMessage)
	}, [])

	// 15 秒后自动清除重启结果消息
	useEffect(() => {
		if (relaunchResult) {
			const timer = setTimeout(() => {
				setRelaunchResult(null)
			}, 15000)

			// 如果组件卸载或 relaunchResult 更改，则清除超时
			return () => clearTimeout(timer)
		}
	}, [relaunchResult])

	// 组件挂载时请求检测到的 Chrome 路径
	useEffect(() => {
		// 使用 gRPC 获取 getDetectedChromePath
		BrowserServiceClient.getDetectedChromePath({})
			.then((result) => {
				setDetectedChromePath(result.path)
				setIsBundled(result.isBundled)
			})
			.catch((error) => {
				console.error("获取检测到的 Chrome 路径时出错:", error)
			})
	}, [])

	// 将 localChromePath 与全局状态同步
	useEffect(() => {
		if (browserSettings.chromeExecutablePath !== localChromePath) {
			setLocalChromePath(browserSettings.chromeExecutablePath || "")
		}
		// 移除了本地 disableToolUse 状态的同步
	}, [browserSettings.chromeExecutablePath, browserSettings.disableToolUse])

	// 防抖连接检查函数
	const debouncedCheckConnection = useCallback(
		debounce(() => {
			if (browserSettings.remoteBrowserEnabled) {
				setIsCheckingConnection(true)
				setConnectionStatus(null)
				if (browserSettings.remoteBrowserHost) {
					// 使用 gRPC 测试浏览器连接
					BrowserServiceClient.testBrowserConnection({ value: browserSettings.remoteBrowserHost })
						.then((result) => {
							setConnectionStatus(result.success)
							setIsCheckingConnection(false)
						})
						.catch((error) => {
							console.error("测试浏览器连接时出错:", error)
							setConnectionStatus(false)
							setIsCheckingConnection(false)
						})
				} else {
					BrowserServiceClient.discoverBrowser({})
						.then((result) => {
							setConnectionStatus(result.success)
							setIsCheckingConnection(false)
						})
						.catch((error) => {
							console.error("发现浏览器时出错:", error)
							setConnectionStatus(false)
							setIsCheckingConnection(false)
						})
				}
			}
		}, 1000),
		[browserSettings.remoteBrowserEnabled, browserSettings.remoteBrowserHost],
	)

	// 组件挂载或远程设置更改时检查连接
	useEffect(() => {
		if (browserSettings.remoteBrowserEnabled) {
			debouncedCheckConnection()
		} else {
			setConnectionStatus(null)
		}
	}, [browserSettings.remoteBrowserEnabled, browserSettings.remoteBrowserHost, debouncedCheckConnection])

	const handleViewportChange = (event: Event) => {
		const target = event.target as HTMLSelectElement
		const selectedSize = BROWSER_VIEWPORT_PRESETS[target.value as keyof typeof BROWSER_VIEWPORT_PRESETS]
		if (selectedSize) {
			BrowserServiceClient.updateBrowserSettings({
				metadata: {},
				viewport: {
					width: selectedSize.width,
					height: selectedSize.height,
				},
				remoteBrowserEnabled: browserSettings.remoteBrowserEnabled,
				remoteBrowserHost: browserSettings.remoteBrowserHost,
				chromeExecutablePath: browserSettings.chromeExecutablePath,
				disableToolUse: browserSettings.disableToolUse,
			})
				.then((response) => {
					if (!response.value) {
						console.error("更新浏览器设置失败")
					}
				})
				.catch((error) => {
					console.error("更新浏览器设置时出错:", error)
				})
		}
	}

	const updateRemoteBrowserEnabled = (enabled: boolean) => {
		BrowserServiceClient.updateBrowserSettings({
			metadata: {},
			viewport: {
				width: browserSettings.viewport.width,
				height: browserSettings.viewport.height,
			},
			remoteBrowserEnabled: enabled,
			// 如果禁用，也清除主机
			remoteBrowserHost: enabled ? browserSettings.remoteBrowserHost : undefined,
			chromeExecutablePath: browserSettings.chromeExecutablePath,
			disableToolUse: browserSettings.disableToolUse,
		})
			.then((response) => {
				if (!response.value) {
					console.error("更新浏览器设置失败")
				}
			})
			.catch((error) => {
				console.error("更新浏览器设置时出错:", error)
			})
	}

	const updateRemoteBrowserHost = (host: string | undefined) => {
		BrowserServiceClient.updateBrowserSettings({
			metadata: {},
			viewport: {
				width: browserSettings.viewport.width,
				height: browserSettings.viewport.height,
			},
			remoteBrowserEnabled: browserSettings.remoteBrowserEnabled,
			remoteBrowserHost: host,
			chromeExecutablePath: browserSettings.chromeExecutablePath,
			disableToolUse: browserSettings.disableToolUse,
		})
			.then((response) => {
				if (!response.value) {
					console.error("更新浏览器设置失败")
				}
			})
			.catch((error) => {
				console.error("更新浏览器设置时出错:", error)
			})
	}

	const debouncedUpdateChromePath = useCallback(
		debounce((newPath: string | undefined) => {
			BrowserServiceClient.updateBrowserSettings({
				metadata: {},
				viewport: {
					width: browserSettings.viewport.width,
					height: browserSettings.viewport.height,
				},
				remoteBrowserEnabled: browserSettings.remoteBrowserEnabled,
				remoteBrowserHost: browserSettings.remoteBrowserHost,
				chromeExecutablePath: newPath,
				disableToolUse: browserSettings.disableToolUse,
			})
				.then((response) => {
					if (!response.value) {
						console.error("更新 chromeExecutablePath 的浏览器设置失败")
					}
				})
				.catch((error) => {
					console.error("更新 chromeExecutablePath 的浏览器设置时出错:", error)
				})
		}, 500),
		[browserSettings],
	)

	const updateChromeExecutablePath = (path: string | undefined) => {
		BrowserServiceClient.updateBrowserSettings({
			metadata: {},
			viewport: {
				width: browserSettings.viewport.width,
				height: browserSettings.viewport.height,
			},
			remoteBrowserEnabled: browserSettings.remoteBrowserEnabled,
			remoteBrowserHost: browserSettings.remoteBrowserHost,
			chromeExecutablePath: path,
			disableToolUse: browserSettings.disableToolUse,
		})
			.then((response) => {
				if (!response.value) {
					console.error("更新浏览器设置失败")
				}
			})
			.catch((error) => {
				console.error("更新浏览器设置时出错:", error)
			})
	}

	// 函数：一次性检查连接，不立即更改 UI 状态
	const checkConnectionOnce = useCallback(() => {
		// 不要为每次检查都显示加载动画，以避免 UI 闪烁
		// 我们将依赖响应来更新 connectionStatus
		if (browserSettings.remoteBrowserHost) {
			// 使用 gRPC 测试浏览器连接
			BrowserServiceClient.testBrowserConnection({ value: browserSettings.remoteBrowserHost })
				.then((result) => {
					setConnectionStatus(result.success)
				})
				.catch((error) => {
					console.error("测试浏览器连接时出错:", error)
					setConnectionStatus(false)
				})
		} else {
			BrowserServiceClient.discoverBrowser({})
				.then((result) => {
					setConnectionStatus(result.success)
				})
				.catch((error) => {
					console.error("发现浏览器时出错:", error)
					setConnectionStatus(false)
				})
		}
	}, [browserSettings.remoteBrowserHost])

	// 当启用远程浏览器时，设置连接状态的持续轮询
	useEffect(() => {
		// 仅当启用远程浏览器模式时才轮询
		if (!browserSettings.remoteBrowserEnabled) {
			// 确保禁用时我们不显示检查状态
			setIsCheckingConnection(false)
			return
		}

		// 启用时立即检查
		checkConnectionOnce()

		// 然后每秒检查一次
		const pollInterval = setInterval(() => {
			checkConnectionOnce()
		}, 1000)

		// 如果组件卸载或禁用远程浏览器，则清除间隔
		return () => clearInterval(pollInterval)
	}, [browserSettings.remoteBrowserEnabled, checkConnectionOnce])

	const updateDisableToolUse = (disabled: boolean) => {
		BrowserServiceClient.updateBrowserSettings({
			metadata: {},
			viewport: {
				width: browserSettings.viewport.width,
				height: browserSettings.viewport.height,
			},
			remoteBrowserEnabled: browserSettings.remoteBrowserEnabled,
			remoteBrowserHost: browserSettings.remoteBrowserHost,
			chromeExecutablePath: browserSettings.chromeExecutablePath,
			disableToolUse: disabled,
		})
			.then((response) => {
				if (!response.value) {
					console.error("更新 disableToolUse 设置失败")
				}
			})
			.catch((error) => {
				console.error("更新 disableToolUse 设置时出错:", error)
			})
	}

	const relaunchChromeDebugMode = () => {
		setDebugMode(true)
		setRelaunchResult(null)
		// 连接状态将通过我们的轮询自动更新

		vscode.postMessage({
			type: "relaunchChromeDebugMode",
		})
	}

	// 确定是否应显示重启按钮
	const isRemoteEnabled = Boolean(browserSettings.remoteBrowserEnabled)
	const shouldShowRelaunchButton = isRemoteEnabled && connectionStatus === false
	const isSubSettingsOpen = !(browserSettings.disableToolUse || false)

	return (
		<div
			id="browser-settings-section"
			style={{ marginBottom: 20, borderTop: "1px solid var(--vscode-panel-border)", paddingTop: 15 }}>
			<h3 style={{ color: "var(--vscode-foreground)", margin: "0 0 10px 0", fontSize: "14px" }}>浏览器设置</h3>

			{/* 主开关 */}
			<div style={{ marginBottom: isSubSettingsOpen ? 0 : 10 }}>
				<VSCodeCheckbox
					checked={browserSettings.disableToolUse || false}
					onChange={(e) => updateDisableToolUse((e.target as HTMLInputElement).checked)}>
					禁用浏览器工具
				</VSCodeCheckbox>
				<p
					style={{
						fontSize: "12px",
						color: "var(--vscode-descriptionForeground)",
						margin: "4px 0 0 0px",
					}}>
					阻止 Cline 使用浏览器操作（例如启动、点击、输入）。
				</p>
			</div>

			<CollapsibleContent isOpen={isSubSettingsOpen}>
				<div style={{ marginBottom: 15 }}>
					<div style={{ marginBottom: 8 }}>
						<label style={{ fontWeight: "500", display: "block", marginBottom: 5 }}>视口大小</label>
						<VSCodeDropdown
							style={{ width: "100%" }}
							value={
								Object.entries(BROWSER_VIEWPORT_PRESETS).find(([_, size]) => {
									const typedSize = size as { width: number; height: number }
									return (
										typedSize.width === browserSettings.viewport.width &&
										typedSize.height === browserSettings.viewport.height
									)
								})?.[0]
							}
							onChange={(event) => handleViewportChange(event as Event)}>
							{Object.entries(BROWSER_VIEWPORT_PRESETS).map(([name]) => (
								<VSCodeOption key={name} value={name}>
									{name}
								</VSCodeOption>
							))}
						</VSCodeDropdown>
					</div>
					<p
						style={{
							fontSize: "12px",
							color: "var(--vscode-descriptionForeground)",
							margin: 0,
						}}>
						设置浏览器视口的大小，用于截图和交互。
					</p>
				</div>

				<div style={{ marginBottom: 0 }}>
					{" "}
					{/* 此 div 现在包含远程连接和 Chrome 路径 */}
					<div style={{ marginBottom: 4, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
						<VSCodeCheckbox
							checked={browserSettings.remoteBrowserEnabled}
							onChange={(e) => updateRemoteBrowserEnabled((e.target as HTMLInputElement).checked)}>
							使用远程浏览器连接
						</VSCodeCheckbox>
						<ConnectionStatusIndicator
							isChecking={isCheckingConnection}
							isConnected={connectionStatus}
							remoteBrowserEnabled={browserSettings.remoteBrowserEnabled}
						/>
					</div>
					<p
						style={{
							fontSize: "12px",
							color: "var(--vscode-descriptionForeground)",
							margin: "0 0 6px 0px",
						}}>
						允许 Cline 使用您的 Chrome
						{isBundled ? "（在您的机器上未检测到）" : detectedChromePath ? ` (${detectedChromePath})` : ""}。您
						可以在下方指定自定义路径。使用远程浏览器连接需要在调试模式下启动 Chrome
						{browserSettings.remoteBrowserEnabled ? (
							<>
								{" "}
								手动（<code>--remote-debugging-port=9222</code>）或使用下方的按钮。输入主机地址或留空以自动发现。
							</>
						) : (
							"。"
						)}
					</p>
					{/* 移动的远程特定设置，在启用远程连接后直接显示 */}
					{browserSettings.remoteBrowserEnabled && (
						<div style={{ marginLeft: 0, marginTop: 8 }}>
							<VSCodeTextField
								value={browserSettings.remoteBrowserHost || ""}
								placeholder="http://localhost:9222"
								style={{ width: "100%", marginBottom: 8 }}
								onChange={(e: any) => updateRemoteBrowserHost(e.target.value || undefined)}
							/>

							{shouldShowRelaunchButton && (
								<div style={{ display: "flex", gap: "10px", marginBottom: 8, justifyContent: "center" }}>
									<VSCodeButton style={{ flex: 1 }} disabled={debugMode} onClick={relaunchChromeDebugMode}>
										{debugMode ? "正在启动浏览器..." : "以调试模式启动浏览器"}
									</VSCodeButton>
								</div>
							)}

							{relaunchResult && (
								<div
									style={{
										padding: "8px",
										marginBottom: "8px",
										backgroundColor: relaunchResult.success ? "rgba(0, 128, 0, 0.1)" : "rgba(255, 0, 0, 0.1)",
										color: relaunchResult.success
											? "var(--vscode-terminal-ansiGreen)"
											: "var(--vscode-terminal-ansiRed)",
										borderRadius: "3px",
										fontSize: "11px",
										whiteSpace: "pre-wrap",
										wordBreak: "break-word",
									}}>
									{relaunchResult.message}
								</div>
							)}

							<p
								style={{
									fontSize: "12px",
									color: "var(--vscode-descriptionForeground)",
									margin: 0,
								}}></p>
						</div>
					)}
					{/* Chrome 可执行文件路径部分现在跟随远程特定设置 */}
					<div style={{ marginBottom: 8, marginTop: 8 }}>
						<label htmlFor="chrome-executable-path" style={{ fontWeight: "500", display: "block", marginBottom: 5 }}>
							Chrome 可执行文件路径（可选）
						</label>
						<VSCodeTextField
							id="chrome-executable-path"
							value={localChromePath}
							placeholder="例如：/usr/bin/google-chrome 或 C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
							style={{ width: "100%" }}
							onChange={(e: any) => {
								const newValue = e.target.value || ""
								setLocalChromePath(newValue)
								debouncedUpdateChromePath(newValue) // 如果为空则发送 ""，而不是 undefined
							}}
						/>
						<p
							style={{
								fontSize: "12px",
								color: "var(--vscode-descriptionForeground)",
								margin: "4px 0 0 0",
							}}>
							留空以自动检测。
						</p>
					</div>
				</div>
			</CollapsibleContent>
		</div>
	)
}

const StatusContainer = styled.div`
	display: flex;
	align-items: center;
	margin-left: 12px;
	height: 20px;
`

const StatusText = styled.span`
	font-size: 12px;
	margin-left: 4px;
`

const CheckIcon = styled.i`
	color: var(--vscode-terminal-ansiGreen);
	font-size: 14px;
`

const Spinner = styled.div`
	width: 14px;
	height: 14px;
	border: 2px solid rgba(255, 255, 255, 0.3);
	border-radius: 50%;
	border-top-color: var(--vscode-progressBar-background);
	animation: spin 1s ease-in-out infinite;

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
`

export default BrowserSettingsSection
