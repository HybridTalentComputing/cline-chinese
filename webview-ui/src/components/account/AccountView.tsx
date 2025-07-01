import { VSCodeButton, VSCodeDivider, VSCodeLink } from "@vscode/webview-ui-toolkit/react"
import { memo, useEffect, useState } from "react"
import { useFirebaseAuth } from "@/context/FirebaseAuthContext"
import VSCodeButtonLink from "../common/VSCodeButtonLink"
import ClineLogoWhite from "../../assets/ClineLogoWhite"
import CountUp from "react-countup"
import CreditsHistoryTable from "./CreditsHistoryTable"
import { UsageTransaction, PaymentTransaction } from "@shared/ClineAccount"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { AccountServiceClient } from "@/services/grpc-client"
import { EmptyRequest } from "@shared/proto/common"
import { useShengSuanYunAuth } from "@/context/ShengSuanYunAuthContext"

type AccountViewProps = {
	onDone: () => void
}

const AccountView = ({ onDone }: AccountViewProps) => {
	return (
		<div className="fixed inset-0 flex flex-col overflow-hidden pt-[10px] pl-[20px]">
			<div className="flex justify-between items-center mb-[17px] pr-[17px]">
				<h3 className="text-[var(--vscode-foreground)] m-0">账户</h3>
				<VSCodeButton onClick={onDone}>确定</VSCodeButton>
			</div>
			<div className="flex-grow overflow-hidden pr-[8px] flex flex-col">
				<div className="h-full mb-[5px]">
					<SSYAccountView />
				</div>
			</div>
		</div>
	)
}

