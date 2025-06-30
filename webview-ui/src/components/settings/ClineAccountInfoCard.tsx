import { VSCodeButton } from "@vscode/webview-ui-toolkit/react"
import { useFirebaseAuth } from "@/context/FirebaseAuthContext"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { AccountServiceClient } from "@/services/grpc-client"
import { EmptyRequest } from "@shared/proto/common"

export const ClineAccountInfoCard = () => {
	const { user: firebaseUser, handleSignOut } = useFirebaseAuth()
	const { userInfo, apiConfiguration, navigateToAccount, setVendor } = useExtensionState()

	let user = apiConfiguration?.clineApiKey ? firebaseUser || userInfo : undefined

	const handleLogin = () => {
		AccountServiceClient.accountLoginClicked(EmptyRequest.create()).catch((err) =>
			console.error("Failed to get login URL:", err),
		)
	}

	const handleShowAccount = () => {
		// navigateToAccount()
		handleSignOut()
		setVendor("ssy")
	}

	return (
		<div className="max-w-[600px]">
			{user?.providerId == "firebase" ? (
				<VSCodeButton appearance="secondary" onClick={handleShowAccount}>
					退出登录
				</VSCodeButton>
			) : (
				<div>
					<VSCodeButton onClick={handleLogin} className="mt-0">
						注册 Cline
					</VSCodeButton>
				</div>
			)}
		</div>
	)
}
