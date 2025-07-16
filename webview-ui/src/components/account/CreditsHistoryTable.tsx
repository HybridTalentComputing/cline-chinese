import { VSCodeDataGrid, VSCodeDataGridRow, VSCodeDataGridCell } from "@vscode/webview-ui-toolkit/react"
import { useState } from "react"
import { TabButton } from "../mcp/configuration/McpConfigurationView"
import { UsageTransaction, PaymentTransaction } from "@shared/ClineAccount"
import { formatDollars, formatTimestamp } from "@/utils/format"

interface CreditsHistoryTableProps {
	isLoading: boolean
	usageData: UsageTransaction[]
	paymentsData: PaymentTransaction[]
	showPayments?: boolean
}

const CreditsHistoryTable = ({ isLoading, usageData, paymentsData, showPayments }: CreditsHistoryTableProps) => {
	const [activeTab, setActiveTab] = useState<"usage" | "payments">("usage")
	return (
		<div className="flex flex-col flex-grow h-full">
			{/* Tabs container */}
			<div className="flex border-b border-[var(--vscode-panel-border)]">
				<TabButton isActive={activeTab === "usage"} onClick={() => setActiveTab("usage")}>
					使用记录
				</TabButton>
				<TabButton isActive={activeTab === "payments"} onClick={() => setActiveTab("payments")}>
					支付记录
				</TabButton>
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
								{usageData && usageData.length > 0 ? (
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
												已使用
											</VSCodeDataGridCell>
										</VSCodeDataGridRow>

										{usageData &&
											usageData.map((row, index) => (
												<VSCodeDataGridRow key={index}>
													<VSCodeDataGridCell grid-column="1">
														{formatTimestamp(row.spentAt || "", "zh-CN")}
													</VSCodeDataGridCell>
													<VSCodeDataGridCell grid-column="2">{row.model}</VSCodeDataGridCell>
													{/* <VSCodeDataGridCell grid-column="3">{`${row.promptTokens} → ${row.completionTokens}`}</VSCodeDataGridCell> */}
													<VSCodeDataGridCell grid-column="3">{`$${Number(row.credits || "0").toFixed(7)}`}</VSCodeDataGridCell>
												</VSCodeDataGridRow>
											))}
									</VSCodeDataGrid>
								) : (
									<div className="flex justify-center items-center p-4">
										<div className="text-[var(--vscode-descriptionForeground)]">还没有使用记录</div>
									</div>
								)}
							</>
						)}

						{showPayments && activeTab === "payments" && (
							<>
								{paymentsData && paymentsData.length > 0 ? (
									<VSCodeDataGrid>
										<VSCodeDataGridRow row-type="header">
											<VSCodeDataGridCell cell-type="columnheader" grid-column="1">
												日期
											</VSCodeDataGridCell>
											<VSCodeDataGridCell cell-type="columnheader" grid-column="2">
												充值
											</VSCodeDataGridCell>
											<VSCodeDataGridCell cell-type="columnheader" grid-column="3">
												余额
											</VSCodeDataGridCell>
										</VSCodeDataGridRow>

										{paymentsData.map((row, index) => (
											<VSCodeDataGridRow key={index}>
												<VSCodeDataGridCell grid-column="1">
													{formatTimestamp(row.paidAt, "zh-CN")}
												</VSCodeDataGridCell>
												<VSCodeDataGridCell grid-column="2">{`$${Number(row.amountCents || "0").toFixed(2)}`}</VSCodeDataGridCell>
												<VSCodeDataGridCell grid-column="3">{`${row.credits || ""}`}</VSCodeDataGridCell>
											</VSCodeDataGridRow>
										))}
									</VSCodeDataGrid>
								) : (
									<div className="flex justify-center items-center p-4">
										<div className="text-[var(--vscode-descriptionForeground)]">还没有支付记录</div>
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
