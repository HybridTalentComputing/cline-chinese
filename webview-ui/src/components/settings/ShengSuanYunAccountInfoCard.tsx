import { VSCodeButton } from "@vscode/webview-ui-toolkit/react"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { vscode } from "@/utils/vscode"
import { WebServiceClient } from "@/services/grpc-client"
import { StringRequest } from "@shared/proto/common"

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
