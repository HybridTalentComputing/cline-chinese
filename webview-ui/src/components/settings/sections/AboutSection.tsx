import Section from "../Section"
import { VSCodeLink } from "@vscode/webview-ui-toolkit/react"

interface AboutSectionProps {
	version: string
	renderSectionHeader: (tabId: string) => JSX.Element | null
}

const AboutSection = ({ version, renderSectionHeader }: AboutSectionProps) => {
	return (
		<div>
			{renderSectionHeader("about")}
			<Section>
				<div className="text-center text-[var(--vscode-descriptionForeground)] text-xs leading-[1.2] px-0 py-0 pr-2 pb-[15px] mt-auto">
					<p className="break-words m-0 p-0">
						如果您有任何问题或反馈，请随时在{" "}
						<VSCodeLink href="https://github.com/cline/cline" className="inline">
							https://github.com/cline/cline
						</VSCodeLink>{" "}
						反馈
					</p>
					<p className="italic mt-[10px] mb-0 p-0">v{version}</p>
				</div>
			</Section>
		</div>
	)
}

export default AboutSection
