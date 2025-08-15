import React from "react"
import { ClineError, ClineErrorType } from "../../../../src/services/error/ClineError"
import { ProgressIndicator } from "./ChatRow"

const RetryMessage = React.memo(
	({ seconds, attempt, retryOperations }: { retryOperations: number; attempt: number; seconds?: number }) => {
		const [remainingSeconds, setRemainingSeconds] = React.useState(seconds || 0)

		React.useEffect(() => {
			if (seconds && seconds > 0) {
				setRemainingSeconds(seconds)

				const interval = setInterval(() => {
					setRemainingSeconds((prev) => {
						if (prev <= 1) {
							clearInterval(interval)
							return 0
						}
						return prev - 1
					})
				}, 1000)

				return () => clearInterval(interval)
			}
		}, [seconds])

		return (
			<span className="font-bold text-[var(--vscode-foreground)]">
				{`API 请求 (重试失败尝试 ${attempt}/${retryOperations}`}
				{remainingSeconds > 0 && `，${remainingSeconds} 秒后`}
				)...
			</span>
		)
	},
)

interface ErrorBlockTitleProps {
	cost?: number
	apiReqCancelReason?: string
	apiRequestFailedMessage?: string
	retryStatus?: {
		attempt: number
		maxAttempts: number
		delaySec?: number
		errorSnippet?: string
	}
}

export const ErrorBlockTitle = ({
	cost,
	apiReqCancelReason,
	apiRequestFailedMessage,
	retryStatus,
}: ErrorBlockTitleProps): [React.ReactElement, React.ReactElement] => {
	const getIconSpan = (iconName: string, colorClass: string) => (
		<div className="w-4 h-4 flex items-center justify-center">
			<span className={`codicon codicon-${iconName} text-base -mb-0.5 ${colorClass}`}></span>
		</div>
	)

	const icon =
		apiReqCancelReason != null ? (
			apiReqCancelReason === "user_cancelled" ? (
				getIconSpan("error", "text-[var(--vscode-descriptionForeground)]")
			) : (
				getIconSpan("error", "text-[var(--vscode-errorForeground)]")
			)
		) : cost != null ? (
			getIconSpan("check", "text-[var(--vscode-charts-green)]")
		) : apiRequestFailedMessage ? (
			getIconSpan("error", "text-[var(--vscode-errorForeground)]")
		) : (
			<ProgressIndicator />
		)

	const title = (() => {
		// Default loading state
		const details = { title: "API 请求中...", classNames: ["font-bold"] }
		// Handle cancellation states first
		if (apiReqCancelReason === "user_cancelled") {
			details.title = "API 请求已取消"
			details.classNames.push("text-[var(--vscode-foreground)]")
		} else if (apiReqCancelReason != null) {
			details.title = "API 流式传输失败"
			details.classNames.push("text-[var(--vscode-errorForeground)]")
		} else if (cost != null) {
			// Handle completed request
			details.title = "API 请求"
			details.classNames.push("text-[var(--vscode-foreground)]")
		} else if (apiRequestFailedMessage) {
			// Handle failed request
			const clineError = ClineError.parse(apiRequestFailedMessage)
			const titleText = clineError?.isErrorType(ClineErrorType.Balance) ? "积分限制已达到" : "API 请求失败"
			details.title = titleText
			details.classNames.push("font-bold text-[var(--vscode-errorForeground)]")
		} else if (retryStatus) {
			// Handle retry state
			const retryOperations = Math.max(0, retryStatus.maxAttempts - 1)
			return <RetryMessage seconds={retryStatus.delaySec} attempt={retryStatus.attempt} retryOperations={retryOperations} />
		}

		return <span className={details.classNames.join(" ")}>{details.title}</span>
	})()

	return [icon, title]
}
