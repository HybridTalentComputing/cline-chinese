import { VSCodeButton, VSCodeDivider, VSCodeDropdown, VSCodeLink, VSCodeOption } from "@vscode/webview-ui-toolkit/react"
import { memo, useEffect, useState } from "react"
import { useFirebaseAuth } from "@/context/FirebaseAuthContext"
import { vscode } from "@/utils/vscode"
import VSCodeButtonLink from "../common/VSCodeButtonLink"
import ClineLogoWhite from "../../assets/ClineLogoWhite"
import CountUp from "react-countup"
import CreditsHistoryTable from "./CreditsHistoryTable"
import { UsageTransaction, PaymentTransaction } from "@shared/ClineAccount"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { EmptyRequest } from "@shared/proto/common"
import { useShengSuanYunAuth } from "@/context/ShengSuanYunAuthContext"
import { AccountServiceClient } from "@/services/grpc-client"
// 定义账户视图组件的属性类型
type AccountViewProps = {
	onDone: () => void
}

// 账户视图组件
const AccountView = ({ onDone }: AccountViewProps) => {
	const { vendor, setVendor, userInfo, apiConfiguration } = useExtensionState()
	const { userSSY } = useShengSuanYunAuth()
	const { user: firebaseUser } = useFirebaseAuth()
	const ssyUser = apiConfiguration?.shengSuanYunToken ? userSSY : undefined
	const clineUser = apiConfiguration?.clineApiKey ? firebaseUser || userInfo : undefined
	const [user, setUser] = useState<any>(null)

	useEffect(() => {
		if (vendor == "cline") {
			setUser(clineUser)
		} else {
			setUser(ssyUser)
		}
	}, [vendor, clineUser, ssyUser])

	return (
		<div className="fixed inset-0 flex flex-col overflow-hidden pt-[10px] pl-[20px]">
			<div className="flex justify-between items-center mb-[17px] pr-[17px]">
				<VSCodeDropdown
					className={ssyUser || clineUser ? "" : "hidden"}
					value={vendor}
					onChange={(e: any) => setVendor(e.target.value)}>
					<VSCodeOption
						className="text-[var(--vscode-foreground)] m-0"
						value="ssy"
						// disabled={!ssyUser}
						style={{
							whiteSpace: "normal",
							wordWrap: "break-word",
							maxWidth: "100%",
						}}>
						胜算云
					</VSCodeOption>
					<VSCodeOption
						className="text-[var(--vscode-foreground)] m-0"
						value="cline"
						// disabled={!clineUser}
						style={{
							whiteSpace: "normal",
							wordWrap: "break-word",
							maxWidth: "100%",
						}}>
						Cline
					</VSCodeOption>
				</VSCodeDropdown>
				<VSCodeButton onClick={onDone}>确定</VSCodeButton>
			</div>
			<div className="flex-grow overflow-hidden pr-[8px] flex flex-col">
				<div className="h-full mb-[5px]">
					<ClineAccountView vendorCode={vendor} user={user} />
				</div>
			</div>
		</div>
	)
}

type ClineAccountViewProps = {
	vendorCode: string
	user: any
}
// Cline账户视图组件
export const ClineAccountView = ({ vendorCode, user }: ClineAccountViewProps) => {
	const { handleSignOutSSY } = useShengSuanYunAuth()
	const { handleSignOut } = useFirebaseAuth()
	const { setVendor } = useExtensionState()
	// 状态管理
	const [balance, setBalance] = useState(0)
	const [isLoading, setIsLoading] = useState(true)
	const [usageData, setUsageData] = useState<UsageTransaction[]>([])
	const [paymentsData, setPaymentsData] = useState<PaymentTransaction[]>([])

	// 监听来自扩展的余额和交易数据更新
	useEffect(() => {
		const handleMessage = (event: MessageEvent) => {
			const message = event.data
			if (message.type === "userCreditsBalance" && message.userCreditsBalance) {
				setBalance(message.userCreditsBalance.currentBalance)
			} else if (message.type === "userCreditsUsage" && message.userCreditsUsage) {
				setUsageData(message.userCreditsUsage)
			} else if (message.type === "userCreditsPayments" && message.userCreditsPayments) {
				setPaymentsData(message.userCreditsPayments)
			}
			setIsLoading(false)
		}

		window.addEventListener("message", handleMessage)

		// 组件挂载时获取所有账户数据
		if (user && vendorCode == "ssy") {
			setIsLoading(true)
			vscode.postMessage({ type: "fetchUserCreditsData" })
		}

		if (user && vendorCode == "cline") {
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
		return () => {
			window.removeEventListener("message", handleMessage)
		}
	}, [user])

	// 处理登录
	const handleLogin = () => {
		AccountServiceClient.accountLoginClicked(EmptyRequest.create()).catch((err) =>
			console.error("Failed to get login URL:", err),
		)
		setVendor("cline")
	}

	// 处理登出
	const handleLogout = () => {
		if (vendorCode == "cline") {
			// 使用gRPC客户端通知扩展清除API密钥和状态
			AccountServiceClient.accountLogoutClicked(EmptyRequest.create()).catch((err) =>
				console.error("Failed to logout:", err),
			)
			// 然后从Firebase登出
			handleSignOut()
			setVendor("ssy")
		} else {
			handleSignOutSSY()
			setVendor("cline")
		}
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
								appearance="primary"
								className="w-full"
								href={
									vendorCode == "cline"
										? "https://app.cline.bot/credits"
										: "https://console.shengsuanyun.com/user/overview"
								}>
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
											if (vendorCode == "ssy") {
												vscode.postMessage({ type: "fetchUserCreditsData" })
												return
											}
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
							{vendorCode == "cline" ? (
								<VSCodeButtonLink href="https://app.cline.bot/credits/#buy" className="w-full">
									增加额度
								</VSCodeButtonLink>
							) : (
								<VSCodeButtonLink href="https://console.shengsuanyun.com/user/recharge" className="w-full">
									充值
								</VSCodeButtonLink>
							)}
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

					<p style={{}}>注册一个账户以获取最新模型的访问权限、查看用量和积分的计费仪表板，以及更多即将推出的功能。</p>

					<VSCodeButton onClick={handleLogin} className="w-full mb-4">
						注册 Cline
					</VSCodeButton>

					<p className="text-[var(--vscode-descriptionForeground)] text-xs text-center m-0">
						继续，表示你同意 Cline <VSCodeLink href="https://cline.bot/tos">用户协议</VSCodeLink> 和{" "}
						<VSCodeLink href="https://cline.bot/privacy">隐私政策.</VSCodeLink>
					</p>
					<div className="w-full flex justify-start mt-16">
						<VSCodeLink
							onclick={() => setVendor("ssy")}
							href="https://router.shengsuanyun.com/auth?from=cline-chinese&callback_url=vscode://HybridTalentComputing.cline-chinese/ssy">
							&gt;&gt;点击接入胜算云，领取100万tokens算力
						</VSCodeLink>
					</div>
				</div>
			)}
		</div>
	)
}

export default memo(AccountView)
