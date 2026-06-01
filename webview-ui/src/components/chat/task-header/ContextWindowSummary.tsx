import { ChevronDownIcon, ChevronRightIcon } from "lucide-react"
import React, { memo, useCallback, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { formatLargeNumber as formatTokenNumber } from "@/utils/format"

interface TokenUsageInfoProps {
	tokensIn?: number
	tokensOut?: number
	cacheWrites?: number
	cacheReads?: number
}

interface TokenDetail {
	title: string
	value?: number
	icon: string
}

interface TaskContextWindowButtonsProps extends TokenUsageInfoProps {
	percentage: number
	tokenUsed: number
	contextWindow: number
	autoCompactThreshold?: number
	isThresholdChanged?: boolean
	isThresholdFadingOut?: boolean
}

// New accordion item component
const AccordionItem = memo<{
	title: string
	value: React.ReactNode
	isExpanded: boolean
	onToggle: (event?: React.MouseEvent) => void
	children?: React.ReactNode
}>(({ title, value, isExpanded, onToggle, children }) => {
	const handleClick = useCallback(
		(event: React.MouseEvent) => {
			event.preventDefault()
			event.stopPropagation()
			onToggle(event)
		},
		[onToggle],
	)

	return (
		<div className="flex flex-col w-full">
			<div
				className="flex justify-between items-center gap-1 cursor-pointer hover:bg-foreground/5 rounded p-0.5 transition-colors w-full"
				onClick={handleClick}>
				<div className="flex items-center gap-1">
					{isExpanded ? <ChevronDownIcon size={12} /> : <ChevronRightIcon size={12} />}
					<div className="font-semibold">{title}</div>
				</div>
				<div className="text-muted-foreground">{value}</div>
			</div>
			{isExpanded && children && <div className="ml-5 my-1 text-xs text-muted-foreground">{children}</div>}
		</div>
	)
})
AccordionItem.displayName = "AccordionItem"

const useTokenDetailTitles = () => {
	const { t } = useTranslation("common")
	return [
		{ title: t("contextWindow.promptTokens"), icon: "codicon-arrow-up" },
		{ title: t("contextWindow.completionTokens"), icon: "codicon-arrow-down" },
		{ title: t("contextWindow.cacheWrites"), icon: "codicon-arrow-left" },
		{ title: t("contextWindow.cacheReads"), icon: "codicon-arrow-right" },
	]
}

const TokenUsageDetails = memo<TokenUsageInfoProps>(({ tokensIn, tokensOut, cacheWrites, cacheReads }) => {
	const { t } = useTranslation("common")
	const TOKEN_DETAILS_CONFIG = useTokenDetailTitles()
	const contextTokenDetails = useMemo(() => {
		const values = [tokensIn, tokensOut, cacheWrites || 0, cacheReads || 0]
		return TOKEN_DETAILS_CONFIG.map((config, index) => ({ ...config, value: values[index] })).filter((item) => item.value)
	}, [tokensIn, tokensOut, cacheWrites, cacheReads, TOKEN_DETAILS_CONFIG])

	if (!tokensIn) {
		return <div>{t("contextWindow.noTokenData")}</div>
	}

	return (
		<div className="space-y-1">
			{contextTokenDetails.map((item) => (
				<div className="flex justify-between" key={item.title}>
					<span>{item.title}</span>
					<span className="font-mono">{formatTokenNumber(item.value || 0)}</span>
				</div>
			))}
		</div>
	)
})
TokenUsageDetails.displayName = "TokenUsageDetails"

export const ContextWindowSummary: React.FC<TaskContextWindowButtonsProps> = ({
	contextWindow,
	tokenUsed,
	tokensIn,
	tokensOut,
	cacheWrites,
	cacheReads,
	percentage,
	autoCompactThreshold = 0,
}) => {
	const { t } = useTranslation("common")
	// Accordion state
	const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())

	const toggleSection = useCallback((section: string, event?: React.MouseEvent) => {
		if (event) {
			event.preventDefault()
			event.stopPropagation()
		}
		setExpandedSections((prev) => {
			const newSet = new Set(prev)
			if (newSet.has(section)) {
				newSet.delete(section)
			} else {
				newSet.add(section)
			}
			return newSet
		})
	}, [])

	const totalTokens = (tokensIn || 0) + (tokensOut || 0) + (cacheWrites || 0) + (cacheReads || 0)

	return (
		<div className="context-window-tooltip-content flex flex-col gap-2 bg-menu rounded shadow-sm z-100 w-60 p-1">
			{autoCompactThreshold > 0 && (
				<AccordionItem
					isExpanded={expandedSections.has("threshold")}
					onToggle={(event) => toggleSection("threshold", event)}
					title={t("contextWindow.autoCondenseThreshold")}
					value={<span className="text-muted-foreground">{`${(autoCompactThreshold * 100).toFixed(0)}%`}</span>}>
					<div className="space-y-1">
						<p className="text-xs leading-relaxed text-white">
							Click on the context window bar to set a new threshold.
						</p>
						<p className="text-xs leading-relaxed mt-0 mb-0">
							When the context window usage exceeds this threshold, the task will be automatically condensed.
						</p>
					</div>
				</AccordionItem>
			)}

			<AccordionItem
				isExpanded={expandedSections.has("context")}
				onToggle={(event) => toggleSection("context", event)}
				title={t("contextWindow.contextWindow")}
				value={percentage ? `${percentage.toFixed(1)}%` : formatTokenNumber(contextWindow)}>
				<div className="space-y-1">
					<div className="flex justify-between">
						<span>{t("contextWindow.used")}</span>
						<span className="font-mono">{formatTokenNumber(tokenUsed)}</span>
					</div>
					<div className="flex justify-between">
						<span>{t("contextWindow.total")}</span>
						<span className="font-mono">{formatTokenNumber(contextWindow)}</span>
					</div>
					<div className="flex justify-between">
						<span>{t("contextWindow.remaining")}</span>
						<span className="font-mono">{formatTokenNumber(contextWindow - tokenUsed)}</span>
					</div>
				</div>
			</AccordionItem>

			{totalTokens > 0 && (
				<AccordionItem
					isExpanded={expandedSections.has("tokens")}
					onToggle={(event) => toggleSection("tokens", event)}
					title={t("contextWindow.tokenUsage")}
					value={`${formatTokenNumber(totalTokens)}`}>
					<TokenUsageDetails
						cacheReads={cacheReads}
						cacheWrites={cacheWrites}
						tokensIn={tokensIn}
						tokensOut={tokensOut}
					/>
				</AccordionItem>
			)}
		</div>
	)
}
