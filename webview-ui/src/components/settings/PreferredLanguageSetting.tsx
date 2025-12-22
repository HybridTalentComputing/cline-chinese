import { VSCodeDropdown, VSCodeOption } from "@vscode/webview-ui-toolkit/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { updateSetting } from "./utils/settingsHandlers"
import { languageOptions } from "@shared/Languages"

const PreferredLanguageSetting: React.FC = () => {
	const { t } = useTranslation()
	const { preferredLanguage } = useExtensionState()

	const handleLanguageChange = (newLanguage: string) => {
		updateSetting("preferredLanguage", newLanguage)
	}

	return (
		<div style={{}}>
			<label className="block mb-1 text-base font-medium" htmlFor="preferred-language-dropdown">
				{t("settings.general.preferredLanguage")}
			</label>
			<VSCodeDropdown
				currentValue={preferredLanguage || "Simplified Chinese - 简体中文"}
				id="preferred-language-dropdown"
				onChange={(e: any) => {
					handleLanguageChange(e.target.value)
				}}
				style={{ width: "100%" }}>
				{languageOptions.map((option) => (
					<VSCodeOption key={option.key} value={option.display}>
						{option.display}
					</VSCodeOption>
				))}
			</VSCodeDropdown>
			<p className="text-sm text-description mt-1">{t("settings.general.preferredLanguageDescription")}</p>
		</div>
	)
}

export default React.memo(PreferredLanguageSetting)
