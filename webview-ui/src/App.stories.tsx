import { HeroUIProvider } from "@heroui/react"
import { DEFAULT_AUTO_APPROVAL_SETTINGS } from "@shared/AutoApprovalSettings"
import { type ApiConfiguration, bedrockModels } from "@shared/api"
import { CLINE_ONBOARDING_MODELS } from "@shared/cline/onboarding"
import type { ClineMessage, ClineSayTool } from "@shared/ExtensionMessage"
import type { HistoryItem } from "@shared/HistoryItem"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { useEffect, useMemo, useState } from "react"
import { expect, userEvent, within } from "storybook/test"
import { ExtensionStateContext, useExtensionState } from "@/context/ExtensionStateContext"
import ChatView from "./components/chat/ChatView"
import OnboardingView from "./components/onboarding/OnboardingView"
import WelcomeView from "./components/welcome/WelcomeView"

// Mock component that mimics App behavior but works in Storybook
const MockApp = () => {
	const { showWelcome, onboardingModels, showAnnouncement } = useExtensionState()

	return (
		<HeroUIProvider>
			{!showWelcome ? (
				onboardingModels ? (
					<OnboardingView onboardingModels={onboardingModels} />
				) : (
					<WelcomeView />
				)
			) : (
				<ChatView
					hideAnnouncement={() => {}}
					isHidden={false}
					showAnnouncement={showAnnouncement}
					showHistoryView={() => {}}
				/>
			)}
		</HeroUIProvider>
	)
}

// Constants
const SIDEBAR_CLASS = "flex flex-col justify-center h-[60%] w-[80%] overflow-hidden"
const ExtensionStateProviderMock = ExtensionStateContext.Provider

const meta: Meta<typeof MockApp> = {
	title: "Views/Chat",
	component: MockApp,
	parameters: {
		layout: "fullscreen",
		docs: {
			description: {
				component: `
The ChatView component is the main interface for interacting with Cline. It provides a comprehensive chat experience with AI assistance, task management, and various tools.

**Key Features:**
- **Task Management**: Create, resume, and manage AI-assisted tasks
- **Message History**: View conversation history with rich formatting
- **File & Image Support**: Attach files and images to messages
- **Tool Integration**: Execute commands, browse files, and use various tools
- **Auto-approval**: Configure automatic approval for certain actions
- **Streaming Responses**: Real-time AI response streaming
- **Context Management**: Intelligent conversation context handling
- **Plan/Act Modes**: Separate planning and execution phases
- **MCP Integration**: Model Context Protocol server support
- **Browser Automation**: Automated browser interactions
- **Checkpoint System**: Save and restore conversation states

**Use Cases:**
- Software development assistance
- Code review and refactoring
- File system operations
- Web browsing and research
- Task automation
- Learning and exploration

**Note**: In Storybook, some features like file operations, command execution, and API calls are mocked for demonstration purposes.
		`,
			},
		},
	},
	decorators: [
		(Story) => (
			<div className="w-full h-full flex justify-center items-center overflow-hidden">
				<div className={SIDEBAR_CLASS}>
					<Story />
				</div>
			</div>
		),
	],
}

export default meta
type Story = StoryObj<typeof MockApp>

// Mock data factories
const createApiConfig = (overrides: Partial<ApiConfiguration> = {}): ApiConfiguration => ({
	actModeApiProvider: "anthropic",
	actModeApiModelId: "claude-3-5-sonnet-20241022",
	actModeOpenRouterModelInfo: {
		maxTokens: 8000,
		contextWindow: 200000,
		supportsPromptCache: true,
	},
	apiKey: "mock-key",
	...overrides,
})

const mockApiConfiguration = createApiConfig()
const mockApiConfigurationPlan = createApiConfig({
	planModeApiProvider: "anthropic",
	planModeApiModelId: "claude-3-5-sonnet-20241022",
})

const createHistoryItem = (id: string, hoursAgo: number, task: string, metrics: Partial<HistoryItem> = {}): HistoryItem => ({
	id,
	ulid: "01HZZZ1A1B2C3D4E5F6G7H8J9K",
	ts: Date.now() - hoursAgo * 3600000,
	task,
	tokensIn: 2500,
	tokensOut: 1200,
	cacheWrites: 350,
	cacheReads: 180,
	totalCost: 0.085,
	size: 123456,
	...metrics,
})

