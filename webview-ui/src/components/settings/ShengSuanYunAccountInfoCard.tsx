import { VSCodeButton, VSCodeLink } from "@vscode/webview-ui-toolkit/react"
import { useShengSuanYunAuth } from "@/context/ShengSuanYunAuthContext"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { vscode } from "@/utils/vscode"

export const ShengSuanYunAccountInfoCard = () => {
	const { apiConfiguration, navigateToAccount } = useExtensionState()
	let key = apiConfiguration?.shengSuanYunApiKey || false
	return (
		<div className="max-w-[600px]">
			{key ? (
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
					登录胜算云
				</VSCodeButton>
			)}
		</div>
	)
}
