import { geminiModels, ModelInfo, openRouterDefaultModelId } from "@shared/api"
import { VSCodeDropdown, VSCodeOption } from "@vscode/webview-ui-toolkit/react"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import styled from "styled-components"
import { ModelDescriptionMarkdown } from "../ModelDescriptionMarkdown"
import { formatPrice, hasThinkingBudget, supportsBrowserUse, supportsImages, supportsPromptCache } from "../utils/pricingUtils"

// ========== Styled Components ==========

const InfoRow = styled.div`
	display: flex;
	column-gap: 16px;
	row-gap: 4px;
	font-size: 12px;
	color: var(--vscode-foreground);
	margin-top: 8px;
	flex-wrap: wrap;
`

const InfoItem = styled.span`
	white-space: nowrap;
`

const InfoLabel = styled.span`
	color: var(--vscode-descriptionForeground);
`

const InfoValue = styled.span`
	font-weight: 500;
`

const CollapsibleHeader = styled.div`
	display: flex;
	align-items: center;
	gap: 6px;
	margin-top: 12px;
	cursor: pointer;
	user-select: none;
	font-size: 11px;
	font-weight: 600;
	text-transform: uppercase;
	letter-spacing: 0.5px;
	color: var(--vscode-descriptionForeground);

	&:hover {
		color: var(--vscode-foreground);
	}
`

const CollapsibleArrow = styled.span<{ $isExpanded: boolean }>`
	font-size: 10px;
	transition: transform 0.15s ease;
	transform: rotate(${({ $isExpanded }) => ($isExpanded ? "90deg" : "0deg")});
`

const CollapsibleContent = styled.div<{ $isExpanded: boolean }>`
	max-height: ${({ $isExpanded }) => ($isExpanded ? "800px" : "0")};
	overflow: ${({ $isExpanded }) => ($isExpanded ? "visible" : "hidden")};
	transition: max-height 0.2s ease;
`

const AdvancedSection = styled.div`
	padding-top: 8px;
	font-size: 12px;
	color: var(--vscode-descriptionForeground);
`

const AdvancedRow = styled.div`
	display: flex;
	justify-content: space-between;
	padding: 4px 0;
`

const AdvancedLabel = styled.span``

const AdvancedValue = styled.span`
	color: var(--vscode-foreground);
`

const ProviderRoutingContainer = styled.div`
	margin-top: 8px;
	margin-bottom: 8px;
`

const ProviderRoutingLabel = styled.label`
	display: block;
	font-size: 12px;
	color: var(--vscode-descriptionForeground);
	margin-bottom: 4px;
`

// ========== Helper Functions ==========

/**
 * Format price for compact display (e.g., "$5/M" for $5 per million tokens)
 * Price is already in per-million format from OpenRouter
 */
const formatCompactPrice = (price: number | undefined): string => {
	if (price === undefined) {
		return "N/A"
	}
	if (price === 0) {
		return "免费"
	}
	if (price < 0.01) {
		return `$${price.toFixed(4)}/M`
	}
	if (price < 1) {
		return `$${price.toFixed(2)}/M`
	}
	return `$${price % 1 === 0 ? price : price.toFixed(2)}/M`
}

/**
 * Format context window for compact display (e.g., "200K")
 */
const formatCompactContext = (contextWindow: number | undefined): string => {
	if (!contextWindow) {
		return "N/A"
	}
	if (contextWindow >= 1_000_000) {
		return `${(contextWindow / 1_000_000).toFixed(contextWindow % 1_000_000 === 0 ? 0 : 1)}M`
	}
	return `${Math.round(contextWindow / 1000)}K`
}

/**
 * Returns an array of formatted tier strings
 */
