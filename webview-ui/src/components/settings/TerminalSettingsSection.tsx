import React, { useState } from "react"
import { VSCodeTextField, VSCodeCheckbox } from "@vscode/webview-ui-toolkit/react"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { StateServiceClient } from "@/services/grpc-client"
import { Int64, Int64Request } from "@shared/proto/common"

export const TerminalSettingsSection: React.FC = () => {
	const { shellIntegrationTimeout, setShellIntegrationTimeout, terminalReuseEnabled, setTerminalReuseEnabled } =
		useExtensionState()
	const [inputValue, setInputValue] = useState((shellIntegrationTimeout / 1000).toString())
	const [inputError, setInputError] = useState<string | null>(null)

	const handleTimeoutChange = (event: Event) => {
		const target = event.target as HTMLInputElement
		const value = target.value

		setInputValue(value)

		const seconds = parseFloat(value)
		if (isNaN(seconds) || seconds <= 0) {
			setInputError("请输入一个正数")
			return
		}

		setInputError(null)
		const timeout = Math.round(seconds * 1000) // Convert to milliseconds

		// Update local state
		setShellIntegrationTimeout(timeout)

		// Send to extension using gRPC
		StateServiceClient.updateTerminalConnectionTimeout({
			value: timeout,
		} as Int64Request)
			.then((response: Int64) => {
				setShellIntegrationTimeout(response.value)
				setInputValue((response.value / 1000).toString())
			})
			.catch((error) => {
				console.error("Failed to update terminal connection timeout:", error)
			})
	}

	const handleInputBlur = () => {
		// If there was an error, reset the input to the current valid value
		if (inputError) {
			setInputValue((shellIntegrationTimeout / 1000).toString())
			setInputError(null)
		}
	}

	const handleTerminalReuseChange = (event: Event) => {
		const target = event.target as HTMLInputElement
		const checked = target.checked

		// Update local state
		setTerminalReuseEnabled(checked)

		// TODO: Send to extension using gRPC when the backend is ready
		// For now, we'll just update the local state
	}

	return (
		<div id="terminal-settings-section" style={{ marginBottom: 20 }}>
			<div style={{ marginBottom: 15 }}>
				<div style={{ marginBottom: 8 }}>
					<label style={{ fontWeight: "500", display: "block", marginBottom: 5 }}>Shell 集成超时 (秒)</label>
					<div style={{ display: "flex", alignItems: "center" }}>
						<VSCodeTextField
							style={{ width: "100%" }}
							value={inputValue}
							placeholder="输入超时值(秒)"
							onChange={(event) => handleTimeoutChange(event as Event)}
							onBlur={handleInputBlur}
						/>
					</div>
					{inputError && (
						<div style={{ color: "var(--vscode-errorForeground)", fontSize: "12px", marginTop: 5 }}>{inputError}</div>
					)}
				</div>
				<p style={{ fontSize: "12px", color: "var(--vscode-descriptionForeground)", margin: 0 }}>
					设置执行命令之前等待 Shell 集成激活的时间。如果您遇到终端连接超时，请增加该值。
				</p>
			</div>

			<div style={{ marginBottom: 15 }}>
				<div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
					<VSCodeCheckbox
						checked={terminalReuseEnabled ?? true}
						onChange={(event) => handleTerminalReuseChange(event as Event)}>
						启用积极的终端重用
					</VSCodeCheckbox>
				</div>
				<p style={{ fontSize: "12px", color: "var(--vscode-descriptionForeground)", margin: 0 }}>
					启用后，Cline 将重用不在当前工作目录中的现有终端窗口。如果您在执行终端命令后遇到任务锁定问题，请禁用此功能。
				</p>
			</div>
		</div>
	)
}

export default TerminalSettingsSection
