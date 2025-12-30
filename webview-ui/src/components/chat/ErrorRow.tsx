import { ClineMessage } from "@shared/ExtensionMessage"
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react"
import { memo } from "react"
import CreditLimitError from "@/components/chat/CreditLimitError"
import { useClineSignIn } from "@/context/ClineAuthContext"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { SSYError, SSYErrorType } from "../../../../src/services/error/SSYError"

const _errorColor = "var(--vscode-errorForeground)"

interface ErrorRowProps {
	message: ClineMessage
	errorType: "error" | "mistake_limit_reached" | "diff_error" | "clineignore_error"
	apiRequestFailedMessage?: string
	apiReqStreamingFailedMessage?: string
}

const ErrorRow = memo(({ message, errorType, apiRequestFailedMessage, apiReqStreamingFailedMessage }: ErrorRowProps) => {
	const { userInfo } = useExtensionState()
	const rawApiError = apiRequestFailedMessage || apiReqStreamingFailedMessage
	const { isLoginLoading, handleSignIn } = useClineSignIn()

	const renderErrorContent = () => {
		switch (errorType) {
			case "error":
			case "mistake_limit_reached":
				// Handle API request errors with special error parsing
				if (rawApiError) {
					// FIXME: ClineError parsing should not be applied to non-Cline providers, but it seems we're using clineErrorMessage below in the default error display
					const ssyError = SSYError.parse(rawApiError)
					const errorMessage = ssyError?._error?.message || ssyError?.message || rawApiError
					const requestId = ssyError?._error?.request_id
					const providerId = ssyError?.providerId || ssyError?._error?.providerId
					const isClineProvider = providerId === "cline"
					const errorCode = ssyError?._error?.code

					if (ssyError?.isErrorType(SSYErrorType.Balance)) {
						const errorDetails = ssyError._error?.details
						return (
							<CreditLimitError
								buyCreditsUrl={errorDetails?.buy_credits_url}
								currentBalance={errorDetails?.current_balance}
								message={errorDetails?.message}
								totalPromotions={errorDetails?.total_promotions}
								totalSpent={errorDetails?.total_spent}
							/>
						)
					}

					if (ssyError?.isErrorType(SSYErrorType.RateLimit)) {
						return (
							<p className="m-0 whitespace-pre-wrap text-(--vscode-errorForeground) wrap-anywhere">
								{errorMessage}
								{requestId && <div>请求 ID: {requestId}</div>}
							</p>
						)
					}

					return (
						<p className="m-0 whitespace-pre-wrap text-error wrap-anywhere flex flex-col gap-3">
							{/* Display the well-formatted error extracted from the ClineError instance */}

							<header>
								{providerId && <span className="uppercase">[{providerId}] </span>}
								{errorCode && <span>{errorCode}</span>}
								{errorMessage}
								{requestId && <div>Request ID: {requestId}</div>}
							</header>

							{/* Windows Powershell Issue */}
							{errorMessage?.toLowerCase()?.includes("powershell") && (
								<div>
									It seems like you're having Windows PowerShell issues, please see this{" "}
									<a
										className="underline text-inherit"
										href="https://github.com/cline/cline/wiki/TroubleShooting-%E2%80%90-%22PowerShell-is-not-recognized-as-an-internal-or-external-command%22">
										故障排除指南
									</a>
									.
								</div>
							)}

							{/* Display raw API error if different from parsed error message */}
							{errorMessage !== rawApiError && <div>{rawApiError}</div>}

							{/* Display Login button for non-logged in users using the Cline provider */}
							<div>
								{/* The user is signed in or not using cline provider */}
								{isClineProvider && !userInfo ? (
									<VSCodeButton className="w-full mb-4" disabled={isLoginLoading} onClick={handleSignIn}>
										Sign in to Cline
										{isLoginLoading && (
											<span className="ml-1 animate-spin">
												<span className="codicon codicon-refresh"></span>
											</span>
										)}
									</VSCodeButton>
								) : (
									<span className="mb-4 text-description">(Click "Retry" below)</span>
								)}
							</div>
						</p>
					)
				}

				// Regular error message
				return <p className="m-0 whitespace-pre-wrap text-(--vscode-errorForeground) wrap-anywhere">{message.text}</p>

			case "diff_error":
				return (
					<div className="flex flex-col p-2 rounded text-xs opacity-80 bg-(--vscode-textBlockQuote-background) text-(--vscode-foreground)">
						<div>该模型使用的搜索模式与文件中的任何内容均不匹配。正在重试...</div>
					</div>
				)

			case "clineignore_error":
				return (
					<div className="flex flex-col p-2 rounded text-xs bg-(--vscode-textBlockQuote-background) text-(--vscode-foreground) opacity-80">
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
