import { memo } from "react"
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react"
import { ClineMessage } from "@shared/ExtensionMessage"
import { ClineError, ClineErrorType } from "../../../../src/services/error/ClineError"
import CreditLimitError from "@/components/chat/CreditLimitError"
import { handleSignIn, useClineAuth } from "@/context/ClineAuthContext"

const errorColor = "var(--vscode-errorForeground)"

interface ErrorRowProps {
	message: ClineMessage
	errorType: "error" | "mistake_limit_reached" | "auto_approval_max_req_reached" | "diff_error" | "clineignore_error"
	apiRequestFailedMessage?: string
	apiReqStreamingFailedMessage?: string
}

const ErrorRow = memo(({ message, errorType, apiRequestFailedMessage, apiReqStreamingFailedMessage }: ErrorRowProps) => {
	const { clineUser } = useClineAuth()

	const renderErrorContent = () => {
		switch (errorType) {
			case "error":
			case "mistake_limit_reached":
			case "auto_approval_max_req_reached":
				// Handle API request errors with special error parsing
				if (apiRequestFailedMessage || apiReqStreamingFailedMessage) {
					const clineError = ClineError.parse(apiRequestFailedMessage || apiReqStreamingFailedMessage)
					const clineErrorMessage = clineError?.message
					const requestId = clineError?._error?.request_id
					const isClineProvider = clineError?.providerId === "cline"

					if (clineError) {
						if (clineError.isErrorType(ClineErrorType.Balance)) {
							const errorDetails = clineError._error?.details
							return (
								<CreditLimitError
									currentBalance={errorDetails?.current_balance}
									totalSpent={errorDetails?.total_spent}
									totalPromotions={errorDetails?.total_promotions}
									message={errorDetails?.message}
									buyCreditsUrl={errorDetails?.buy_credits_url}
								/>
							)
						}
					}

					if (clineError?.isErrorType(ClineErrorType.RateLimit)) {
						return (
							<p className="m-0 whitespace-pre-wrap text-[var(--vscode-errorForeground)] wrap-anywhere">
								{clineErrorMessage}
								{requestId && <div>Request ID: {requestId}</div>}
							</p>
						)
					}

					// Default error display
					return (
						<p className="m-0 whitespace-pre-wrap text-[var(--vscode-errorForeground)] wrap-anywhere">
							{clineErrorMessage}
							{requestId && <div>Request ID: {requestId}</div>}
							{clineErrorMessage?.toLowerCase()?.includes("powershell") && (
								<>
									<br />
									<br />
									看起来您遇到了 Windows PowerShell 问题，请参阅此{" "}
									<a
										href="https://github.com/cline/cline/wiki/TroubleShooting-%E2%80%90-%22PowerShell-is-not-recognized-as-an-internal-or-external-command%22"
										className="underline text-inherit">
										故障排除指南
									</a>
									.
								</>
							)}
							{clineError?.isErrorType(ClineErrorType.Auth) && (
								<>
									<br />
									<br />
									{/* The user is signed in or not using cline provider */}
									{clineUser && !isClineProvider ? (
										<span className="mb-4 text-[var(--vscode-descriptionForeground)]">
											(点击下方的“重试”)
										</span>
									) : (
										<VSCodeButton onClick={handleSignIn} className="w-full mb-4">
											登录 Cline
										</VSCodeButton>
									)}
								</>
							)}
						</p>
					)
				}

				// Regular error message
				return (
					<p className="m-0 whitespace-pre-wrap text-[var(--vscode-errorForeground)] wrap-anywhere">{message.text}</p>
				)

			case "diff_error":
				return (
					<div className="flex flex-col p-2 rounded text-xs opacity-80 bg-[var(--vscode-textBlockQuote-background)] text-[var(--vscode-foreground)]">
						<div>该模型使用的搜索模式与文件中的任何内容均不匹配。正在重试...</div>
					</div>
				)

			case "clineignore_error":
				return (
					<div className="flex flex-col p-2 rounded text-xs bg-[var(--vscode-textBlockQuote-background)] text-[var(--vscode-foreground)] opacity-80">
						<div>
							Cline 访问 <code>{message.text}</code> 被 <code>.clineignore</code>配置阻拦
						</div>
					</div>
				)

			default:
				return null
		}
	}

	// For diff_error and clineignore_error, we don't show the header separately
	if (errorType === "diff_error" || errorType === "clineignore_error") {
		return <>{renderErrorContent()}</>
	}

	// For other error types, show header + content
	return <>{renderErrorContent()}</>
})

export default ErrorRow
