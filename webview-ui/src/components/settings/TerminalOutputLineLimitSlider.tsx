import React from "react"
import { useExtensionState } from "@/context/ExtensionStateContext"

const TerminalOutputLineLimitSlider: React.FC = () => {
	const { terminalOutputLineLimit, setTerminalOutputLineLimit } = useExtensionState()

	const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const value = parseInt(event.target.value, 10)
		setTerminalOutputLineLimit(value)
	}

	return (
		<div style={{ marginBottom: 15 }}>
			<label htmlFor="terminal-output-limit" style={{ fontWeight: "500", display: "block", marginBottom: 5 }}>
				端子输出限制
			</label>
			<div style={{ display: "flex", alignItems: "center" }}>
				<input
					type="range"
					id="terminal-output-limit"
					min="100"
					max="5000"
					step="100"
					value={terminalOutputLineLimit ?? 500}
					onChange={handleSliderChange}
					style={{ flexGrow: 1, marginRight: "1rem" }}
				/>
				<span>{terminalOutputLineLimit ?? 500}</span>
			</div>
			<p style={{ fontSize: "12px", color: "var(--vscode-descriptionForeground)", margin: "5px 0 0 0" }}>
				执行命令时终端输出的最大行数。超出此限制时，将从中间删除行，以节省令牌。
			</p>
		</div>
	)
}

export default TerminalOutputLineLimitSlider