const mockTaskHistory: HistoryItem[] = [
	createHistoryItem("task-1", 1, "Create a React component for displaying user profiles"),
	createHistoryItem("task-2", 2, "Debug the authentication flow in the login system", {
		tokensIn: 3200,
		tokensOut: 1800,
		cacheWrites: 450,
		cacheReads: 220,
		totalCost: 0.125,
		size: 1234567,
	}),
	createHistoryItem("task-3", 24, "Optimize database queries for better performance", {
		tokensIn: 4500,
		tokensOut: 2400,
		cacheWrites: 680,
		cacheReads: 340,
		totalCost: 0.185,
		size: 12345678,
	}),
]

const createMessage = (
	minutesAgo: number,
	type: ClineMessage["type"],
	say: ClineMessage["say"],
	text: string,
	overrides: Partial<ClineMessage> = {},
): ClineMessage => ({
	ts: Date.now() - minutesAgo * 60000,
	type,
	say,
	text,
	...overrides,
})

const createSayToolMessage = (
	minutesAgo: number,
	sayTool: ClineSayTool,
	overrides: Partial<ClineMessage> = {},
): ClineMessage => ({
	ts: Date.now() - minutesAgo * 60000,
	type: "say",
	say: "tool",
	text: JSON.stringify({
		operationIsLocatedInWorkspace: true,
		...sayTool,
	}),
	...overrides,
})

const createApiReqMessage = (minutesAgo: number, request: string, metrics: any = {}) =>
	createMessage(
		minutesAgo,
		"say",
		"api_req_started",
		JSON.stringify({
			request,
			tokensIn: 19500,
			tokensOut: 4220,
			cacheWrites: 120,
			cacheReads: 60,
			size: 12345,
			cost: 0.025,
			...metrics,
		}),
	)

const mockActiveMessages: ClineMessage[] = [
	createMessage(5, "say", "task", "Help me create a responsive navigation component for a React application"),
	createApiReqMessage(4.9, "Initial analysis request"),
	createMessage(
		4.7,
		"say",
		"text",
		"I'll help you create a responsive navigation component for your React application. Let me start by examining your current project structure and then create a modern, accessible navigation component.",
	),
	createMessage(4.3, "say", "tool", JSON.stringify({ tool: "listFilesTopLevel", path: "src/components" })),
	createApiReqMessage(4.2, "Component creation request", { tokensIn: 12020, tokensOut: 6180, cost: 0.042 }),
	createMessage(
		4,
		"say",
		"text",
		"Based on your project structure, I'll create a responsive navigation component with the following features:\n\n- Mobile-first responsive design\n- Accessible keyboard navigation\n- Smooth animations\n- Support for nested menu items\n- Dark/light theme support",
	),
	createMessage(
		3.7,
		"say",
		"tool",
		JSON.stringify({
			tool: "newFileCreated",
			path: "src/components/Navigation/Navigation.tsx",
			content: "// Navigation component code...",
		}),
	),
	createApiReqMessage(3.5, "Final response request", { tokensIn: 41550, tokensOut: 3320, cost: 0.018 }),
	createMessage(
		3.3,
		"say",
		"text",
		"I've created a responsive navigation component with TypeScript support. The component includes:\n\n✅ Mobile-first responsive design\n✅ Accessible ARIA attributes\n✅ Toggle functionality for mobile\n✅ TypeScript interfaces for type safety\n✅ Theme support\n\nWould you like me to also create the CSS styles for this component?",
	),
]

const mockStreamingMessages: ClineMessage[] = [
	...mockActiveMessages,
	createMessage(
		0.17,
		"say",
		"text",
		"Now I'll create the CSS styles for the navigation component. This will include responsive breakpoints, smooth animations, and accessibility features...",
		{ partial: true },
	),
]

// Reusable state and decorator factories
const createMockState = (overrides: any = {}) => ({
	...useExtensionState(),
	useAutoCondense: true,
	autoCondenseThreshold: 0.5,
	version: "0.0.1-stories",
	welcomeViewCompleted: true,
	showWelcome: false,
	clineMessages: mockActiveMessages,
	taskHistory: mockTaskHistory,
	apiConfiguration: mockApiConfiguration,
	onboardingModels: undefined,
	openRouterModels: bedrockModels,
	showAnnouncement: false,
	backgroundEditEnabled: false,
	...overrides,
})

