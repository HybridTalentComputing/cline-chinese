import { memo } from "react"
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react"
import { ClineMessage } from "@shared/ExtensionMessage"
import { SSYError, SSYErrorType } from "../../../../src/services/error/SSYError"
import CreditLimitError from "@/components/chat/CreditLimitError"
import { handleSignInSSY, useShengSuanYunAuth } from "@/context/ShengSuanYunAuthContext"
import CreditLimitErrorSSY from "./CreditLimitErrorSSY"

const errorColor = "var(--vscode-errorForeground)"

interface ErrorRowProps {
	message: ClineMessage
	errorType: "error" | "mistake_limit_reached" | "auto_approval_max_req_reached" | "diff_error" | "clineignore_error"
	apiRequestFailedMessage?: string
	apiReqStreamingFailedMessage?: string
}

const ErrorRow = memo(({ message, errorType, apiRequestFailedMessage, apiReqStreamingFailedMessage }: ErrorRowProps) => {
	const { userSSY: ssyUser } = useShengSuanYunAuth()

	const renderErrorContent = () => {
		switch (errorType) {
			case "error":
			case "mistake_limit_reached":
			case "auto_approval_max_req_reached":
				// Handle API request errors with special error parsing
				if (apiRequestFailedMessage || apiReqStreamingFailedMessage) {
					const ssyError = SSYError.parse(apiRequestFailedMessage || apiReqStreamingFailedMessage)
					const ssyErrorMessage = ssyError?.message
					const requestId = ssyError?._error?.request_id
					const isSSYProvider = ssyError?.providerId === "shengsuanyun"
					if (ssyError) {
						if (ssyError.isErrorType(SSYErrorType.Balance)) {
							const errorDetails = ssyError._error?.details
							return (
								<CreditLimitErrorSSY
									currentBalance={errorDetails?.balance}
									bill={errorDetails?.bill}
									message={errorDetails?.message}
									// buyCreditsUrl={errorDetails?.buy_credits_url}
								/>
							)
						}
					}

					if (ssyError?.isErrorType(SSYErrorType.RateLimit)) {
						return (
							<p className="m-0 whitespace-pre-wrap text-[var(--vscode-errorForeground)] wrap-anywhere">
								{ssyErrorMessage}
								{requestId && <div>请求 ID: {requestId}</div>}
							</p>
						)
					}

					if (ssyError?.isErrorType(SSYErrorType.QuotaExceeded)) {
						return (
							<>
								<p className="m-0 whitespace-pre-wrap text-[var(--vscode-errorForeground)] wrap-anywhere">
									{ssyErrorMessage}
									{requestId && <div>请求 ID: {requestId}</div>}
								</p>
								<p>
									点击这里，在编辑 API Key 对话框中
									<a href="https://console.shengsuanyun.com/user/keys" className="underline text-inherit">
										配置 API Key 配额
									</a>
								</p>
							</>
						)
					}

					if (ssyError?.isErrorType(SSYErrorType.TpmLimitExceeded)) {
						return (
							<>
								<p className="m-0 whitespace-pre-wrap text-[var(--vscode-errorForeground)] wrap-anywhere">
									{ssyErrorMessage}
									{requestId && <div>请求 ID: {requestId}</div>}
								</p>
								<p>
									<a href="https://console.shengsuanyun.com/user/keys" className="underline text-inherit">
										在编辑 API Key 对话框中配置 API Key TPM
									</a>
								</p>
								或
								<p>
									<a
										href="https://docs.router.shengsuanyun.com/6893249m0#1-tpm-tokens-per-minute-%E9%99%90%E5%88%B6%E8%B6%85%E5%87%BA"
										className="underline text-inherit">
										了解更多关于TPM (Tokens Per Minute) 限制超出错误的说明
									</a>
								</p>
							</>
						)
					}
					if (ssyError?.isErrorType(SSYErrorType.RpmLimitExceeded)) {
						return (
							<>
								<p className="m-0 whitespace-pre-wrap text-[var(--vscode-errorForeground)] wrap-anywhere">
									{ssyErrorMessage}
									{requestId && <div>请求 ID: {requestId}</div>}
								</p>
								<p>
									<a href="https://console.shengsuanyun.com/user/keys" className="underline text-inherit">
										在编辑 API Key 对话框中配置 API Key RPM
									</a>
									或
								</p>
								<p>
									<a
										href="https://docs.router.shengsuanyun.com/6893249m0#2-rpm-requests-per-minute-%E9%99%90%E5%88%B6%E8%B6%85%E5%87%BA"
										className="underline text-inherit">
										了解更多关于RPM (Requests Per Minute) 限制超出错误的说明
									</a>
								</p>
							</>
						)
					}

					// Default error display
					return (
						<p className="m-0 whitespace-pre-wrap text-[var(--vscode-errorForeground)] wrap-anywhere">
							{ssyErrorMessage}
							{requestId && <div>请求 ID: {requestId}</div>}
							{ssyErrorMessage?.toLowerCase()?.includes("powershell") && (
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
							{ssyError?.isErrorType(SSYErrorType.Auth) && (
								<>
									<br />
									<br />
									{/* The user is signed in or not using cline provider */}
									{ssyUser && !isSSYProvider ? (
										<span className="mb-4 text-[var(--vscode-descriptionForeground)]">
											(点击下方的“重试”)
										</span>
									) : (
										<VSCodeButton onClick={handleSignInSSY} className="w-full mb-4">
											登录 Cline 胜算云
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
