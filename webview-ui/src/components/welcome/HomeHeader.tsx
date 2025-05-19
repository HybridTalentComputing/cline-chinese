import ClineLogoVariable from "@/assets/ClineLogoVariable"
import HeroTooltip from "@/components/common/HeroTooltip"

const HomeHeader = () => {
	return (
		<div className="flex flex-col items-center mb-5">
			<div className="my-5">
				<ClineLogoVariable className="size-16" />
			</div>
			<div className="text-center flex items-center justify-center">
				<h2 className="m-0 text-[var(--vscode-font-size)]">{"我能为您做什么？"}</h2>
				<HeroTooltip
					placement="bottom"
					className="max-w-[300px]"
					content={
						"我可以逐步开发软件，包括编辑文件、探索项目、运行命令和使用浏览器。我甚至可以通过MCP工具扩展我的能力，以提供超出基本代码补全的帮助。"
					}>
					<span
						className="codicon codicon-info ml-2 cursor-pointer"
						style={{ fontSize: "14px", color: "var(--vscode-textLink-foreground)" }}
					/>
				</HeroTooltip>
			</div>
		</div>
	)
}

export default HomeHeader
