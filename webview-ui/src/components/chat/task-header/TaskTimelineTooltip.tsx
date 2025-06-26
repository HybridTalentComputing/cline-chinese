import React from "react"
import { ClineMessage } from "@shared/ExtensionMessage"
import { Tooltip } from "@heroui/react"
import { getColor } from "./util"

interface TaskTimelineTooltipProps {
	message: ClineMessage
	children: React.ReactNode
}

const TaskTimelineTooltip = ({ message, children }: TaskTimelineTooltipProps) => {
	const getMessageDescription = (message: ClineMessage): string => {
		if (message.type === "say") {
			switch (message.say) {
				// TODO: Need to confirm these classifcations with design
				case "task":
					return "任务消息"
				case "user_feedback":
					return "用户反馈"
				case "text":
					return "助手回复"
				case "tool":
					if (message.text) {
						try {
							const toolData = JSON.parse(message.text)
							if (
								toolData.tool === "readFile" ||
								toolData.tool === "listFilesTopLevel" ||
								toolData.tool === "listFilesRecursive" ||
								toolData.tool === "listCodeDefinitionNames" ||
								toolData.tool === "searchFiles"
							) {
								return `读文件: ${toolData.tool}`
							} else if (toolData.tool === "editedExistingFile") {
								return `编辑文件: ${toolData.path || "未知文件"}`
							} else if (toolData.tool === "newFileCreated") {
								return `新文件: ${toolData.path || "未知文件"}`
							} else if (toolData.tool === "webFetch") {
								return `读取网页: ${toolData.path || "未知的 URL"}`
							}
							return `工具: ${toolData.tool}`
						} catch (e) {
							return "工具使用"
						}
					}
					return "工具使用"
				case "command":
					return "终端命令"
				case "command_output":
					return "终端输出"
				case "browser_action":
					return "浏览器操作"
				case "browser_action_result":
					return "浏览器结果"
				case "completion_result":
					return "任务完成"
				case "checkpoint_created":
					return "检查点创建"
				default:
					return message.say || "未知"
			}
		} else if (message.type === "ask") {
			switch (message.ask) {
				case "followup":
					return "Assistant Message"
				case "plan_mode_respond":
					return "规划响应"
				case "tool":
					if (message.text) {
						try {
							const toolData = JSON.parse(message.text)
							if (
								toolData.tool === "readFile" ||
								toolData.tool === "listFilesTopLevel" ||
								toolData.tool === "listFilesRecursive" ||
								toolData.tool === "listCodeDefinitionNames" ||
								toolData.tool === "searchFiles"
							) {
								return `读文件批准: ${toolData.tool}`
							} else if (toolData.tool === "editedExistingFile") {
								return `编辑文件批准: ${toolData.path || "未知文件"}`
							} else if (toolData.tool === "newFileCreated") {
								return `新文件批准: ${toolData.path || "未知文件"}`
							} else if (toolData.tool === "webFetch") {
								return `网页读取: ${toolData.path || "未知的 URL"}`
							}
							return `工具批准: ${toolData.tool}`
						} catch (e) {
							return "工具批准"
						}
					}
					return "工具批准"
				case "command":
					return "终端命令批准"
				case "browser_action_launch":
					return "浏览器操作批准"
				default:
					return message.ask || "未知"
			}
		}
		console.log("Unknown Message Type --------", message)
		return "未知消息类型"
	}

	const getMessageContent = (message: ClineMessage): string => {
		if (message.text) {
			if (message.type === "ask" && message.ask === "plan_mode_respond" && message.text) {
				try {
					const planData = JSON.parse(message.text)
					return planData.response || message.text
				} catch (e) {
					return message.text
				}
			} else if (message.type === "say" && message.say === "tool" && message.text) {
				try {
					const toolData = JSON.parse(message.text)
					return JSON.stringify(toolData, null, 2)
				} catch (e) {
					return message.text
				}
			}

			if (message.text.length > 200) {
				return message.text.substring(0, 200) + "..."
			}
			return message.text
		}
		return ""
	}

	const getTimestamp = (message: ClineMessage): string => {
		if (message.ts) {
			const messageDate = new Date(message.ts)
			const today = new Date()

			const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate())
			const messageDateOnly = new Date(messageDate.getFullYear(), messageDate.getMonth(), messageDate.getDate())

			const time = messageDate.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: true })

			const monthNames = [
				"一月",
				"二月",
				"三月",
				"四月",
				"五月",
				"六月",
				"七月",
				"八月",
				"九月",
				"十月",
				"十一月",
				"十二月",
			]
			const monthName = monthNames[messageDate.getMonth()]

			if (messageDateOnly.getTime() === todayDate.getTime()) {
				return `${time}`
			} else if (messageDate.getFullYear() === today.getFullYear()) {
				return `${monthName} ${messageDate.getDate()} ${time}`
			} else {
				return `${monthName} ${messageDate.getDate()}, ${messageDate.getFullYear()} ${time}`
			}
		}
		return ""
	}

	return (
		<Tooltip
			content={
				<div className="flex flex-col">
					<div className="flex flex-wrap items-center font-bold mb-1">
						<div className="mr-4 mb-0.5">
							<div
								style={{
									width: "10px",
									height: "10px",
									minWidth: "10px", // Ensure fixed width
									minHeight: "10px", // Ensure fixed height
									borderRadius: "50%",
									backgroundColor: getColor(message),
									marginRight: "8px",
									display: "inline-block",
									flexShrink: 0, // Prevent shrinking when space is limited
								}}
							/>
							{getMessageDescription(message)}
						</div>
						{getTimestamp(message) && (
							<span className="font-normal text-tiny" style={{ fontWeight: "normal", fontSize: "10px" }}>
								{getTimestamp(message)}
							</span>
						)}
					</div>
					{getMessageContent(message) && (
						<div
							style={{
								whiteSpace: "pre-wrap",
								wordBreak: "break-word",
								maxHeight: "150px",
								overflowY: "auto",
								fontSize: "11px",
								fontFamily: "var(--vscode-editor-font-family)",
								backgroundColor: "var(--vscode-textBlockQuote-background)",
								padding: "4px",
								borderRadius: "2px",
								scrollbarWidth: "none",
							}}>
							{getMessageContent(message)}
						</div>
					)}
				</div>
			}
			classNames={{
				base: "bg-[var(--vscode-editor-background)] text-[var(--vscode-editor-foreground)] border-[var(--vscode-widget-border)] py-1 rounded-[3px] max-w-[calc(100dvw-2rem)] text-xs",
			}}
			shadow="sm"
			placement="bottom"
			disableAnimation
			closeDelay={100}
			isKeyboardDismissDisabled={true}>
			{children}
		</Tooltip>
	)
}

export default TaskTimelineTooltip
