import React from "react"
import MarkdownBlock from "../common/MarkdownBlock"

interface NewTaskPreviewProps {
	context: string
}

const NewTaskPreview: React.FC<NewTaskPreviewProps> = ({ context }) => {
	return (
		<div className="bg-[var(--vscode-badge-background)] text-[var(--vscode-badge-foreground)] rounded-[3px] p-[14px] pb-[6px]">
			<span style={{ fontWeight: "bold" }}>任务</span>
			<MarkdownBlock markdown={context} />
		</div>
	)
}

export default NewTaskPreview
