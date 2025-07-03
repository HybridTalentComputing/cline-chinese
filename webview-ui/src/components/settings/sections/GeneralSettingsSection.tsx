import { VSCodeCheckbox, VSCodeLink } from "@vscode/webview-ui-toolkit/react"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { updateSetting } from "../utils/settingsHandlers"
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
					<VSCodeCheckbox
						className="mb-[5px]"
						checked={telemetrySetting !== "disabled"}
						onChange={(e: any) => {
							const checked = e.target.checked === true
							updateSetting("telemetrySetting", checked ? "enabled" : "disabled")
						}}>
						允许匿名错误和使用情况报告
					</VSCodeCheckbox>
					<p className="text-xs mt-[5px] text-[var(--vscode-descriptionForeground)]">
						通过发送匿名使用数据和错误报告来帮助改进 Cline。我们绝不会发送任何代码、提示或个人信息。请参阅我们的{" "}
						<VSCodeLink href="https://docs.cline.bot/more-info/telemetry" className="text-inherit">
							遥测概述
						</VSCodeLink>{" "}
						和{" "}
						<VSCodeLink href="https://cline.bot/privacy" className="text-inherit">
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
