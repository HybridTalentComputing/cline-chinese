import VSCodeButtonLink from "@/components/common/VSCodeButtonLink"
import { TaskServiceClient } from "@/services/grpc-client"
import { AskResponseRequest } from "@shared/proto/task"
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react"
import React from "react"

interface CreditLimitErrorProps {
	currentBalance: number
	totalSpent: number
	totalPromotions: number
	message: string
}

const CreditLimitError: React.FC<CreditLimitErrorProps> = ({ currentBalance, totalSpent, totalPromotions, message }) => {
	return (
		<div
			style={{
				backgroundColor: "var(--vscode-textBlockQuote-background)",
				padding: "12px",
				borderRadius: "4px",
				marginBottom: "12px",
			}}>
			<div style={{ color: "var(--vscode-errorForeground)", marginBottom: "8px" }}>{message}</div>
			<div style={{ marginBottom: "12px" }}>
				<div style={{ color: "var(--vscode-foreground)" }}>
					余额: <span style={{ fontWeight: "bold" }}>${currentBalance.toFixed(2)}</span>
				</div>
				<div style={{ color: "var(--vscode-foreground)" }}>使用: ${totalSpent.toFixed(2)}</div>
				<div style={{ color: "var(--vscode-foreground)" }}>促销总额: ${totalPromotions.toFixed(2)}</div>
			</div>

			<VSCodeButtonLink
				href="https://app.cline.bot/credits/#buy"
				style={{
					width: "100%",
					marginBottom: "8px",
				}}>
				<span className="codicon codicon-credit-card" style={{ fontSize: "14px", marginRight: "6px" }} />
				充值
			</VSCodeButtonLink>

			<VSCodeButton
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
				appearance="secondary"
				style={{
					width: "100%",
				}}>
				<span className="codicon codicon-refresh" style={{ fontSize: "14px", marginRight: "6px" }} />
				重试
			</VSCodeButton>
		</div>
	)
}

export default CreditLimitError
