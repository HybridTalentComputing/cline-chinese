import { EmptyRequest } from "@shared/proto/index.cline"
import { VSCodeButton, VSCodeLink } from "@vscode/webview-ui-toolkit/react"
import { useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { RemoteConfigToggle } from "@/components/account/RemoteConfigToggle"
import { useClineAuth } from "@/context/ClineAuthContext"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { StateServiceClient } from "@/services/grpc-client"
import Section from "../Section"

interface RemoteConfigSectionProps {
	renderSectionHeader: (tabId: string) => JSX.Element | null
}

function BaseRemoteConfigSection({ renderSectionHeader, children }: React.PropsWithChildren<RemoteConfigSectionProps>) {
	return (
		<div>
			{renderSectionHeader("remote-config")}
			<Section>{children}</Section>
		</div>
	)
}

const AUTOMATIC_DELAY_MS = 30000

function RefreshButton() {
	const { t } = useTranslation("settings")
	const [isLoading, setIsLoading] = useState(false)
	const [retryIn, setRetryIn] = useState<number | null>(null)
	const intervalRef = useRef<NodeJS.Timeout>()

	useEffect(() => {
		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current)
			}
		}
	}, [])

	const onRefresh = () => {
		setIsLoading(true)
		StateServiceClient.refreshRemoteConfig(EmptyRequest.create()).finally(() => {
			setIsLoading(false)
			setRetryIn(AUTOMATIC_DELAY_MS / 1000)

			intervalRef.current = setInterval(() => {
				setRetryIn((old) => {
					if (old && old > 0) return old - 1

					intervalRef.current && clearInterval(intervalRef.current)
					return null
				})
			}, 1000)
		})
	}

	return (
		<VSCodeButton
			className={`w-full rounded-xs ${isLoading ? "animate-pulse" : ""}`}
			disabled={isLoading || (retryIn !== null && retryIn > 0)}
			onClick={() => onRefresh()}>
			Refresh {retryIn && retryIn > 0 && <>(Retry in: {retryIn} seconds)</>}
		</VSCodeButton>
	)
}

interface SettingRowProps {
	label: string
	value: string | number | boolean | undefined | null
	isSecret?: boolean
}

function SettingRow({ label, value, isSecret }: SettingRowProps) {
	const { t } = useTranslation("settings")
	const displayValue = (() => {
		if (value === undefined || value === null) {
			return <span className="text-description italic">{t("remoteConfig.notConfigured")}</span>
		}
		if (typeof value === "boolean") {
			return value ? (
				<span className="text-green-500">{t("remoteConfig.enabled")}</span>
			) : (
				<span className="text-description">{t("remoteConfig.disabled")}</span>
			)
		}
		if (isSecret && typeof value === "string" && value.length > 0) {
			return <span className="font-mono text-xs">{"•".repeat(Math.min(value.length, 20))}</span>
		}
		return <span className="font-mono text-xs break-all">{String(value)}</span>
	})()

	const isLongValue = typeof value === "string" && value.length > 25
	if (isLongValue) {
		return (
			<div className="flex flex-col gap-1 py-1.5 border-b border-vscode-widget-border last:border-b-0">
				<span className="text-description text-xs">{label}</span>
				<div className="pl-2 overflow-hidden text-right">{displayValue}</div>
			</div>
		)
	}

	return (
		<div className="flex justify-between items-center py-1.5 border-b border-vscode-widget-border last:border-b-0 gap-2">
			<span className="text-description text-xs shrink-0">{label}</span>
			<span className="text-right overflow-hidden text-ellipsis">{displayValue}</span>
		</div>
	)
}

interface TestButtonProps {
	label: string
	onClick: () => Promise<void>
	disabled?: boolean
	successMessage?: string
}

function TestButton({ label, onClick, disabled, successMessage }: TestButtonProps) {
	const { t } = useTranslation("settings")
	const [isLoading, setIsLoading] = useState(false)
	const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
	const timeoutRef = useRef<NodeJS.Timeout>()

	useEffect(() => {
		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current)
			}
		}
	}, [])

	const handleClick = async () => {
		setIsLoading(true)
		setResult(null)
		try {
			await onClick()
			setResult({ success: true, message: successMessage || t("remoteConfig.success") })
		} catch (error) {
			setResult({ success: false, message: error instanceof Error ? error.message : t("remoteConfig.failed") })
		} finally {
			setIsLoading(false)
			timeoutRef.current = setTimeout(() => setResult(null), 5000)
		}
	}

	return (
		<div className="flex items-center gap-2">
			<VSCodeButton
				appearance="secondary"
				className={isLoading ? "animate-pulse" : ""}
				disabled={disabled || isLoading}
				onClick={handleClick}>
				{isLoading ? t("remoteConfig.testing") : label}
			</VSCodeButton>
			{result && <span className={`text-xs ${result.success ? "text-green-500" : "text-red-500"}`}>{result.message}</span>}
		</div>
	)
}