const createStoryDecorator =
	(stateOverrides: any = {}) =>
	(Story: any) => {
		const mockState = useMemo(() => createMockState(stateOverrides), [])
		return (
			<ExtensionStateProviderMock value={mockState}>
				<div className="w-full h-full flex justify-center items-center overflow-hidden">
					<div className={SIDEBAR_CLASS}>
						<Story />
					</div>
				</div>
			</ExtensionStateProviderMock>
		)
	}

export const Welcome: Story = {
	decorators: [createStoryDecorator({ welcomeViewCompleted: false, showWelcome: true, clineMessages: [] })],
	parameters: {
		docs: {
			description: {
				story: "欢迎屏幕，显示给新用户或没有活动任务时。显示快速启动选项和最近任务历史记录。",
			},
		},
	},
	args: {},
	// More on component testing: https://storybook.js.org/docs/writing-tests/interaction-testing
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		// Button has vscode-button element name
		const getStartedButton = canvas.getByText("免费开始使用")
		const byokButton = canvas.getByText("使用您自己的 API 密钥")
		await expect(getStartedButton).toBeInTheDocument()
		await expect(byokButton).toBeInTheDocument()
		await userEvent.click(byokButton)
		await expect(getStartedButton).toBeInTheDocument()
		await expect(byokButton).not.toBeInTheDocument()
	},
}

export const Onboarding: Story = {
	decorators: [
		createStoryDecorator({
			welcomeViewCompleted: false,
			showWelcome: true,
			clineMessages: [],
			onboardingModels: { models: CLINE_ONBOARDING_MODELS },
		}),
	],
	parameters: {
		docs: {
			description: {
				story: "The onboarding flow shown to new users, allowing them to select their preferred AI models and configure initial settings.",
			},
		},
	},
	args: {
		onboardingModels: { models: CLINE_ONBOARDING_MODELS },
	},
	argTypes: {
		onboardingModels: {
			control: { type: "object" },
		},
	},
	// More on component testing: https://storybook.js.org/docs/writing-tests/interaction-testing
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)

		// Step 0: User type selection should be visible
		const title = canvas.getByText("你将如何使用 Cline?")
		await expect(title).toBeInTheDocument()
		const freeUserOption = canvas.getByText("完全免费")
		const powerUserOption = canvas.getByText("前沿模型")
		await expect(freeUserOption).toBeInTheDocument()
		await expect(powerUserOption).toBeInTheDocument()

		// Select "Free User" option
		await userEvent.click(freeUserOption)

		// Verify the next button appears
		const nextButton = canvas.getByText("继续")
		await expect(nextButton).toBeInTheDocument()

		// Click next to go to model selection
		await userEvent.click(nextButton)

		// Step 1: Model selection should be visible
		// Check for model group headers
		const otherOptionsHeader = canvas.getByText("选择免费型号")

		// At least one should be visible
		await expect(otherOptionsHeader).toBeInTheDocument()

		// Test search functionality
		const searchInput = canvas.getByPlaceholderText("搜索模型...")
		await expect(searchInput).toBeInTheDocument()

		// Type in search box
		await userEvent.type(searchInput, "claude")

		// Verify search term is in the input
		await expect(searchInput).toHaveValue("claude")

		// Clear search
		await userEvent.clear(searchInput)

		// Verify sign in button appears after model selection
		const signInButton = canvas.getByText("创建帐户")
		await expect(signInButton).toBeInTheDocument()

		// Test back navigation
		const backButton = canvas.getByText("返回")
		await expect(backButton).toBeInTheDocument()
		await userEvent.click(backButton)

		// Should be back to user type selection
		await expect(canvas.getByText("你将如何使用 Cline?")).toBeInTheDocument()

		// Test power user flow
		await userEvent.click(powerUserOption)

		const continueButton = canvas.getByText("继续")
		await userEvent.click(continueButton)

		// Should see model selection again
		await expect(canvas.getByPlaceholderText("搜索模型...")).toBeInTheDocument()
		await userEvent.click(canvas.getByText("返回"))
	},
}

export const EmptyState: Story = {
	decorators: [createStoryDecorator({ clineMessages: [], taskHistory: [], isNewUser: true, showAnnouncement: true })],
	parameters: {
		docs: {
			description: {
				story: "对于首次使用且没有对话记录或活动任务的用户，显示空白状态。",
			},
		},
	},
}

export const ReturnUser: Story = {
	decorators: [
		createStoryDecorator({ clineMessages: [], taskHistory: mockTaskHistory, isNewUser: true, showAnnouncement: false }),
	],
	parameters: {
		docs: {
			description: {
				story: "显示老用户的聊天记录主屏幕。",
			},
		},
	},
}

