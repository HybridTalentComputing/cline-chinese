import { VSCodeLink, VSCodeTextField } from "@vscode/webview-ui-toolkit/react"
import { useTranslation } from "react-i18next"
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
	const getApiKeyText = /^[aeiou]/i.test(providerName)
		? t("settings.apiConfig.getApiKeyAn", { providerName })
		: t("settings.apiConfig.getApiKey", { providerName })

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
					<VSCodeLink
						href={signupUrl}
						style={{
							display: "inline",
							fontSize: "inherit",
						}}>
						{" "}
						{getApiKeyText}
					</VSCodeLink>
				)}
			</p>
		</div>
	)
}
