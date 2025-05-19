import React, { useState } from "react"
import { VSCodeTextField } from "@vscode/webview-ui-toolkit/react"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { vscode } from "@/utils/vscode"

export const TerminalSettingsSection: React.FC = () => {
	const { shellIntegrationTimeout, setShellIntegrationTimeout } = useExtensionState()
	// 将 shellIntegrationTimeout 从毫秒转换为秒，并初始化 inputValue
	const [inputValue, setInputValue] = useState((shellIntegrationTimeout / 1000).toString())
	const [inputError, setInputError] = useState<string | null>(null)

	const handleTimeoutChange = (event: Event) => {
		const target = event.target as HTMLInputElement
		const value = target.value

		setInputValue(value) // 更新输入框的显示值

		const seconds = parseFloat(value) // 将输入值解析为浮点数
		if (isNaN(seconds) || seconds <= 0) {
			setInputError("请输入一个正数") // 如果输入无效，则设置错误消息
			return
		}

		setInputError(null) // 清除错误消息
		const timeout = Math.round(seconds * 1000) // 将秒转换为毫秒并四舍五入

		// 更新本地状态
		setShellIntegrationTimeout(timeout)

		// 发送到扩展程序
		vscode.postMessage({
			type: "updateTerminalConnectionTimeout", // 消息类型，保持英文
			shellIntegrationTimeout: timeout,
		})
	}

	const handleInputBlur = () => {
		// 如果存在错误，则将输入重置为当前有效值
		if (inputError) {
			setInputValue((shellIntegrationTimeout / 1000).toString()) // 将输入值重置为存储的超时时间（秒）
			setInputError(null) // 清除错误消息
		}
	}

	return (
		<div
			id="terminal-settings-section" // ID 保持英文
			style={{ marginBottom: 20, borderTop: "1px solid var(--vscode-panel-border)", paddingTop: 15 }}>
			<h3 style={{ color: "var(--vscode-foreground)", margin: "0 0 10px 0", fontSize: "14px" }}>终端设置</h3>
			<div style={{ marginBottom: 15 }}>
				<div style={{ marginBottom: 8 }}>
					<label style={{ fontWeight: "500", display: "block", marginBottom: 5 }}>
						Shell 集成超时时间 (秒)
					</label>
					<div style={{ display: "flex", alignItems: "center" }}>
						<VSCodeTextField
							style={{ width: "100%" }}
							value={inputValue}
							placeholder="输入超时时间（秒）"
							onChange={(event) => handleTimeoutChange(event as Event)}
							onBlur={handleInputBlur}
						/>
					</div>
					{inputError && (
						<div style={{ color: "var(--vscode-errorForeground)", fontSize: "12px", marginTop: 5 }}>{inputError}</div>
					)}
				</div>
				<p style={{ fontSize: "12px", color: "var(--vscode-descriptionForeground)", margin: 0 }}>
					设置 Cline 在执行命令前等待 Shell 集成激活的时间。如果您遇到终端连接超时问题，请增加此值。
				</p>
			</div>
		</div>
	)
}

export default TerminalSettingsSection
