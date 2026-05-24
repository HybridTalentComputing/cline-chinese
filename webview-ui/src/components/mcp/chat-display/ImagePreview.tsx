import { StringRequest } from "@shared/proto/cline/common"
import DOMPurify from "dompurify"
import React from "react"
import { useTranslation } from "react-i18next"
import ChatErrorBoundary from "@/components/chat/ChatErrorBoundary"
import { FileServiceClient, WebServiceClient } from "@/services/grpc-client"
import { checkIfImageUrl, formatUrlForOpening, getSafeHostname } from "./utils/mcpRichUtil"

interface ImagePreviewProps {
	url: string
}

// Wrapper component that provides i18n context to the class component
const ImagePreviewInner: React.FC<ImagePreviewProps> = (props) => {
	const { t } = useTranslation("misc")

	// Use a class-like approach with hooks
	const [state, setState] = React.useState({
		loading: true,
		error: null as string | null,
		fetchStartTime: Date.now(),
	})
	const [aspectRatio, setAspectRatio] = React.useState(1)
	const imgRef = React.createRef<HTMLImageElement>()
	const timeoutRef = React.useRef<NodeJS.Timeout | null>(null)
	const heartbeatRef = React.useRef<NodeJS.Timeout | null>(null)
	const [elapsedSeconds, setElapsedSeconds] = React.useState(0)

	// Track aspect ratio for proper display
	const aspectRatioRef = React.useRef(1)

	const cleanup = React.useCallback(() => {
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current)
			timeoutRef.current = null
		}
		if (heartbeatRef.current) {
			clearInterval(heartbeatRef.current)
			heartbeatRef.current = null
		}
	}, [])

	const handleImageLoad = React.useCallback(() => {
		setState((prev) => ({ ...prev, loading: false }))
		cleanup()
	}, [cleanup])

	const handleImageError = React.useCallback(() => {
		setState({
			loading: false,
			error: `Failed to load image: ${props.url}`,
			fetchStartTime: Date.now(),
		})
		cleanup()
	}, [props.url, cleanup])

	const checkContentType = React.useCallback(
		(url: string) => {
			checkIfImageUrl(url)
				.then((isImage) => {
					if (isImage) {
						loadImage(url)
					} else {
						handleImageError()
					}
				})
				.catch(() => {
					handleImageError()
				})
		},
		[handleImageError],
	)

	const loadImage = React.useCallback(
		(url: string) => {
			const isSvg = /\.svg(\?.*)?$/i.test(url)

			if (isSvg) {
				aspectRatioRef.current = 1
				handleImageLoad()
				return
			}

			const testImg = new Image()
			testImg.onload = () => {
				if (testImg.width > 0 && testImg.height > 0) {
					aspectRatioRef.current = testImg.width / testImg.height
				}
				handleImageLoad()
			}
			testImg.onerror = () => {
				handleImageError()
			}
			testImg.crossOrigin = "anonymous"
		},
		[handleImageLoad, handleImageError],
	)

	React.useEffect(() => {
		timeoutRef.current = setTimeout(() => {
			if (state.loading) {
				setState({
					loading: false,
					error: `Timeout loading image: ${props.url}`,
					fetchStartTime: Date.now(),
				})
			}
		}, 15000)

		heartbeatRef.current = setInterval(() => {
			if (state.loading) {
				setElapsedSeconds(Math.floor((Date.now() - state.fetchStartTime) / 1000))
			}
		}, 1000)

		checkContentType(props.url)

		return () => {
			cleanup()
		}
	}, [props.url])

	if (state.loading) {
		const currentElapsed = Math.floor((Date.now() - state.fetchStartTime) / 1000)
		return (
			<div
				className="image-preview-loading"
				style={{
					padding: "12px",
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
					{t("mcp.chatDisplay.loadingImage", { host: getSafeHostname(props.url) })}
				</div>
				{currentElapsed > 3 && (
					<div style={{ fontSize: "11px", color: "var(--vscode-descriptionForeground)" }}>
						{currentElapsed > 60
							? t("mcp.chatDisplay.waitingFor", {
									time: `${Math.floor(currentElapsed / 60)}m ${currentElapsed % 60}s`,
								})
							: t("mcp.chatDisplay.waitingFor", { time: `${currentElapsed}s` })}
					</div>
				)}
				{/* Hidden image that we'll use to detect load/error events */}
				{/\.svg(\?.*)?$/i.test(props.url) ? (
					<object
						data={DOMPurify.sanitize(props.url)}
						onError={handleImageError}
						onLoad={handleImageLoad}
						style={{ display: "none" }}
						type="image/svg+xml"
					/>
				) : (
					<img
						alt=""
						onError={handleImageError}
						onLoad={handleImageLoad}
						ref={imgRef}
						src={DOMPurify.sanitize(props.url)}
						style={{ display: "none" }}
					/>
				)}
			</div>
		)
	}

	if (state.error) {
		return (
			<div
				className="image-preview-error"
				onClick={async () => {
					try {
						await WebServiceClient.openInBrowser(
							StringRequest.create({
								value: DOMPurify.sanitize(props.url),
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
				}}>
				<div style={{ fontWeight: "bold" }}>{t("mcp.chatDisplay.failedToLoadImage")}</div>
				<div style={{ fontSize: "12px", marginTop: "4px" }}>{getSafeHostname(props.url)}</div>
				<div style={{ fontSize: "11px", marginTop: "8px", color: "var(--vscode-textLink-foreground)" }}>
					{t("mcp.chatDisplay.clickToOpenBrowser")}
				</div>
			</div>
		)
	}

	// Render the image
	return (
		<div
			className="image-preview"
			onClick={async () => {
				try {
					// For data URIs, open in VS Code editor (like mermaid diagrams)
					if (props.url.startsWith("data:")) {
						await FileServiceClient.openImage(StringRequest.create({ value: props.url }))
					} else {
						// For regular URLs, open in browser
						await WebServiceClient.openInBrowser(
							StringRequest.create({
								value: DOMPurify.sanitize(formatUrlForOpening(props.url)),
							}),
						)
					}
				} catch (err) {
					console.error("Error opening image:", err)
				}
			}}
			style={{
				margin: "10px 0",
				maxWidth: "100%",
				cursor: "pointer",
			}}>
			{/\.svg(\?.*)?$/i.test(props.url) ? (
				// Special handling for SVG images
				<object
					aria-label={t("mcp.chatDisplay.svgFrom", { host: getSafeHostname(props.url) })}
					data={DOMPurify.sanitize(props.url)}
					style={{
						width: "100%",
						height: "auto",
						borderRadius: "4px",
					}}
					type="image/svg+xml">
					{/* Fallback if object tag fails */}
					<img
						alt={t("mcp.chatDisplay.svgFrom", { host: getSafeHostname(props.url) })}
						src={DOMPurify.sanitize(props.url)}
						style={{
							width: "100%",
							height: "auto",
							borderRadius: "4px",
						}}
					/>
				</object>
			) : (
				<img
					alt={t("mcp.chatDisplay.imageFrom", { host: getSafeHostname(props.url) })}
					loading="eager"
					src={DOMPurify.sanitize(props.url)}
					style={{
						width: "100%",
						height: "auto",
						borderRadius: "4px",
					}}
				/>
			)}
		</div>
	)
}

// Create a wrapper component that memoizes the ImagePreview to prevent unnecessary re-renders
const MemoizedImagePreview = React.memo(
	(props: ImagePreviewProps) => <ImagePreviewInner {...props} />,
	(prevProps, nextProps) => prevProps.url === nextProps.url, // Only re-render if URL changes
)

// Wrap the ImagePreview component with an error boundary
const ImagePreviewWithErrorBoundary: React.FC<ImagePreviewProps> = (props) => {
	const { t } = useTranslation("misc")
	return (
		<ChatErrorBoundary errorTitle={t("mcp.chatDisplay.somethingWrongImage")}>
			<MemoizedImagePreview {...props} />
		</ChatErrorBoundary>
	)
}

export default ImagePreviewWithErrorBoundary
