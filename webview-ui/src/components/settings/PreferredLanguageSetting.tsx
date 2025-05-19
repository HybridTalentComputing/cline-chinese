import { VSCodeDropdown, VSCodeOption } from "@vscode/webview-ui-toolkit/react"
import React from "react"
import { ChatSettings } from "@shared/ChatSettings"

interface PreferredLanguageSettingProps {
	chatSettings: ChatSettings
	setChatSettings: (settings: ChatSettings) => void
}

const PreferredLanguageSetting: React.FC<PreferredLanguageSettingProps> = ({ chatSettings, setChatSettings }) => {
	return (
		<div style={{ marginTop: 10, marginBottom: 10 }}>
			<label htmlFor="preferred-language-dropdown" className="block mb-1 text-sm font-medium">
				首选语言
			</label>
			<VSCodeDropdown
				id="preferred-language-dropdown"
				currentValue={chatSettings.preferredLanguage || "English"}
				onChange={(e: any) => {
					const newLanguage = e.target.value
					setChatSettings({
						...chatSettings,
						preferredLanguage: newLanguage,
					}) // 这会构造一个完整的 ChatSettings 对象
				}}
				style={{ width: "100%" }}>
				<VSCodeOption value="English">英语</VSCodeOption>
				<VSCodeOption value="Arabic - العربية">阿拉伯语 - العربية</VSCodeOption>
				<VSCodeOption value="Portuguese - Português (Brasil)">葡萄牙语 - Português (Brasil)</VSCodeOption>
				<VSCodeOption value="Czech - Čeština">捷克语 - Čeština</VSCodeOption>
				<VSCodeOption value="French - Français">法语 - Français</VSCodeOption>
				<VSCodeOption value="German - Deutsch">德语 - Deutsch</VSCodeOption>
				<VSCodeOption value="Hindi - हिन्दी">印地语 - हिन्दी</VSCodeOption>
				<VSCodeOption value="Hungarian - Magyar">匈牙利语 - Magyar</VSCodeOption>
				<VSCodeOption value="Italian - Italiano">意大利语 - Italiano</VSCodeOption>
				<VSCodeOption value="Japanese - 日本語">日语 - 日本語</VSCodeOption>
				<VSCodeOption value="Korean - 한국어">韩语 - 한국어</VSCodeOption>
				<VSCodeOption value="Polish - Polski">波兰语 - Polski</VSCodeOption>
				<VSCodeOption value="Portuguese - Português (Portugal)">葡萄牙语 - Português (Portugal)</VSCodeOption>
				<VSCodeOption value="Russian - Русский">俄语 - Русский</VSCodeOption>
				<VSCodeOption value="Simplified Chinese - 简体中文">简体中文 - 简体中文</VSCodeOption>
				<VSCodeOption value="Spanish - Español">西班牙语 - Español</VSCodeOption>
				<VSCodeOption value="Traditional Chinese - 繁體中文">繁體中文 - 繁體中文</VSCodeOption>
				<VSCodeOption value="Turkish - Türkçe">土耳其语 - Türkçe</VSCodeOption>
			</VSCodeDropdown>
			<p className="text-xs text-[var(--vscode-descriptionForeground)] mt-1">
				Cline 用于交流的语言。
			</p>
		</div>
	)
}

export default React.memo(PreferredLanguageSetting)
