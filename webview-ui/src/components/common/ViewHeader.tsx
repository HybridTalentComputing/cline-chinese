import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { getEnvironmentColor } from "@/utils/environmentColors"
import type { Environment } from "../../../../src/shared/config-types"

type ViewHeaderProps = {
	title: string
	onDone: () => void
	showEnvironmentSuffix?: boolean
	environment?: Environment
}

const ViewHeader = ({ title, onDone, showEnvironmentSuffix, environment }: ViewHeaderProps) => {
	const { t } = useTranslation("misc")
	const showSubtext = showEnvironmentSuffix && environment && environment !== "production"
	const envKey = environment ? `common.environment.${environment}` : ""
	const envDisplayName = environment ? t(envKey) : ""
	const titleColor = getEnvironmentColor(environment)

	return (
		<div className="flex justify-between items-center py-2.5 px-5 mb-[17px]">
			<div className="relative">
				<h3 className="m-0 text-lg font-normal" style={{ color: titleColor }}>
					{title}
				</h3>
				{showSubtext && (
					<span className="absolute left-0 top-8 -translate-y-1 text-xs text-description whitespace-nowrap">
						{t("common.viewHeader.environment", { env: envDisplayName })}
					</span>
				)}
			</div>
			<Button onClick={onDone} size="header">
				{t("common.viewHeader.done")}
			</Button>
		</div>
	)
}

export default ViewHeader