export const ActiveConversation: Story = {
	decorators: [createStoryDecorator({ task: mockTaskHistory[0], currentTaskItem: mockTaskHistory[0] })],
	parameters: {
		docs: {
			description: {
				story: "一段生动的对话，展现了与 Cline 的典型互动，包括创建任务、使用工具和 AI 响应。",
			},
		},
	},
}

export const StreamingResponse: Story = {
	decorators: [createStoryDecorator({ clineMessages: mockStreamingMessages })],
	parameters: {
		docs: {
			description: {
				story: "显示正在进行中的流式响应，演示实时 AI 响应渲染。",
			},
		},
	},
}

const createLongMessages = (): ClineMessage[] => [
	createMessage(30, "say", "task", "请帮我使用 React、Node.js 和 MongoDB 构建一个完整的电子商务应用程序。"),
	createMessage(
		29.7,
		"say",
		"text",
		"我将帮助你构建一个完整的电子商务应用程序。我们先从搭建项目结构开始，然后逐步实现核心功能。",
	),
	createMessage(
		29.3,
		"say",
		"tool",
		JSON.stringify({ tool: "newFileCreated", path: "package.json", content: "// Package.json content..." }),
	),
	createMessage(
		29,
		"say",
		"text",
		"太好了！我已经配置好了初始的 package.json 文件。现在让我们来创建集成 Express 和 MongoDB 的后端服务器。",
	),
	createMessage(
		28.7,
		"say",
		"tool",
		JSON.stringify({ tool: "newFileCreated", path: "server.js", content: "// Express server code..." }),
	),
	createMessage(28.3, "say", "text", "完美！后端服务器已搭建完成。现在我们来创建产品模型和处理产品操作的路由。"),
	createMessage(
		28,
		"say",
		"tool",
		JSON.stringify({ tool: "newFileCreated", path: "models/Product.js", content: "// Product model code..." }),
	),
	createMessage(
		27.7,
		"say",
		"text",
		"太棒了！产品模型已经准备就绪，所有必要的字段都已添加完毕。现在让我们用现代组件结构创建 React 前端。",
	),
	createMessage(27.3, "say", "command", "cd client && npx create-react-app . --template typescript"),
	createMessage(27, "say", "command_output", "创建新的 React 应用……成功！已创建客户端 /path/to/project/client"),
	createMessage(26.7, "say", "text", "太棒了！React 前端已经用 TypeScript 配置好了。现在让我们来创建电商应用的主要组件。"),
]

export const LongConversation: Story = {
	decorators: [createStoryDecorator({ clineMessages: createLongMessages() })],
	parameters: {
		docs: {
			description: {
				story: "一段较长的对话，展示了在复杂的开发任务中使用多种工具、创建文件和执行命令的过程。",
			},
		},
	},
}

// Optimized message patterns for common scenarios
const createErrorMessages = () => [
	createMessage(5, "say", "task", "请帮我修复 React 应用中的构建错误"),
	createMessage(4.7, "say", "text", "我会帮你修复构建错误。首先让我检查一下你的应用程序目前的状态。"),
	createMessage(4.3, "say", "command", "npm run build"),
	createMessage(4, "say", "error", "构建失败，UserProfile.tsx 和 api.ts 中存在 TypeScript 错误。"),
	createMessage(3.7, "say", "text", "我发现你的代码中存在 TypeScript 错误。让我检查一下文件并修复这些问题。"),
	createMessage(3.3, "say", "tool", JSON.stringify({ tool: "readFile", path: "src/components/UserProfile.tsx" })),
	createMessage(
		3,
		"say",
		"text",
		"我找到问题所在了。“用户”类型没有“username”属性。我这就通过更新组件，使用正确的属性名称来修复这个问题。",
	),
]

const createAskMessage = (type: string, text: string, streamingFailedMessage?: string) => ({
	ts: Date.now() - 60000,
	type: "ask" as const,
	ask: type,
	text,
	streamingFailedMessage,
})

export const ErrorState: Story = {
	decorators: [createStoryDecorator({ clineMessages: createErrorMessages() })],
	parameters: {
		docs: {
			description: {
				story: "展示了 Cline 如何处理和显示错误消息，帮助用户理解和解决问题。",
			},
		},
	},
}

