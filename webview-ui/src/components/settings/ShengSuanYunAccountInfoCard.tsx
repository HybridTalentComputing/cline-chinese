import { VSCodeButton } from "@vscode/webview-ui-toolkit/react"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { vscode } from "@/utils/vscode"
import { AccountServiceClient, WebServiceClient } from "@/services/grpc-client"
import { EmptyRequest, StringRequest } from "@shared/proto/common"

export const ShengSuanYunAccountInfoCard = () => {
	const { apiConfiguration } = useExtensionState()
	const key = apiConfiguration?.shengSuanYunApiKey || null
	return (
		<div className="max-w-[600px]">
			{!key ? (
				<VSCodeButton
					appearance="primary"
					onClick={() => {
						AccountServiceClient.shengSuanYunLoginClicked(EmptyRequest.create()).catch((err) =>
							console.error("shengSuanYunLoginClicked Failed to get login URL:", err),
						)
					}}>
					登录胜算云Router
				</VSCodeButton>
			) : null}
		</div>
	)
}
