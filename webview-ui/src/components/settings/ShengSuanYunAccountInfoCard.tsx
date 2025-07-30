import { VSCodeButton } from "@vscode/webview-ui-toolkit/react"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { AccountServiceClient } from "@/services/grpc-client"
import { EmptyRequest } from "@shared/proto/cline/common"

export const ShengSuanYunAccountInfoCard = () => {
	const { apiConfiguration, navigateToAccount } = useExtensionState()
	let key = apiConfiguration?.shengSuanYunApiKey || false
	return (
		<div className="max-w-[600px]">
			{key ? (
				<VSCodeButton appearance="secondary" onClick={() => navigateToAccount()}>
					查看账单与使用记录
				</VSCodeButton>
			) : (
				<VSCodeButton
					appearance="primary"
					onClick={() => {
						AccountServiceClient.shengSuanYunLoginClicked(EmptyRequest.create()).catch((err) =>
							console.error("shengSuanYunLoginClicked Failed to get login URL:", err),
						)
					}}>
					登录胜算云
				</VSCodeButton>
			)}
		</div>
	)
}
