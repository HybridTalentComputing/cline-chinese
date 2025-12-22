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
		title: "onboarding.userType.title",
		description: "onboarding.userType.description",
		buttons: [
			{ text: "onboarding.button.continue", action: "next", variant: "default" },
			{ text: "onboarding.button.login", action: "signin", variant: "secondary" },
		],
	},
	[NEW_USER_TYPE.FREE]: {
		title: "onboarding.step.free.title",
		buttons: [
			{ text: "onboarding.button.createAccount", action: "signup", variant: "default" },
			{ text: "onboarding.button.back", action: "back", variant: "secondary" },
		],
	},
	[NEW_USER_TYPE.POWER]: {
		title: "onboarding.step.power.title",
		buttons: [
			{ text: "onboarding.button.createAccount", action: "signup", variant: "default" },
			{ text: "onboarding.button.back", action: "back", variant: "secondary" },
		],
	},
	[NEW_USER_TYPE.BYOK]: {
		title: "onboarding.step.byok.title",
		buttons: [
			{ text: "onboarding.button.continue", action: "done", variant: "default" },
			{ text: "onboarding.button.back", action: "back", variant: "secondary" },
		],
	},
	2: {
		title: "onboarding.step.almost.title",
		description: "onboarding.step.almost.description",
		buttons: [{ text: "onboarding.button.back", action: "back", variant: "secondary" }],
	},
} as const

export const USER_TYPE_SELECTIONS: UserTypeSelection[] = [
	{ title: "onboarding.userType.free.title", description: "onboarding.userType.free.description", type: NEW_USER_TYPE.FREE },
	{ title: "onboarding.userType.power.title", description: "onboarding.userType.power.description", type: NEW_USER_TYPE.POWER },
	{
		title: "onboarding.userType.byok.title",
		description: "onboarding.userType.byok.description",
		type: NEW_USER_TYPE.BYOK,
	},
]
