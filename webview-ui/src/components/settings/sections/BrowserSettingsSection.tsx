import { VSCodeButton, VSCodeCheckbox, VSCodeDropdown, VSCodeOption, VSCodeTextField } from "@vscode/webview-ui-toolkit/react"
import React, { useCallback, useEffect, useState } from "react"
import styled from "styled-components"
import { BROWSER_VIEWPORT_PRESETS } from "../../../../../src/shared/BrowserSettings"
import { useExtensionState } from "../../../context/ExtensionStateContext"
import { BrowserServiceClient } from "../../../services/grpc-client"
import { EmptyRequest, StringRequest } from "@shared/proto/cline/common"
import { updateBrowserSetting } from "../utils/settingsHandlers"
import { DebouncedTextField } from "../common/DebouncedTextField"
import Section from "../Section"

interface BrowserSettingsSectionProps {
	renderSectionHeader: (tabId: string) => JSX.Element | null
}

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
					<StatusText>检查连接...</StatusText>
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
	max-height: ${({ isOpen }) => (isOpen ? "1000px" : "0")}; // Sufficiently large height
	opacity: ${({ isOpen }) => (isOpen ? 1 : 0)};
	margin-top: ${({ isOpen }) => (isOpen ? "15px" : "0")};
	visibility: ${({ isOpen }) => (isOpen ? "visible" : "hidden")};