function OtelSettingsSection() {
	const { t } = useTranslation("settings")
	const { remoteConfigSettings } = useExtensionState()

	const otelEnabled = remoteConfigSettings?.openTelemetryEnabled
	const hasOtelConfig =
		otelEnabled !== undefined ||
		remoteConfigSettings?.openTelemetryOtlpEndpoint !== undefined ||
		remoteConfigSettings?.openTelemetryMetricsExporter !== undefined ||
		remoteConfigSettings?.openTelemetryLogsExporter !== undefined

	if (!hasOtelConfig) {
		return null
	}

	const handleTestOtel = async () => {
		const response = await StateServiceClient.testOtelConnection(EmptyRequest.create({}))
		if (!response.success) {
			throw new Error(response.error || "Test failed")
		}
	}

	return (
		<div className="mb-4">
			<h4 className="text-sm font-medium mb-2 flex items-center gap-2">
				<i className="codicon codicon-pulse" />
				OpenTelemetry Configuration
			</h4>
			<div className="bg-vscode-textBlockQuote-background rounded p-3 mb-2">
				<SettingRow label={t("remoteConfig.otelEnabled")} value={otelEnabled} />
				<SettingRow
					label={t("remoteConfig.metricsExporter")}
					value={remoteConfigSettings?.openTelemetryMetricsExporter}
				/>
				<SettingRow label={t("remoteConfig.logsExporter")} value={remoteConfigSettings?.openTelemetryLogsExporter} />
				<SettingRow label={t("remoteConfig.otlpProtocol")} value={remoteConfigSettings?.openTelemetryOtlpProtocol} />
				<SettingRow label={t("remoteConfig.otlpEndpoint")} value={remoteConfigSettings?.openTelemetryOtlpEndpoint} />
				{remoteConfigSettings?.openTelemetryOtlpMetricsEndpoint && (
					<SettingRow
						label={t("remoteConfig.metricsEndpoint")}
						value={remoteConfigSettings?.openTelemetryOtlpMetricsEndpoint}
					/>
				)}
				{remoteConfigSettings?.openTelemetryOtlpLogsEndpoint && (
					<SettingRow
						label={t("remoteConfig.logsEndpoint")}
						value={remoteConfigSettings?.openTelemetryOtlpLogsEndpoint}
					/>
				)}
				{remoteConfigSettings?.openTelemetryOtlpHeaders && (
					<SettingRow
						label={t("remoteConfig.otlpHeaders")}
						value={`${Object.keys(remoteConfigSettings.openTelemetryOtlpHeaders).length} ${t("remoteConfig.headerCount", { count: Object.keys(remoteConfigSettings.openTelemetryOtlpHeaders).length })}`}
					/>
				)}
				{remoteConfigSettings?.openTelemetryMetricExportInterval && (
					<SettingRow
						label={t("remoteConfig.metricExportInterval")}
						value={`${remoteConfigSettings.openTelemetryMetricExportInterval}ms`}
					/>
				)}
				{remoteConfigSettings?.openTelemetryOtlpInsecure !== undefined && (
					<SettingRow label={t("remoteConfig.otlpInsecure")} value={remoteConfigSettings?.openTelemetryOtlpInsecure} />
				)}
				{remoteConfigSettings?.openTelemetryLogBatchSize && (
					<SettingRow label={t("remoteConfig.logBatchSize")} value={remoteConfigSettings?.openTelemetryLogBatchSize} />
				)}
				{remoteConfigSettings?.openTelemetryLogBatchTimeout && (
					<SettingRow
						label={t("remoteConfig.logBatchTimeout")}
						value={`${remoteConfigSettings.openTelemetryLogBatchTimeout}ms`}
					/>
				)}
				{remoteConfigSettings?.openTelemetryLogMaxQueueSize && (
					<SettingRow
						label={t("remoteConfig.logMaxQueueSize")}
						value={remoteConfigSettings?.openTelemetryLogMaxQueueSize}
					/>
				)}
			</div>

			{otelEnabled && (
				<div className="flex gap-2 flex-wrap">
					<TestButton
						disabled={!remoteConfigSettings?.openTelemetryMetricsExporter}
						label={t("remoteConfig.test")}
						onClick={handleTestOtel}
						successMessage={t("remoteConfig.flushedBuffers")}
					/>
				</div>
			)}
		</div>
	)
}

