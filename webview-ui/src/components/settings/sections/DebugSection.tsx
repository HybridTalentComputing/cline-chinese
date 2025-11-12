import { VSCodeButton } from "@vscode/webview-ui-toolkit/react"
import Section from "../Section"

interface DebugSectionProps {
	onResetState: (resetGlobalState?: boolean) => Promise<void>
	renderSectionHeader: (tabId: string) => JSX.Element | null
}

const DebugSection = ({ onResetState, renderSectionHeader }: DebugSectionProps) => {
	return (
		<div>
			{renderSectionHeader("debug")}
			<Section>
				<VSCodeButton
					className="mt-[5px] w-auto"
					onClick={() => onResetState()}
					style={{ backgroundColor: "var(--vscode-errorForeground)", color: "black" }}>
					重置工作区状态
				</VSCodeButton>
				<VSCodeButton
					className="mt-[5px] w-auto"
					onClick={() => onResetState(true)}
					style={{ backgroundColor: "var(--vscode-errorForeground)", color: "black" }}>
					重置全局状态
				</VSCodeButton>
				<p className="text-xs mt-[5px] text-(--vscode-descriptionForeground)">
					这将重置扩展程序中的所有全局状态和密钥存储。
				</p>
			</Section>
		</div>
	)
}

export default DebugSection