`

export const BrowserSettingsSection: React.FC<BrowserSettingsSectionProps> = ({ renderSectionHeader }) => {
	const { browserSettings } = useExtensionState()
	const [isCheckingConnection, setIsCheckingConnection] = useState(false)
	const [connectionStatus, setConnectionStatus] = useState<boolean | null>(null)
	const [relaunchResult, setRelaunchResult] = useState<{ success: boolean; message: string } | null>(null)
	const [debugMode, setDebugMode] = useState(false)
	const [isBundled, setIsBundled] = useState(false)
	const [detectedChromePath, setDetectedChromePath] = useState<string | null>(null)

	// Auto-clear relaunch result message after 15 seconds
	useEffect(() => {
		if (relaunchResult) {
			const timer = setTimeout(() => {
				setRelaunchResult(null)
			}, 15000)
			return () => clearTimeout(timer)
		}
	}, [relaunchResult])

	// Request detected Chrome path on mount
	useEffect(() => {
		BrowserServiceClient.getDetectedChromePath(EmptyRequest.create({}))
			.then((result) => {
				setDetectedChromePath(result.path)
				setIsBundled(result.isBundled)
			})
			.catch((error) => {
				console.error("Error getting detected Chrome path:", error)
			})
	}, [])

	// Function to check connection once without changing UI state immediately
	const checkConnectionOnce = useCallback(() => {
		if (browserSettings.remoteBrowserHost) {
			BrowserServiceClient.testBrowserConnection(StringRequest.create({ value: browserSettings.remoteBrowserHost }))
				.then((result) => {
					setConnectionStatus(result.success)
				})
				.catch((error) => {
					console.error("Error testing browser connection:", error)
					setConnectionStatus(false)
				})
		} else {
			BrowserServiceClient.discoverBrowser(EmptyRequest.create({}))
				.then((result) => {
					setConnectionStatus(result.success)
				})
				.catch((error) => {
					console.error("Error discovering browser:", error)
					setConnectionStatus(false)
				})
		}
	}, [browserSettings.remoteBrowserHost])

	// Setup continuous polling for connection status when remote browser is enabled
	useEffect(() => {
		if (!browserSettings.remoteBrowserEnabled) {
			setIsCheckingConnection(false)
			return
		}

		checkConnectionOnce()
		const pollInterval = setInterval(() => {
			checkConnectionOnce()
		}, 1000)

		return () => clearInterval(pollInterval)
	}, [browserSettings.remoteBrowserEnabled, checkConnectionOnce])

	const handleViewportChange = (event: Event) => {
		const target = event.target as HTMLSelectElement
		const selectedSize = BROWSER_VIEWPORT_PRESETS[target.value as keyof typeof BROWSER_VIEWPORT_PRESETS]
		if (selectedSize) {
			updateBrowserSetting("viewport", {
				width: selectedSize.width,
				height: selectedSize.height,
			})
		}
	}

	const relaunchChromeDebugMode = () => {
		setDebugMode(true)
		setRelaunchResult(null)

		BrowserServiceClient.relaunchChromeDebugMode(EmptyRequest.create({}))
			.then((result) => {
				setRelaunchResult({
					success: true,
					message: result.value,
				})
				setDebugMode(false)
			})
			.catch((error) => {
				console.error("Error relaunching Chrome:", error)
				setRelaunchResult({
					success: false,
					message: `Error relaunching Chrome: ${error.message}`,
				})
				setDebugMode(false)
			})
	}

	// Determine if we should show the relaunch button
	const isRemoteEnabled = Boolean(browserSettings.remoteBrowserEnabled)
	const shouldShowRelaunchButton = isRemoteEnabled && connectionStatus === false
	const isSubSettingsOpen = !(browserSettings.disableToolUse || false)

	return (
		<div>
			{renderSectionHeader("browser")}
			<Section>
				<div id="browser-settings-section" style={{ marginBottom: 20 }}>
					{/* Master Toggle */}
					<div style={{ marginBottom: isSubSettingsOpen ? 0 : 10 }}>
						<VSCodeCheckbox
							checked={browserSettings.disableToolUse || false}
							onChange={(e) => updateBrowserSetting("disableToolUse", (e.target as HTMLInputElement).checked)}>
							禁止浏览器工具使用
						</VSCodeCheckbox>
						<p
							style={{
								fontSize: "12px",
								color: "var(--vscode-descriptionForeground)",
								margin: "4px 0 0 0px",
							}}>
							防止 Cline 使用浏览器操作 (如： 加载, 点击, 输入).
						</p>
					</div>

					<CollapsibleContent isOpen={isSubSettingsOpen}>
						<div style={{ marginBottom: 15 }}>
							<div style={{ marginBottom: 8 }}>
								<label style={{ fontWeight: "500", display: "block", marginBottom: 5 }}>窗口大小</label>
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
								设置浏览器视口的大小以用于屏幕截图和交互。
							</p>
						</div>

						<div style={{ marginBottom: 0 }}>
							{" "}
							{/* This div now contains Remote Connection & Chrome Path */}
							<div
								style={{
									marginBottom: 4,
									display: "flex",
									alignItems: "center",
									justifyContent: "space-between",
								}}>
								<VSCodeCheckbox
									checked={browserSettings.remoteBrowserEnabled}
									onChange={(e) => {
										const enabled = (e.target as HTMLInputElement).checked
										updateBrowserSetting("remoteBrowserEnabled", enabled)
										// If disabling, also clear the host
										if (!enabled) {
											updateBrowserSetting("remoteBrowserHost", undefined)
										}
									}}>
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
								启用 Cline 使用 Chrome
								{isBundled
									? "(not detected on your machine)"
									: detectedChromePath
										? ` (${detectedChromePath})`
										: ""}
								. 您可以在下面指定自定义路径。使用远程浏览器连接需要以调试模式启动 Chrome
								{browserSettings.remoteBrowserEnabled ? (
									<>
										{" "}
										手动 (<code>--remote-debugging-port=9222</code>
										)或使用下方按钮。输入主机地址，或留空以实现自动发现。
									</>
								) : (
									"."
								)}
							</p>
							{/* Moved remote-specific settings to appear directly after enabling remote connection */}
							{browserSettings.remoteBrowserEnabled && (
								<div style={{ marginLeft: 0, marginTop: 8 }}>
									<DebouncedTextField
										initialValue={browserSettings.remoteBrowserHost || ""}
										placeholder="http://localhost:9222"
										style={{ width: "100%", marginBottom: 8 }}
										onChange={(value) => updateBrowserSetting("remoteBrowserHost", value || undefined)}
									/>

									{shouldShowRelaunchButton && (
										<div style={{ display: "flex", gap: "10px", marginBottom: 8, justifyContent: "center" }}>
											<VSCodeButton
												style={{ flex: 1 }}
												disabled={debugMode}
												onClick={relaunchChromeDebugMode}>
												{debugMode ? "启动浏览器..." : "使用调试模式启动浏览器"}
											</VSCodeButton>
										</div>
									)}

									{relaunchResult && (
										<div
											style={{
												padding: "8px",
												marginBottom: "8px",
												backgroundColor: relaunchResult.success
													? "rgba(0, 128, 0, 0.1)"
													: "rgba(255, 0, 0, 0.1)",
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
							{/* Chrome Executable Path section now follows remote-specific settings */}
							<div style={{ marginBottom: 8, marginTop: 8 }}>
								<label
									htmlFor="chrome-executable-path"
									style={{ fontWeight: "500", display: "block", marginBottom: 5 }}>
									Chrome 可执行文件路径（可选）
								</label>
								<DebouncedTextField
									id="chrome-executable-path"
									initialValue={browserSettings.chromeExecutablePath || ""}
									placeholder="e.g., /usr/bin/google-chrome or C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
									style={{ width: "100%" }}
									onChange={(value) => updateBrowserSetting("chromeExecutablePath", value || undefined)}
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
			</Section>
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
