import type { ClineMessage, ClineSayTool } from "@shared/ExtensionMessage"
import type { Mode } from "@shared/storage/types"

/**
 * Button action types that determine the behavior
 */
export type ButtonActionType =
	| "approve" // Send yesButtonClicked
	| "reject" // Send noButtonClicked
	| "proceed" // Send messageResponse or yesButtonClicked
	| "new_task" // Start a new task
	| "cancel" // Cancel streaming
	| "utility" // Execute utility function (condense, report_bug)

/**
 * Button configuration for different message states
 */
export interface ButtonConfig {
	sendingDisabled: boolean
	enableButtons: boolean
	primaryText?: string
	secondaryText?: string
	primaryAction?: ButtonActionType
	secondaryAction?: ButtonActionType
}

/**
 * Centralized button state configurations based on task lifecycle
 * This is the single source of truth for both button display and actions
 */
export const BUTTON_CONFIGS: Record<string, ButtonConfig> = {
	// Error recovery states - user must take action
	api_req_failed: {
		sendingDisabled: false,
		enableButtons: true,
		primaryText: "重试",
		secondaryText: "开始新任务",
		primaryAction: "approve",
		secondaryAction: "new_task",
	},
	mistake_limit_reached: {
		sendingDisabled: false,
		enableButtons: true,
		primaryText: "继续执行",
		secondaryText: "开始新任务",
		primaryAction: "proceed",
		secondaryAction: "new_task",
	},
	auto_approval_max_req_reached: {
		sendingDisabled: false,
		enableButtons: true,
		primaryText: "继续",
		secondaryText: "开始新任务",
		primaryAction: "proceed",
		secondaryAction: "new_task",
	},

	// Tool approval states - most common during task execution
	tool_approve: {
		sendingDisabled: false,
		enableButtons: true,
		primaryText: "批准",
		secondaryText: "拒绝",
		primaryAction: "approve",
		secondaryAction: "reject",
	},
	tool_save: {
		sendingDisabled: false,
		enableButtons: true,
		primaryText: "保存",
		secondaryText: "拒绝",
		primaryAction: "approve",
		secondaryAction: "reject",
	},

	// Command execution states
	command: {
		sendingDisabled: false,
		enableButtons: true,
		primaryText: "运行命令",
		secondaryText: "拒绝",
		primaryAction: "approve",
		secondaryAction: "reject",
	},
	command_output: {
		sendingDisabled: false,
		enableButtons: true,
		primaryText: "运行时继续",
		secondaryText: undefined,
		primaryAction: "proceed",
		secondaryAction: undefined,
	},

	// Browser and external tool states
	browser_action_launch: {
		sendingDisabled: false,
		enableButtons: true,
		primaryText: "批准",
		secondaryText: "拒绝",
		primaryAction: "approve",
		secondaryAction: "reject",
	},
	use_mcp_server: {
		sendingDisabled: false,
		enableButtons: true,
		primaryText: "批准",
		secondaryText: "拒绝",
		primaryAction: "approve",
		secondaryAction: "reject",
	},
	followup: {
		sendingDisabled: false,
		enableButtons: false,
		primaryText: "批准",
		secondaryText: "拒绝",
		primaryAction: "new_task",
		secondaryAction: undefined,
	},
	plan_mode_respond: {
		sendingDisabled: false,
		enableButtons: false,
		primaryText: "批准",
		secondaryText: "拒绝",
		primaryAction: "approve",
		secondaryAction: "reject",
	},

	// Task lifecycle states
	completion_result: {
		sendingDisabled: false,
		enableButtons: true,
		primaryText: "开始新任务",
		secondaryText: undefined,
		primaryAction: "new_task",
		secondaryAction: undefined,
	},
	resume_task: {
		sendingDisabled: false,
		enableButtons: true,
		primaryText: "恢复任务",
		secondaryText: undefined,
		primaryAction: "proceed",
		secondaryAction: undefined,
	},
	resume_completed_task: {
		sendingDisabled: false,
		enableButtons: true,
		primaryText: "开始新任务",
		secondaryText: undefined,
		primaryAction: "proceed",
		secondaryAction: undefined,
	},
	new_task: {
		sendingDisabled: false,
		enableButtons: true,
		primaryText: "使用上下文开始新任务",
		secondaryText: undefined,
		primaryAction: "utility",
		secondaryAction: undefined,
	},

	// Utility states
	condense: {
		sendingDisabled: false,
		enableButtons: true,
		primaryText: "压缩对话",
		secondaryText: undefined,
		primaryAction: "utility",
		secondaryAction: undefined,
	},
	report_bug: {
		sendingDisabled: false,
		enableButtons: true,
		primaryText: "报告 GitHub 问题",
		secondaryText: undefined,
		primaryAction: "utility",
		secondaryAction: undefined,
	},

	// Streaming/partial states - disable interaction during streaming
	partial: {
		sendingDisabled: true,
		enableButtons: true,
		primaryText: undefined,
		secondaryText: "取消",
		primaryAction: undefined,
		secondaryAction: "cancel",
	},

	// Default states
	default: {
		sendingDisabled: false,
		enableButtons: false,
		primaryText: undefined,
		secondaryText: undefined,
		primaryAction: undefined,
		secondaryAction: undefined,
	},
	api_req_active: {
		sendingDisabled: true,
		enableButtons: true,
		primaryText: undefined,
		secondaryText: "取消",
		primaryAction: undefined,
		secondaryAction: "cancel",
	},
}

