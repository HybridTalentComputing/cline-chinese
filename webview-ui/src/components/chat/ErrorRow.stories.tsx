import { ClineMessage } from "@shared/ExtensionMessage"
import type { Meta, StoryObj } from "@storybook/react-vite"
import { useMemo } from "react"
import { expect, userEvent, within } from "storybook/test"
import { createStorybookDecorator } from "@/config/StorybookDecorator"
import ErrorRow from "./ErrorRow"

// Mock data factories
const createMockMessage = (overrides: Partial<ClineMessage> = {}): ClineMessage => ({
	ts: Date.now(),
	type: "say",
	say: "error",
	text: "处理您的请求时发生错误。",
	...overrides,
})

const createMockAuthState = (overrides: any = {}) => ({
	clineUser: null,
	activeOrganization: null,
	isAuthenticated: false,
	...overrides,
})

const createMockExtensionState = (overrides: any = {}) => ({
	version: "1.0.0",
	clineMessages: [],
	taskHistory: [],
	shouldShowAnnouncement: false,
	...overrides,
})

// Reusable decorators
const createStoryDecorator =
	(authOverrides: any = {}, extensionOverrides: any = {}) =>
	(Story: any) => {
		const mockExtensionState = useMemo(
			() => ({
				state: { ...createMockExtensionState(extensionOverrides) },
				auth: { ...createMockAuthState(authOverrides) },
			}),
			[],
		)

		return createStorybookDecorator(mockExtensionState.state, "p-4", mockExtensionState.auth)(Story)
	}

const meta: Meta<typeof ErrorRow> = {
	title: "Views/Components/ErrorRow",
	component: ErrorRow,
	parameters: {
		docs: {
			description: {
				component:
					"在聊天界面显示不同类型的错误信息，包括 API 错误、信用额度错误、差异错误和 Clineignore 错误。针对 Cline 提供商错误进行特殊错误解析，并提供相应的用户操作。",
			},
		},
	},
	decorators: [createStoryDecorator()],
}

export default meta
type Story = StoryObj<typeof ErrorRow>

// Interactive plain text error story with configurable args and presets
export const Default: Story = {
	args: {
		message: createMockMessage({ text: "执行命令时出错。" }),
		errorType: "error",
		apiRequestFailedMessage: undefined,
	},
	argTypes: {
		errorType: {
			control: { type: "select" },
			options: ["error", "mistake_limit_reached", "diff_error", "clineignore_error"],
			description: "要显示的错误类型",
		},
		message: {
			control: { type: "object" },
			description: "包含错误文本和元数据的消息对象",
		},
		apiRequestFailedMessage: {
			control: { type: "select" },
			options: [
				// Empty option for no error message
				"",
				// PowerShell error
				"PowerShell 不被识别为内部或外部命令、可运行程序或批处理文件。",
				JSON.stringify({
					request_id: "has-request-id",
					message: "error message.",
					code: "random_code",
				}),
			],
		},
	},
	parameters: {
		docs: {
			description: {
				story: "用于测试不同纯文本错误类型和消息的交互式故事。使用预设下拉菜单快速测试常见场景，或手动配置错误类型和消息对象。",
			},
		},
	},
}

// API request errors
export const ApiRequestFailed: Story = {
	args: {
		message: createMockMessage(),
		errorType: "error",
		apiRequestFailedMessage: "网络错误：无法连接到API服务器。请检查您的网络连接并重试。",
	},
}

export const ApiStreamingFailed: Story = {
	args: {
		message: createMockMessage(),
		errorType: "error",
		apiReqStreamingFailedMessage: "流媒体错误：接收响应时连接中断。",
	},
}