export const AutoApprovalEnabled: Story = {
	decorators: [
		createStoryDecorator({
			autoApprovalSettings: {
				...DEFAULT_AUTO_APPROVAL_SETTINGS,
				enabled: true,
			},
		}),
	],
	parameters: {
		docs: {
			description: {
				story: "显示启用自动审批功能的界面，允许 Cline 在未经用户确认的情况下自动执行某些操作。",
			},
		},
	},
}

const createPlanModeMessages = () => [
	createMessage(5, "say", "task", "请帮我重构我的 React 应用，使其使用 TypeScript 并提升性能。"),
	createApiReqMessage(4.9, "规划分析请求", { tokensIn: 20000, tokensOut: 19500, cost: 0.065 }),
	createMessage(
		4.7,
		"say",
		"text",
		"我会帮助你重构 React 应用，使其使用 TypeScript 并提升性能。让我为你制定一个详细的迁移计划。",
	),
	createApiReqMessage(4.5, "Detailed planning request", { tokensIn: 20002, tokensOut: 12500, cost: 0.095 }),
	createAskMessage("plan_mode_respond", "以下是我关于如何使用 TypeScript 迁移和性能优化阶段重构 React 应用程序的全面计划。"),
]

export const PlanMode: Story = {
	decorators: [
		createStoryDecorator({
			clineMessages: createPlanModeMessages(),
			apiConfiguration: mockApiConfigurationPlan,
			mode: "plan" as const,
		}),
	],
	parameters: {
		docs: {
			description: {
				story: "在计划模式下显示 Cline，重点在于创建详细计划并在实施前讨论方法。",
			},
		},
	},
}

const createBrowserMessages = () => [
	createMessage(5, "say", "task", "请帮我测试一下我的Web应用程序的登录功能。"),
	createMessage(4.7, "say", "text", "我会帮你测试登录功能。让我打开浏览器，访问你的应用程序。"),
	createMessage(4.3, "say", "browser_action_launch", JSON.stringify({ action: "launch", url: "http://localhost:3000/login" })),
	createMessage(
		4,
		"say",
		"browser_action_result",
		JSON.stringify({ currentUrl: "http://localhost:3000/login", logs: "Page loaded successfully" }),
	),
	createMessage(3.7, "say", "text", "太好了！浏览器已启动并跳转到您的登录页面。现在让我测试一下登录功能。"),
	createMessage(3.3, "say", "browser_action", JSON.stringify({ action: "click", coordinate: "400,200" })),
	createMessage(3, "say", "browser_action", JSON.stringify({ action: "type", text: "test@example.com" })),
]

export const BrowserAutomation: Story = {
	decorators: [createStoryDecorator({ clineMessages: createBrowserMessages() })],
	parameters: {
		docs: {
			description: {
				story: "展示了 Cline 执行浏览器自动化任务，包括启动浏览器、点击元素和测试 Web 应用程序。",
			},
		},
	},
}

// Optimized stories using ask message pattern
const createToolApprovalMessages = () => [
	createMessage(5, "say", "task", "请帮我解读配置文件"),
	createMessage(4.7, "say", "text", "我需要读取一个文件来了解您的配置。"),
	createAskMessage("tool", JSON.stringify({ tool: "read_file", path: "config.json" })),
]

export const ToolApproval: Story = {
	decorators: [createStoryDecorator({ clineMessages: createToolApprovalMessages() })],
	parameters: {
		docs: {
			description: {
				story: "显示工具审批请求，并带有文件操作的批准/拒绝按钮。",
			},
		},
	},
}

export const ToolSave: Story = {
	decorators: [
		createStoryDecorator({
			clineMessages: [
				createMessage(5, "say", "task", "请更新 README 文件，添加新的说明。"),
				createMessage(4.7, "say", "text", "我会将新的说明更新到您的 README 文件中。"),
				createAskMessage("tool", JSON.stringify({ tool: "editedExistingFile", path: "README.md" })),
			],
		}),
	],
	parameters: {
		docs: {
			description: {
				story: "显示文件保存请求，并带有“保存/拒绝”按钮，用于文件编辑操作。",
			},
		},
	},
}

// Quick story generators for common patterns
const quickStory = (
	name: string,
	askType: string,
	text: string,
	description: string,
	streamingFailedMessage?: string,
): Story => ({
	decorators: [
		createStoryDecorator({
			clineMessages: [
				...createLongMessages(),
				createMessage(6, "say", "task", `帮助 ${name.toLowerCase()}`),
				createMessage(4.7, "say", "text", `我会帮你 ${name.toLowerCase()}.`),
				createAskMessage(askType, text, streamingFailedMessage),
			],
		}),
	],
	parameters: { docs: { description: { story: description } } },
})

