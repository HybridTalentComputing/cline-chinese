import { VSCodeCheckbox, VSCodeLink } from "@vscode/webview-ui-toolkit/react"
import { useExtensionState } from "@/context/ExtensionStateContext"
import PreferredLanguageSetting from "../PreferredLanguageSetting"
import Section from "../Section"

interface GeneralSettingsSectionProps {
	renderSectionHeader: (tabId: string) => JSX.Element | null
}

const GeneralSettingsSection = ({ renderSectionHeader }: GeneralSettingsSectionProps) => {
	const { telemetrySetting } = useExtensionState()

	return (
		<div>
			{renderSectionHeader("general")}
			<Section>
				<PreferredLanguageSetting />
				<div className="mb-[5px]">
					<h2 className="block mb-1 text-sm font-medium">本插件不会搜集和传输任何用户信息</h2>
					<p className="text-xs mt-[5px] text-[var(--vscode-descriptionForeground)]">
						选择使用胜算云 API Router 功能的用户。请参阅我们的{" "}
						<VSCodeLink className="text-inherit" href="https://docs.router.shengsuanyun.com/terms-of-service">
							使用条款
						</VSCodeLink>{" "}
						and{" "}
						<VSCodeLink className="text-inherit" href="https://docs.router.shengsuanyun.com/privacy-policy">
							隐私政策
						</VSCodeLink>{" "}
						获取详情.
					</p>
				</div>
			</Section>
		</div>
	)
}

export default GeneralSettingsSection
