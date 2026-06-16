import { VSCodeButton, VSCodeLink } from "@vscode/webview-ui-toolkit/react"
import { useTranslation } from "react-i18next"
import { useClineSignIn } from "@/context/ClineAuthContext"
import { useExtensionState } from "@/context/ExtensionStateContext"
import ClineLogoVariable from "../../assets/ClineLogoVariable"

// export const AccountWelcomeView = () => (
// 	<div className="flex flex-col items-center pr-3 gap-2.5">
// 		<ClineLogoWhite className="size-16 mb-4" />
export const AccountWelcomeView = () => {
	const { t } = useTranslation("settings")
	const { environment } = useExtensionState()
	const { isLoginLoading, handleSignIn } = useClineSignIn()

	return (
		<div className="flex flex-col items-center gap-2.5">
			<ClineLogoVariable className="size-16 mb-4" environment={environment} />

			<p>{t("account.signUpDescription")}</p>

			<VSCodeButton className="w-full mb-4" disabled={isLoginLoading} onClick={handleSignIn}>
				{t("account.signUpWithCline")}
				{isLoginLoading && (
					<span className="ml-1 animate-spin">
						<span className="codicon codicon-refresh" />
					</span>
				)}
			</VSCodeButton>

			<p className="text-(--vscode-descriptionForeground) text-xs text-center m-0">
				{t("account.agreeToTerms")} <VSCodeLink href="https://cline.bot/tos">{t("account.termsOfService")}</VSCodeLink>{" "}
				{t("settingsSections.privacyPolicy").replace("privacy policy", "")}{" "}
				<VSCodeLink href="https://cline.bot/privacy">{t("account.privacyPolicyAnd")}</VSCodeLink>
			</p>
		</div>
	)
}