export const CommandExecution: Story = quickStory(
	"Command Execution",
	"command",
	"npm install",
	"显示命令执行请求，并带有“运行命令”/“拒绝”按钮。",
)

export const CommandOutput: Story = {
	decorators: [
		createStoryDecorator({
			clineMessages: [
				createAskMessage("command", "npm install"),
				createAskMessage("command_output", "正在安装软件包……这可能需要几分钟时间。"),
			],
		}),
	],
	parameters: {
		docs: {
			description: {
				story: "命令执行期间，显示命令输出，并带有“边运行边继续”按钮。",
			},
		},
	},
}
// 批量创建剩余的优化后的 stories
export const ApiRequestFailed = quickStory(
	"API 请求失败",
	"api_req_failed",
	"由于网络超时，API 请求失败。您是否要重试？",
	"当 API 请求失败时，显示带有“重试/开始新任务”按钮的错误恢复选项。",
)

export const MistakeLimitReached = quickStory(
	"达到错误次数上限",
	"mistake_limit_reached",
	"我已尝试多次修复此问题，但未能成功。",
	"显示达到错误限制的状态，并提供“仍然继续/开始新任务”选项。",
)

export const CompletionResult = quickStory(
	"任务完成",
	"completion_result",
	"任务成功完成！我已实现所有请求的功能。",
	"显示任务完成状态及“开始新任务”按钮。",
)

export const BrowserActionLaunch = quickStory(
	"启动浏览器",
	"browser_action_launch",
	"启动浏览器以测试网站：http://localhost:3000",
	"显示浏览器操作审批界面，带有“批准/拒绝”按钮用于启动浏览器。",
)

export const McpServerUsage = quickStory(
	"MCP 服务器使用",
	"use_mcp_server",
	JSON.stringify({ tool: "get_weather", location: "New York" }),
	"显示 MCP 服务器使用审批界面，带有“批准/拒绝”按钮用于外部工具调用。",
)

export const Followup = quickStory(
	"后续跟进",
	"followup",
	"接下来您想让我做什么？",
	"显示后续提问状态，Cline 会在此询问下一步工作。",
)

export const ResumeTask = quickStory(
	"恢复任务",
	"resume_task",
	"您是否想要恢复之前的任务？",
	"显示恢复任务选项，用于继续之前中断的工作。",
)

export const NewTaskWithContext = quickStory(
	"新任务",
	"new_task",
	"在当前对话上下文中开始新任务",
	"显示带有上下文保留选项的新任务创建界面。",
)
export const ApiRequestActive: Story = {
	decorators: [
		createStoryDecorator({
			clineMessages: [
				createMessage(5, "say", "text", "正在处理您的请求...", { partial: true }),
				createApiReqMessage(4.7, "发出 API 请求以生成响应", { partial: true }),
			],
		}),
	],
	parameters: { docs: { description: { story: "显示处于活动状态的 API 请求，并提供取消按钮。" } } },
}
export const PlanModeResponse = quickStory(
	"计划模式响应",
	"plan_mode_respond",
	"这是我为创建全面测试策略而制定的详细计划。",
	"显示计划模式响应，Cline 在此展示详细计划供用户审批。",
)

export const CondenseConversation = quickStory(
	"压缩对话",
	"condense",
	"您是否希望我压缩对话内容以提高性能？",
	"显示用于压缩对话以提升性能的实用操作选项。",
)

export const ReportBug = quickStory(
	"报告错误",
	"report_bug",
	"您是否愿意报告此问题以帮助改进 Cline？",
	"显示用于向 GitHub 仓库报告错误的实用操作选项。",
)

export const ResumeCompletedTask = quickStory(
	"恢复已完成任务类型",
	"resume_completed_task",
	"之前的任务已完成。您想开始一个新任务吗？",
	"为已完成的任务恢复状态显示“开始新任务”选项。",
)