const errorTypes = ["api_req_failed", "mistake_limit_reached", "auto_approval_max_req_reached"]

/**
 * Determines button configuration based on message type and state
 * This is the single source of truth used by both ActionButtons and useMessageHandlers
 */
export function getButtonConfig(message: ClineMessage | undefined, _mode: Mode = "act"): ButtonConfig {
	if (!message) {
		return BUTTON_CONFIGS.default
	}

	const isStreaming = message.partial === true
	const isError = message?.ask ? errorTypes.includes(message.ask) : false

	// Handle partial/streaming messages first (most common during task execution)
	// This must be checked before any other conditions to ensure streaming state takes precedence
	if (isStreaming && !isError) {
		return BUTTON_CONFIGS.partial
	}

	// Handle ask messages (user interaction required)
	if (message.type === "ask") {
		switch (message.ask) {
			// Error recovery states
			case "api_req_failed":
				return BUTTON_CONFIGS.api_req_failed
			case "mistake_limit_reached":
				return BUTTON_CONFIGS.mistake_limit_reached
			case "auto_approval_max_req_reached":
				return BUTTON_CONFIGS.auto_approval_max_req_reached

			// Tool approval (most common)
			case "tool": {
				// Only parse JSON if we need to determine save vs approve
				try {
					const tool = JSON.parse(message.text || "{}") as ClineSayTool
					if (tool.tool === "editedExistingFile" || tool.tool === "newFileCreated") {
						return BUTTON_CONFIGS.tool_save
					}
				} catch {
					// Fall through to default tool approval
				}
				return BUTTON_CONFIGS.tool_approve
			}

			// Command execution
			case "command":
				return BUTTON_CONFIGS.command
			case "command_output":
				return BUTTON_CONFIGS.command_output

			// Standard approvals
			case "followup":
				return BUTTON_CONFIGS.followup
			case "browser_action_launch":
				return BUTTON_CONFIGS.browser_action_launch
			case "use_mcp_server":
				return BUTTON_CONFIGS.use_mcp_server
			case "plan_mode_respond":
				return BUTTON_CONFIGS.plan_mode_respond

			// Task lifecycle
			case "completion_result":
				return BUTTON_CONFIGS.completion_result
			case "resume_task":
				return BUTTON_CONFIGS.resume_task
			case "resume_completed_task":
				return BUTTON_CONFIGS.resume_completed_task
			case "new_task":
				return BUTTON_CONFIGS.new_task

			// Utility
			case "condense":
				return BUTTON_CONFIGS.condense
			case "report_bug":
				return BUTTON_CONFIGS.report_bug

			default:
				return BUTTON_CONFIGS.tool_approve
		}
	}

	// Handle say messages (typically don't require buttons except in special cases)
	if (message.type === "say" && message.say === "api_req_started") {
		return BUTTON_CONFIGS.api_req_active
	}

	return BUTTON_CONFIGS.partial
}
