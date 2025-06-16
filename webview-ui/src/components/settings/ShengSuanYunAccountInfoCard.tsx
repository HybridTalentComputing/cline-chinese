import { VSCodeButton } from "@vscode/webview-ui-toolkit/react"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { vscode } from "@/utils/vscode"

export const ShengSuanYunAccountInfoCard = () => {
	const { apiConfiguration } = useExtensionState()
	const key = apiConfiguration?.shengSuanYunApiKey || null
	return (
		<div className="max-w-[600px]">
			{!key ? (
				<VSCodeButton
					appearance="primary"
					onClick={() => {
						vscode.postMessage({ type: "accountLoginClickedSSY" })
					}}>
					登录胜算云
				</VSCodeButton>
			) : null}
		</div>
	)
}
