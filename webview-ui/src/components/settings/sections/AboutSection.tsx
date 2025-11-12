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
				<div className="flex px-4 flex-col gap-2">
					<h2 className="text-lg font-semibold">Cline v{version}</h2>
					<p>
						一款可以使用命令行界面和编辑器的AI助手。Cline可以逐步处理复杂的软件开发任务，它使用的工具包括创建和编辑文件、浏览大型项目、使用浏览器，以及执行终端命令（在您授予权限后）。
					</p>

					<h3 className="text-md font-semibold">社区 & 支持</h3>
					<p>
						<VSCodeLink href="https://x.com/cline">X</VSCodeLink>
						{" • "}
						<VSCodeLink href="https://discord.gg/cline">Discord</VSCodeLink>
						{" • "}
						<VSCodeLink href="https://www.reddit.com/r/cline/"> r/cline</VSCodeLink>
					</p>

					<h3 className="text-md font-semibold">Development</h3>
					<p>
						<VSCodeLink href="https://github.com/cline/cline">GitHub</VSCodeLink>
						{" • "}
						<VSCodeLink href="https://github.com/cline/cline/issues"> Issues</VSCodeLink>
						{" • "}
						<VSCodeLink href="https://github.com/cline/cline/discussions/categories/feature-requests?discussions_q=is%3Aopen+category%3A%22Feature+Requests%22+sort%3Atop">
							{" "}
							Feature Requests
						</VSCodeLink>
					</p>

					<h3 className="text-md font-semibold">资源</h3>
					<p>
						<VSCodeLink href="https://docs.cline.bot/getting-started/for-new-coders">文档</VSCodeLink>
						{" • "}
						<VSCodeLink href="https://router.shengsuanyun.com/model">胜算云</VSCodeLink>
					</p>
				</div>
			</Section>
		</div>
	)
}

export default AboutSection
