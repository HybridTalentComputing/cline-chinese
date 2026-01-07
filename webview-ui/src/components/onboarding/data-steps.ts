export enum NEW_USER_TYPE {
	FREE = "free",
	POWER = "power",
	BYOK = "byok",
}

type UserTypeSelection = {
	title: string
	description: string
	type: NEW_USER_TYPE
}

export const STEP_CONFIG = {
	0: {
		title: "你想怎么使用 Cline?",
		description: "选择一个下面的选项来开始.",
		buttons: [
			{ text: "继续", action: "next", variant: "default" },
			{ text: "登录到胜算云", action: "signin", variant: "secondary" },
		],
	},
	[NEW_USER_TYPE.FREE]: {
		title: "绝对免费",
		buttons: [
			{ text: "创建账户", action: "signup", variant: "default" },
			{ text: "返回", action: "back", variant: "secondary" },
		],
	},
	[NEW_USER_TYPE.POWER]: {
		title: "选择你的模型",
		buttons: [
			{ text: "创建账户", action: "signup", variant: "default" },
			{ text: "返回", action: "back", variant: "secondary" },
		],
	},
	[NEW_USER_TYPE.BYOK]: {
		title: "配置你的提供商 API 密钥",
		buttons: [
			{ text: "继续", action: "done", variant: "default" },
			{ text: "返回", action: "back", variant: "secondary" },
		],
	},
	2: {
		title: "几乎完成了！",
		description: "在浏览器中完成账户创建。然后回到这里完成最后的设置。",
		buttons: [{ text: "返回", action: "back", variant: "secondary" }],
	},
} as const

export const USER_TYPE_SELECTIONS: UserTypeSelection[] = [
	{ title: "绝对免费", description: "免费开始使用", type: NEW_USER_TYPE.FREE },
	{ title: "前沿模型", description: "Claude 4.5, GPT-5.1 Codex Max, 等", type: NEW_USER_TYPE.POWER },
	{ title: "使用你自己的 API Key", description: "使用你自己的供应商Key 来使用 Cline", type: NEW_USER_TYPE.BYOK },
]
