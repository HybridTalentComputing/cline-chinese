import { Button } from "@/components/ui/button"
import { useTranslation } from "react-i18next"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { StateServiceClient } from "@/services/grpc-client"
import Section from "../Section"

interface DebugSectionProps {
	onResetState: (resetGlobalState?: boolean) => Promise<void>
	renderSectionHeader: (tabId: string) => JSX.Element | null
}

const DebugSection = ({ onResetState, renderSectionHeader }: DebugSectionProps) => {
	const { t } = useTranslation()
	const { setShowWelcome } = useExtensionState()
	return (
		<div>
			{renderSectionHeader("debug")}
			<Section>
				<Button onClick={() => onResetState()} variant="danger">
					{t("settings.debug.resetWorkspace")}
				</Button>
				<Button onClick={() => onResetState(true)} variant="danger">
					{t("settings.debug.resetGlobal")}
				</Button>
				<p className="text-xs mt-[5px] text-(--vscode-descriptionForeground)">
					{t("settings.debug.resetGlobalDescription")}
				</p>
			</Section>
			<Section>
				<Button
					onClick={async () =>
						await StateServiceClient.setWelcomeViewCompleted({ value: false })
							.catch(() => {})
							.finally(() => setShowWelcome(true))
					}
					variant="secondary">
					{t("settings.debug.resetOnboarding")}
				</Button>
			</Section>
		</div>
	)
}

export default DebugSection
