import { VSCodeButton, VSCodeLink } from "@vscode/webview-ui-toolkit/react"
import debounce from "debounce"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useDeepCompareEffect, useEvent, useMount } from "react-use"
import { Virtuoso, type VirtuosoHandle } from "react-virtuoso"
import styled from "styled-components"
import {
	ClineApiReqInfo,
	ClineAsk,
	ClineMessage,
	ClineSayBrowserAction,
	ClineSayTool,
	ExtensionMessage,
} from "@shared/ExtensionMessage"
import { findLast } from "@shared/array"
import { combineApiRequests } from "@shared/combineApiRequests"
import { combineCommandSequences } from "@shared/combineCommandSequences"
import { getApiMetrics } from "@shared/getApiMetrics"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { vscode } from "@/utils/vscode"
import { TaskServiceClient, SlashServiceClient, FileServiceClient } from "@/services/grpc-client"
import HistoryPreview from "@/components/history/HistoryPreview"
import { normalizeApiConfiguration } from "@/components/settings/ApiOptions"
import Announcement from "@/components/chat/Announcement"
import BrowserSessionRow from "@/components/chat/BrowserSessionRow"
import ChatRow from "@/components/chat/ChatRow"
import ChatTextArea from "@/components/chat/ChatTextArea"
import QuotedMessagePreview from "@/components/chat/QuotedMessagePreview"
import TaskHeader from "@/components/chat/TaskHeader"
import TelemetryBanner from "@/components/common/TelemetryBanner"
import { unified } from "unified"
import remarkStringify from "remark-stringify"
import rehypeRemark from "rehype-remark"
import rehypeParse from "rehype-parse"
import HomeHeader from "../welcome/HomeHeader"
import AutoApproveBar from "./auto-approve-menu/AutoApproveBar"
interface ChatViewProps {
	isHidden: boolean
	showAnnouncement: boolean
	hideAnnouncement: () => void
	showHistoryView: () => void
}