export const ClineAccountView = () => {
	const { user: firebaseUser, handleSignOut } = useFirebaseAuth()
	const { userInfo, apiConfiguration } = useExtensionState()

	let user = apiConfiguration?.clineApiKey ? firebaseUser || userInfo : undefined

	const [balance, setBalance] = useState(0)
	const [isLoading, setIsLoading] = useState(true)
	const [usageData, setUsageData] = useState<UsageTransaction[]>([])
	const [paymentsData, setPaymentsData] = useState<PaymentTransaction[]>([])

	useEffect(() => {
		if (user) {
			setIsLoading(true)
			AccountServiceClient.fetchUserCreditsData(EmptyRequest.create())
				.then((response) => {
					setBalance(response.balance?.currentBalance || 0)
					setUsageData(response.usageTransactions)
					setPaymentsData(response.paymentTransactions)
					setIsLoading(false)
				})
				.catch((error) => {
					console.error("Failed to fetch user credits data:", error)
					setIsLoading(false)
				})
		}
	}, [user])

	const handleLogin = () => {
		AccountServiceClient.accountLoginClicked(EmptyRequest.create()).catch((err) =>
			console.error("Failed to get login URL:", err),
		)
	}

	const handleLogout = () => {
		// Use gRPC client to notify extension to clear API keys and state
		AccountServiceClient.accountLogoutClicked(EmptyRequest.create()).catch((err) => console.error("Failed to logout:", err))
		// Then sign out of Firebase
		handleSignOut()
	}
	return (
		<div className="h-full flex flex-col">
			{user ? (
				<div className="flex flex-col pr-3 h-full">
					<div className="flex flex-col w-full">
						<div className="flex items-center mb-6 flex-wrap gap-y-4">
							{user.photoURL ? (
								<img src={user.photoURL} alt="Profile" className="size-16 rounded-full mr-4" />
							) : (
								<div className="size-16 rounded-full bg-[var(--vscode-button-background)] flex items-center justify-center text-2xl text-[var(--vscode-button-foreground)] mr-4">
									{user.displayName?.[0] || user.email?.[0] || "?"}
								</div>
							)}

							<div className="flex flex-col">
								{user.displayName && (
									<h2 className="text-[var(--vscode-foreground)] m-0 mb-1 text-lg font-medium">
										{user.displayName}
									</h2>
								)}

								{user.email && (
									<div className="text-sm text-[var(--vscode-descriptionForeground)]">{user.email}</div>
								)}
							</div>
						</div>
					</div>

					<div className="w-full flex gap-2 flex-col min-[225px]:flex-row">
						<div className="w-full min-[225px]:w-1/2">
							<VSCodeButtonLink
								href="https://router.shengsuanyun.com/control/user/settings"
								appearance="primary"
								className="w-full">
								仪表盘
							</VSCodeButtonLink>
						</div>
						<VSCodeButton appearance="secondary" onClick={handleLogout} className="w-full min-[225px]:w-1/2">
							注销
						</VSCodeButton>
					</div>

					<VSCodeDivider className="w-full my-6" />

					<div className="w-full flex flex-col items-center">
						<div className="text-sm text-[var(--vscode-descriptionForeground)] mb-3">余额</div>

						<div className="text-4xl font-bold text-[var(--vscode-foreground)] mb-6 flex items-center gap-2">
							{isLoading ? (
								<div className="text-[var(--vscode-descriptionForeground)]">加载...</div>
							) : (
								<>
									<span>$</span>
									<CountUp end={balance} duration={0.66} decimals={2} />
									<VSCodeButton
										appearance="icon"
										className="mt-1"
										onClick={() => {
											setIsLoading(true)
											AccountServiceClient.fetchUserCreditsData(EmptyRequest.create())
												.then((response) => {
													setBalance(response.balance?.currentBalance || 0)
													setUsageData(response.usageTransactions)
													setPaymentsData(response.paymentTransactions)
													setIsLoading(false)
												})
												.catch((error) => {
													console.error("Failed to refresh user credits data:", error)
													setIsLoading(false)
												})
										}}>
										<span className="codicon codicon-refresh"></span>
									</VSCodeButton>
								</>
							)}
						</div>

						<div className="w-full">
							<VSCodeButtonLink href="https://router.shengsuanyun.com/control/user/recharge" className="w-full">
								充值
							</VSCodeButtonLink>
						</div>
					</div>

					<VSCodeDivider className="mt-6 mb-3 w-full" />

					<div className="flex-grow flex flex-col min-h-0 pb-[0px]">
						<CreditsHistoryTable isLoading={isLoading} usageData={usageData} paymentsData={paymentsData} />
					</div>
				</div>
			) : (
				<div className="flex flex-col items-center pr-3">
					<ClineLogoWhite className="size-16 mb-4" />

					<p style={{}}>注册一个帐户以访问最新型号，注册账单仪表板以查看使用情况和积分， 以及更多即将推出的功能。</p>

					<VSCodeButton onClick={handleLogin} className="w-full mb-4">
						注册 Cline
					</VSCodeButton>

					<p className="text-[var(--vscode-descriptionForeground)] text-xs text-center m-0">
						继续即表示您同意 <VSCodeLink href="https://cline.bot/tos">服务条款</VSCodeLink> 和{" "}
						<VSCodeLink href="https://cline.bot/privacy">隐私政策</VSCodeLink>
					</p>
				</div>
			)}
		</div>
	)
}

