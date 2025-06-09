import { VSCodeButton, VSCodeLink } from "@vscode/webview-ui-toolkit/react"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { useShengSuanYunAuth } from "@/context/ShengSuanYunAuthContext"

export const ShengSuanYunAccountInfoCard = () => {
	const { userSSY: ssyUser } = useShengSuanYunAuth()
	const { userInfo, apiConfiguration, navigateToAccount } = useExtensionState()

	let user = apiConfiguration?.shengSuanYunToken ? ssyUser || userInfo : undefined
	const handleShowAccount = () => {
		navigateToAccount()
	}

	return (
		<div className="max-w-[600px]">
			{user?.Wallet ? (
				<VSCodeButton appearance="secondary" onClick={handleShowAccount}>
					查看账单与使用记录
				</VSCodeButton>
			) : (
				<div>
					<VSCodeLink
						className="btn-link"
						href="https://router.shengsuanyun.com/auth?callback_url=vscode://shengsuan-cloud.cline-shengsuan/ssy">
						登录胜算云
					</VSCodeLink>
				</div>
			)}
		</div>
	)
}
