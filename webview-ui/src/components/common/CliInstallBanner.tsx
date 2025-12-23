import { EmptyRequest, Int64Request } from "@shared/proto/index.cline"
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react"
import { Terminal, XIcon } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { Button } from "@/components/ui/button"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { StateServiceClient } from "@/services/grpc-client"
import { isMacOSOrLinux } from "@/utils/platformUtils"
import { getAsVar, VSC_INACTIVE_SELECTION_BACKGROUND } from "@/utils/vscStyles"

export const CURRENT_CLI_BANNER_VERSION = 1

export const CliInstallBanner: React.FC = () => {
	const { t } = useTranslation()
	const { navigateToSettings, subagentsEnabled } = useExtensionState()
	const [isCopied, setIsCopied] = useState(false)
	const [isClineCliInstalled, setIsClineCliInstalled] = useState(false)

	// Poll for CLI installation status while the component is mounted
	useEffect(() => {
		const checkInstallation = async () => {
			try {
				const result = await StateServiceClient.checkCliInstallation(EmptyRequest.create())
				setIsClineCliInstalled(result.value)
			} catch (error) {
				console.error("Failed to check CLI installation:", error)
			}
		}

		// Check immediately when component mounts
		checkInstallation()

		// Set up polling interval (every 1.5 seconds)
		const pollInterval = setInterval(checkInstallation, 1500)

		// Clean up interval when component unmounts
		return () => {
			clearInterval(pollInterval)
		}
	}, [])

	const handleClose = useCallback((e?: React.MouseEvent) => {
		e?.preventDefault()
		e?.stopPropagation()

		// Update state to hide banner
		StateServiceClient.updateCliBannerVersion(Int64Request.create({ value: CURRENT_CLI_BANNER_VERSION })).catch(console.error)
	}, [])

	const handleInstallClick = async () => {
		if (!isClineCliInstalled) {
			try {
				// Call the backend to initiate CLI installation
				await StateServiceClient.installClineCli(EmptyRequest.create())
				// Banner will automatically close after successful installation
				// setTimeout(() => {
				// 	handleClose()
				// }, 500)
			} catch (error) {
				console.error("Failed to initiate CLI installation:", error)
			}
		}
	}

	const handleEnableSubagents = () => {
		if (!subagentsEnabled) {
			navigateToSettings("features")
		}
	}

	const handleCopyCommand = async (e: React.MouseEvent) => {
		e.preventDefault()
		e.stopPropagation()

		// Copy the install command to clipboard
		await navigator.clipboard.writeText("npm install -g cline")

		// Show feedback by changing the icon
		setIsCopied(true)
		setTimeout(() => {
			setIsCopied(false)
		}, 1500)
	}

	return (
		<div
			className="flex flex-col gap-1 shrink-0 mb-1 relative text-sm mt-1.5 mx-4 no-underline transition-colors border-0 text-left"
			style={{
				backgroundColor: getAsVar(VSC_INACTIVE_SELECTION_BACKGROUND),
				borderRadius: "3px",
				color: "var(--vscode-foreground)",
				padding: "12px",
			}}>
			<h4 className="m-0 flex items-center gap-2" style={{ paddingRight: "24px" }}>
				<Terminal className="w-4 h-4" />
				{isMacOSOrLinux() ? t("banner.cliInstallBanner.titleUnix") : t("banner.cliInstallBanner.titleWindows")}
			</h4>
			<p className="m-0">
				{isMacOSOrLinux() ? (
					<>
						<span dangerouslySetInnerHTML={{ __html: t("banner.cliInstallBanner.descriptionUnix") }} />{" "}
						<a
							href="https://docs.cline.bot/cline-cli/overview"
							rel="noopener noreferrer"
							style={{ color: "var(--vscode-textLink-foreground)" }}
							target="_blank">
							{t("banner.cliInstallBanner.learnMore")}
						</a>
					</>
				) : (
					<>
						<span dangerouslySetInnerHTML={{ __html: t("banner.cliInstallBanner.descriptionWindows") }} />{" "}
						<a
							href="https://docs.cline.bot/cline-cli/overview"
							rel="noopener noreferrer"
							style={{ color: "var(--vscode-textLink-foreground)" }}
							target="_blank">
							{t("banner.cliInstallBanner.learnMore")}
						</a>
					</>
				)}
			</p>
			<div className="flex flex-col gap-2 my-1">
				<div
					className="p-2 rounded flex items-center justify-between"
					style={{
						backgroundColor: "var(--vscode-editor-background)",
						fontFamily: "var(--vscode-editor-font-family)",
						fontSize: 12,
					}}>
					npm install -g cline
					<VSCodeButton
						appearance="icon"
						onClick={handleCopyCommand}
						style={{ marginLeft: "8px", flexShrink: 0 }}
						title={isCopied ? t("banner.cliInstallBanner.copied") : t("banner.cliInstallBanner.copyCommand")}>
						<span className={`codicon ${isCopied ? "codicon-check" : "codicon-copy"}`}></span>
					</VSCodeButton>
				</div>
				{isMacOSOrLinux() ? (
					<div className="flex gap-2">
						<VSCodeButton
							appearance="primary"
							className="flex-1"
							disabled={isClineCliInstalled}
							onClick={handleInstallClick}>
							{isClineCliInstalled ? (
								<>
									<span className="codicon codicon-check" style={{ marginRight: "4px" }}></span>
									{t("banner.cliInstallBanner.installed")}
								</>
							) : (
								t("banner.cliInstallBanner.install")
							)}
						</VSCodeButton>
						<VSCodeButton
							appearance="primary"
							className="flex-1"
							disabled={subagentsEnabled}
							onClick={handleEnableSubagents}
							title={t("banner.cliInstallBanner.configureSubagents")}>
							{t("banner.cliInstallBanner.enableSubagents")}
						</VSCodeButton>
					</div>
				) : (
					<div className="flex gap-2">
						<VSCodeButton
							appearance="primary"
							className="flex-1"
							disabled={isClineCliInstalled}
							onClick={handleInstallClick}>
							{isClineCliInstalled ? (
								<>
									<span className="codicon codicon-check" style={{ marginRight: "4px" }}></span>
									{t("banner.cliInstallBanner.installed")}
								</>
							) : (
								t("banner.cliInstallBanner.installCli")
							)}
						</VSCodeButton>
						<VSCodeButton
							appearance="secondary"
							className="flex-1"
							disabled
							title={t("banner.cliInstallBanner.subagentsWindowsTooltip")}>
							{t("banner.cliInstallBanner.subagentsWindows")}
						</VSCodeButton>
					</div>
				)}
			</div>

			{/* Close button */}
			<Button
				className="absolute top-2.5 right-2"
				data-testid="cli-banner-close-button"
				onClick={handleClose}
				size="icon"
				variant="icon">
				<XIcon />
			</Button>
		</div>
	)
}

export default CliInstallBanner
