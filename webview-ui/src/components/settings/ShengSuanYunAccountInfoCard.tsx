import { VSCodeButton } from "@vscode/webview-ui-toolkit/react"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { AccountServiceClient } from "@/services/grpc-client"
import { EmptyRequest } from "@shared/proto/common"
import { useShengSuanYunAuth } from "@/context/ShengSuanYunAuthContext"

export const ShengSuanYunAccountInfoCard = () => {
	const { handleSignOutSSY } = useShengSuanYunAuth()
	const { apiConfiguration } = useExtensionState()
	const key = apiConfiguration?.shengSuanYunApiKey || null
	return (
		<div className="max-w-[600px]">
			{key ? (
				<VSCodeButton appearance="secondary" onClick={() => handleSignOutSSY()}>
					退出登录
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
