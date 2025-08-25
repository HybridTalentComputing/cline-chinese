import type { PaymentTransaction, UsageTransaction } from "@shared/ClineAccount"
import { VSCodeDataGrid, VSCodeDataGridCell, VSCodeDataGridRow } from "@vscode/webview-ui-toolkit/react"
import { useState } from "react"
import { formatDollars, formatTimestamp } from "@/utils/format"
import { TabButton } from "../mcp/configuration/McpConfigurationView"

interface CreditsHistoryTableProps {
	isLoading: boolean
	usageData: UsageTransaction[]
	paymentsData: PaymentTransaction[]
	showPayments?: boolean
}

const CreditsHistoryTable = ({ isLoading, usageData, paymentsData, showPayments }: CreditsHistoryTableProps) => {
	const [activeTab, setActiveTab] = useState<"usage" | "payments">("usage")
	console.log(usageData, "...........................")
	return (
		<div className="flex flex-col flex-grow h-full">
			{/* Tabs container */}
			<div className="flex border-b border-[var(--vscode-panel-border)]">
				<TabButton isActive={activeTab === "usage"} onClick={() => setActiveTab("usage")}>
					使用历史
				</TabButton>
				{showPayments && (
					<TabButton isActive={activeTab === "payments"} onClick={() => setActiveTab("payments")}>
						支付历史
					</TabButton>
				)}
			</div>

			{/* Content container */}
			<div className="mt-[15px] mb-[0px] rounded-md overflow-auto flex-grow">
				{isLoading ? (
					<div className="flex justify-center items-center p-4">
						<div className="text-[var(--vscode-descriptionForeground)]">加载中...</div>
					</div>
				) : (
					<>
						{activeTab === "usage" && (
							<>
								{usageData.length > 0 ? (
									<VSCodeDataGrid>
										<VSCodeDataGridRow row-type="header">
											<VSCodeDataGridCell cell-type="columnheader" grid-column="1">
												日期
											</VSCodeDataGridCell>
											<VSCodeDataGridCell cell-type="columnheader" grid-column="2">
												模型
											</VSCodeDataGridCell>
											{/* <VSCodeDataGridCell cell-type="columnheader" grid-column="3">
												Tokens Used
											</VSCodeDataGridCell> */}
											<VSCodeDataGridCell cell-type="columnheader" grid-column="3">
												使用的积分
											</VSCodeDataGridCell>
										</VSCodeDataGridRow>

										{usageData.map((row, index) => (
											<VSCodeDataGridRow key={index}>
												<VSCodeDataGridCell grid-column="1">
													{formatTimestamp(row.spentAt || "")}
												</VSCodeDataGridCell>
												<VSCodeDataGridCell grid-column="2">{`${row.model}`}</VSCodeDataGridCell>
												{/* <VSCodeDataGridCell grid-column="3">{`${row.promptTokens} → ${row.completionTokens}`}</VSCodeDataGridCell> */}
												<VSCodeDataGridCell grid-column="3">{`$${Number(row.credits).toFixed(4)}`}</VSCodeDataGridCell>
											</VSCodeDataGridRow>
										))}
									</VSCodeDataGrid>
								) : (
									<div className="flex justify-center items-center p-4">
										<div className="text-[var(--vscode-descriptionForeground)]">无使用历史</div>
									</div>
								)}
							</>
						)}

						{showPayments && activeTab === "payments" && (
							<>
								{paymentsData.length > 0 ? (
									<VSCodeDataGrid>
										<VSCodeDataGridRow row-type="header">
											<VSCodeDataGridCell cell-type="columnheader" grid-column="1">
												日期
											</VSCodeDataGridCell>
											<VSCodeDataGridCell cell-type="columnheader" grid-column="2">
												总费用
											</VSCodeDataGridCell>
											<VSCodeDataGridCell cell-type="columnheader" grid-column="3">
												积分
											</VSCodeDataGridCell>
										</VSCodeDataGridRow>

										{paymentsData.map((row, index) => (
											<VSCodeDataGridRow key={index}>
												<VSCodeDataGridCell grid-column="1">
													{formatTimestamp(row.paidAt)}
												</VSCodeDataGridCell>
												<VSCodeDataGridCell grid-column="2">{`$${formatDollars(row.amountCents)}`}</VSCodeDataGridCell>
												<VSCodeDataGridCell grid-column="3">{`${row.credits}`}</VSCodeDataGridCell>
											</VSCodeDataGridRow>
										))}
									</VSCodeDataGrid>
								) : (
									<div className="flex justify-center items-center p-4">
										<div className="text-[var(--vscode-descriptionForeground)]">无支付历史</div>
									</div>
								)}
							</>
						)}
					</>
				)}
			</div>
		</div>
	)
}

export default CreditsHistoryTable
