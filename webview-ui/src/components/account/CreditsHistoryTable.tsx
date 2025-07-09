import { VSCodeDataGrid, VSCodeDataGridRow, VSCodeDataGridCell } from "@vscode/webview-ui-toolkit/react"
import { useState } from "react"
import { TabButton } from "../mcp/configuration/McpConfigurationView"
import { UsageTransaction, PaymentTransaction } from "@shared/ClineAccount"
import { formatDollars, formatTimestamp } from "@/utils/format"

interface CreditsHistoryTableProps {
	isLoading: boolean
	usageData: UsageTransaction[]
	paymentsData: PaymentTransaction[]
}

const CreditsHistoryTable = ({ isLoading, usageData, paymentsData }: CreditsHistoryTableProps) => {
	const [activeTab, setActiveTab] = useState<"usage" | "payments">("usage")

	return (
		<div className="flex flex-col flex-grow h-full">
			{/* 标签容器 */}
			<div className="flex border-b border-[var(--vscode-panel-border)]">
				<TabButton isActive={activeTab === "usage"} onClick={() => setActiveTab("usage")}>
					使用记录
				</TabButton>
				<TabButton isActive={activeTab === "payments"} onClick={() => setActiveTab("payments")}>
					充值记录
				</TabButton>
			</div>

			{/* 内容容器 */}
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
												消耗积分
											</VSCodeDataGridCell>
										</VSCodeDataGridRow>

										{usageData.map((row, index) => {
											let model = row.model
											if (row.modelProvider.length) model = `${row.modelProvider}/${model}`
											return (
												<VSCodeDataGridRow key={index}>
													<VSCodeDataGridCell grid-column="1">
														{formatTimestamp(row.spentAt)}
													</VSCodeDataGridCell>
													<VSCodeDataGridCell grid-column="2">{model}</VSCodeDataGridCell>
													{/* <VSCodeDataGridCell grid-column="3">{`${row.promptTokens} → ${row.completionTokens}`}</VSCodeDataGridCell> */}
													<VSCodeDataGridCell grid-column="3">{`$${Number(row.credits).toFixed(7)}`}</VSCodeDataGridCell>
												</VSCodeDataGridRow>
											)
										})}
									</VSCodeDataGrid>
								) : (
									<div className="flex justify-center items-center p-4">
										<div className="text-[var(--vscode-descriptionForeground)]">暂无使用记录</div>
									</div>
								)}
							</>
						)}

						{activeTab === "payments" && (
							<>
								{paymentsData && paymentsData.length > 0 ? (
									<VSCodeDataGrid>
										<VSCodeDataGridRow row-type="header">
											<VSCodeDataGridCell cell-type="columnheader" grid-column="1">
												日期
											</VSCodeDataGridCell>
											<VSCodeDataGridCell cell-type="columnheader" grid-column="2">
												总金额
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
										<div className="text-[var(--vscode-descriptionForeground)]">暂无充值记录</div>
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