export const SSYAccountView = () => {
	const { userSSY: ssyUser, handleSignOutSSY } = useShengSuanYunAuth()
	const { userInfo, apiConfiguration } = useExtensionState()
	let user = apiConfiguration?.shengSuanYunToken ? ssyUser || userInfo : undefined

	const [balance, setBalance] = useState(0)
	const [isLoading, setIsLoading] = useState(true)
	const [usageData, setUsageData] = useState<UsageTransaction[]>([])
	const [paymentsData, setPaymentsData] = useState<PaymentTransaction[]>([])

	// Fetch all account data when component mounts using gRPC
	useEffect(() => {
		if (user) {
			setIsLoading(true)
			AccountServiceClient.shengSuanYunUserData(EmptyRequest.create())
				.then((response) => {
					setBalance(response.balance?.currentBalance || 0)
					setUsageData(response.usageTransactions)
					setPaymentsData(response.paymentTransactions)
					setIsLoading(false)
				})
				.catch((error) => {
					console.error("Failed to fetch user credits data:", error)
					setIsLoading(false)
				})
		}
	}, [user])

	const handleLogin = () => {
		AccountServiceClient.shengSuanYunLoginClicked(EmptyRequest.create()).catch((err) =>
			console.error("Failed to get login URL:", err),
		)
	}

	const handleLogout = () => {
		AccountServiceClient.shengSuanYunLogoutClicked(EmptyRequest.create()).catch((err) =>
			console.error("Failed to logout:", err),
		)
		handleSignOutSSY()
	}
	return (
		<div className="h-full flex flex-col">
			{user ? (
				<div className="flex flex-col pr-3 h-full">
					<div className="flex flex-col w-full">
						<div className="flex items-center mb-6 flex-wrap gap-y-4">
							{user.photoURL ? (
								<img src={user.photoURL} alt="Profile" className="size-16 rounded-full mr-4" />
							) : (
								<div className="size-16 rounded-full bg-[var(--vscode-button-background)] flex items-center justify-center text-2xl text-[var(--vscode-button-foreground)] mr-4">
									{user.displayName?.[0] || user.email?.[0] || "?"}
								</div>
							)}

							<div className="flex flex-col">
								{user.displayName && (
									<h2 className="text-[var(--vscode-foreground)] m-0 mb-1 text-lg font-medium">
										{user.displayName}
									</h2>
								)}

								{user.email && (
									<div className="text-sm text-[var(--vscode-descriptionForeground)]">{user.email}</div>
								)}
							</div>
						</div>
					</div>

					<div className="w-full flex gap-2 flex-col min-[225px]:flex-row">
						<div className="w-full min-[225px]:w-1/2">
							<VSCodeButtonLink
								href="https://router.shengsuanyun.com/user/bill"
								appearance="primary"
								className="w-full">
								个人中心
							</VSCodeButtonLink>
						</div>
						<VSCodeButton appearance="secondary" onClick={handleLogout} className="w-full min-[225px]:w-1/2">
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
									<CountUp end={balance} duration={0.66} decimals={2} />
									<VSCodeButton
										appearance="icon"
										className="mt-1"
										onClick={() => {
											setIsLoading(true)
											AccountServiceClient.shengSuanYunUserData(EmptyRequest.create())
												.then((response) => {
													setBalance(response.balance?.currentBalance || 0)
													setUsageData(response.usageTransactions)
													setPaymentsData(response.paymentTransactions)
													setIsLoading(false)
												})
												.catch((error) => {
													console.error("Failed to refresh user credits data:", error)
													setIsLoading(false)
												})
										}}>
										<span className="codicon codicon-refresh"></span>
									</VSCodeButton>
								</>
							)}
						</div>

						<div className="w-full">
							<VSCodeButtonLink href="https://router.shengsuanyun.com/user/recharge" className="w-full">
								充值
							</VSCodeButtonLink>
						</div>
					</div>

					<VSCodeDivider className="mt-6 mb-3 w-full" />

					<div className="flex-grow flex flex-col min-h-0 pb-[0px]">
						<CreditsHistoryTable isLoading={isLoading} usageData={usageData} paymentsData={paymentsData} />
					</div>
				</div>
			) : (
				<div className="flex flex-col items-center pr-3">
					<ClineLogoWhite className="size-16 mb-4" />
					<p style={{}}>注册帐户访问最新模型，进群联系客服，获得100万Tokens免费额度，以及更多即将推出的功能。</p>
					<VSCodeButton onClick={handleLogin} className="w-full mb-4">
						注册 Cline 胜算云Router
					</VSCodeButton>
					<p className="text-[var(--vscode-descriptionForeground)] text-xs text-center m-0">
						继续即表示您同意 <VSCodeLink href="https://cline.bot/tos">服务条款</VSCodeLink> 和{" "}
						<VSCodeLink href="https://cline.bot/privacy">隐私政策.</VSCodeLink>
					</p>
				</div>
			)}
		</div>
	)
}

export default memo(AccountView)
