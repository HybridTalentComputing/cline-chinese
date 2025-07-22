import React from "react"
import { VSCodeDropdown, VSCodeOption } from "@vscode/webview-ui-toolkit/react"
import { McpDisplayMode } from "@shared/McpDisplayMode"

interface McpDisplayModeDropdownProps {
	value: McpDisplayMode
	onChange: (mode: McpDisplayMode) => void
	id?: string
	className?: string
	style?: React.CSSProperties
	onClick?: (e: React.MouseEvent) => void
}

const McpDisplayModeDropdown: React.FC<McpDisplayModeDropdownProps> = ({ value, onChange, id, className, style, onClick }) => {
	const handleChange = (e: any) => {
		const newMode = e.target.value as McpDisplayMode
		onChange(newMode)
	}

	return (
		<VSCodeDropdown id={id} value={value} onChange={handleChange} onClick={onClick} className={className} style={style}>
			<VSCodeOption value="plain">纯文本</VSCodeOption>
			<VSCodeOption value="rich">富文本</VSCodeOption>
			<VSCodeOption value="markdown">Markdown</VSCodeOption>
		</VSCodeDropdown>
	)
}

export default McpDisplayModeDropdown
