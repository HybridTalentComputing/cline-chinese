import type { TFunction } from "i18next"

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

export const getStepConfig = (t: TFunction) => ({
	0: {
		title: t("onboarding.howWillYouUse"),
		description: t("onboarding.selectOption"),
		buttons: [
			{ text: t("onboarding.continue"), action: "next", variant: "default" },
			{ text: t("onboarding.loginToCline"), action: "signin", variant: "secondary" },
		],
	},
	[NEW_USER_TYPE.FREE]: {
		title: t("onboarding.selectFreeModel"),
		buttons: [
			{ text: t("onboarding.createMyAccount"), action: "signup", variant: "default" },
			{ text: t("onboarding.back"), action: "back", variant: "secondary" },
		],
	},
	[NEW_USER_TYPE.POWER]: {
		title: t("onboarding.selectYourModel"),
		buttons: [
			{ text: t("onboarding.createMyAccount"), action: "signup", variant: "default" },
			{ text: t("onboarding.back"), action: "back", variant: "secondary" },
		],
	},
	[NEW_USER_TYPE.BYOK]: {
		title: t("onboarding.configureYourProvider"),
		buttons: [
			{ text: t("onboarding.continue"), action: "done", variant: "default" },
			{ text: t("onboarding.back"), action: "back", variant: "secondary" },
		],
	},
	2: {
		title: t("onboarding.almostThere"),
		description: t("onboarding.completeInBrowser"),
		buttons: [{ text: t("onboarding.back"), action: "back", variant: "secondary" }],
	},
})

export const getUserTypeSelections = (t: TFunction): UserTypeSelection[] => [
	{ title: t("onboarding.absolutelyFree"), description: t("onboarding.getStartedNoCost"), type: NEW_USER_TYPE.FREE },
	{ title: t("onboarding.frontierModel"), description: t("onboarding.frontierModelDescription"), type: NEW_USER_TYPE.POWER },
	{ title: t("onboarding.bringOwnKey"), description: t("onboarding.bringOwnKeyDescription"), type: NEW_USER_TYPE.BYOK },
]