const formatTiers = (
	tiers: ModelInfo["tiers"],
	priceType: "inputPrice" | "outputPrice" | "cacheReadsPrice" | "cacheWritesPrice",
	t: (key: string) => string,
): JSX.Element[] => {
	if (!tiers || tiers.length === 0) {
		return []
	}

	return tiers
		.map((tier, index, arr) => {
			const prevLimit = index > 0 ? arr[index - 1].contextWindow : 0
			const price = tier[priceType]

			if (price === undefined) {
				return null
			}

			return (
				<span key={`tier-${tier.contextWindow}`} style={{ paddingLeft: "15px" }}>
					{formatPrice(price)}/{t("settings.providers.advanced.millionTokens")} (
					{tier.contextWindow === Number.POSITIVE_INFINITY || tier.contextWindow >= Number.MAX_SAFE_INTEGER ? (
						<span>
							{">"} {prevLimit.toLocaleString()}
						</span>
					) : (
						<span>
							{"<="} {tier.contextWindow?.toLocaleString()}
						</span>
					)}{" "}
					{t("settings.providers.advanced.tokens")}){index < arr.length - 1 && <br />}
				</span>
			)
		})
		.filter((element): element is JSX.Element => element !== null)
}

// ========== Props ==========

interface ModelInfoViewProps {
	selectedModelId: string
	modelInfo: ModelInfo
	isPopup?: boolean
	// Provider routing props (optional - only shown for Cline provider)
	providerSorting?: string
	onProviderSortingChange?: (value: string) => void
	showProviderRouting?: boolean
}

// ========== Component ==========

