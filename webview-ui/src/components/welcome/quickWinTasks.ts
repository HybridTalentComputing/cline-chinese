export interface QuickWinTask {
	id: string
	title: string
	description: string
	icon?: string
	actionCommand: string
	prompt: string
	buttonText?: string
}

export const quickWinTasks: QuickWinTask[] = [
	{
		id: "nextjs_notetaking_app",
		title: "新建一个 Next.js 应用",
		description: "使用 Next.js 和 Tailwind CSS 创建一个漂亮的笔记应用程序。",
		icon: "WebAppIcon",
		actionCommand: "cline/createNextJsApp",
		prompt: "使用 Tailwind CSS 进行样式设计，制作一个美观的 Next.js 笔记应用。设置基本结构以及用于添加和查看笔记的简洁 UI。",
		buttonText: ">",
	},
	{
		id: "terminal_cli_tool",
		title: "制作 CLI 工具",
		description: "开发一个强大的终端 CLI 来自动执行一项很酷的任务。",
		icon: "TerminalIcon",
		actionCommand: "cline/createCliTool",
		prompt: "使用 Node.js 制作一个终端 CLI 工具，使用免费天气 API 获取给定城市的当前天气，并以用户友好的格式显示。",
		buttonText: ">",
	},
	{
		id: "snake_game",
		title: "开发一个游戏",
		description: "编写一个在浏览器中运行的经典贪吃蛇游戏。",
		icon: "GameIcon",
		actionCommand: "cline/createSnakeGame",
		prompt: "使用 HTML、CSS 和 JavaScript 制作一款经典的贪吃蛇游戏。该游戏应该可以在浏览器中运行，并支持键盘操控贪吃蛇、计分系统以及游戏结束状态。",
		buttonText: ">",
	},
]