function PromptUploadingSection() {
	const { t } = useTranslation("settings")
	const { remoteConfigSettings } = useExtensionState()

	const blobStoreConfig = remoteConfigSettings?.blobStoreConfig
	if (!blobStoreConfig) {
		return null
	}

	const handleTestPromptUploading = async () => {
		const response = await StateServiceClient.testPromptUploading(EmptyRequest.create({}))
		if (!response.success) {
			throw new Error(response.error || "Test failed")
		}
	}

	return (
		<div className="mb-4">
			<h4 className="text-sm font-medium mb-2 flex items-center gap-2">
				<i className="codicon codicon-cloud-upload" />
				Prompt Uploading Configuration
			</h4>
			<div className="bg-vscode-textBlockQuote-background rounded p-3 mb-2">
				<SettingRow label={t("remoteConfig.storageType")} value={blobStoreConfig.adapterType?.toUpperCase()} />
				<SettingRow label={t("remoteConfig.bucket")} value={blobStoreConfig.bucket} />
				<SettingRow label={t("remoteConfig.region")} value={blobStoreConfig.region} />
				{blobStoreConfig.endpoint && <SettingRow label={t("remoteConfig.endpoint")} value={blobStoreConfig.endpoint} />}
				{blobStoreConfig.accountId && (
					<SettingRow label={t("remoteConfig.accountId")} value={blobStoreConfig.accountId} />
				)}
				<SettingRow isSecret label={t("remoteConfig.accessKeyId")} value={blobStoreConfig.accessKeyId} />
				<SettingRow isSecret label={t("remoteConfig.secretAccessKey")} value={blobStoreConfig.secretAccessKey} />
				{blobStoreConfig.intervalMs && (
					<SettingRow label={t("remoteConfig.syncInterval")} value={`${blobStoreConfig.intervalMs}ms`} />
				)}
				{blobStoreConfig.batchSize && (
					<SettingRow label={t("remoteConfig.batchSize")} value={blobStoreConfig.batchSize} />
				)}
				{blobStoreConfig.maxRetries && (
					<SettingRow label={t("remoteConfig.maxRetries")} value={blobStoreConfig.maxRetries} />
				)}
				{blobStoreConfig.maxQueueSize && (
					<SettingRow label={t("remoteConfig.maxQueueSize")} value={blobStoreConfig.maxQueueSize} />
				)}
				<SettingRow label={t("remoteConfig.backfillEnabled")} value={blobStoreConfig.backfillEnabled} />
			</div>

			<TestButton label={t("remoteConfig.testUpload")} onClick={handleTestPromptUploading} />
		</div>
	)
}

export function RemoteConfigSection({ renderSectionHeader }: RemoteConfigSectionProps) {
	const { t } = useTranslation("settings")
	const { remoteConfigSettings, optOutOfRemoteConfig } = useExtensionState()
	const { activeOrganization } = useClineAuth()

	if (optOutOfRemoteConfig) {
		return (
			<BaseRemoteConfigSection renderSectionHeader={renderSectionHeader}>
				<div className="flex flex-col justify-center gap-4">
					<h3>{t("remoteConfig.optedOut")}</h3>

					<RemoteConfigToggle activeOrganization={activeOrganization} />
				</div>
			</BaseRemoteConfigSection>
		)
	}

	if (!remoteConfigSettings || Object.keys(remoteConfigSettings).length === 0) {
		return (
			<BaseRemoteConfigSection renderSectionHeader={renderSectionHeader}>
				<div className="flex flex-col justify-center gap-4">
					<h3>
						You haven't configured remote config yet. Do so through our{" "}
						<VSCodeLink href="https://app.cline.bot/dashboard/organization?tab=settings">
							{t("remoteConfig.dashboard")}
						</VSCodeLink>
						.
					</h3>

					<RefreshButton />
				</div>
			</BaseRemoteConfigSection>
		)
	}

	return (
		<BaseRemoteConfigSection renderSectionHeader={renderSectionHeader}>
			<div className="flex flex-col gap-2">
				<p className="text-description text-xs mb-2">{t("remoteConfig.settingsManagedByOrg")}</p>

				<OtelSettingsSection />
				<PromptUploadingSection />

				<div className="mt-2">
					<RefreshButton />
				</div>
			</div>
		</BaseRemoteConfigSection>
	)
}