export const ModelInfoView = ({
	selectedModelId,
	modelInfo,
	isPopup,
	providerSorting,
	onProviderSortingChange,
	showProviderRouting,
}: ModelInfoViewProps) => {
	const { t } = useTranslation()
	const [advancedExpanded, setAdvancedExpanded] = useState(false)

	const isGemini = Object.keys(geminiModels).includes(selectedModelId)
	const hasThinkingConfig = hasThinkingBudget(modelInfo)
	const hasTiers = !!modelInfo.tiers && modelInfo.tiers.length > 0

	// Capability checks
	const hasImages = supportsImages(modelInfo)
	const hasBrowser = supportsBrowserUse(modelInfo)
	const hasCaching = !isGemini && supportsPromptCache(modelInfo)

	// Check if we have cache pricing to show in Advanced section
	const hasCachePricing = modelInfo.supportsPromptCache && (modelInfo.cacheWritesPrice || modelInfo.cacheReadsPrice)

	// 根据模型 ID 获取翻译后的描述
	const getTranslatedDescription = (): string | undefined => {
		if (!modelInfo.description) return undefined

		// 如果是 Claude Sonnet 4.5，使用翻译
		if (selectedModelId === openRouterDefaultModelId || selectedModelId === "anthropic/claude-sonnet-4.5") {
			return t("models.claudeSonnet45.description", { defaultValue: modelInfo.description })
		}

		return modelInfo.description
	}

	const translatedDescription = getTranslatedDescription()

	return (
		<div style={{ marginTop: 4 }}>
			{/* Description */}
			{translatedDescription && (
				<ModelDescriptionMarkdown isPopup={isPopup} key="description" markdown={translatedDescription} />
			)}

			{/* Compact Info Row: Context, Input, Output */}
			<InfoRow>
				{modelInfo.contextWindow !== undefined && modelInfo.contextWindow > 0 && (
					<InfoItem>
						<InfoLabel>{t("settings.providers.advanced.context")} </InfoLabel>
						<InfoValue>{formatCompactContext(modelInfo.contextWindow)}</InfoValue>
					</InfoItem>
				)}
				{modelInfo.inputPrice !== undefined && (
					<InfoItem>
						<InfoLabel>{t("settings.providers.advanced.input")} </InfoLabel>
						<InfoValue>{formatCompactPrice(modelInfo.inputPrice)}</InfoValue>
					</InfoItem>
				)}
				{modelInfo.outputPrice !== undefined && (
					<InfoItem>
						<InfoLabel>{t("settings.providers.advanced.output")} </InfoLabel>
						<InfoValue>
							{hasThinkingConfig && modelInfo.thinkingConfig?.outputPrice !== undefined
								? formatCompactPrice(modelInfo.thinkingConfig.outputPrice)
								: formatCompactPrice(modelInfo.outputPrice)}
						</InfoValue>
					</InfoItem>
				)}
			</InfoRow>

			{/* Collapsible Advanced Section */}
			<CollapsibleHeader onClick={() => setAdvancedExpanded(!advancedExpanded)}>
				<CollapsibleArrow $isExpanded={advancedExpanded}>▶</CollapsibleArrow>
				{t("settings.providers.advanced.title")}
			</CollapsibleHeader>
			<CollapsibleContent $isExpanded={advancedExpanded}>
				<AdvancedSection>
					{/* Capabilities */}
					<AdvancedRow>
						<AdvancedLabel>{t("settings.providers.advanced.images")}</AdvancedLabel>
						<AdvancedValue>
							{hasImages ? t("settings.providers.advanced.yes") : t("settings.providers.advanced.no")}
						</AdvancedValue>
					</AdvancedRow>
					<AdvancedRow>
						<AdvancedLabel>{t("settings.providers.advanced.browser")}</AdvancedLabel>
						<AdvancedValue>
							{hasBrowser ? t("settings.providers.advanced.yes") : t("settings.providers.advanced.no")}
						</AdvancedValue>
					</AdvancedRow>
					{!isGemini && (
						<AdvancedRow>
							<AdvancedLabel>{t("settings.providers.advanced.promptCaching")}</AdvancedLabel>
							<AdvancedValue>
								{hasCaching ? t("settings.providers.advanced.yes") : t("settings.providers.advanced.no")}
							</AdvancedValue>
						</AdvancedRow>
					)}

					{/* Cache Pricing */}
					{hasCachePricing && (
						<>
							{modelInfo.cacheReadsPrice !== undefined && (
								<AdvancedRow>
									<AdvancedLabel>{t("settings.providers.advanced.cacheReads")}</AdvancedLabel>
									<AdvancedValue>{formatCompactPrice(modelInfo.cacheReadsPrice)}</AdvancedValue>
								</AdvancedRow>
							)}
							{modelInfo.cacheWritesPrice !== undefined && (
								<AdvancedRow>
									<AdvancedLabel>{t("settings.providers.advanced.cacheWrites")}</AdvancedLabel>
									<AdvancedValue>{formatCompactPrice(modelInfo.cacheWritesPrice)}</AdvancedValue>
								</AdvancedRow>
							)}
						</>
					)}

					{/* Tiered Pricing */}
					{hasTiers && (
						<div style={{ marginTop: 8 }}>
							<div style={{ fontWeight: 500, marginBottom: 4 }}>
								{t("settings.providers.advanced.tieredPricing")}
							</div>
							{modelInfo.tiers && (
								<>
									<div>
										<span style={{ fontWeight: 500 }}>{t("settings.providers.advanced.input")}</span>
										<br />
										{formatTiers(modelInfo.tiers, "inputPrice", t)}
									</div>
									<div style={{ marginTop: 4 }}>
										<span style={{ fontWeight: 500 }}>{t("settings.providers.advanced.output")}</span>
										<br />
										{formatTiers(modelInfo.tiers, "outputPrice", t)}
									</div>
								</>
							)}
						</div>
					)}

					{/* Provider Routing */}
					{showProviderRouting && onProviderSortingChange && (
						<ProviderRoutingContainer>
							<ProviderRoutingLabel>{t("settings.providers.advanced.providerRouting.label")}</ProviderRoutingLabel>
							<VSCodeDropdown
								onChange={(e: any) => onProviderSortingChange(e.target.value)}
								style={{ width: "100%" }}
								value={providerSorting || ""}>
								<VSCodeOption value="">{t("settings.providers.advanced.providerRouting.default")}</VSCodeOption>
								<VSCodeOption value="price">
									{t("settings.providers.advanced.providerRouting.price")}
								</VSCodeOption>
								<VSCodeOption value="throughput">
									{t("settings.providers.advanced.providerRouting.throughput")}
								</VSCodeOption>
								<VSCodeOption value="latency">
									{t("settings.providers.advanced.providerRouting.latency")}
								</VSCodeOption>
							</VSCodeDropdown>
							<p
								style={{
									fontSize: "11px",
									marginTop: 4,
									marginBottom: 0,
									color: "var(--vscode-descriptionForeground)",
								}}>
								{!providerSorting && t("settings.providers.advanced.providerRouting.defaultDescription")}
								{providerSorting === "price" && t("settings.providers.advanced.providerRouting.priceDescription")}
								{providerSorting === "throughput" &&
									t("settings.providers.advanced.providerRouting.throughputDescription")}
								{providerSorting === "latency" &&
									t("settings.providers.advanced.providerRouting.latencyDescription")}
							</p>
						</ProviderRoutingContainer>
					)}
				</AdvancedSection>
			</CollapsibleContent>
		</div>
	)
}
