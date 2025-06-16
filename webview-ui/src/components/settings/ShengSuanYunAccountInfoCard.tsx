import { VSCodeButton, VSCodeLink } from "@vscode/webview-ui-toolkit/react"
import { useShengSuanYunAuth } from "@/context/ShengSuanYunAuthContext"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { vscode } from "@/utils/vscode"

export const ShengSuanYunAccountInfoCard = () => {
	const { userSSY: ssyUser } = useShengSuanYunAuth()
	const { userInfo, apiConfiguration, navigateToAccount } = useExtensionState()
	let user = apiConfiguration?.shengSuanYunToken ? ssyUser || userInfo : undefined

	return (
		<div className="max-w-[600px]">
			{user?.Wallet ? (
				<VSCodeButton
					appearance="secondary"
					onClick={() => {
						navigateToAccount()
					}}>
					查看账单与使用记录
				</VSCodeButton>
			) : (
				<VSCodeButton
					appearance="primary"
					onClick={() => {
						vscode.postMessage({ type: "accountLoginClickedSSY" })
					}}>
					登录胜算云Router
				</VSCodeButton>
			)}
		</div>
	)
}
