import { VSCodeLink, VSCodeTextField } from "@vscode/webview-ui-toolkit/react"
import { Trans, useTranslation } from "react-i18next"
import { useDebouncedInput } from "../utils/useDebouncedInput"

/**
 * Props for the ApiKeyField component
 */
interface ApiKeyFieldProps {
	initialValue: string
	onChange: (value: string) => void
	providerName: string
	signupUrl?: string
	placeholder?: string
	helpText?: string
}

/**
 * A reusable component for API key input fields with standard styling and help text for signing up for key
 */
export const ApiKeyField = ({ initialValue, onChange, providerName, signupUrl, placeholder, helpText }: ApiKeyFieldProps) => {
	const { t } = useTranslation()
	const [localValue, setLocalValue] = useDebouncedInput(initialValue, onChange)
	const defaultPlaceholder = placeholder || t("settings.apiConfig.apiKeyPlaceholder")
	const defaultHelpText = helpText || t("settings.apiConfig.apiKeyStoredLocally")
	const getApiKeyKey = /^[aeiou]/i.test(providerName) ? "settings.apiConfig.getApiKeyAn" : "settings.apiConfig.getApiKey"

	return (
		<div>
			<VSCodeTextField
				onInput={(e: any) => setLocalValue(e.target.value)}
				placeholder={defaultPlaceholder}
				required={true}
				style={{ width: "100%" }}
				type="password"
				value={localValue}>
				<span style={{ fontWeight: 500 }}>
					{providerName} {t("settings.providers.apiKey")}
				</span>
			</VSCodeTextField>
			<p
				style={{
					fontSize: "12px",
					marginTop: 3,
					color: "var(--vscode-descriptionForeground)",
				}}>
				{defaultHelpText}
				{!localValue && signupUrl && (
					<>
						{" "}
						<Trans
							components={{
								signupLink: (
									<VSCodeLink
										href={signupUrl}
										style={{
											display: "inline",
											fontSize: "inherit",
										}}>
										{t("settings.apiConfig.signingUpHere")}
									</VSCodeLink>
								),
							}}
							i18nKey={getApiKeyKey}
							values={{ providerName }}
						/>
					</>
				)}
			</p>
		</div>
	)
}
