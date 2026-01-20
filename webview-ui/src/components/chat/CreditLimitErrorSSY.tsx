import { AskResponseRequest } from "@shared/proto/cline/task"
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react"
import React from "react"
import VSCodeButtonLink from "@/components/common/VSCodeButtonLink"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { TaskServiceClient } from "@/services/grpc-client"

interface CreditLimitErrorSSYProps {
	currentBalance: number
	bill?: number
	message: string
	buyCreditsUrl?: string
}

const CreditLimitErrorSSY: React.FC<CreditLimitErrorSSYProps> = ({
	currentBalance = 0,
	bill = 0,
	message = "账户余额不足.",
	buyCreditsUrl = "https://console.shengsuanyun.com/user/recharge",
}) => {
	const { uriScheme } = useExtensionState()
	const callbackUrl = `${uriScheme || "vscode"}://HybridTalentComputing.cline-chinese`
	const fullPurchaseUrl = new URL(buyCreditsUrl)
	fullPurchaseUrl.searchParams.set("callback_url", callbackUrl)

	return (
		<div className="p-2 border-none rounded-md mb-2 bg-[var(--vscode-textBlockQuote-background)]">
			<div className="mb-3 font-azeret-mono">
				<div style={{ color: "var(--vscode-errorForeground)", marginBottom: "8px" }}>{message}</div>
				<div style={{ marginBottom: "12px" }}>
					<div style={{ color: "var(--vscode-foreground)" }}>
						余额: <span style={{ fontWeight: "bold" }}>{currentBalance.toFixed(2)}</span>
					</div>
					<div style={{ color: "var(--vscode-foreground)" }}>待处理账单: {bill.toFixed(2)}</div>
				</div>
			</div>

			<VSCodeButtonLink
				href={fullPurchaseUrl.toString()}
				style={{
					width: "100%",
					marginBottom: "8px",
				}}>
				<span className="codicon codicon-credit-card mr-[6px] text-[14px]" />
				充值
			</VSCodeButtonLink>

			<VSCodeButton
				appearance="secondary"
				onClick={async () => {
					try {
						await TaskServiceClient.askResponse(
							AskResponseRequest.create({
								responseType: "yesButtonClicked",
								text: "",
								images: [],
							}),
						)
					} catch (error) {
						console.error("Error invoking action:", error)
					}
				}}
				style={{
					width: "100%",
				}}>
				<span className="codicon codicon-refresh" style={{ fontSize: "14px", marginRight: "6px" }} />
				重试
			</VSCodeButton>
		</div>
	)
}

export default CreditLimitErrorSSY