// 清理 Markdown 转义字符的函数
function cleanupMarkdownEscapes(markdown: string): string {
	return (
		markdown
			// 处理下划线和星号（单个或多个）
			.replace(/\\([_*]+)/g, "$1")

			// 处理尖括号（用于泛型和 XML）
			.replace(/\\([<>])/g, "$1")

			// 处理反引号（用于代码）
			.replace(/\\(`)/g, "$1")

			// 处理其他常见的 Markdown 特殊字符
			.replace(/\\([[\]()#.!])/g, "$1")

			// 修复多个连续的反斜杠
			.replace(/\\{2,}([_*`<>[\]()#.!])/g, "$1")
	)
}

async function convertHtmlToMarkdown(html: string) {
	// 处理 HTML 到 Markdown
	const result = await unified()
		.use(rehypeParse as any, { fragment: true }) // 解析 HTML 片段
		.use(rehypeRemark as any) // 将 HTML 转换为 Markdown AST
		.use(remarkStringify as any, {
			// 将 Markdown AST 转换为文本
			bullet: "-", // 无序列表使用 -
			emphasis: "*", // 强调使用 *
			strong: "_", // 加粗使用 _
			listItemIndent: "one", // 列表缩进使用一个空格
			rule: "-", // 水平线使用 -
			ruleSpaces: false, // 水平线不带空格
			fences: true,
			escape: false,
			entities: false,
		})
		.process(html)

	const md = String(result)
	// 应用全面的转义字符清理
	return cleanupMarkdownEscapes(md)
}

export const MAX_IMAGES_PER_MESSAGE = 20 // Anthropic 限制每个消息最多 20 张图片

const ChatView = ({ isHidden, showAnnouncement, hideAnnouncement, showHistoryView }: ChatViewProps) => {
	const { version, clineMessages: messages, taskHistory, apiConfiguration, telemetrySetting } = useExtensionState()

	//const task = messages.length > 0 ? (messages[0].say === "task" ? messages[0] : undefined) : undefined) : undefined
	const task = useMemo(() => messages.at(0), [messages]) // 保留这个不太安全的版本，因为如果第一条消息不是任务，则扩展处于不良状态，需要调试（参见 Cline.abort）
	const modifiedMessages = useMemo(() => combineApiRequests(combineCommandSequences(messages.slice(1))), [messages])
	// 必须在所有 api_req_finished 都被缩减为 api_req_started 消息之后
	const apiMetrics = useMemo(() => getApiMetrics(modifiedMessages), [modifiedMessages])

	const lastApiReqTotalTokens = useMemo(() => {
		const getTotalTokensFromApiReqMessage = (msg: ClineMessage) => {
			if (!msg.text) return 0
			const { tokensIn, tokensOut, cacheWrites, cacheReads }: ClineApiReqInfo = JSON.parse(msg.text)
			return (tokensIn || 0) + (tokensOut || 0) + (cacheWrites || 0) + (cacheReads || 0)
		}
		const lastApiReqMessage = findLast(modifiedMessages, (msg) => {
			if (msg.say !== "api_req_started") return false
			return getTotalTokensFromApiReqMessage(msg) > 0
		})
		if (!lastApiReqMessage) return undefined
		return getTotalTokensFromApiReqMessage(lastApiReqMessage)
	}, [modifiedMessages])

	const [inputValue, setInputValue] = useState("")
	const [activeQuote, setActiveQuote] = useState<string | null>(null)
	const [isTextAreaFocused, setIsTextAreaFocused] = useState(false)
	const textAreaRef = useRef<HTMLTextAreaElement>(null)
	const [sendingDisabled, setSendingDisabled] = useState(false)
	const [selectedImages, setSelectedImages] = useState<string[]>([])

	// 我们需要保留 ask，因为 useEffect > lastMessage 总会让我们知道 ask 何时传入并处理它，但是当 handleMessage 被调用时，最后一条消息可能不再是 ask（它可能是一个紧随其后的 say）
	const [clineAsk, setClineAsk] = useState<ClineAsk | undefined>(undefined)
	const [enableButtons, setEnableButtons] = useState<boolean>(false)
	const [primaryButtonText, setPrimaryButtonText] = useState<string | undefined>("批准")
	const [secondaryButtonText, setSecondaryButtonText] = useState<string | undefined>("拒绝")
	const [didClickCancel, setDidClickCancel] = useState(false)
	const virtuosoRef = useRef<VirtuosoHandle>(null)
	const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({})
	const scrollContainerRef = useRef<HTMLDivElement>(null)
	const disableAutoScrollRef = useRef(false)
	const [showScrollToBottom, setShowScrollToBottom] = useState(false)
	const [isAtBottom, setIsAtBottom] = useState(false)

	useEffect(() => {
		const handleCopy = async (e: ClipboardEvent) => {
			const targetElement = e.target as HTMLElement | null
			// 如果复制事件源自 input 或 textarea，
			// 让浏览器默认行为处理它。
			if (
				targetElement &&
				(targetElement.tagName === "INPUT" || targetElement.tagName === "TEXTAREA" || targetElement.isContentEditable)
			) {
				return
			}

			if (window.getSelection) {
				const selection = window.getSelection()
				if (selection && selection.rangeCount > 0) {
					const range = selection.getRangeAt(0)
					const commonAncestor = range.commonAncestorContainer
					let textToCopy: string | null = null

					// 检查选区是否在首选纯文本复制的元素内
					let currentElement =
						commonAncestor.nodeType === Node.ELEMENT_NODE
							? (commonAncestor as HTMLElement)
							: commonAncestor.parentElement
					let preferPlainTextCopy = false
					while (currentElement) {
						if (currentElement.tagName === "PRE" && currentElement.querySelector("code")) {
							preferPlainTextCopy = true
							break
						}
						// 检查计算出的 white-space 样式
						const computedStyle = window.getComputedStyle(currentElement)
						if (
							computedStyle.whiteSpace === "pre" ||
							computedStyle.whiteSpace === "pre-wrap" ||
							computedStyle.whiteSpace === "pre-line"
						) {
							// 如果元素本身或其祖先元素具有类似 pre 的 white-space，
							// 并且选区可能包含在其中，则首选纯文本。
							// 这有助于处理像 TaskHeader 文本显示这样的元素。
							preferPlainTextCopy = true
							break
						}

						// 如果到达已知的聊天消息边界或 body，则停止搜索
						if (
							currentElement.classList.contains("chat-row-assistant-message-container") ||
							currentElement.classList.contains("chat-row-user-message-container") ||
							currentElement.tagName === "BODY"
						) {
							break
						}
						currentElement = currentElement.parentElement
					}

					if (preferPlainTextCopy) {
						// 对于代码块或具有预格式化 white-space 的元素，获取纯文本。
						textToCopy = selection.toString()
					} else {
						// 对于其他内容，使用现有的 HTML 到 Markdown 转换
						const clonedSelection = range.cloneContents()
						const div = document.createElement("div")
						div.appendChild(clonedSelection)
						const selectedHtml = div.innerHTML
						textToCopy = await convertHtmlToMarkdown(selectedHtml)
					}

					if (textToCopy !== null) {
						vscode.postMessage({ type: "copyToClipboard", text: textToCopy })
						e.preventDefault()
					}
				}
			}
		}
		document.addEventListener("copy", handleCopy)

		return () => {
			document.removeEventListener("copy", handleCopy)
		}
	}, [])

	// UI 布局取决于最后两条消息
	// （因为它依赖于这些消息的内容，所以我们进行深度比较。例如，按下按钮后的按钮状态会将 enableButtons 设置为 false，否则即使消息没有更改，此效果也必须再次变为 true
	const lastMessage = useMemo(() => messages.at(-1), [messages])
	const secondLastMessage = useMemo(() => messages.at(-2), [messages])
	useDeepCompareEffect(() => {
		// 如果最后一条消息是 ask，则显示用户 ask UI
		// 如果用户完成了任务，则启动一个新任务并使用新的对话历史记录，因为在扩展等待用户响应的这一刻，用户可能会关闭扩展，对话历史记录将会丢失。
		// 基本上，只要任务处于活动状态，对话历史记录就会被持久化
		if (lastMessage) {
			switch (lastMessage.type) {
				case "ask":
					const isPartial = lastMessage.partial === true
					switch (lastMessage.ask) {
						case "api_req_failed":
							setSendingDisabled(true)
							setClineAsk("api_req_failed")
							setEnableButtons(true)
							setPrimaryButtonText("重试")
							setSecondaryButtonText("开始新任务")
							break
						case "mistake_limit_reached":
							setSendingDisabled(false)
							setClineAsk("mistake_limit_reached")
							setEnableButtons(true)
							setPrimaryButtonText("仍然继续")
							setSecondaryButtonText("开始新任务")
							break
						case "auto_approval_max_req_reached":
							setSendingDisabled(true)
							setClineAsk("auto_approval_max_req_reached")
							setEnableButtons(true)
							setPrimaryButtonText("继续")
							setSecondaryButtonText("开始新任务")
							break
						case "followup":
							setSendingDisabled(isPartial)
							setClineAsk("followup")
							setEnableButtons(false)
							// setPrimaryButtonText(undefined)
							// setSecondaryButtonText(undefined)
							break
						case "plan_mode_respond":
							setSendingDisabled(isPartial)
							setClineAsk("plan_mode_respond")
							setEnableButtons(false)
							// setPrimaryButtonText(undefined)
							// setSecondaryButtonText(undefined)
							break
						case "tool":
							setSendingDisabled(isPartial)
							setClineAsk("tool")
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
							setClineAsk("browser_action_launch")
							setEnableButtons(!isPartial)
							setPrimaryButtonText("批准")
							setSecondaryButtonText("拒绝")
							break
						case "command":
							setSendingDisabled(isPartial)
							setClineAsk("command")
							setEnableButtons(!isPartial)
							setPrimaryButtonText("运行命令")
							setSecondaryButtonText("拒绝")
							break
						case "command_output":
							setSendingDisabled(false)
							setClineAsk("command_output")
							setEnableButtons(true)
							setPrimaryButtonText("运行时继续")
							setSecondaryButtonText(undefined)
							break
						case "use_mcp_server":
							setSendingDisabled(isPartial)
							setClineAsk("use_mcp_server")
							setEnableButtons(!isPartial)
							setPrimaryButtonText("批准")
							setSecondaryButtonText("拒绝")
							break
						case "completion_result":
							// 扩展等待反馈。但我们可以只显示一个新任务按钮
							setSendingDisabled(isPartial)
							setClineAsk("completion_result")
							setEnableButtons(!isPartial)
							setPrimaryButtonText("开始新任务")
							setSecondaryButtonText(undefined)
							break
						case "resume_task":
							setSendingDisabled(false)
							setClineAsk("resume_task")
							setEnableButtons(true)
							setPrimaryButtonText("恢复任务")
							setSecondaryButtonText(undefined)
							setDidClickCancel(false) // 特殊情况，我们重置取消按钮状态
							break
						case "resume_completed_task":
							setSendingDisabled(false)
							setClineAsk("resume_completed_task")
							setEnableButtons(true)
							setPrimaryButtonText("开始新任务")
							setSecondaryButtonText(undefined)
							setDidClickCancel(false)
							break
						case "new_task":
							setSendingDisabled(isPartial)
							setClineAsk("new_task")
							setEnableButtons(!isPartial)
							setPrimaryButtonText("开始带上下文的新任务")
							setSecondaryButtonText(undefined)
							break
						case "condense":
							setSendingDisabled(isPartial)
							setClineAsk("condense")
							setEnableButtons(!isPartial)
							setPrimaryButtonText("精简对话")
							setSecondaryButtonText(undefined)
							break
						case "report_bug":
							setSendingDisabled(isPartial)
							setClineAsk("report_bug")
							setEnableButtons(!isPartial)
							setPrimaryButtonText("报告 GitHub 问题")
							setSecondaryButtonText(undefined)
							break
					}
					break
				case "say":
					// 不想重置，因为在 ask 等待响应时，ask 之后可能会有一个 "say"
					switch (lastMessage.say) {
						case "api_req_started":
							if (secondLastMessage?.ask === "command_output") {
								// 如果最后一个 ask 是 command_output，并且我们收到了一个 api_req_started，那么这意味着命令已经完成，我们不再需要用户的输入（在所有其他情况下，用户必须与输入字段或按钮交互才能继续，这会自动执行以下操作）
								setInputValue("")
								setSendingDisabled(true)
								setSelectedImages([])
								setClineAsk(undefined)
								setEnableButtons(false)
							}
							break
						case "task":
						case "error":
						case "api_req_finished":
						case "text":
						case "browser_action":
						case "browser_action_result":
						case "browser_action_launch":
						case "command":
						case "use_mcp_server":
						case "command_output":
						case "mcp_server_request_started":
						case "mcp_server_response":
						case "completion_result":
						case "tool":
						case "load_mcp_documentation":
							break
					}
					break
			}
		} else {
			// 这会在发送第一条消息后被调用，所以我们必须改为监视 messages.length
			// 没有消息，所以用户必须提交一个任务
			// setTextAreaDisabled(false)
			// setClineAsk(undefined)
			// setPrimaryButtonText(undefined)
			// setSecondaryButtonText(undefined)
		}
	}, [lastMessage, secondLastMessage])

	useEffect(() => {
		if (messages.length === 0) {
			setSendingDisabled(false)
			setClineAsk(undefined)
			setEnableButtons(false)
			setPrimaryButtonText("批准")
			setSecondaryButtonText("拒绝")
		}
	}, [messages.length])

	useEffect(() => {
		setExpandedRows({})
	}, [task?.ts])

	const isStreaming = useMemo(() => {
		const isLastAsk = !!modifiedMessages.at(-1)?.ask // 检查 clineAsk 是不够的，因为例如对于一个工具，messages effect 可能会再次被调用，将 clineAsk 设置为其值，如果下一条消息不是 ask，则它不会重置。这可能是因为我们更新消息的频率比以前高得多，并且应该通过优化来解决，因为它可能是一个渲染错误。但作为目前的最后保障，如果最后一条消息不是 ask，则会显示取消按钮
		const isToolCurrentlyAsking = isLastAsk && clineAsk !== undefined && enableButtons && primaryButtonText !== undefined
		if (isToolCurrentlyAsking) {
			return false
		}

		const isLastMessagePartial = modifiedMessages.at(-1)?.partial === true
		if (isLastMessagePartial) {
			return true
		} else {
			const lastApiReqStarted = findLast(modifiedMessages, (message) => message.say === "api_req_started")
			if (lastApiReqStarted && lastApiReqStarted.text != null && lastApiReqStarted.say === "api_req_started") {
				const cost = JSON.parse(lastApiReqStarted.text).cost
				if (cost === undefined) {
					// API 请求尚未完成
					return true
				}
			}
		}

		return false
	}, [modifiedMessages, clineAsk, enableButtons, primaryButtonText])

	const handleSendMessage = useCallback(
		async (text: string, images: string[]) => {
			let messageToSend = text.trim()
			const hasContent = messageToSend || images.length > 0

			// 如果存在活动引用，则在其前面添加
			if (activeQuote && hasContent) {
				const prefix = "[context] \n> "
				const formattedQuote = activeQuote
				const suffix = "\n[/context] \n\n"
				messageToSend = `${prefix} ${formattedQuote} ${suffix} ${messageToSend}`
			}

			if (hasContent) {
				console.log("[ChatView] handleSendMessage - 正在发送消息:", messageToSend)
				if (messages.length === 0) {
					await TaskServiceClient.newTask({ text: messageToSend, images })
				} else if (clineAsk) {
					switch (clineAsk) {
						case "followup":
						case "plan_mode_respond":
						case "tool":
						case "browser_action_launch":
						case "command": // 用户可以为工具或命令使用提供反馈
						case "command_output": // 用户可以向命令标准输入发送输入
						case "use_mcp_server":
						case "completion_result": // 如果发生这种情况，则用户对完成结果有反馈
						case "resume_task":
						case "resume_completed_task":
						case "mistake_limit_reached":
						case "new_task": // 用户可以提供反馈或拒绝新的任务建议
							await TaskServiceClient.askResponse({
								responseType: "messageResponse",
								text: messageToSend,
								images,
							})
							break
						case "condense":
							await TaskServiceClient.askResponse({
								responseType: "messageResponse",
								text: messageToSend,
								images,
							})
							break
						case "report_bug":
							await TaskServiceClient.askResponse({
								responseType: "messageResponse",
								text: messageToSend,
								images,
							})
							break
						// 没有其他情况应该启用文本字段
					}
				}
				setInputValue("")
				setActiveQuote(null) // 发送消息时清除引用
				setSendingDisabled(true)
				setSelectedImages([])
				setClineAsk(undefined)
				setEnableButtons(false)
				// setPrimaryButtonText(undefined)
				// setSecondaryButtonText(undefined)
				disableAutoScrollRef.current = false
			}
		},
		[messages.length, clineAsk, activeQuote],
	)

	const startNewTask = useCallback(async () => {
		setActiveQuote(null) // 清除活动引用状态
		await TaskServiceClient.clearTask({})
	}, [])

	/*
	此逻辑依赖于上面的 useEffect[messages] 来设置 clineAsk，之后会显示按钮，然后我们向扩展发送一个 askResponse。
	*/
	const handlePrimaryButtonClick = useCallback(
		async (text?: string, images?: string[]) => {
			const trimmedInput = text?.trim()
			switch (clineAsk) {
				case "api_req_failed":
				case "command":
				case "command_output":
				case "tool":
				case "browser_action_launch":
				case "use_mcp_server":
				case "resume_task":
				case "mistake_limit_reached":
				case "auto_approval_max_req_reached":
					if (trimmedInput || (images && images.length > 0)) {
						await TaskServiceClient.askResponse({
							responseType: "yesButtonClicked",
							text: trimmedInput,
							images: images,
						})
					} else {
						await TaskServiceClient.askResponse({
							responseType: "yesButtonClicked",
						})
					}
					// 发送后清除输入状态
					setInputValue("")
					setActiveQuote(null) // 使用主按钮时清除引用
					setSelectedImages([])
					break
				case "completion_result":
				case "resume_completed_task":
					// 扩展等待反馈。但我们可以只显示一个新任务按钮
					startNewTask()
					break
				case "new_task":
					console.info("新任务按钮已点击！", { lastMessage, messages, clineAsk, text })
					await TaskServiceClient.newTask({
						text: lastMessage?.text,
						images: [],
					})
					break
				case "condense":
					await SlashServiceClient.condense({ value: lastMessage?.text }).catch((err) => console.error(err))
					break
				case "report_bug":
					await SlashServiceClient.reportBug({ value: lastMessage?.text }).catch((err) => console.error(err))
					break
			}
			setSendingDisabled(true)
			setClineAsk(undefined)
			setEnableButtons(false)
			// setPrimaryButtonText(undefined)
			// setSecondaryButtonText(undefined)
			disableAutoScrollRef.current = false
		},
		[clineAsk, startNewTask, lastMessage],
	)

	const handleSecondaryButtonClick = useCallback(
		async (text?: string, images?: string[]) => {
			const trimmedInput = text?.trim()
			if (isStreaming) {
				await TaskServiceClient.cancelTask({})
				setDidClickCancel(true)
				return
			}

			switch (clineAsk) {
				case "api_req_failed":
				case "mistake_limit_reached":
				case "auto_approval_max_req_reached":
					startNewTask()
					break
				case "command":
				case "tool":
				case "browser_action_launch":
				case "use_mcp_server":
					if (trimmedInput || (images && images.length > 0)) {
						await TaskServiceClient.askResponse({
							responseType: "noButtonClicked",
							text: trimmedInput,
							images: images,
						})
					} else {
						// 向 API 响应“此操作失败”并让其重试
						await TaskServiceClient.askResponse({
							responseType: "noButtonClicked",
						})
					}
					// 发送后清除输入状态
					setInputValue("")
					setActiveQuote(null) // 使用辅助按钮时清除引用
					setSelectedImages([])
					break
			}
			setSendingDisabled(true)
			setClineAsk(undefined)
			setEnableButtons(false)
			// setPrimaryButtonText(undefined)
			// setSecondaryButtonText(undefined)
			disableAutoScrollRef.current = false
		},
		[clineAsk, startNewTask, isStreaming],
	)

	const handleTaskCloseButtonClick = useCallback(() => {
		startNewTask()
	}, [startNewTask])

	const handleFocusChange = useCallback((isFocused: boolean) => {
		setIsTextAreaFocused(isFocused)
	}, [])

	const { selectedModelInfo } = useMemo(() => {
		return normalizeApiConfiguration(apiConfiguration)
	}, [apiConfiguration])

	const selectImages = useCallback(async () => {
		try {
			const response = await FileServiceClient.selectImages({})
			if (response && response.values && response.values.length > 0) {
				setSelectedImages((prevImages) => [...prevImages, ...response.values].slice(0, MAX_IMAGES_PER_MESSAGE))
			}
		} catch (error) {
			console.error("选择图片时出错:", error)
		}
	}, [])

	const shouldDisableImages = !selectedModelInfo.supportsImages || selectedImages.length >= MAX_IMAGES_PER_MESSAGE

	const handleMessage = useCallback(
		(e: MessageEvent) => {
			const message: ExtensionMessage = e.data
			switch (message.type) {
				case "action":
					switch (message.action!) {
						case "didBecomeVisible":
							if (!isHidden && !sendingDisabled && !enableButtons) {
								textAreaRef.current?.focus()
							}
							break
						case "focusChatInput":
							textAreaRef.current?.focus()
							if (isHidden) {
								// 将消息发送回扩展以显示聊天视图
								vscode.postMessage({ type: "showChatView" })
							}
							break
					}
					break
				case "selectedImages":
					const newImages = message.images ?? []
					if (newImages.length > 0) {
						setSelectedImages((prevImages) => [...prevImages, ...newImages].slice(0, MAX_IMAGES_PER_MESSAGE))
					}
					break
				case "addToInput":
					setInputValue((prevValue) => {
						const newText = message.text ?? ""
						const newTextWithNewline = newText + "\n"
						return prevValue ? `${prevValue}\n${newTextWithNewline}` : newTextWithNewline
					})
					// 状态更新后滚动到底部
					// 自动聚焦输入并将光标置于新行以便于输入
					setTimeout(() => {
						if (textAreaRef.current) {
							textAreaRef.current.scrollTop = textAreaRef.current.scrollHeight
							textAreaRef.current.focus()
						}
					}, 0)
					break
				case "invoke":
					switch (message.invoke!) {
						case "sendMessage":
							handleSendMessage(message.text ?? "", message.images ?? [])
							break
						case "primaryButtonClick":
							handlePrimaryButtonClick(message.text ?? "", message.images ?? [])
							break
						case "secondaryButtonClick":
							handleSecondaryButtonClick(message.text ?? "", message.images ?? [])
							break
					}
			}
			// 此处不明确要求 textAreaRef.current，因为 React 保证 ref 在重新渲染时保持稳定，并且我们使用的是它的引用而不是它的值。
		},
		[isHidden, sendingDisabled, enableButtons, handleSendMessage, handlePrimaryButtonClick, handleSecondaryButtonClick],
	)

	useEvent("message", handleMessage)

	useMount(() => {
		// 注意：vscode 窗口需要聚焦才能使其工作
		textAreaRef.current?.focus()
	})

	useEffect(() => {
		const timer = setTimeout(() => {
			if (!isHidden && !sendingDisabled && !enableButtons) {
				textAreaRef.current?.focus()
			}
		}, 50)
		return () => {
			clearTimeout(timer)
		}
	}, [isHidden, sendingDisabled, enableButtons])

	const visibleMessages = useMemo(() => {
		return modifiedMessages.filter((message) => {
			switch (message.ask) {
				case "completion_result":
					// 不要为没有文本的 completion_result ask 显示聊天行。这种特定类型的消息仅在 cline 希望执行命令作为其完成结果的一部分时发生，在这种情况下，我们将 completion_result 工具与 execute_command 工具穿插。
					if (message.text === "") {
						return false
					}
					break
				case "api_req_failed": // 此消息用于更新最新的 api_req_started，表明请求失败
				case "resume_task":
				case "resume_completed_task":
					return false
			}
			switch (message.say) {
				case "api_req_finished": // combineApiRequests 无论如何都会从 modifiedMessages 中删除此内容
				case "api_req_retried": // 此消息用于更新最新的 api_req_started，表明请求已重试
				case "deleted_api_reqs": // 来自已删除消息的聚合 api_req 指标
					return false
				case "text":
					// 有时 cline 返回空文本消息，我们不想渲染这些消息。（我们也为用户消息使用 say 文本，因此如果他们只发送了图片，我们仍然会渲染它）
					if ((message.text ?? "") === "" && (message.images?.length ?? 0) === 0) {
						return false
					}
					break
				case "mcp_server_request_started":
					return false
			}
			return true
		})
	}, [modifiedMessages])

	const isBrowserSessionMessage = (message: ClineMessage): boolean => {
		// 哪些可见消息是浏览器会话消息，见上文

		// 注意：我们希望作为浏览器会话一部分的任何消息都应包含在此处
		// 之前存在一个问题，我们在浏览器操作后添加了检查点，导致浏览器会话中断。
		if (message.type === "ask") {
			return ["browser_action_launch"].includes(message.ask!)
		}
		if (message.type === "say") {
			return [
				"browser_action_launch",
				"api_req_started",
				"text",
				"browser_action",
				"browser_action_result",
				"checkpoint_created",
				"reasoning",
			].includes(message.say!)
		}
		return false
	}

	const groupedMessages = useMemo(() => {
		const result: (ClineMessage | ClineMessage[])[] = []
		let currentGroup: ClineMessage[] = []
		let isInBrowserSession = false

		const endBrowserSession = () => {
			if (currentGroup.length > 0) {
				result.push([...currentGroup])
				currentGroup = []
				isInBrowserSession = false
			}
		}

		visibleMessages.forEach((message) => {
			if (message.ask === "browser_action_launch" || message.say === "browser_action_launch") {
				// 如果有，则完成现有的浏览器会话
				endBrowserSession()
				// 开始新的
				isInBrowserSession = true
				currentGroup.push(message)
			} else if (isInBrowserSession) {
				// 如果 api_req_started 被取消，则结束会话

				if (message.say === "api_req_started") {
					// 获取 currentGroup 中的最后一个 api_req_started 以检查它是否被取消。如果是，则此 api req 不属于当前浏览器会话
					const lastApiReqStarted = [...currentGroup].reverse().find((m) => m.say === "api_req_started")
					if (lastApiReqStarted?.text != null) {
						const info = JSON.parse(lastApiReqStarted.text)
						const isCancelled = info.cancelReason != null
						if (isCancelled) {
							endBrowserSession()
							result.push(message)
							return
						}
					}
				}

				if (isBrowserSessionMessage(message)) {
					currentGroup.push(message)

					// 检查这是否是关闭操作
					if (message.say === "browser_action") {
						const browserAction = JSON.parse(message.text || "{}") as ClineSayBrowserAction
						if (browserAction.action === "close") {
							endBrowserSession()
						}
					}
				} else {
					// 如果有，则完成现有的浏览器会话
					endBrowserSession()
					result.push(message)
				}
			} else {
				result.push(message)
			}
		})

		// 处理浏览器会话是最后一组的情况
		if (currentGroup.length > 0) {
			result.push([...currentGroup])
		}

		return result
	}, [visibleMessages])

	// 滚动

	const scrollToBottomSmooth = useMemo(
		() =>
			debounce(
				() => {
					virtuosoRef.current?.scrollTo({
						top: Number.MAX_SAFE_INTEGER,
						behavior: "smooth",
					})
				},
				10,
				{ immediate: true },
			),
		[],
	)

	const scrollToBottomAuto = useCallback(() => {
		virtuosoRef.current?.scrollTo({
			top: Number.MAX_SAFE_INTEGER,
			behavior: "auto", // "instant" 行为会导致崩溃
		})
	}, [])

	// 用户切换某些行时滚动
	const toggleRowExpansion = useCallback(
		(ts: number) => {
			const isCollapsing = expandedRows[ts] ?? false
			const lastGroup = groupedMessages.at(-1)
			const isLast = Array.isArray(lastGroup) ? lastGroup[0].ts === ts : lastGroup?.ts === ts
			const secondToLastGroup = groupedMessages.at(-2)
			const isSecondToLast = Array.isArray(secondToLastGroup)
				? secondToLastGroup[0].ts === ts
				: secondToLastGroup?.ts === ts

			const isLastCollapsedApiReq =
				isLast &&
				!Array.isArray(lastGroup) && // 确保它不是浏览器会话组
				lastGroup?.say === "api_req_started" &&
				!expandedRows[lastGroup.ts]

			setExpandedRows((prev) => ({
				...prev,
				[ts]: !prev[ts],
			}))

			// 用户展开行时禁用自动滚动
			if (!isCollapsing) {
				disableAutoScrollRef.current = true
			}

			if (isCollapsing && isAtBottom) {
				const timer = setTimeout(() => {
					scrollToBottomAuto()
				}, 0)
				return () => clearTimeout(timer)
			} else if (isLast || isSecondToLast) {
				if (isCollapsing) {
					if (isSecondToLast && !isLastCollapsedApiReq) {
						return
					}
					const timer = setTimeout(() => {
						scrollToBottomAuto()
					}, 0)
					return () => clearTimeout(timer)
				} else {
					const timer = setTimeout(() => {
						virtuosoRef.current?.scrollToIndex({
							index: groupedMessages.length - (isLast ? 1 : 2),
							align: "start",
						})
					}, 0)
					return () => clearTimeout(timer)
				}
			}
		},
		[groupedMessages, expandedRows, scrollToBottomAuto, isAtBottom],
	)

	const handleRowHeightChange = useCallback(
		(isTaller: boolean) => {
			if (!disableAutoScrollRef.current) {
				if (isTaller) {
					scrollToBottomSmooth()
				} else {
					setTimeout(() => {
						scrollToBottomAuto()
					}, 0)
				}
			}
		},
		[scrollToBottomSmooth, scrollToBottomAuto],
	)

	useEffect(() => {
		if (!disableAutoScrollRef.current) {
			setTimeout(() => {
				scrollToBottomSmooth()
			}, 50)
			// return () => clearTimeout(timer) // 不要清理，因为如果 visibleMessages.length 更改，它会取消。
		}
	}, [groupedMessages.length, scrollToBottomSmooth])

	const handleWheel = useCallback((event: Event) => {
		const wheelEvent = event as WheelEvent
		if (wheelEvent.deltaY && wheelEvent.deltaY < 0) {
			if (scrollContainerRef.current?.contains(wheelEvent.target as Node)) {
				// 用户向上滚动
				disableAutoScrollRef.current = true
			}
		}
	}, [])
	useEvent("wheel", handleWheel, window, { passive: true }) // passive 选项可提高滚动性能

	const placeholderText = useMemo(() => {
		const text = task ? "输入消息..." : "在此输入您的任务..."
		return text
	}, [task])

	const itemContent = useCallback(
		(index: number, messageOrGroup: ClineMessage | ClineMessage[]) => {
			// 浏览器会话组
			if (Array.isArray(messageOrGroup)) {
				return (
					<BrowserSessionRow
						messages={messageOrGroup}
						isLast={index === groupedMessages.length - 1}
						lastModifiedMessage={modifiedMessages.at(-1)}
						onHeightChange={handleRowHeightChange}
						// 为组中的每条消息传递处理程序
						isExpanded={(messageTs: number) => expandedRows[messageTs] ?? false}
						onToggleExpand={(messageTs: number) => {
							setExpandedRows((prev) => ({
								...prev,
								[messageTs]: !prev[messageTs],
							}))
						}}
						onSetQuote={setActiveQuote}
					/>
				)
			}

			// 我们仅为最后一条消息显示某些状态
			// 如果最后一条消息是检查点，我们希望显示前一条消息的状态
			const nextMessage = index < groupedMessages.length - 1 && groupedMessages[index + 1]
			const isNextCheckpoint = !Array.isArray(nextMessage) && nextMessage && nextMessage?.say === "checkpoint_created"
			const isLastMessageGroup = isNextCheckpoint && index === groupedMessages.length - 2

			const isLast = index === groupedMessages.length - 1 || isLastMessageGroup

			// 常规消息
			return (
				<ChatRow
					key={messageOrGroup.ts}
					message={messageOrGroup}
					isExpanded={expandedRows[messageOrGroup.ts] || false}
					onToggleExpand={() => toggleRowExpansion(messageOrGroup.ts)}
					lastModifiedMessage={modifiedMessages.at(-1)}
					isLast={isLast}
					onHeightChange={handleRowHeightChange}
					inputValue={inputValue}
					sendMessageFromChatRow={handleSendMessage}
					onSetQuote={setActiveQuote}
				/>
			)
		},
		[
			expandedRows,
			modifiedMessages,
			groupedMessages.length,
			toggleRowExpansion,
			handleRowHeightChange,
			inputValue,
			setActiveQuote,
			handleSendMessage, // Added handleSendMessage to dependency array
		],
	)

	return (
		<div
			style={{
				position: "fixed",
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
				display: isHidden ? "none" : "flex",
				flexDirection: "column",
				overflow: "hidden",
			}}>
			{task ? (
				<TaskHeader
					task={task}
					tokensIn={apiMetrics.totalTokensIn}
					tokensOut={apiMetrics.totalTokensOut}
					doesModelSupportPromptCache={selectedModelInfo.supportsPromptCache}
					cacheWrites={apiMetrics.totalCacheWrites}
					cacheReads={apiMetrics.totalCacheReads}
					totalCost={apiMetrics.totalCost}
					lastApiReqTotalTokens={lastApiReqTotalTokens}
					onClose={handleTaskCloseButtonClick}
				/>
			) : (
				<div
					style={{
						flex: "1 1 0", // flex-grow: 1（放大比例）, flex-shrink: 1（缩小比例）, flex-basis: 0（项目占据的主轴空间）
						minHeight: 0,
						overflowY: "auto",
						display: "flex",
						flexDirection: "column",
						paddingBottom: "10px",
					}}>
					{telemetrySetting === "unset" && <TelemetryBanner />}

					{showAnnouncement && <Announcement version={version} hideAnnouncement={hideAnnouncement} />}

					<HomeHeader />
					{taskHistory.length > 0 && <HistoryPreview showHistoryView={showHistoryView} />}
				</div>
			)}

			{!task && <AutoApproveBar />}

			{task && (
				<>
					<div style={{ flexGrow: 1, display: "flex" }} ref={scrollContainerRef}>
						<Virtuoso
							ref={virtuosoRef}
							key={task.ts} // 确保任务更改时 virtuoso 重新渲染的技巧，我们使用 initialTopMostItemIndex 从底部开始
							className="scrollable"
							style={{
								flexGrow: 1,
								overflowY: "scroll", // 始终显示滚动条
							}}
							components={{
								Footer: () => <div style={{ height: 5 }} />, // 在底部添加空内边距
							}}
							// 顶部增加 3_000 以防止用户折叠行时跳动
							increaseViewportBy={{
								top: 3_000,
								bottom: Number.MAX_SAFE_INTEGER,
							}} // 确保最后一条消息始终被渲染的技巧，以便在添加新消息时获得真正完美的滚动到底部动画（Number.MAX_SAFE_INTEGER 对于算术运算是安全的，virtuoso 在 src/sizeRangeSystem.ts 中仅将此值用于此目的）
							data={groupedMessages} // messages 是扩展返回的原始格式，modifiedMessages 是组合了某些相关类型消息的已操作结构，visibleMessages 是移除了不应渲染消息的已过滤结构
							itemContent={itemContent}
							atBottomStateChange={(isAtBottom) => {
								setIsAtBottom(isAtBottom)
								if (isAtBottom) {
									disableAutoScrollRef.current = false
								}
								setShowScrollToBottom(disableAutoScrollRef.current && !isAtBottom)
							}}
							atBottomThreshold={10} // 任何更低的值都会导致 followOutput（跟随输出）出现问题
							initialTopMostItemIndex={groupedMessages.length - 1}
						/>
					</div>
					<AutoApproveBar />
					{showScrollToBottom ? (
						<div
							style={{
								display: "flex",
								padding: "10px 15px 0px 15px",
							}}>
							<ScrollToBottomButton
								onClick={() => {
									scrollToBottomSmooth()
									disableAutoScrollRef.current = false
								}}>
								<span className="codicon codicon-chevron-down" style={{ fontSize: "18px" }}></span>
							</ScrollToBottomButton>
						</div>
					) : (
						<div
							style={{
								opacity:
									primaryButtonText || secondaryButtonText || isStreaming
										? enableButtons || (isStreaming && !didClickCancel)
											? 1
											: 0.5
										: 0,
								display: "flex",
								padding: `${primaryButtonText || secondaryButtonText || isStreaming ? "10" : "0"}px 15px 0px 15px`,
							}}>
							{primaryButtonText && !isStreaming && (
								<VSCodeButton
									appearance="primary"
									disabled={!enableButtons}
									style={{
										flex: secondaryButtonText ? 1 : 2,
										marginRight: secondaryButtonText ? "6px" : "0",
									}}
									onClick={() => handlePrimaryButtonClick(inputValue, selectedImages)}>
									{primaryButtonText}
								</VSCodeButton>
							)}
							{(secondaryButtonText || isStreaming) && (
								<VSCodeButton
									appearance="secondary"
									disabled={!enableButtons && !(isStreaming && !didClickCancel)}
									style={{
										flex: isStreaming ? 2 : 1,
										marginLeft: isStreaming ? 0 : "6px",
									}}
									onClick={() => handleSecondaryButtonClick(inputValue, selectedImages)}>
									{isStreaming ? "取消" : secondaryButtonText}
								</VSCodeButton>
							)}
						</div>
					)}
				</>
			)}
			{(() => {
				return activeQuote ? (
					<div style={{ marginBottom: "-12px", marginTop: "10px" }}>
						<QuotedMessagePreview
							text={activeQuote}
							onDismiss={() => setActiveQuote(null)}
							isFocused={isTextAreaFocused}
						/>
					</div>
				) : null
			})()}

			<ChatTextArea
				ref={textAreaRef}
				onFocusChange={handleFocusChange}
				activeQuote={activeQuote}
				inputValue={inputValue}
				setInputValue={setInputValue}
				sendingDisabled={sendingDisabled}
				placeholderText={placeholderText}
				selectedImages={selectedImages}
				setSelectedImages={setSelectedImages}
				onSend={() => handleSendMessage(inputValue, selectedImages)}
				onSelectImages={selectImages}
				shouldDisableImages={shouldDisableImages}
				onHeightChange={() => {
					if (isAtBottom) {
						scrollToBottomAuto()
					}
				}}
			/>
		</div>
	)
}

const ScrollToBottomButton = styled.div`
	background-color: color-mix(in srgb, var(--vscode-toolbar-hoverBackground) 55%, transparent);
	border-radius: 3px;
	overflow: hidden;
	cursor: pointer;
	display: flex;
	justify-content: center;
	align-items: center;
	flex: 1;
	height: 25px;

	&:hover {
		background-color: color-mix(in srgb, var(--vscode-toolbar-hoverBackground) 90%, transparent);
	}

	&:active {
		background-color: color-mix(in srgb, var(--vscode-toolbar-hoverBackground) 70%, transparent);
	}
`

export default ChatView
