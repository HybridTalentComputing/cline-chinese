import { useEffect } from "react"
import { useDeepCompareEffect } from "react-use"
import { ClineMessage, ClineSayTool } from "@shared/ExtensionMessage"
import { ChatState } from "../types/chatTypes"

/**
 * Custom hook for managing button state based on messages
 * Handles button text and enable/disable states based on the current ask type
 */
export function useButtonState(messages: ClineMessage[], chatState: ChatState) {
	const {
		setSendingDisabled,
		setEnableButtons,
		setPrimaryButtonText,
		setSecondaryButtonText,
		setDidClickCancel,
		lastMessage,
		secondLastMessage,
	} = chatState

	// Update button state based on last message
	useDeepCompareEffect(() => {
		if (lastMessage) {
			switch (lastMessage.type) {
				case "ask":
					const isPartial = lastMessage.partial === true
					switch (lastMessage.ask) {
						case "api_req_failed":
							setSendingDisabled(true)
							setEnableButtons(true)
							setPrimaryButtonText("重试")
							setSecondaryButtonText("开始新任务")
							break
						case "mistake_limit_reached":
							setSendingDisabled(false)
							setEnableButtons(true)
							setPrimaryButtonText("总是继续")
							setSecondaryButtonText("开始新任务")
							break
						case "auto_approval_max_req_reached":
							setSendingDisabled(true)
							setEnableButtons(true)
							setPrimaryButtonText("继续")
							setSecondaryButtonText("开始新任务")
							break
						case "followup":
							setSendingDisabled(isPartial)
							setEnableButtons(false)
							break
						case "plan_mode_respond":
							setSendingDisabled(isPartial)
							setEnableButtons(false)
							break
						case "tool":
							setSendingDisabled(isPartial)
							setEnableButtons(!isPartial)
							const tool = JSON.parse(lastMessage.text || "{}") as ClineSayTool
							switch (tool.tool) {
								case "editedExistingFile":
								case "newFileCreated":
									setPrimaryButtonText("保存")
									setSecondaryButtonText("拒绝")
									break
								default:
									setPrimaryButtonText("批准")
									setSecondaryButtonText("拒绝")
									break
							}
							break
						case "browser_action_launch":
							setSendingDisabled(isPartial)
							setEnableButtons(!isPartial)
							setPrimaryButtonText("批准")
							setSecondaryButtonText("拒绝")
							break
						case "command":
							setSendingDisabled(isPartial)
							setEnableButtons(!isPartial)
							setPrimaryButtonText("运行命令")
							setSecondaryButtonText("拒绝")
							break
						case "command_output":
							setSendingDisabled(false)
							setEnableButtons(true)
							setPrimaryButtonText("运行中继续")
							setSecondaryButtonText(undefined)
							break
						case "use_mcp_server":
							setSendingDisabled(isPartial)
							setEnableButtons(!isPartial)
							setPrimaryButtonText("批准")
							setSecondaryButtonText("拒绝")
							break
						case "completion_result":
							setSendingDisabled(isPartial)
							setEnableButtons(!isPartial)
							setPrimaryButtonText("开始新任务")
							setSecondaryButtonText(undefined)
							break
						case "resume_task":
							setSendingDisabled(false)
							setEnableButtons(true)
							setPrimaryButtonText("重启任务")
							setSecondaryButtonText(undefined)
							setDidClickCancel(false)
							break
						case "resume_completed_task":
							setSendingDisabled(false)
							setEnableButtons(true)
							setPrimaryButtonText("开始新任务")
							setSecondaryButtonText(undefined)
							setDidClickCancel(false)
							break
						case "new_task":
							setSendingDisabled(isPartial)
							setEnableButtons(!isPartial)
							setPrimaryButtonText("使用当前上下文开始新任务")
							setSecondaryButtonText(undefined)
							break
						case "condense":
							setSendingDisabled(isPartial)
							setEnableButtons(!isPartial)
							setPrimaryButtonText("精简对话")
							setSecondaryButtonText(undefined)
							break
						case "report_bug":
							setSendingDisabled(isPartial)
							setEnableButtons(!isPartial)
							setPrimaryButtonText("在 GitHub 报告问题")
							setSecondaryButtonText(undefined)
							break
					}
					break
				case "say":
					switch (lastMessage.say) {
						case "api_req_started":
							if (secondLastMessage?.ask === "command_output") {
								chatState.setInputValue("")
								setSendingDisabled(true)
								chatState.setSelectedImages([])
								chatState.setSelectedFiles([])
								setEnableButtons(false)
							}
							break
					}
					break
			}
		}
	}, [lastMessage, secondLastMessage])

	// Reset button state when no messages
	useEffect(() => {
		if (messages.length === 0) {
			setSendingDisabled(false)
			setEnableButtons(false)
			setPrimaryButtonText("批准")
			setSecondaryButtonText("拒绝")
		}
	}, [messages.length, setSendingDisabled, setEnableButtons, setPrimaryButtonText, setSecondaryButtonText])
}
