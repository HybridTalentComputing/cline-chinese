import { useExtensionState } from "@/context/ExtensionStateContext"
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react"
import { useSsyAuth } from "@/context/SsyAuthContext"
import { vscode } from "@/utils/vscode"

export const SSYAccountInfoCard = () => {
	const { userSSY: ssyUser, handleSignOutSSY } = useSsyAuth()
	const { userInfo, apiConfiguration } = useExtensionState()

	let user = apiConfiguration?.shengsuanyunToken ? ssyUser || userInfo : undefined

	const handleLogin = () => {
		vscode.postMessage({ type: "accountLoginClickedSSY" })
	}

	const handleLogout = () => {
		// First notify extension to clear API keys and state
		vscode.postMessage({ type: "accountLogoutClickedSSY" })
		// Then sign out of Firebase
		handleSignOutSSY()
	}

	const handleShowAccount = () => {
		vscode.postMessage({ type: "showAccountViewClicked" })
	}

	return (
		<div className="max-w-[600px]">
			{user ? (
				<VSCodeButton appearance="secondary" onClick={handleShowAccount}>
					查看账单与使用记录
				</VSCodeButton>
			) : (
				<div>
					<VSCodeButton onClick={handleLogin} className="mt-0">
						注册 Cline 胜算云
					</VSCodeButton>
				</div>
			)}
		</div>
	)
}
