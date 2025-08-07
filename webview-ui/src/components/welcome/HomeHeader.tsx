import ClineLogoVariable from "@/assets/ClineLogoVariable"
import HeroTooltip from "@/components/common/HeroTooltip"
import { UiServiceClient } from "@/services/grpc-client"
import { EmptyRequest } from "@shared/proto/cline/common"

interface HomeHeaderProps {
	shouldShowQuickWins?: boolean
}

const HomeHeader = ({ shouldShowQuickWins = false }: HomeHeaderProps) => {
	const handleTakeATour = async () => {
		try {
			await UiServiceClient.openWalkthrough(EmptyRequest.create())
		} catch (error) {
			console.error("Error opening walkthrough:", error)
		}
	}

	return (
		<div className="flex flex-col items-center mb-5">
			<div className="my-5">
				<ClineLogoVariable className="size-16" />
			</div>
			<div className="text-center flex items-center justify-center">
				<h2 className="m-0 text-[var(--vscode-font-size)]">{"我能为你做什么？"}</h2>
				<HeroTooltip
					placement="bottom"
					className="max-w-[300px]"
					content={
						"我可以通过逐步编辑文件、探索项目、运行命令和使用浏览器来开发软件。我甚至可以通过使用MCP工具扩展我的能力，帮助实现超出基本代码补全的功能。"
					}>
					<span
						className="codicon codicon-info ml-2 cursor-pointer"
						style={{ fontSize: "14px", color: "var(--vscode-textLink-foreground)" }}
					/>
				</HeroTooltip>
			</div>
			{shouldShowQuickWins && (
				<div className="mt-4">
					<button
						onClick={handleTakeATour}
						className="flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--vscode-panel-border)] bg-white/[0.02] hover:bg-[var(--vscode-list-hoverBackground)] transition-colors duration-150 ease-in-out text-[var(--vscode-editor-foreground)] text-sm font-medium cursor-pointer">
						Take a Tour
						<span className="codicon codicon-play scale-90"></span>
					</button>
				</div>
			)}
		</div>
	)
}

export default HomeHeader
