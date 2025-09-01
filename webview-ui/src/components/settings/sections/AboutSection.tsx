import { VSCodeLink } from "@vscode/webview-ui-toolkit/react"
import Section from "../Section"

interface AboutSectionProps {
	version: string
	renderSectionHeader: (tabId: string) => JSX.Element | null
}

const AboutSection = ({ version, renderSectionHeader }: AboutSectionProps) => {
	return (
		<div>
			{renderSectionHeader("about")}
			<Section>
				<div className="text-center text-[var(--vscode-descriptionForeground)] text-xs leading-[1.2] px-0 py-0 pr-2 pb-[15px] mt-auto flex flex-col items-center justify-center gap-5">
					<p className="break-words m-0 p-0">
						如果您有任何问题或反馈，请随时在{" "}
						<VSCodeLink className="inline" href="https://github.com/SSYCloud/cline-chinese-ssy/issues">
							https://github.com/SSYCloud/cline-chinese-ssy
						</VSCodeLink>{" "}
						反馈或使用微信联系客服。
					</p>
					<div className="w-full flex flex-col justify-center items-center">
						<img alt="customer service" className="w-30 h-30" src="https://www.shengsuanyun.com/relation.webp" />
					</div>
					<p className="italic mt-[10px] mb-0 p-0">v{version}</p>
				</div>
			</Section>
		</div>
	)
}

export default AboutSection
