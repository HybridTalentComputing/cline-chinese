/**
 * Action types that can be triggered from banner buttons/links
 * Frontend maps these to actual handlers
 */
export enum BannerActionType {
	/** Open external URL */
	Link = "link",
	/** Open API settings tab */
	ShowApiSettings = "show-api-settings",
	/** Open feature settings tab */
	ShowFeatureSettings = "show-feature-settings",
	/** Open account/login view */
	ShowAccount = "show-account",
	/** Set the active model */
	SetModel = "set-model",
	/** Trigger CLI installation flow */
	InstallCli = "install-cli",
}

/**
 * Backend banner format returned from server API
 */
export interface BackendBanner {
	id: string
	titleMd: string
	bodyMd: string
	rulesJson: string
}

/**
 * Banner data structure for backend-to-frontend communication.
 * Backend constructs this JSON, frontend renders it via BannerCarousel.
 */
export interface BannerCardData {
	/** Unique identifier for the banner (used for dismissal tracking) */
	id: string

	/** Banner title text */
	title: string

	/** Banner description/body markdown text */
	description: string

	/**
	 * Icon ID from Lucide icon set (e.g., "lightbulb", "megaphone", "terminal")
	 * LINK: https://lucide.dev/icons/
	 * Optional - if omitted, no icon is shown
	 */
	icon?: string

	/**
	 * Optional footer action buttons
	 * Rendered below the description as prominent buttons
	 */
	actions?: BannerAction[]

	/**
	 * Platform filter - only show on specified platforms
	 * If undefined, show on all platforms
	 */
	platforms?: ("windows" | "mac" | "linux")[]

	/** Only show to Cline users */
	isClineUserOnly?: boolean
}

/**
 * Single action definition (button or link)
 */
export interface BannerAction {
	/** Button/link label text */
	title: string

	/**
	 * Action type - determines what happens on click
	 * Defaults to "link" if omitted
	 */
	action?: BannerActionType

	/**
	 * Action argument - interpretation depends on action type:
	 * - Link: URL to open
	 * - SetModel: model ID (e.g., "anthropic/claude-opus-4.5")
	 * - Others: generally unused
	 */
	arg?: string
}

/**
 * The list of predefined banner config rendered by the Welcome Section UI.
 * TODO: Backend would return a similar JSON structure in the future which we will replace this with.
 */
export const BANNER_DATA: BannerCardData[] = [
	// Info banner with inline link
	{
		id: "info-banner-v1",
		icon: "lightbulb",
		title: "在右侧边栏使用 Cline",
		description:
			"为了获得最佳体验，请将 Cline 图标拖动到右侧边栏。这样在与 Cline 聊天时，您的文件资源管理器和编辑器仍然可见，从而更轻松地浏览代码库并实时查看更改。[查看如何操作 →](https://docs.cline.bot/features/customization/opening-cline-in-sidebar)",
	},

	// Announcement with conditional actions based on user auth state
	{
		id: "new-model-opus-4-5-cline-users",
		icon: "megaphone",
		title: "Claude Opus 4.5 现已推出",
		description: "最先进的性能，成本比 Opus 4.1 低 3 倍。现已在 Cline 提供商中可用。",
		actions: [
			{
				title: "立即尝试",
				action: BannerActionType.SetModel,
				arg: "anthropic/claude-opus-4.5",
			},
		],
		isClineUserOnly: true, // Only Cline users see this
	},

	{
		id: "new-model-opus-4-5-non-cline-users",
		icon: "megaphone",
		title: "Claude Opus 4.5 现已推出",
		description: "最先进的性能，成本比 Opus 4.1 低 3 倍。现已在 Cline 提供商中可用。",
		actions: [
			{
				title: "开始使用",
				action: BannerActionType.ShowAccount,
			},
		],
		isClineUserOnly: false, // Only non-Cline users see this
	},

	// Platform-specific banner (macOS/Linux)
	{
		id: "cli-install-unix-v1",
		icon: "terminal",
		title: "CLI 和子代理现已可用",
		platforms: ["mac", "linux"] satisfies BannerCardData["platforms"],
		description: "在终端中使用 Cline 并启用子代理功能。[了解更多](https://docs.cline.bot/cline-cli/overview)",
		actions: [
			{
				title: "安装",
				action: BannerActionType.InstallCli,
			},
			{
				title: "启用子代理",
				action: BannerActionType.ShowFeatureSettings,
			},
		],
	},

	// Platform-specific banner (Windows)
	{
		id: "cli-info-windows-v1",
		icon: "terminal",
		title: "Cline CLI 信息",
		platforms: ["windows"] satisfies BannerCardData["platforms"],
		description: "适用于 macOS 和 Linux。即将支持其他平台。[了解更多](https://docs.cline.bot/cline-cli/overview)",
	},
]
