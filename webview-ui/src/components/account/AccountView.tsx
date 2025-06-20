import { VSCodeButton, VSCodeDivider, VSCodeLink } from "@vscode/webview-ui-toolkit/react"
import { memo, useEffect, useState } from "react"
import { useFirebaseAuth } from "@/context/FirebaseAuthContext"
import { vscode } from "@/utils/vscode"
import VSCodeButtonLink from "../common/VSCodeButtonLink"
import ClineLogoWhite from "../../assets/ClineLogoWhite"
import CountUp from "react-countup"
import CreditsHistoryTable from "./CreditsHistoryTable"
import { UsageTransaction, PaymentTransaction } from "@shared/ClineAccount"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { AccountServiceClient } from "@/services/grpc-client"
import { EmptyRequest } from "@shared/proto/common"

// 定义账户视图组件的属性类型
type AccountViewProps = {
	onDone: () => void
}

// 账户视图组件
const AccountView = ({ onDone }: AccountViewProps) => {
	return (
		<div className="fixed inset-0 flex flex-col overflow-hidden pt-[10px] pl-[20px]">
			<div className="flex justify-between items-center mb-[17px] pr-[17px]">
				<h3 className="text-[var(--vscode-foreground)] m-0">账户</h3>
				<VSCodeButton onClick={onDone}>完成</VSCodeButton>
			</div>
			<div className="flex-grow overflow-hidden pr-[8px] flex flex-col">
				<div className="h-full mb-[5px]">
					<ClineAccountView />
				</div>
			</div>
		</div>
	)
}

// Cline账户视图组件
export const ClineAccountView = () => {
	const { user: firebaseUser, handleSignOut } = useFirebaseAuth()
	const { userInfo, apiConfiguration } = useExtensionState()

	// 根据API配置确定当前用户
	let user = apiConfiguration?.clineApiKey ? firebaseUser || userInfo : undefined

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
				setUsageData(message.userCreditsUsage.usageTransactions)
			} else if (message.type === "userCreditsPayments" && message.userCreditsPayments) {
				setPaymentsData(message.userCreditsPayments.paymentTransactions)
			}
			setIsLoading(false)
		}

		window.addEventListener("message", handleMessage)

		// 组件挂载时获取所有账户数据
		if (user) {
			setIsLoading(true)
			vscode.postMessage({ type: "fetchUserCreditsData" })
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
	}

	// 处理登出
	const handleLogout = () => {
		// 使用gRPC客户端通知扩展清除API密钥和状态
		AccountServiceClient.accountLogoutClicked(EmptyRequest.create()).catch((err) => console.error("Failed to logout:", err))
		// 然后从Firebase登出
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
							<VSCodeButtonLink href="https://app.cline.bot/credits" appearance="primary" className="w-full">
								控制面板
							</VSCodeButtonLink>
						</div>
						<VSCodeButton appearance="secondary" onClick={handleLogout} className="w-full min-[225px]:w-1/2">
							退出登录
						</VSCodeButton>
					</div>

					<VSCodeDivider className="w-full my-6" />

					<div className="w-full flex flex-col items-center">
						<div className="text-sm text-[var(--vscode-descriptionForeground)] mb-3">当前余额</div>

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
										onClick={() => vscode.postMessage({ type: "fetchUserCreditsData" })}>
										<span className="codicon codicon-refresh"></span>
									</VSCodeButton>
								</>
							)}
						</div>

						<div className="w-full">
							<VSCodeButtonLink href="https://app.cline.bot/credits/#buy" className="w-full">
								添加积分
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

					<p style={{}}>注册账户以获取最新模型、查看使用情况和积分的计费控制面板，以及更多即将推出的功能。</p>

					<VSCodeButton onClick={handleLogin} className="w-full mb-4">
						使用Cline注册
					</VSCodeButton>

					<p className="text-[var(--vscode-descriptionForeground)] text-xs text-center m-0">
						继续即表示您同意<VSCodeLink href="https://cline.bot/tos">服务条款</VSCodeLink>和{" "}
						<VSCodeLink href="https://cline.bot/privacy">隐私政策</VSCodeLink>。
					</p>
				</div>
			)}
		</div>
	)
}

export default memo(AccountView)
