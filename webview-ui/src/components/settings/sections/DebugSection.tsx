import Section from "../Section"
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react"

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
					onClick={() => onResetState()}
					className="mt-[5px] w-auto"
					style={{ backgroundColor: "var(--vscode-errorForeground)", color: "black" }}>
					重置工作区状态
				</VSCodeButton>
				<VSCodeButton
					onClick={() => onResetState(true)}
					className="mt-[5px] w-auto"
					style={{ backgroundColor: "var(--vscode-errorForeground)", color: "black" }}>
					重置全局状态
				</VSCodeButton>
				<p className="text-xs mt-[5px] text-[var(--vscode-descriptionForeground)]">
					这将重置扩展中的所有全局状态和秘密存储。
				</p>
			</Section>
		</div>
	)
}

export default DebugSection