// Diff Edit Stories - New Format
const createNewFormatMultiFileMessages = () => [
	createMessage(5, "say", "task", "请帮我重构身份验证模块"),
	createMessage(4.7, "say", "text", "我会帮你重构身份验证模块。让我来做必要的修改。"),
	createSayToolMessage(4.3, {
		tool: "editedExistingFile",
		path: "src/auth/types.ts",
		content: `*** Begin Patch
*** Add File: src/auth/types.ts
+export interface User {
+  id: string
+  email: string
+  role: 'admin' | 'user'
+}
+
+export interface AuthState {
+  user: User | null
+  isAuthenticated: boolean
+}

*** Update File: src/auth/login.ts
@@
-function login(email, password) {
-  return fetch('/api/login', {
+function login(email: string, password: string): Promise<AuthState> {
+  return fetch('/api/login', {
	 method: 'POST',
-    body: { email, password }
+    body: JSON.stringify({ email, password }),
+    headers: { 'Content-Type': 'application/json' }
   })
 }
@@
-export default login
+export { login }

*** Delete File: src/auth/old-utils.js
-function deprecatedHelper() {
-  console.log('This is deprecated')
-}
-
-module.exports = { deprecatedHelper }
*** End Patch`,
	}),
	{ partial: false },
]

export const DiffEditNewFormat: Story = {
	decorators: [createStoryDecorator({ backgroundEditEnabled: true, clineMessages: createNewFormatMultiFileMessages() })],
	parameters: {
		docs: {
			description: {
				story: "以清晰、可展开的视图显示新的差异编辑格式，其中包含多个文件操作（添加、更新、删除）。",
			},
		},
	},
}

export const DiffEditNewFormatStreaming: Story = {
	decorators: [
		(Story) => {
			const [messages, setMessages] = useState<ClineMessage[]>([
				createMessage(5, "say", "task", "向用户模块添加 TypeScript 类型"),
				createMessage(4.7, "say", "text", "我将添加 TypeScript 类型以提高类型安全性。"),
			])
			const mockState = useMemo(() => createMockState({ backgroundEditEnabled: true, clineMessages: messages }), [messages])

			useEffect(() => {
				// Simulate streaming: progressively add more content
				const partialPatch = `*** Begin Patch
*** Update File: src/user/profile.ts
@@
-interface UserProfile {
-  name: string
+interface UserProfile {
+  id: string
+  name: string`

				const morePatch =
					partialPatch +
					`
+  email: string
+  createdAt: Date`

				const completePatch =
					morePatch +
					`
+}
*** End Patch`

				// Add initial partial message
				const timer1 = setTimeout(() => {
					setMessages((prev: ClineMessage[]) => [
						...prev,
						createSayToolMessage(
							4.3,
							{
								tool: "editedExistingFile",
								path: "src/user/profile.ts",
								content: partialPatch,
							},
							{ partial: true },
						),
					])
				}, 500)

				// Add more content
				const timer2 = setTimeout(() => {
					setMessages((prev: ClineMessage[]) => {
						const updated = [...prev]
						updated[updated.length - 1] = createSayToolMessage(
							4.3,
							{
								tool: "editedExistingFile",
								path: "src/user/profile.ts",
								content: morePatch,
							},
							{ partial: true },
						)
						return updated
					})
				}, 1500)

				// Complete the patch
				const timer3 = setTimeout(() => {
					setMessages((prev: ClineMessage[]) => {
						const updated = [...prev]
						updated[updated.length - 1] = createSayToolMessage(
							4.3,
							{
								tool: "editedExistingFile",
								path: "src/user/profile.ts",
								content: completePatch,
							},
							{ partial: false },
						)
						return updated
					})
				}, 2500)

				return () => {
					clearTimeout(timer1)
					clearTimeout(timer2)
					clearTimeout(timer3)
				}
			}, [])

			return (
				<ExtensionStateProviderMock value={mockState}>
					<div className="w-full h-full flex justify-center items-center overflow-hidden">
						<div className={SIDEBAR_CLASS}>
							<Story />
						</div>
					</div>
				</ExtensionStateProviderMock>
			)
		},
	],
	parameters: {
		docs: {
			description: {
				story: "在流式传输时显示新的差异编辑格式（不完整的补丁，没有结束补丁标记）。",
			},
		},
	},
}

// Diff Edit Stories - Replace Diff Edit Format
const createReplaceDiffFormatPatchMessages = () => [
	createMessage(5, "say", "task", "修复表单中的验证逻辑"),
	createMessage(4.7, "say", "text", "我将使用更新后的模式修复验证逻辑。"),
	createSayToolMessage(4.3, {
		tool: "editedExistingFile",
		path: "src/auth/types.ts",
		content: `------- SEARCH
function validateEmail(email) {
  return email.includes('@')
}
=======
function validateEmail(email: string): boolean {
  const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/
  return emailRegex.test(email)
}
+++++++ REPLACE`,
	}),
]

