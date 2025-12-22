import { NewTaskRequest } from "@shared/proto/cline/task"
import React from "react"
import { useTranslation } from "react-i18next"
import { TaskServiceClient } from "@/services/grpc-client"
import QuickWinCard from "./QuickWinCard"
import { QuickWinTask, quickWinTasks } from "./quickWinTasks"

export const SuggestedTasks: React.FC<{ shouldShowQuickWins: boolean }> = ({ shouldShowQuickWins }) => {
	const { t } = useTranslation()
	const handleExecuteQuickWin = async (prompt: string) => {
		await TaskServiceClient.newTask(NewTaskRequest.create({ text: prompt, images: [] }))
	}

	if (shouldShowQuickWins) {
		const localizedTasks: QuickWinTask[] = quickWinTasks.map((task) => {
			switch (task.id) {
				case "nextjs_notetaking_app":
					return {
						...task,
						title: t("welcome.quickWins.nextjsTitle"),
						description: t("welcome.quickWins.nextjsDesc"),
					}
				case "terminal_cli_tool":
					return {
						...task,
						title: t("welcome.quickWins.cliTitle"),
						description: t("welcome.quickWins.cliDesc"),
					}
				case "snake_game":
					return {
						...task,
						title: t("welcome.quickWins.gameTitle"),
						description: t("welcome.quickWins.gameDesc"),
					}
				default:
					return task
			}
		})

		return (
			<div className="px-4 pt-1 pb-3 select-none">
				{" "}
				<h2 className="text-sm font-medium mb-2.5 text-center text-gray">
					{t("welcome.quickWins.title", {
						interpolation: { escapeValue: false },
					})}
				</h2>
				<div className="flex flex-col space-y-1">
					{" "}
					{localizedTasks.map((task: QuickWinTask) => (
						<QuickWinCard key={task.id} onExecute={() => handleExecuteQuickWin(task.prompt)} task={task} />
					))}
				</div>
			</div>
		)
	}
}
