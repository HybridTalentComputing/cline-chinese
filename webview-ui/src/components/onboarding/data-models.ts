import type { OpenRouterModelInfo } from "@shared/proto/cline/models"
import type { OnboardingModel, OnboardingModelGroup } from "@shared/proto/cline/state"
import { TFunction } from "i18next"

export interface OnboardingModelsByGroup {
	power: ModelGroup[]
}

interface ModelGroup {
	group: string
	models: OnboardingModel[]
}

export function getClineUIOnboardingGroups(groupedModels: OnboardingModelGroup): OnboardingModelsByGroup {
	const { models } = groupedModels

	const frontierModels = models.filter((m) => m.group === "frontier")
	const openSourceModels = models.filter((m) => m.group === "open source")

	return {
		power: [
			...(frontierModels.length > 0 ? [{ group: "frontier", models: frontierModels }] : []),
			...(openSourceModels.length > 0 ? [{ group: "open source", models: openSourceModels }] : []),
		],
	}
}

export function getPriceRange(modelInfo: OpenRouterModelInfo, t: TFunction): string {
	const prompt = Number(modelInfo.inputPrice ?? 0)
	const completion = Number(modelInfo.outputPrice ?? 0)
	const cost = prompt + completion
	if (cost === 0) {
		return t("onboarding.model.priceRange.free")
	}
	if (cost < 10) {
		return "$"
	}
	if (cost > 50) {
		return "$$$"
	}
	return "$$"
}

export function getOverviewLabel(overview: number, t: TFunction): string {
	if (overview >= 95) {
		return t("onboarding.model.overviewLabels.topPerformer")
	}
	if (overview >= 80) {
		return t("onboarding.model.overviewLabels.great")
	}
	if (overview >= 60) {
		return t("onboarding.model.overviewLabels.good")
	}
	if (overview >= 50) {
		return t("onboarding.model.overviewLabels.average")
	}
	return t("onboarding.model.overviewLabels.belowAverage")
}

export function getCapabilities(modelInfo: OpenRouterModelInfo, t: TFunction): string[] {
	const capabilities = new Set<string>()
	if (modelInfo.supportsImages) {
		capabilities.add(t("onboarding.model.capabilities.images"))
	}
	if (modelInfo.supportsPromptCache) {
		capabilities.add(t("onboarding.model.capabilities.promptCache"))
	}
	capabilities.add(t("onboarding.model.capabilities.tools"))
	return Array.from(capabilities)
}

export function getSpeedLabel(t: TFunction, latency?: number): string {
	if (!latency) {
		return t("onboarding.model.speedLabels.average")
	}
	if (latency < 1) {
		return t("onboarding.model.speedLabels.instant")
	}
	if (latency < 2) {
		return t("onboarding.model.speedLabels.fast")
	}
	if (latency > 5) {
		return t("onboarding.model.speedLabels.slow")
	}

	return t("onboarding.model.speedLabels.average")
}