export const DiffEditReplaceDiffFormat: Story = {
	decorators: [createStoryDecorator({ backgroundEditEnabled: true, clineMessages: createReplaceDiffFormatPatchMessages() })],
	parameters: {
		docs: {
			description: {
				story: "显示旧的搜索/替换差异格式（向后兼容），带有完整的标记，自动转换为新格式显示。",
			},
		},
	},
}

export const DiffEditReplaceDiffFormatStreaming: Story = {
	decorators: [
		(Story) => {
			const [messages, setMessages] = useState<ClineMessage[]>([
				createMessage(5, "say", "task", "更新错误处理"),
				createMessage(4.7, "say", "text", "我将改进 API 客户端中的错误处理机制。"),
			])
			const mockState = useMemo(() => createMockState({ backgroundEditEnabled: true, clineMessages: messages }), [messages])

			useEffect(() => {
				const completePatch = `------- SEARCH
try {
  const response = await fetch(url)
  return response.json()
} catch (error) {
  console.error(error)
}
=======
try {
  const response = await fetch(url)
  if (!response.ok) {
	throw new Error(\`HTTP error! status: \${response.status}\`)
  }
  return response.json()
} catch (error) {
  console.error('API request failed:', error)
  throw error
}
+++++++ REPLACE`

				const patchChunks = completePatch.split("\n")
				let currentIndex = 0

				const intervalId = setInterval(() => {
					if (currentIndex >= patchChunks.length) {
						clearInterval(intervalId)
						return
					}

					setMessages((prev: ClineMessage[]) => {
						const updated = [...prev]
						updated[updated.length - 1] = createSayToolMessage(
							4.3,
							{
								tool: "editedExistingFile",
								path: "src/auth/types.ts",
								content: patchChunks.slice(0, currentIndex + 1).join("\n"),
							},
							{ partial: currentIndex !== patchChunks.length - 1 },
						)
						return updated
					})

					currentIndex++
				}, 500)

				return () => clearInterval(intervalId)
			}, [])

			return (
				<ExtensionStateProviderMock value={mockState}>
					<div className="w-full h-full flex justify-center items-center overflow-hidden">
						<div className={SIDEBAR_CLASS}>
							<Story />
						</div>
					</div>
				</ExtensionStateProviderMock>
			)
		},
	],
	parameters: {
		docs: {
			description: {
				story: "在流式传输时显示旧的搜索/替换差异格式（不完整，缺少替换标记），演示了对部分内容的优雅处理。",
			},
		},
	},
}

// Combined example showing both formats in one conversation
const createMixedFormatMessages = () => [
	createMessage(5, "say", "task", "重构整个身份验证系统"),
	createMessage(4.7, "say", "text", "我将重构身份验证系统，首先从登录功能开始。"),
	createSayToolMessage(4.5, {
		tool: "editedExistingFile",
		path: "src/auth/types.ts",
		content: `------- SEARCH
function login(username, password) {
  return authenticateUser(username, password)
}
=======
async function login(username: string, password: string): Promise<AuthResult> {
  return await authenticateUser(username, password)
}
+++++++ REPLACE`,
	}),
	createMessage(4.3, "say", "text", "太好了！现在让我添加类型定义并更新身份验证模块。"),
	createSayToolMessage(4.0, {
		tool: "editedExistingFile",
		path: "src/auth/types.ts",
		content: `*** Begin Patch
*** Add File: src/auth/types.ts
+export interface AuthResult {
+  success: boolean
+  token?: string
+  error?: string
+}
+
+export interface LoginCredentials {
+  username: string
+  password: string
+}

*** Update File: src/auth/authenticate.ts
@@
-function authenticateUser(username, password) {
+async function authenticateUser(username: string, password: string): Promise<AuthResult> {
   // Authentication logic
+  return { success: true, token: 'mock-token' }
 }
*** End Patch`,
	}),
]

export const DiffEditMixedFormats: Story = {
	decorators: [createStoryDecorator({ clineMessages: createMixedFormatMessages() })],
	parameters: {
		docs: {
			description: {
				story: "展示了使用搜索/替换和应用补丁差异格式的对话，演示了无缝的向后兼容性和格式检测。",
			},
		},
	},
}