// Cline-specific errors
export const ClineBalanceError: Story = {
	args: {
		message: createMockMessage(),
		errorType: "error",
		apiRequestFailedMessage: JSON.stringify({
			message: "余额不足，无法完成此请求。",
			code: "insufficient_credits",
			request_id: "req_123456789",
			providerId: "cline",
			details: {
				current_balance: 0.5,
				total_spent: 25.75,
				total_promotions: 5.0,
				message: "您的余额已用完。请购买更多积分以继续游戏。",
				buy_credits_url: "https://app.example.bot/dashboard/account?tab=credits&redirect=true",
			},
		}),
	},
}

export const ClineRateLimitError: Story = {
	args: {
		message: createMockMessage(),
		errorType: "error",
		apiRequestFailedMessage: JSON.stringify({
			message: "请求频次已超限。请稍候后再进行请求。",
			request_id: "req_987654321",
			providerId: "cline",
		}),
	},
}

// Authentication-related errors with configurable scenarios
export const AuthenticationErrors: Story = {
	args: {
		message: createMockMessage(),
		errorType: "error",
		apiRequestFailedMessage: JSON.stringify({
			message: "身份验证失败。请登录以继续。",
			code: "ERR_BAD_REQUEST",
			request_id: "req_auth_123",
			providerId: "cline",
		}),
	},
	argTypes: {
		apiRequestFailedMessage: {
			control: { type: "text" },
			description: "包含错误详情的 JSON 字符串",
		},
	},
	parameters: {
		docs: {
			description: {
				story: "用于测试身份验证相关错误的交互式用例。配置错误消息 JSON 以测试不同的身份验证场景，包括登录/注销状态。",
			},
		},
	},
}

// Auth error when signed in (shows different UI)
export const AuthErrorSignedIn: Story = {
	...AuthenticationErrors,
	decorators: [
		createStoryDecorator({
			clineUser: { id: "user123", email: "user@example.com" },
			isAuthenticated: true,
		}),
	],
	args: {
		message: createMockMessage(),
		errorType: "error",
		apiRequestFailedMessage: JSON.stringify({
			message: "身份验证失败。请重试您的请求。",
			request_id: "req_auth_456",
			providerId: "anthropic",
		}),
	},
}

// Interactive tests
export const InteractiveSignIn: Story = {
	args: {
		message: createMockMessage(),
		errorType: "error",
		apiRequestFailedMessage: JSON.stringify({
			message: "请登录以使用 Cline 服务。",
			code: "ERR_BAD_REQUEST",
			request_id: "req_signin_test",
			providerId: "cline",
		}),
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)

		// Find the sign in button
		const signInButton = canvas.getByRole("button", { name: /sign in to cline/i })
		await expect(signInButton).toBeInTheDocument()

		// Test button is clickable
		await expect(signInButton).toBeEnabled()

		// Click the button (this will trigger the mock handler)
		await userEvent.click(signInButton)
	},
}

export const TroubleshootingLink: Story = {
	args: {
		message: createMockMessage(),
		errorType: "error",
		apiRequestFailedMessage: "PowerShell 未被识别为内部或外部命令。请检查您的系统配置。",
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)

		// Find the troubleshooting link
		const troubleshootingLink = canvas.getByRole("link", { name: /troubleshooting guide/i })
		await expect(troubleshootingLink).toBeInTheDocument()

		// Verify link attributes
		await expect(troubleshootingLink).toHaveAttribute("href")
		await expect(troubleshootingLink).toHaveClass("underline")
	},
}

// Keep this one as it has specific testing logic for request ID
export const ErrorWithRequestId: Story = {
	args: {
		message: createMockMessage(),
		errorType: "error",
		apiRequestFailedMessage: JSON.stringify({
			message: "处理您的请求时发生意外错误。",
			request_id: "req_detailed_123456",
			providerId: "cline",
		}),
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)

		// Verify error message is displayed
		const errorMessage = canvas.getByText(/an unexpected error occurred/i)
		await expect(errorMessage).toBeInTheDocument()

		// Verify request ID is displayed
		const requestId = canvas.getByText(/request id: req_detailed_123456/i)
		await expect(requestId).toBeInTheDocument()
	},
}
