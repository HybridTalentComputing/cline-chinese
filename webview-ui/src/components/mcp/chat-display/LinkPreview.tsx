import { StringRequest } from "@shared/proto/cline/common"
import DOMPurify from "dompurify"
import React from "react"
import { useTranslation } from "react-i18next"
import ChatErrorBoundary from "@/components/chat/ChatErrorBoundary"
import { WebServiceClient } from "@/services/grpc-client"
import { getSafeHostname, normalizeRelativeUrl } from "./utils/mcpRichUtil"

interface OpenGraphData {
	title?: string
	description?: string
	image?: string
	url?: string
	siteName?: string
	type?: string
}

interface LinkPreviewProps {
	url: string
}

interface LinkPreviewState {
	loading: boolean
	error: ErrorType
	errorMessage: string | null
	ogData: OpenGraphData | null
	/**
	 * Track if fetch has completed (success or error)
	 */
	hasCompletedFetch: boolean
	/**
	 * Track when the fetch started
	 */
	fetchStartTime: number
}

// Error types for better UI feedback
type ErrorType = "timeout" | "network" | "general" | null

// Use a function component with hooks instead of class component
const LinkPreview: React.FC<LinkPreviewProps> = ({ url }) => {
	const { t } = useTranslation("misc")
	const [loading, setLoading] = React.useState(true)
	const [error, setError] = React.useState<ErrorType>(null)
	const [errorMessage, setErrorMessage] = React.useState<string | null>(null)
	const [ogData, setOgData] = React.useState<OpenGraphData | null>(null)
	const [hasCompletedFetch, setHasCompletedFetch] = React.useState(false)
	const [fetchStartTime, setFetchStartTime] = React.useState(Date.now())
	const heartbeatRef = React.useRef<NodeJS.Timeout | null>(null)

	const cleanup = React.useCallback(() => {
		if (heartbeatRef.current) {
			clearInterval(heartbeatRef.current)
			heartbeatRef.current = null
		}
	}, [])

	React.useEffect(() => {
		setFetchStartTime(Date.now())

		const fetchOpenGraphData = async () => {
			try {
				const response = await WebServiceClient.fetchOpenGraphData(
					StringRequest.create({
						value: url,
					}),
				)

				if (response) {
					const data: OpenGraphData = {
						title: response.title || undefined,
						description: response.description || undefined,
						image: response.image || undefined,
						url: response.url || undefined,
						siteName: response.siteName || undefined,
						type: response.type || undefined,
					}

					setOgData(data)
					setLoading(false)
					setHasCompletedFetch(true)
				} else {
					setError("network")
					setErrorMessage("Failed to fetch Open Graph data")
					setLoading(false)
					setHasCompletedFetch(true)
				}

				cleanup()

				heartbeatRef.current = setInterval(() => {
					// Force update for elapsed time display
				}, 1000)
			} catch (err) {
				setError("general")
				setErrorMessage(err instanceof Error ? err.message : "Unknown error occurred")
				setLoading(false)
				setHasCompletedFetch(true)
				cleanup()
			}
		}

		fetchOpenGraphData()

		return () => {
			cleanup()
		}
	}, [url])

	// Calculate elapsed time for loading state
	const elapsedSeconds = loading ? Math.floor((Date.now() - fetchStartTime) / 1000) : 0

	// Fallback display while loading
	if (loading) {
		return (
			<div
				className="link-preview-loading"
				style={{
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "center",
					border: "1px solid var(--vscode-editorWidget-border, rgba(127, 127, 127, 0.3))",
					borderRadius: "4px",
					height: "128px",
					maxWidth: "512px",
				}}>
				<div style={{ display: "flex", alignItems: "center", marginBottom: "8px" }}>
					<div
						className="loading-spinner"
						style={{
							marginRight: "8px",
							width: "16px",
							height: "16px",
							border: "2px solid rgba(127, 127, 127, 0.3)",
							borderTopColor: "var(--vscode-textLink-foreground, #3794ff)",
							borderRadius: "50%",
							animation: "spin 1s linear infinite",
						}}
					/>
					<style>
						{`
							@keyframes spin {
								to { transform: rotate(360deg); }
							}
						`}
					</style>
					{t("mcp.chatDisplay.loadingPreview", { host: getSafeHostname(url) })}
				</div>
				{elapsedSeconds > 5 && (
					<div style={{ fontSize: "11px", color: "var(--vscode-descriptionForeground)" }}>
						{elapsedSeconds > 60
							? t("mcp.chatDisplay.waitingFor", {
									time: `${Math.floor(elapsedSeconds / 60)}m ${elapsedSeconds % 60}s`,
								})
							: t("mcp.chatDisplay.waitingFor", { time: `${elapsedSeconds}s` })}
					</div>
				)}
			</div>
		)
	}

	// Handle different error states with specific messages
	if (error) {
		let errorDisplay = t("mcp.chatDisplay.unableToLoad")

		if (error === "timeout") {
			errorDisplay = t("mcp.chatDisplay.timedOut")
		} else if (error === "network") {
			errorDisplay = t("mcp.chatDisplay.networkError")
		}

		return (
			<div
				className="link-preview-error"
				onClick={async () => {
					try {
						await WebServiceClient.openInBrowser(
							StringRequest.create({
								value: DOMPurify.sanitize(url),
							}),
						)
					} catch (err) {
						console.error("Error opening URL in browser:", err)
					}
				}}
				style={{
					padding: "12px",
					border: "1px solid var(--vscode-editorWidget-border, rgba(127, 127, 127, 0.3))",
					borderRadius: "4px",
					color: "var(--vscode-errorForeground)",
					height: "128px",
					maxWidth: "512px",
					overflow: "auto",
				}}>
				<div style={{ fontWeight: "bold" }}>{errorDisplay}</div>
				<div style={{ fontSize: "12px", marginTop: "4px" }}>{getSafeHostname(url)}</div>
				{errorMessage && <div style={{ fontSize: "11px", marginTop: "4px", opacity: 0.8 }}>{errorMessage}</div>}
				<div style={{ fontSize: "11px", marginTop: "8px", color: "var(--vscode-textLink-foreground)" }}>
					{t("mcp.chatDisplay.clickToOpenBrowser")}
				</div>
			</div>
		)
	}

	// Create a fallback object if ogData is null
	const data = ogData || {
		title: getSafeHostname(url),
		description: t("mcp.chatDisplay.noDescription"),
		siteName: getSafeHostname(url),
		url: url,
	}

	// Render the Open Graph preview
	return (
		<div
			className="link-preview"
			onClick={async () => {
				try {
					await WebServiceClient.openInBrowser(
						StringRequest.create({
							value: DOMPurify.sanitize(url),
						}),
					)
				} catch (err) {
					console.error("Error opening URL in browser:", err)
				}
			}}
			style={{
				display: "flex",
				border: "1px solid var(--vscode-editorWidget-border, rgba(127, 127, 127, 0.3))",
				borderRadius: "4px",
				overflow: "hidden",
				cursor: "pointer",
				height: "128px",
				maxWidth: "512px",
			}}>
			{data.image && (
				<div className="link-preview-image" style={{ width: "128px", height: "128px", flexShrink: 0 }}>
					<img
						alt=""
						onError={(e) => {
							console.log(`Image could not be loaded: ${data.image}`)
							// Hide the broken image
							;(e.target as HTMLImageElement).style.display = "none"
						}}
						onLoad={(e) => {
							// Check aspect ratio to determine if we should use contain or cover
							const img = e.currentTarget
							if (img.naturalWidth > 0 && img.naturalHeight > 0) {
								const aspectRatio = img.naturalWidth / img.naturalHeight

								// Use contain for extreme aspect ratios (logos), cover for photos
								if (aspectRatio > 2.5 || aspectRatio < 0.4) {
									img.style.objectFit = "contain"
								} else {
									img.style.objectFit = "cover"
								}
							}
						}}
						src={DOMPurify.sanitize(normalizeRelativeUrl(data.image, url))}
						style={{
							width: "100%",
							height: "100%",
							objectFit: "contain", // Use contain for link preview thumbnails to handle logos
							objectPosition: "center", // Center the image
						}}
					/>
				</div>
			)}

			<div
				className="link-preview-content"
				style={{
					flex: 1,
					padding: "12px",
					display: "flex",
					flexDirection: "column",
					overflow: "hidden",
					height: "100%", // Ensure full height
				}}>
				{/* Top section with title and URL - top aligned */}
				<div className="link-preview-top">
					<div
						className="link-preview-title"
						style={{
							fontWeight: "bold",
							marginBottom: "4px",
							whiteSpace: "nowrap",
							overflow: "hidden",
							textOverflow: "ellipsis",
						}}>
						{data.title || t("mcp.chatDisplay.noTitle")}
					</div>

					<div
						className="link-preview-url"
						style={{
							fontSize: "12px",
							color: "var(--vscode-textLink-foreground, #3794ff)",
							marginBottom: "8px", // Increased for better separation
							whiteSpace: "nowrap",
							overflow: "hidden",
							textOverflow: "ellipsis",
						}}>
						{data.siteName || getSafeHostname(url)}
					</div>
				</div>

				{/* Description with space-around in the remaining space */}
				<div
					className="link-preview-description-container"
					style={{
						flex: 1, // Take up remaining space
						display: "flex",
						flexDirection: "column",
						justifyContent: "space-around", // Space around in the remaining area
					}}>
					<div
						className="link-preview-description"
						style={{
							fontSize: "12px",
							color: "var(--vscode-descriptionForeground, rgba(204, 204, 204, 0.7))",
							overflow: "hidden",
							display: "-webkit-box",
							WebkitLineClamp: 3,
							WebkitBoxOrient: "vertical",
							textOverflow: "ellipsis",
						}}>
						{data.description || t("mcp.chatDisplay.noDescription")}
					</div>
				</div>
			</div>
		</div>
	)
}

// Create a wrapper component that memoizes the LinkPreview to prevent unnecessary re-renders
const MemoizedLinkPreview = React.memo(
	(props: LinkPreviewProps) => <LinkPreview {...props} />,
	(prevProps, nextProps) => prevProps.url === nextProps.url, // Only re-render if URL changes
)

// Wrap the LinkPreview component with an error boundary
const LinkPreviewWithErrorBoundary: React.FC<LinkPreviewProps> = (props) => {
	const { t } = useTranslation("misc")
	return (
		<ChatErrorBoundary errorTitle={t("mcp.chatDisplay.somethingWrongLink")}>
			<MemoizedLinkPreview {...props} />
		</ChatErrorBoundary>
	)
}

export default LinkPreviewWithErrorBoundary
