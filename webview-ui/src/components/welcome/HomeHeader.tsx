import { EmptyRequest } from "@shared/proto/cline/common"
import { InfoIcon } from "lucide-react"
import ClineLogoVariable from "@/assets/ClineLogoVariable"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { UiServiceClient } from "@/services/grpc-client"

interface HomeHeaderProps {
	shouldShowQuickWins?: boolean
}

const HomeHeader = ({ shouldShowQuickWins = false }: HomeHeaderProps) => {
	const { environment } = useExtensionState()

	const handleTakeATour = async () => {
		try {
			await UiServiceClient.openWalkthrough(EmptyRequest.create())
		} catch (error) {
			console.error("Error opening walkthrough:", error)
		}
	}

	return (
		<div className="flex flex-col items-center mb-5">
			<div className="my-7">
				<ClineLogoVariable className="size-20" environment={environment} />
			</div>
			<div className="text-center flex items-center justify-center">
				<h1 className="m-0 font-bold">我能做什么?</h1>
				<Tooltip>
					<TooltipContent side="bottom">
						我可以逐步开发软件，包括编辑文件、浏览项目、运行命令和使用浏览器。我甚至可以使用 MCP
						工具扩展我的能力，使其超越基本的代码补全。
					</TooltipContent>
					<TooltipTrigger asChild>
						<InfoIcon className="ml-2 cursor-pointer text-link text-sm size-2" />
					</TooltipTrigger>
				</Tooltip>
			</div>
			{shouldShowQuickWins && (
				<div className="mt-4">
					<button
						className="flex items-center gap-2 px-4 py-2 rounded-full border border-border-panel bg-white/2 hover:bg-list-background-hover transition-colors duration-150 ease-in-out text-code-foreground text-sm font-medium cursor-pointer"
						onClick={handleTakeATour}
						type="button">
						查看教程
						<span className="codicon codicon-play scale-90"></span>
					</button>
				</div>
			)}
		</div>
	)
}

export default HomeHeader
