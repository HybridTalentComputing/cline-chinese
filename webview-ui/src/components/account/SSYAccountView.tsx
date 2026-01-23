import type { PaymentTransaction, UsageTransaction } from "@shared/ClineAccount"
import { EmptyRequest } from "@shared/proto/cline/common"
import { VSCodeButton, VSCodeDivider, VSCodeLink } from "@vscode/webview-ui-toolkit/react"
import { useEffect, useState } from "react"
import ClineLogoWhite from "@/assets/ClineLogoWhite"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { AccountServiceClient } from "@/services/grpc-client"
import VSCodeButtonLink from "../common/VSCodeButtonLink"
import CreditsHistoryTable from "./CreditsHistoryTable"
import { StyledCreditDisplaySSY } from "./StyledCreditDisplaySSY"

export const SSYAccountView = () => {
	const { userInfo } = useExtensionState()
	console.log("SSYAccountView() userInfo: ", userInfo)

	const [rate, setRate] = useState(0)
	const [isLoading, setIsLoading] = useState(true)
	const [usageData, setUsageData] = useState<UsageTransaction[]>([])
	const [paymentsData, setPaymentsData] = useState<PaymentTransaction[]>([])

	// Fetch all account data when component mounts using gRPC
	useEffect(() => {
		if (!userInfo || !userInfo.displayName) {
			setIsLoading(false)
			return
		}
		setIsLoading(true)
		AccountServiceClient.shengSuanYunUserData(EmptyRequest.create())
			.then((res: any) => {
				setRate(res.rate || 0)
				setUsageData(res.usageTransactions)
				setPaymentsData(res.paymentTransactions)
			})
			.catch((error: any) => {
				console.error("Failed to fetch user credits data:", error)
			})
			.finally(() => setIsLoading(false))
	}, [userInfo])

	return (
		<div className="h-full flex flex-col">
			{userInfo ? (
				<div className="flex flex-col pr-3 h-full">
					<div className="flex flex-col w-full">
						<div className="flex items-center mb-6 flex-wrap gap-y-4">
							{userInfo.photoUrl ? (
								<img alt="Profile" className="size-16 rounded-full mr-4" src={userInfo.photoUrl} />
							) : (
								<div className="size-16 rounded-full bg-[var(--vscode-button-background)] flex items-center justify-center text-2xl text-[var(--vscode-button-foreground)] mr-4">
									{userInfo.displayName?.[0] || userInfo.email?.[0] || "?"}
								</div>
							)}

							<div className="flex flex-col">
								{userInfo.displayName && (
									<h2 className="text-[var(--vscode-foreground)] m-0 mb-1 text-lg font-medium">
										{userInfo.displayName}
									</h2>
								)}

								{userInfo.email && (
									<div className="text-sm text-[var(--vscode-descriptionForeground)]">{userInfo.email}</div>
								)}
							</div>
						</div>
					</div>

					<div className="w-full flex gap-2 flex-col min-[225px]:flex-row">
						<div className="w-full min-[225px]:w-1/2">
							<VSCodeButtonLink
								appearance="primary"
								className="w-full"
								href="https://console.shengsuanyun.com/user/overview">
								个人中心
							</VSCodeButtonLink>
						</div>

						<VSCodeButton
							appearance="secondary"
							className="w-full min-[225px]:w-1/2"
							onClick={() => {
								AccountServiceClient.shengSuanYunLogoutClicked(EmptyRequest.create()).catch((err) =>
									console.error("Failed to logout:", err),
								)
							}}>
							退出登录
						</VSCodeButton>
					</div>

					<VSCodeDivider className="w-full my-6" />
					<div className="w-full flex flex-col items-center">
						<div className="text-sm text-[var(--vscode-descriptionForeground)] mb-3">余额</div>

						<div className="text-4xl font-bold text-[var(--vscode-foreground)] mb-6 flex items-center gap-2">
							{isLoading ? (
								<div className="text-[var(--vscode-descriptionForeground)]">加载中...</div>
							) : (
								<>
									<span>$</span>
									<StyledCreditDisplaySSY balance={(userInfo.balance || 0) * rate} />
									<VSCodeButton
										appearance="icon"
										className="mt-1"
										onClick={() => {
											setIsLoading(true)
											AccountServiceClient.shengSuanYunUserData(EmptyRequest.create())
												.then((res) => {
													setRate(res.rate || 0)
													setUsageData(res.usageTransactions as any)
													setPaymentsData(res.paymentTransactions)
												})
												.catch((error) => {
													console.error("Failed to refresh user credits data:", error)
												})
												.finally(() => setIsLoading(false))
										}}>
										<span className="codicon codicon-refresh"></span>
									</VSCodeButton>
								</>
							)}
						</div>

						<div className="w-full">
							<VSCodeButtonLink className="w-full" href="https://console.shengsuanyun.com/user/recharge">
								充值
							</VSCodeButtonLink>
						</div>
					</div>

					<VSCodeDivider className="mt-6 mb-3 w-full" />

					<div className="flex-grow flex flex-col min-h-0 pb-[0px]">
						<CreditsHistoryTable isLoading={isLoading} paymentsData={paymentsData} usageData={usageData} />
					</div>
				</div>
			) : (
				<div className="flex flex-col items-center pr-3">
					<ClineLogoWhite className="size-16 mb-4" />
					<p style={{}}>注册帐户访问最新模型，进群联系客服，获得100万Tokens免费额度，以及更多即将推出的功能。</p>
					<VSCodeButton
						className="w-full mb-4"
						onClick={() => {
							setIsLoading(true)
							AccountServiceClient.shengSuanYunLoginClicked(EmptyRequest.create())
								.catch((err) => console.error("Failed to get login URL:", err))
								.finally(() => {
									setIsLoading(false)
								})
						}}>
						注册 Cline Chinese赞助商--胜算云
					</VSCodeButton>
					<p className="text-[var(--vscode-descriptionForeground)] text-xs text-center m-0">
						继续即表示您同意{" "}
						<VSCodeLink href="https://docs.router.shengsuanyun.com/terms-of-service">服务条款</VSCodeLink> 和{" "}
						<VSCodeLink href="https://docs.router.shengsuanyun.com/privacy-policy">隐私政策.</VSCodeLink>
					</p>
				</div>
			)}
		</div>
	)
}
