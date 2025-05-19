import { Anthropic } from "@anthropic-ai/sdk"
import cloneDeep from "clone-deep"
import { execa } from "execa"
import getFolderSize from "get-folder-size"
import { setTimeout as setTimeoutPromise } from "node:timers/promises"
import os from "os"
import pTimeout from "p-timeout"
import pWaitFor from "p-wait-for"
import * as path from "path"
import { serializeError } from "serialize-error"
import * as vscode from "vscode"
import { Logger } from "@services/logging/Logger"
import { ApiHandler, buildApiHandler } from "@api/index"
import { AnthropicHandler } from "@api/providers/anthropic"
import { ClineHandler } from "@api/providers/cline"
import { OpenRouterHandler } from "@api/providers/openrouter"
import { ApiStream } from "@api/transform/stream"
import CheckpointTracker from "@integrations/checkpoints/CheckpointTracker"
import { DIFF_VIEW_URI_SCHEME, DiffViewProvider } from "@integrations/editor/DiffViewProvider"
import { formatContentBlockToMarkdown } from "@integrations/misc/export-markdown"
import { extractTextFromFile } from "@integrations/misc/extract-text"
import { showSystemNotification } from "@integrations/notifications"
import { TerminalManager } from "@integrations/terminal/TerminalManager"
import { BrowserSession } from "@services/browser/BrowserSession"
import { UrlContentFetcher } from "@services/browser/UrlContentFetcher"
import { listFiles } from "@services/glob/list-files"
import { regexSearchFiles } from "@services/ripgrep"
import { telemetryService } from "@/services/posthog/telemetry/TelemetryService"
import { parseSourceCodeForDefinitionsTopLevel } from "@services/tree-sitter"
import { ApiConfiguration } from "@shared/api"
import { findLast, findLastIndex, parsePartialArrayString } from "@shared/array"
import { AutoApprovalSettings } from "@shared/AutoApprovalSettings"
import { BrowserSettings } from "@shared/BrowserSettings"
import { ChatSettings } from "@shared/ChatSettings"
import { combineApiRequests } from "@shared/combineApiRequests"
import { combineCommandSequences, COMMAND_REQ_APP_STRING } from "@shared/combineCommandSequences"
import {
	BrowserAction,
	BrowserActionResult,
	browserActions,
	ClineApiReqCancelReason,
	ClineApiReqInfo,
	ClineAsk,
	ClineAskQuestion,
	ClineAskUseMcpServer,
	ClineMessage,
	ClinePlanModeResponse,
	ClineSay,
	ClineSayBrowserAction,
	ClineSayTool,
	COMPLETION_RESULT_CHANGES_FLAG,
	ExtensionMessage,
} from "@shared/ExtensionMessage"
import { getApiMetrics } from "@shared/getApiMetrics"
import { HistoryItem } from "@shared/HistoryItem"
import { DEFAULT_LANGUAGE_SETTINGS, getLanguageKey, LanguageDisplay } from "@shared/Languages"
import { ClineAskResponse, ClineCheckpointRestore } from "@shared/WebviewMessage"
import { calculateApiCostAnthropic } from "@utils/cost"
import { fileExistsAtPath } from "@utils/fs"
import { createAndOpenGitHubIssue } from "@utils/github-url-utils"
import { arePathsEqual, getReadablePath, isLocatedInWorkspace } from "@utils/path"
import { fixModelHtmlEscaping, removeInvalidChars } from "@utils/string"
import { AssistantMessageContent, parseAssistantMessageV2, ToolParamName, ToolUseName } from "@core/assistant-message"
import { constructNewFileContent } from "@core/assistant-message/diff"
import { ClineIgnoreController } from "@core/ignore/ClineIgnoreController"
import { parseMentions } from "@core/mentions"
import { formatResponse } from "@core/prompts/responses"
import { addUserInstructions, SYSTEM_PROMPT } from "@core/prompts/system"
import { getContextWindowInfo } from "@core/context/context-management/context-window-utils"
import { FileContextTracker } from "@core/context/context-tracking/FileContextTracker"
import { ModelContextTracker } from "@core/context/context-tracking/ModelContextTracker"
import {
	checkIsAnthropicContextWindowError,
	checkIsOpenRouterContextWindowError,
} from "@core/context/context-management/context-error-handling"
import { ContextManager } from "@core/context/context-management/ContextManager"
import { loadMcpDocumentation } from "@core/prompts/loadMcpDocumentation"
import {
	ensureRulesDirectoryExists,
	ensureTaskDirectoryExists,
	getSavedApiConversationHistory,
	getSavedClineMessages,
	GlobalFileNames,
	saveApiConversationHistory,
	saveClineMessages,
} from "@core/storage/disk"
import {
	getGlobalClineRules,
	getLocalClineRules,
	refreshClineRulesToggles,
} from "@core/context/instructions/user-instructions/cline-rules"
import { ensureLocalClineDirExists } from "../context/instructions/user-instructions/rule-helpers"
import {
	refreshExternalRulesToggles,
	getLocalWindsurfRules,
	getLocalCursorRules,
} from "@core/context/instructions/user-instructions/external-rules"
import { refreshWorkflowToggles } from "../context/instructions/user-instructions/workflows"
import { getGlobalState } from "@core/storage/state"
import { parseSlashCommands } from "@core/slash-commands"
import WorkspaceTracker from "@integrations/workspace/WorkspaceTracker"
import { McpHub } from "@services/mcp/McpHub"
import { isInTestMode } from "../../services/test/TestMode"
import { featureFlagsService } from "@/services/posthog/feature-flags/FeatureFlagsService"

export const cwd =
	vscode.workspace.workspaceFolders?.map((folder) => folder.uri.fsPath).at(0) ?? path.join(os.homedir(), "Desktop") // may or may not exist but fs checking existence would immediately ask for permission which would be bad UX, need to come up with a better solution

type ToolResponse = string | Array<Anthropic.TextBlockParam | Anthropic.ImageBlockParam>
type UserContent = Array<Anthropic.ContentBlockParam>

export class Task {
	// dependencies
	private context: vscode.ExtensionContext
	private mcpHub: McpHub
	private workspaceTracker: WorkspaceTracker
	private updateTaskHistory: (historyItem: HistoryItem) => Promise<HistoryItem[]>
	private postStateToWebview: () => Promise<void>
	private postMessageToWebview: (message: ExtensionMessage) => Promise<void>
	private reinitExistingTaskFromId: (taskId: string) => Promise<void>
	private cancelTask: () => Promise<void>

	readonly taskId: string
	private taskIsFavorited?: boolean
	api: ApiHandler
	private terminalManager: TerminalManager
	private urlContentFetcher: UrlContentFetcher
	browserSession: BrowserSession
	contextManager: ContextManager
	private didEditFile: boolean = false
	customInstructions?: string
	autoApprovalSettings: AutoApprovalSettings
	browserSettings: BrowserSettings
	chatSettings: ChatSettings
	apiConversationHistory: Anthropic.MessageParam[] = []
	clineMessages: ClineMessage[] = []
	private clineIgnoreController: ClineIgnoreController
	private askResponse?: ClineAskResponse
	private askResponseText?: string
	private askResponseImages?: string[]
	private lastMessageTs?: number
	private consecutiveAutoApprovedRequestsCount: number = 0
	private consecutiveMistakeCount: number = 0
	private abort: boolean = false
	didFinishAbortingStream = false
	abandoned = false
	private diffViewProvider: DiffViewProvider
	private checkpointTracker?: CheckpointTracker
	checkpointTrackerErrorMessage?: string
	conversationHistoryDeletedRange?: [number, number]
	isInitialized = false
	isAwaitingPlanResponse = false
	didRespondToPlanAskBySwitchingMode = false

	// Metadata tracking
	private fileContextTracker: FileContextTracker
	private modelContextTracker: ModelContextTracker

	// streaming
	isWaitingForFirstChunk = false
	isStreaming = false
	private currentStreamingContentIndex = 0
	private assistantMessageContent: AssistantMessageContent[] = []
	private presentAssistantMessageLocked = false
	private presentAssistantMessageHasPendingUpdates = false
	private userMessageContent: (Anthropic.TextBlockParam | Anthropic.ImageBlockParam)[] = []
	private userMessageContentReady = false
	private didRejectTool = false
	private didAlreadyUseTool = false
	private didCompleteReadingStream = false
	private didAutomaticallyRetryFailedApiRequest = false
	private enableCheckpoints: boolean

	constructor(
		context: vscode.ExtensionContext,
		mcpHub: McpHub,
		workspaceTracker: WorkspaceTracker,
		updateTaskHistory: (historyItem: HistoryItem) => Promise<HistoryItem[]>,
		postStateToWebview: () => Promise<void>,
		postMessageToWebview: (message: ExtensionMessage) => Promise<void>,
		reinitExistingTaskFromId: (taskId: string) => Promise<void>,
		cancelTask: () => Promise<void>,
		apiConfiguration: ApiConfiguration,
		autoApprovalSettings: AutoApprovalSettings,
		browserSettings: BrowserSettings,
		chatSettings: ChatSettings,
		shellIntegrationTimeout: number,
		enableCheckpointsSetting: boolean,
		customInstructions?: string,
		task?: string,
		images?: string[],
		historyItem?: HistoryItem,
	) {
		this.context = context
		this.mcpHub = mcpHub
		this.workspaceTracker = workspaceTracker
		this.updateTaskHistory = updateTaskHistory
		this.postStateToWebview = postStateToWebview
		this.postMessageToWebview = postMessageToWebview
		this.reinitExistingTaskFromId = reinitExistingTaskFromId
		this.cancelTask = cancelTask
		this.clineIgnoreController = new ClineIgnoreController(cwd)
		// Initialization moved to startTask/resumeTaskFromHistory
		this.terminalManager = new TerminalManager()
		this.terminalManager.setShellIntegrationTimeout(shellIntegrationTimeout)
		this.urlContentFetcher = new UrlContentFetcher(context)
		this.browserSession = new BrowserSession(context, browserSettings)
		this.contextManager = new ContextManager()
		this.diffViewProvider = new DiffViewProvider(cwd)
		this.customInstructions = customInstructions
		this.autoApprovalSettings = autoApprovalSettings
		this.browserSettings = browserSettings
		this.chatSettings = chatSettings
		this.enableCheckpoints = enableCheckpointsSetting

		// Initialize taskId first
		if (historyItem) {
			this.taskId = historyItem.id
			this.taskIsFavorited = historyItem.isFavorited
			this.conversationHistoryDeletedRange = historyItem.conversationHistoryDeletedRange
		} else if (task || images) {
			this.taskId = Date.now().toString()
		} else {
			throw new Error("Either historyItem or task/images must be provided")
		}

		// Initialize file context tracker
		this.fileContextTracker = new FileContextTracker(context, this.taskId)
		this.modelContextTracker = new ModelContextTracker(context, this.taskId)

		// Prepare effective API configuration
		let effectiveApiConfiguration: ApiConfiguration = {
			...apiConfiguration,
			taskId: this.taskId,
			onRetryAttempt: (attempt: number, maxRetries: number, delay: number, error: any) => {
				const lastApiReqStartedIndex = findLastIndex(this.clineMessages, (m) => m.say === "api_req_started")
				if (lastApiReqStartedIndex !== -1) {
					try {
						const currentApiReqInfo: ClineApiReqInfo = JSON.parse(
							this.clineMessages[lastApiReqStartedIndex].text || "{}",
						)
						currentApiReqInfo.retryStatus = {
							attempt: attempt, // attempt 已经是 retry.ts 中的 1-indexed
							maxAttempts: maxRetries, // 总尝试次数
							delaySec: Math.round(delay / 1000),
							errorSnippet: error?.message ? `${String(error.message).substring(0, 50)}...` : undefined,
						}
						// 如果正在重试，清除之前的 cancelReason 和 streamingFailedMessage
						delete currentApiReqInfo.cancelReason
						delete currentApiReqInfo.streamingFailedMessage
						this.clineMessages[lastApiReqStartedIndex].text = JSON.stringify(currentApiReqInfo)

						// 将更新后的状态发布到 webview，以便 UI 反映重试尝试
						this.postStateToWebview().catch((e) =>
							console.error("在 onRetryAttempt 中向 webview 发布状态时出错:", e),
						)

						console.log(
							`[任务 ${this.taskId}] API 自动重试状态更新: 尝试 ${attempt}/${maxRetries}, 延迟: ${delay}ms`,
						)
					} catch (e) {
						console.error(`[任务 ${this.taskId}] 更新 api_req_started 的 retryStatus 时出错:`, e)
					}
				}
			},
		}

		if (apiConfiguration.apiProvider === "openai" || apiConfiguration.apiProvider === "openai-native") {
			effectiveApiConfiguration.reasoningEffort = chatSettings.openAIReasoningEffort
		}

		// taskId 初始化后，我们就可以构建 API 处理器了
		this.api = buildApiHandler(effectiveApiConfiguration)

		// 在 browserSession 上设置 taskId 用于遥测跟踪
		this.browserSession.setTaskId(this.taskId)

		// 继续任务初始化
		if (historyItem) {
			this.resumeTaskFromHistory()
		} else if (task || images) {
			this.startTask(task, images)
		}

		// 初始化遥测
		if (historyItem) {
			// 从历史记录打开任务
			telemetryService.captureTaskRestarted(this.taskId, apiConfiguration.apiProvider)
		} else {
			// 新任务已启动
			telemetryService.captureTaskCreated(this.taskId, apiConfiguration.apiProvider)
		}
	}

	// 当任务被控制器引用时，它将始终有权访问扩展上下文
	// 如果控制器在例如中止任务后取消引用任务，则会抛出此错误
	private getContext(): vscode.ExtensionContext {
		const context = this.context
		if (!context) {
			throw new Error("无法访问扩展上下文")
		}
		return context
	}

	// 将任务存储到磁盘以供历史记录使用
	private async addToApiConversationHistory(message: Anthropic.MessageParam) {
		this.apiConversationHistory.push(message)
		await saveApiConversationHistory(this.getContext(), this.taskId, this.apiConversationHistory)
	}

	private async overwriteApiConversationHistory(newHistory: Anthropic.MessageParam[]) {
		this.apiConversationHistory = newHistory
		await saveApiConversationHistory(this.getContext(), this.taskId, this.apiConversationHistory)
	}

	private async addToClineMessages(message: ClineMessage) {
		// 这些值允许我们重建创建此 cline 消息时的对话历史记录
		// 在添加 cline 消息之前初始化 apiConversationHistory 很重要
		message.conversationHistoryIndex = this.apiConversationHistory.length - 1 // 注意：这是最后添加的消息的索引，即用户消息，一旦呈现了 clinemessages，我们就会用完成的助手消息更新 apiconversationhistory。这意味着在重置到某个消息时，我们需要将此索引 +1 以获取此工具使用对应的正确助手消息
		message.conversationHistoryDeletedRange = this.conversationHistoryDeletedRange
		this.clineMessages.push(message)
		await this.saveClineMessagesAndUpdateHistory()
	}

	private async overwriteClineMessages(newMessages: ClineMessage[]) {
		this.clineMessages = newMessages
		await this.saveClineMessagesAndUpdateHistory()
	}

	private async saveClineMessagesAndUpdateHistory() {
		try {
			await saveClineMessages(this.getContext(), this.taskId, this.clineMessages)

			// 像在 ChatView 中一样组合
			const apiMetrics = getApiMetrics(combineApiRequests(combineCommandSequences(this.clineMessages.slice(1))))
			const taskMessage = this.clineMessages[0] // 第一条消息始终是任务 say
			const lastRelevantMessage =
				this.clineMessages[
					findLastIndex(this.clineMessages, (m) => !(m.ask === "resume_task" || m.ask === "resume_completed_task"))
				]
			const taskDir = await ensureTaskDirectoryExists(this.getContext(), this.taskId)
			let taskDirSize = 0
			try {
				// getFolderSize.loose 会静默忽略错误
				// 返回字节数，size/1000/1000 = MB
				taskDirSize = await getFolderSize.loose(taskDir)
			} catch (error) {
				console.error("获取任务目录大小时失败:", taskDir, error)
			}
			await this.updateTaskHistory({
				id: this.taskId,
				ts: lastRelevantMessage.ts,
				task: taskMessage.text ?? "",
				tokensIn: apiMetrics.totalTokensIn,
				tokensOut: apiMetrics.totalTokensOut,
				cacheWrites: apiMetrics.totalCacheWrites,
				cacheReads: apiMetrics.totalCacheReads,
				totalCost: apiMetrics.totalCost,
				size: taskDirSize,
				shadowGitConfigWorkTree: await this.checkpointTracker?.getShadowGitConfigWorkTree(),
				cwdOnTaskInitialization: cwd,
				conversationHistoryDeletedRange: this.conversationHistoryDeletedRange,
				isFavorited: this.taskIsFavorited,
			})
		} catch (error) {
			console.error("保存 cline 消息失败:", error)
		}
	}

	async restoreCheckpoint(messageTs: number, restoreType: ClineCheckpointRestore, offset?: number) {
		const messageIndex = this.clineMessages.findIndex((m) => m.ts === messageTs) - (offset || 0)
		// 查找 messageIndex 之前最后一条具有 lastCheckpointHash 的消息
		const lastHashIndex = findLastIndex(this.clineMessages.slice(0, messageIndex), (m) => m.lastCheckpointHash !== undefined)
		const message = this.clineMessages[messageIndex]
		const lastMessageWithHash = this.clineMessages[lastHashIndex]

		if (!message) {
			console.error("未找到消息", this.clineMessages)
			return
		}

		let didWorkspaceRestoreFail = false

		switch (restoreType) {
			case "task":
				break
			case "taskAndWorkspace":
			case "workspace":
				if (!this.enableCheckpoints) {
					vscode.window.showErrorMessage("检查点在设置中已禁用。")
					didWorkspaceRestoreFail = true
					break
				}

				if (!this.checkpointTracker && !this.checkpointTrackerErrorMessage) {
					try {
						this.checkpointTracker = await CheckpointTracker.create(
							this.taskId,
							this.context.globalStorageUri.fsPath,
							this.enableCheckpoints,
						)
					} catch (error) {
						const errorMessage = error instanceof Error ? error.message : "未知错误"
						console.error("初始化检查点跟踪器失败:", errorMessage)
						this.checkpointTrackerErrorMessage = errorMessage
						await this.postStateToWebview()
						vscode.window.showErrorMessage(errorMessage)
						didWorkspaceRestoreFail = true
					}
				}
				if (message.lastCheckpointHash && this.checkpointTracker) {
					try {
						await this.checkpointTracker.resetHead(message.lastCheckpointHash)
					} catch (error) {
						const errorMessage = error instanceof Error ? error.message : "未知错误"
						vscode.window.showErrorMessage("恢复检查点失败: " + errorMessage)
						didWorkspaceRestoreFail = true
					}
				} else if (offset && lastMessageWithHash.lastCheckpointHash && this.checkpointTracker) {
					try {
						await this.checkpointTracker.resetHead(lastMessageWithHash.lastCheckpointHash)
					} catch (error) {
						const errorMessage = error instanceof Error ? error.message : "未知错误"
						vscode.window.showErrorMessage("恢复偏移检查点失败: " + errorMessage)
						didWorkspaceRestoreFail = true
					}
				}
				break
		}

		if (!didWorkspaceRestoreFail) {
			switch (restoreType) {
				case "task":
				case "taskAndWorkspace":
					this.conversationHistoryDeletedRange = message.conversationHistoryDeletedRange
					const newConversationHistory = this.apiConversationHistory.slice(
						0,
						(message.conversationHistoryIndex || 0) + 2,
					) // +1 因为此索引对应于最后一条用户消息，再 +1 因为 slice 结束索引是独占的
					await this.overwriteApiConversationHistory(newConversationHistory)

					// 更新上下文历史记录状态
					await this.contextManager.truncateContextHistory(
						message.ts,
						await ensureTaskDirectoryExists(this.getContext(), this.taskId),
					)

					// 聚合已删除的 api reqs 信息，这样我们就不会丢失成本/令牌
					const deletedMessages = this.clineMessages.slice(messageIndex + 1)
					const deletedApiReqsMetrics = getApiMetrics(combineApiRequests(combineCommandSequences(deletedMessages)))

					const newClineMessages = this.clineMessages.slice(0, messageIndex + 1)
					await this.overwriteClineMessages(newClineMessages) // 调用 saveClineMessages，它会保存 historyItem

					await this.say(
						"deleted_api_reqs",
						JSON.stringify({
							tokensIn: deletedApiReqsMetrics.totalTokensIn,
							tokensOut: deletedApiReqsMetrics.totalTokensOut,
							cacheWrites: deletedApiReqsMetrics.totalCacheWrites,
							cacheReads: deletedApiReqsMetrics.totalCacheReads,
							cost: deletedApiReqsMetrics.totalCost,
						} satisfies ClineApiReqInfo),
					)
					break
				case "workspace":
					break
			}

			switch (restoreType) {
				case "task":
					vscode.window.showInformationMessage("任务消息已恢复到检查点")
					break
				case "workspace":
					vscode.window.showInformationMessage("工作区文件已恢复到检查点")
					break
				case "taskAndWorkspace":
					vscode.window.showInformationMessage("任务和工作区已恢复到检查点")
					break
			}

			if (restoreType !== "task") {
				// 在消息上设置 isCheckpointCheckedOut 标志
				// 查找此消息之前的所有检查点消息
				const checkpointMessages = this.clineMessages.filter((m) => m.say === "checkpoint_created")
				const currentMessageIndex = checkpointMessages.findIndex((m) => m.ts === messageTs)

				// 将所有检查点消息的 isCheckpointCheckedOut 设置为 false
				checkpointMessages.forEach((m, i) => {
					m.isCheckpointCheckedOut = i === currentMessageIndex
				})
			}

			await this.saveClineMessagesAndUpdateHistory()

			await this.postMessageToWebview({ type: "relinquishControl" })

			this.cancelTask() // 任务已被提供程序事先取消，但我们需要重新初始化以获取更新的消息
		} else {
			await this.postMessageToWebview({ type: "relinquishControl" })
		}
	}

	async presentMultifileDiff(messageTs: number, seeNewChangesSinceLastTaskCompletion: boolean) {
		const relinquishButton = () => {
			this.postMessageToWebview({ type: "relinquishControl" })
		}
		if (!this.enableCheckpoints) {
			vscode.window.showInformationMessage("检查点在设置中已禁用。无法显示差异。")
			relinquishButton()
			return
		}

		console.log("presentMultifileDiff", messageTs)
		const messageIndex = this.clineMessages.findIndex((m) => m.ts === messageTs)
		const message = this.clineMessages[messageIndex]
		if (!message) {
			console.error("未找到消息")
			relinquishButton()
			return
		}
		const hash = message.lastCheckpointHash
		if (!hash) {
			console.error("未找到检查点哈希")
			relinquishButton()
			return
		}

		// TODO: 处理从原始工作区外部调用此函数的情况，在这种情况下，我们需要向用户显示错误消息，告知我们无法在工作区外部显示差异？
		if (!this.checkpointTracker && this.enableCheckpoints && !this.checkpointTrackerErrorMessage) {
			try {
				this.checkpointTracker = await CheckpointTracker.create(
					this.taskId,
					this.context.globalStorageUri.fsPath,
					this.enableCheckpoints,
				)
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : "未知错误"
				console.error("初始化检查点跟踪器失败:", errorMessage)
				this.checkpointTrackerErrorMessage = errorMessage
				await this.postStateToWebview()
				vscode.window.showErrorMessage(errorMessage)
				relinquishButton()
				return
			}
		}

		let changedFiles:
			| {
					relativePath: string
					absolutePath: string
					before: string
					after: string
			  }[]
			| undefined

		try {
			if (seeNewChangesSinceLastTaskCompletion) {
				// 获取上次任务完成情况
				const lastTaskCompletedMessageCheckpointHash = findLast(
					this.clineMessages.slice(0, messageIndex),
					(m) => m.say === "completion_result",
				)?.lastCheckpointHash // ask 仅用于放弃控制权，我们关心的是最后的 say
				// 如果未定义，则我们从 git 的开头获取差异
				// if (!lastTaskCompletedMessage) {
				// 	console.error("未找到先前的任务完成消息")
				// 	return
				// }
				// 此值 *应该* 始终存在
				const firstCheckpointMessageCheckpointHash = this.clineMessages.find(
					(m) => m.say === "checkpoint_created",
				)?.lastCheckpointHash

				const previousCheckpointHash = lastTaskCompletedMessageCheckpointHash || firstCheckpointMessageCheckpointHash // 要么使用第一个检查点和任务完成之间的差异，要么使用最新的两个任务完成之间的差异

				if (!previousCheckpointHash) {
					vscode.window.showErrorMessage("意外错误：未找到检查点哈希")
					relinquishButton()
					return
				}

				// 获取当前状态和提交之间的已更改文件
				changedFiles = await this.checkpointTracker?.getDiffSet(previousCheckpointHash, hash)
				if (!changedFiles?.length) {
					vscode.window.showInformationMessage("未找到任何更改")
					relinquishButton()
					return
				}
			} else {
				// 获取当前状态和提交之间的已更改文件
				changedFiles = await this.checkpointTracker?.getDiffSet(hash)
				if (!changedFiles?.length) {
					vscode.window.showInformationMessage("未找到任何更改")
					relinquishButton()
					return
				}
			}
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : "未知错误"
			vscode.window.showErrorMessage("检索差异集失败: " + errorMessage)
			relinquishButton()
			return
		}

		// 检查 VS Code 设置中是否启用了多重差异编辑器
		// const config = vscode.workspace.getConfiguration()
		// const isMultiDiffEnabled = config.get("multiDiffEditor.experimental.enabled")

		// if (!isMultiDiffEnabled) {
		// 	vscode.window.showErrorMessage(
		// 		"请在您的 VS Code 设置中启用 'multiDiffEditor.experimental.enabled' 以使用此功能。",
		// 	)
		// 	relinquishButton()
		// 	return
		// }
		// 打开多重差异编辑器
		await vscode.commands.executeCommand(
			"vscode.changes",
			seeNewChangesSinceLastTaskCompletion ? "新更改" : "自快照以来的更改",
			changedFiles.map((file) => [
				vscode.Uri.file(file.absolutePath),
				vscode.Uri.parse(`${DIFF_VIEW_URI_SCHEME}:${file.relativePath}`).with({
					query: Buffer.from(file.before ?? "").toString("base64"),
				}),
				vscode.Uri.parse(`${DIFF_VIEW_URI_SCHEME}:${file.relativePath}`).with({
					query: Buffer.from(file.after ?? "").toString("base64"),
				}),
			]),
		)
		relinquishButton()
	}

	async doesLatestTaskCompletionHaveNewChanges() {
		if (!this.enableCheckpoints) {
			return false
		}

		const messageIndex = findLastIndex(this.clineMessages, (m) => m.say === "completion_result")
		const message = this.clineMessages[messageIndex]
		if (!message) {
			console.error("未找到完成消息")
			return false
		}
		const hash = message.lastCheckpointHash
		if (!hash) {
			console.error("未找到检查点哈希")
			return false
		}

		if (this.enableCheckpoints && !this.checkpointTracker && !this.checkpointTrackerErrorMessage) {
			try {
				this.checkpointTracker = await CheckpointTracker.create(
					this.taskId,
					this.context.globalStorageUri.fsPath,
					this.enableCheckpoints,
				)
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : "未知错误"
				console.error("初始化检查点跟踪器失败:", errorMessage)
				return false
			}
		}

		// 获取上次任务完成情况
		const lastTaskCompletedMessage = findLast(this.clineMessages.slice(0, messageIndex), (m) => m.say === "completion_result")

		try {
			// 获取上次任务完成情况
			const lastTaskCompletedMessageCheckpointHash = lastTaskCompletedMessage?.lastCheckpointHash // ask 仅用于放弃控制权，我们关心的是最后的 say
			// 如果未定义，则我们从 git 的开头获取差异
			// if (!lastTaskCompletedMessage) {
			// 	console.error("未找到先前的任务完成消息")
			// 	return
			// }
			// 此值 *应该* 始终存在
			const firstCheckpointMessageCheckpointHash = this.clineMessages.find(
				(m) => m.say === "checkpoint_created",
			)?.lastCheckpointHash

			const previousCheckpointHash = lastTaskCompletedMessageCheckpointHash || firstCheckpointMessageCheckpointHash // 要么使用第一个检查点和任务完成之间的差异，要么使用最新的两个任务完成之间的差异

			if (!previousCheckpointHash) {
				return false
			}

			// 获取当前状态和提交之间已更改文件的计数
			const changedFilesCount = (await this.checkpointTracker?.getDiffCount(previousCheckpointHash, hash)) || 0
			if (changedFilesCount > 0) {
				return true
			}
		} catch (error) {
			console.error("获取差异集失败:", error)
			return false
		}

		return false
	}

	// 与 webview 通信

	// partial 有三种有效状态：true（部分消息）、false（部分消息的完成）、undefined（单个完整消息）
	async ask(
		type: ClineAsk,
		text?: string,
		partial?: boolean,
	): Promise<{
		response: ClineAskResponse
		text?: string
		images?: string[]
	}> {
		// 如果此 Cline 实例被提供程序中止，那么唯一使我们保持活动状态的是仍在后台运行的 promise，在这种情况下，我们不希望将其结果发送到 webview，因为它现在附加到一个新的 Cline 实例。因此，我们可以安全地忽略任何活动 promise 的结果，并且此类将被释放。（尽管我们在提供程序中将 Cline 设置为 undefined，但这只是删除了对此实例的引用，但该实例在 promise 解析或拒绝之前仍然存在。）
		if (this.abort) {
			throw new Error("Cline 实例已中止")
		}
		let askTs: number
		if (partial !== undefined) {
			const lastMessage = this.clineMessages.at(-1)
			const isUpdatingPreviousPartial =
				lastMessage && lastMessage.partial && lastMessage.type === "ask" && lastMessage.ask === type
			if (partial) {
				if (isUpdatingPreviousPartial) {
					// 现有部分消息，因此更新它
					lastMessage.text = text
					lastMessage.partial = partial
					// todo 更有效地保存和发布新数据或一次发布整个消息，因此忽略部分保存，并且只发布部分消息的部分而不是新侦听器中的整个数组
					// await this.saveClineMessagesAndUpdateHistory()
					// await this.postStateToWebview()
					await this.postMessageToWebview({
						type: "partialMessage",
						partialMessage: lastMessage,
					})
					throw new Error("当前 ask promise 已被忽略 1")
				} else {
					// 这是一个新的部分消息，因此使用部分状态添加它
					// this.askResponse = undefined
					// this.askResponseText = undefined
					// this.askResponseImages = undefined
					askTs = Date.now()
					this.lastMessageTs = askTs
					await this.addToClineMessages({
						ts: askTs,
						type: "ask",
						ask: type,
						text,
						partial,
					})
					await this.postStateToWebview()
					throw new Error("当前 ask promise 已被忽略 2")
				}
			} else {
				// partial=false 表示它是先前部分消息的完整版本
				if (isUpdatingPreviousPartial) {
					// 这是先前部分消息的完整版本，因此用完整版本替换部分版本
					this.askResponse = undefined
					this.askResponseText = undefined
					this.askResponseImages = undefined

					/*
					历史上的错误：
					在 webview 中，我们使用 ts 作为 virtuoso 列表的 chatrow 键。由于我们会在流式传输结束时更新此 ts，因此会导致视图闪烁。key prop 必须稳定，否则 react 在渲染之间协调项目时会遇到麻烦，从而导致组件卸载和重新挂载（闪烁）。
					这里的教训是，如果在渲染列表时看到闪烁，则可能是因为 key prop 不稳定。
					因此，在这种情况下，我们必须确保在首次设置消息 ts 后永远不会更改它。
					*/
					askTs = lastMessage.ts
					this.lastMessageTs = askTs
					// lastMessage.ts = askTs
					lastMessage.text = text
					lastMessage.partial = false
					await this.saveClineMessagesAndUpdateHistory()
					// await this.postStateToWebview()
					await this.postMessageToWebview({
						type: "partialMessage",
						partialMessage: lastMessage,
					})
				} else {
					// 这是一个新的 partial=false 消息，因此像往常一样添加它
					this.askResponse = undefined
					this.askResponseText = undefined
					this.askResponseImages = undefined
					askTs = Date.now()
					this.lastMessageTs = askTs
					await this.addToClineMessages({
						ts: askTs,
						type: "ask",
						ask: type,
						text,
					})
					await this.postStateToWebview()
				}
			}
		} else {
			// 这是一个新的非部分消息，因此像往常一样添加它
			// const lastMessage = this.clineMessages.at(-1)
			this.askResponse = undefined
			this.askResponseText = undefined
			this.askResponseImages = undefined
			askTs = Date.now()
			this.lastMessageTs = askTs
			await this.addToClineMessages({
				ts: askTs,
				type: "ask",
				ask: type,
				text,
			})
			await this.postStateToWebview()
		}

		await pWaitFor(() => this.askResponse !== undefined || this.lastMessageTs !== askTs, { interval: 100 })
		if (this.lastMessageTs !== askTs) {
			throw new Error("当前 ask promise 已被忽略") // 如果我们连续发送多个 ask（例如使用 command_output），则可能会发生这种情况。重要的是，当我们知道 ask 可能会失败时，要优雅地处理它
		}
		const result = {
			response: this.askResponse!,
			text: this.askResponseText,
			images: this.askResponseImages,
		}
		this.askResponse = undefined
		this.askResponseText = undefined
		this.askResponseImages = undefined
		return result
	}

	async handleWebviewAskResponse(askResponse: ClineAskResponse, text?: string, images?: string[]) {
		this.askResponse = askResponse
		this.askResponseText = text
		this.askResponseImages = images
	}

	async say(type: ClineSay, text?: string, images?: string[], partial?: boolean): Promise<undefined> {
		if (this.abort) {
			throw new Error("Cline 实例已中止")
		}

		if (partial !== undefined) {
			const lastMessage = this.clineMessages.at(-1)
			const isUpdatingPreviousPartial =
				lastMessage && lastMessage.partial && lastMessage.type === "say" && lastMessage.say === type
			if (partial) {
				if (isUpdatingPreviousPartial) {
					// 现有部分消息，因此更新它
					lastMessage.text = text
					lastMessage.images = images
					lastMessage.partial = partial
					await this.postMessageToWebview({
						type: "partialMessage",
						partialMessage: lastMessage,
					})
				} else {
					// 这是一个新的部分消息，因此使用部分状态添加它
					const sayTs = Date.now()
					this.lastMessageTs = sayTs
					await this.addToClineMessages({
						ts: sayTs,
						type: "say",
						say: type,
						text,
						images,
						partial,
					})
					await this.postStateToWebview()
				}
			} else {
				// partial=false 表示它是先前部分消息的完整版本
				if (isUpdatingPreviousPartial) {
					// 这是先前部分消息的完整版本，因此用完整版本替换部分版本
					this.lastMessageTs = lastMessage.ts
					// lastMessage.ts = sayTs
					lastMessage.text = text
					lastMessage.images = images
					lastMessage.partial = false

					// 我们不流式传输 partialMessage 事件，而是像往常一样进行保存和发布以持久化到磁盘
					await this.saveClineMessagesAndUpdateHistory()
					// await this.postStateToWebview()
					await this.postMessageToWebview({
						type: "partialMessage",
						partialMessage: lastMessage,
					}) // 比整个 postStateToWebview 更高效
				} else {
					// 这是一个新的 partial=false 消息，因此像往常一样添加它
					const sayTs = Date.now()
					this.lastMessageTs = sayTs
					await this.addToClineMessages({
						ts: sayTs,
						type: "say",
						say: type,
						text,
						images,
					})
					await this.postStateToWebview()
				}
			}
		} else {
			// 这是一个新的非部分消息，因此像往常一样添加它
			const sayTs = Date.now()
			this.lastMessageTs = sayTs
			await this.addToClineMessages({
				ts: sayTs,
				type: "say",
				say: type,
				text,
				images,
			})
			await this.postStateToWebview()
		}
	}

	async sayAndCreateMissingParamError(toolName: ToolUseName, paramName: string, relPath?: string) {
		await this.say(
			"error",
			`Cline 尝试使用 ${toolName}${
				relPath ? ` 为 '${relPath.toPosix()}'` : ""
			} 但缺少必需参数 '${paramName}' 的值。正在重试...`,
		)
		return formatResponse.toolError(formatResponse.missingToolParameterError(paramName))
	}

	async removeLastPartialMessageIfExistsWithType(type: "ask" | "say", askOrSay: ClineAsk | ClineSay) {
		const lastMessage = this.clineMessages.at(-1)
		if (lastMessage?.partial && lastMessage.type === type && (lastMessage.ask === askOrSay || lastMessage.say === askOrSay)) {
			this.clineMessages.pop()
			await this.saveClineMessagesAndUpdateHistory()
			await this.postStateToWebview()
		}
	}

	// 任务生命周期

	private async startTask(task?: string, images?: string[]): Promise<void> {
		try {
			await this.clineIgnoreController.initialize()
		} catch (error) {
			console.error("初始化 ClineIgnoreController 失败:", error)
			// 可选地，通知用户或适当地处理错误
		}
		// conversationHistory (用于 API) 和 clineMessages (用于 webview) 需要同步
		// 如果扩展进程被终止，则在重新启动时 clineMessages 可能不为空，因此在创建新的 Cline 客户端时需要将其设置为空数组 [] (否则 webview 会显示先前会话的过时消息)
		this.clineMessages = []
		this.apiConversationHistory = []

		await this.postStateToWebview()

		await this.say("text", task, images)

		this.isInitialized = true

		let imageBlocks: Anthropic.ImageBlockParam[] = formatResponse.imageBlocks(images)
		await this.initiateTaskLoop([
			{
				type: "text",
				text: `<task>\n${task}\n</task>`,
			},
			...imageBlocks,
		])
	}

	private async resumeTaskFromHistory() {
		try {
			await this.clineIgnoreController.initialize()
		} catch (error) {
			console.error("初始化 ClineIgnoreController 失败:", error)
			// 可选地，通知用户或适当地处理错误
		}
		// 更新：我们不再需要这个了，因为大多数任务现在都是在启用检查点的情况下创建的
		// 现在我们允许用户为旧任务初始化检查点，假设他们是从同一个工作区继续这些任务（我们从未将工作区与任务绑定，因此无法知道是否在正确的工作区中打开）
		// const doesShadowGitExist = await CheckpointTracker.doesShadowGitExist(this.taskId, this.controllerRef.deref())
		// if (!doesShadowGitExist) {
		// 	this.checkpointTrackerErrorMessage = "检查点仅适用于新任务"
		// }

		const modifiedClineMessages = await getSavedClineMessages(this.getContext(), this.taskId)

		// 删除之前可能已添加的任何恢复消息
		const lastRelevantMessageIndex = findLastIndex(
			modifiedClineMessages,
			(m) => !(m.ask === "resume_task" || m.ask === "resume_completed_task"),
		)
		if (lastRelevantMessageIndex !== -1) {
			modifiedClineMessages.splice(lastRelevantMessageIndex + 1)
		}

		// 由于我们不再使用 api_req_finished，我们需要检查最后一个 api_req_started 是否具有成本值，如果没有并且没有取消原因可呈现，则删除它，因为它表示一个没有任何部分内容流式传输的 api 请求
		const lastApiReqStartedIndex = findLastIndex(
			modifiedClineMessages,
			(m) => m.type === "say" && m.say === "api_req_started",
		)
		if (lastApiReqStartedIndex !== -1) {
			const lastApiReqStarted = modifiedClineMessages[lastApiReqStartedIndex]
			const { cost, cancelReason }: ClineApiReqInfo = JSON.parse(lastApiReqStarted.text || "{}")
			if (cost === undefined && cancelReason === undefined) {
				modifiedClineMessages.splice(lastApiReqStartedIndex, 1)
			}
		}

		await this.overwriteClineMessages(modifiedClineMessages)
		this.clineMessages = await getSavedClineMessages(this.getContext(), this.taskId)

		// 现在向用户显示 cline 消息并询问他们是否要恢复（注意：我们之前遇到过一个错误，即打开旧任务时 apiconversationhistory 不会初始化，这是因为我们正在等待恢复）
		// 这很重要，以防用户在未先恢复任务的情况下删除消息
		this.apiConversationHistory = await getSavedApiConversationHistory(this.getContext(), this.taskId)

		// 加载上下文历史记录状态
		await this.contextManager.initializeContextHistory(await ensureTaskDirectoryExists(this.getContext(), this.taskId))

		const lastClineMessage = this.clineMessages
			.slice()
			.reverse()
			.find((m) => !(m.ask === "resume_task" || m.ask === "resume_completed_task")) // 可能是多个恢复任务

		let askType: ClineAsk
		if (lastClineMessage?.ask === "completion_result") {
			askType = "resume_completed_task"
		} else {
			askType = "resume_task"
		}

		this.isInitialized = true

		const { response, text, images } = await this.ask(askType) // 调用 poststatetowebview
		let responseText: string | undefined
		let responseImages: string[] | undefined
		if (response === "messageResponse") {
			await this.say("user_feedback", text, images)
			await this.saveCheckpoint()
			responseText = text
			responseImages = images
		}

		// 需要确保 api 对话历史记录可以被 api 恢复，即使它与 cline 消息不同步

		const existingApiConversationHistory: Anthropic.Messages.MessageParam[] = await getSavedApiConversationHistory(
			this.getContext(),
			this.taskId,
		)

		// 删除最后一条用户消息，以便我们可以用恢复消息更新它
		let modifiedOldUserContent: UserContent // 要么是最后一条消息（如果是用户消息），要么是最后一条（助手）消息之前的用户消息
		let modifiedApiConversationHistory: Anthropic.Messages.MessageParam[] // 需要删除最后一条用户消息以替换为新的修改后的用户消息
		if (existingApiConversationHistory.length > 0) {
			const lastMessage = existingApiConversationHistory[existingApiConversationHistory.length - 1]
			if (lastMessage.role === "assistant") {
				modifiedApiConversationHistory = [...existingApiConversationHistory]
				modifiedOldUserContent = []
			} else if (lastMessage.role === "user") {
				const existingUserContent: UserContent = Array.isArray(lastMessage.content)
					? lastMessage.content
					: [{ type: "text", text: lastMessage.content }]
				modifiedApiConversationHistory = existingApiConversationHistory.slice(0, -1)
				modifiedOldUserContent = [...existingUserContent]
			} else {
				throw new Error("意外：最后一条消息不是用户或助手消息")
			}
		} else {
			throw new Error("意外：没有现有的 API 对话历史记录")
		}

		let newUserContent: UserContent = [...modifiedOldUserContent]

		const agoText = (() => {
			const timestamp = lastClineMessage?.ts ?? Date.now()
			const now = Date.now()
			const diff = now - timestamp
			const minutes = Math.floor(diff / 60000)
			const hours = Math.floor(minutes / 60)
			const days = Math.floor(hours / 24)

			if (days > 0) {
				return `${days} 天前`
			}
			if (hours > 0) {
				return `${hours} 小时前`
			}
			if (minutes > 0) {
				return `${minutes} 分钟前`
			}
			return "刚刚"
		})()

		const wasRecent = lastClineMessage?.ts && Date.now() - lastClineMessage.ts < 30_000

		const [taskResumptionMessage, userResponseMessage] = formatResponse.taskResumption(
			this.chatSettings?.mode === "plan" ? "plan" : "act",
			agoText,
			cwd,
			wasRecent,
			responseText,
		)

		if (taskResumptionMessage !== "") {
			newUserContent.push({
				type: "text",
				text: taskResumptionMessage,
			})
		}

		if (userResponseMessage !== "") {
			newUserContent.push({
				type: "text",
				text: userResponseMessage,
			})
		}

		if (responseImages && responseImages.length > 0) {
			newUserContent.push(...formatResponse.imageBlocks(responseImages))
		}

		await this.overwriteApiConversationHistory(modifiedApiConversationHistory)
		await this.initiateTaskLoop(newUserContent)
	}

	private async initiateTaskLoop(userContent: UserContent): Promise<void> {
		let nextUserContent = userContent
		let includeFileDetails = true
		while (!this.abort) {
			const didEndLoop = await this.recursivelyMakeClineRequests(nextUserContent, includeFileDetails)
			includeFileDetails = false // 我们只在第一次需要文件详细信息

			//  这个代理循环的工作方式是，cline 将被赋予一个任务，然后他调用工具来完成该任务。除非有 attempt_completion 调用，否则我们会一直用他的工具的响应来回应他，直到他 attempt_completion 或不再使用任何工具。如果他不再使用任何工具，我们会要求他考虑是否已完成任务，然后调用 attempt_completion，否则继续完成任务。
			// 有一个 MAX_REQUESTS_PER_TASK 限制以防止无限请求，但会提示 Cline 尽可能高效地完成任务。

			//const totalCost = this.calculateApiCost(totalInputTokens, totalOutputTokens)
			if (didEndLoop) {
				// 目前任务永远不会“完成”。这只会在用户达到最大请求数并拒绝重置计数时发生。
				//this.say("task_completed", `任务已完成。API 使用总成本：${totalCost}`)
				break
			} else {
				// this.say(
				// 	"tool",
				// 	"Cline 仅使用文本块进行了响应，但尚未调用 attempt_completion。正在强制他继续执行任务..."
				// )
				nextUserContent = [
					{
						type: "text",
						text: formatResponse.noToolsUsed(),
					},
				]
				this.consecutiveMistakeCount++
			}
		}
	}

	async abortTask() {
		this.abort = true // 将停止任何自主运行的 promise
		this.terminalManager.disposeAll()
		this.urlContentFetcher.closeBrowser()
		await this.browserSession.dispose()
		this.clineIgnoreController.dispose()
		this.fileContextTracker.dispose()
		await this.diffViewProvider.revertChanges() // 需要等待，以确保在从检查点重新启动任务之前恢复目录/文件
	}

	// Checkpoints

	async saveCheckpoint(isAttemptCompletionMessage: boolean = false) {
		if (!this.enableCheckpoints) {
			// 如果禁用了检查点，则不执行任何操作。
			return
		}
		// 将所有 checkpoint_created 消息的 isCheckpointCheckedOut 设置为 false
		this.clineMessages.forEach((message) => {
			if (message.say === "checkpoint_created") {
				message.isCheckpointCheckedOut = false
			}
		})

		if (!isAttemptCompletionMessage) {
			// 确保我们没有创建重复的检查点
			const lastMessage = this.clineMessages.at(-1)
			if (lastMessage?.say === "checkpoint_created") {
				return
			}

			// 对于非尝试完成的情况，我们只记录检查点
			await this.say("checkpoint_created")
			this.checkpointTracker?.commit().then(async (commitHash) => {
				const lastCheckpointMessage = findLast(this.clineMessages, (m) => m.say === "checkpoint_created")
				if (lastCheckpointMessage) {
					lastCheckpointMessage.lastCheckpointHash = commitHash
					await this.saveClineMessagesAndUpdateHistory()
				}
			}) // 目前静默失败

			//
		} else {
			// 尝试完成需要检查点同步，以便在 attempt_completion 后显示按钮
			const commitHash = await this.checkpointTracker?.commit()
			// 对于 attempt_completion，找到最后一条 completion_result 消息并设置其检查点哈希。这将用于显示“查看新更改”按钮
			const lastCompletionResultMessage = findLast(
				this.clineMessages,
				(m) => m.say === "completion_result" || m.ask === "completion_result",
			)
			if (lastCompletionResultMessage) {
				lastCompletionResultMessage.lastCheckpointHash = commitHash
				await this.saveClineMessagesAndUpdateHistory()
			}
		}

		// if (commitHash) {

		// 以前我们为每条消息都创建检查点，但这过于频繁且没有必要。
		// // 从末尾开始向前查找，直到找到工具使用或另一条带有哈希的消息
		// for (let i = this.clineMessages.length - 1; i >= 0; i--) {
		// 	const message = this.clineMessages[i]
		// 	if (message.lastCheckpointHash) {
		// 		// 找到带有哈希的消息，可以停止
		// 		break
		// 	}
		// 	// 用哈希更新此消息
		// 	message.lastCheckpointHash = commitHash

		// 	// 我们只关心将哈希添加到最后一次工具使用中（我们不想将此哈希添加到之前的每条消息中，例如对于检查点之前的任务）
		// 	const isToolUse =
		// 		message.say === "tool" ||
		// 		message.ask === "tool" ||
		// 		message.say === "command" ||
		// 		message.ask === "command" ||
		// 		message.say === "completion_result" ||
		// 		message.ask === "completion_result" ||
		// 		message.ask === "followup" ||
		// 		message.say === "use_mcp_server" ||
		// 		message.ask === "use_mcp_server" ||
		// 		message.say === "browser_action" ||
		// 		message.say === "browser_action_launch" ||
		// 		message.ask === "browser_action_launch"

		// 	if (isToolUse) {
		// 		break
		// 	}
		// }
		// // 保存更新后的消息
		// await this.saveClineMessagesAndUpdateHistory()
		// }
	}

	// 工具

	/**
	 * 直接在 Node.js 中使用 execa 执行命令
	 * 这用于测试模式，以捕获完整输出，而无需使用 VS Code 终端
	 * 命令在使用 Promise.race 30 秒后自动终止
	 */
	private async executeCommandInNode(command: string): Promise<[boolean, ToolResponse]> {
		try {
			// 创建子进程
			const childProcess = execa(command, {
				shell: true,
				cwd,
				reject: false,
				all: true, // 合并 stdout 和 stderr
			})

			// 设置变量以收集输出
			let output = ""

			// 实时收集输出
			if (childProcess.all) {
				childProcess.all.on("data", (data) => {
					output += data.toString()
				})
			}

			// 创建一个在 30 秒后拒绝的超时 Promise
			const timeoutPromise = new Promise<never>((_, reject) => {
				setTimeout(() => {
					if (childProcess.pid) {
						childProcess.kill("SIGKILL") // 使用 SIGKILL 进行更强制的终止
					}
					reject(new Error("Command timeout after 30s"))
				}, 30000)
			})

			// 命令完成与超时之间的竞争
			const result = await Promise.race([childProcess, timeoutPromise]).catch((error) => {
				// 如果由于超时到达此处，则返回带有超时标志的部分结果
				Logger.info(`Command timed out after 30s: ${command}`)
				return {
					stdout: "",
					stderr: "",
					exitCode: 124, // 标准超时退出代码
					timedOut: true,
				}
			})

			// 检查是否发生超时
			const wasTerminated = result.timedOut === true

			// 使用收集到的输出或结果输出
			if (!output) {
				output = result.stdout || result.stderr || ""
			}

			Logger.info(`Command executed in Node: ${command}\nOutput:\n${output}`)

			// 如果命令已终止，则添加终止消息
			if (wasTerminated) {
				output += "\nCommand was taking a while to run so it was auto terminated after 30s"
			}

			// 格式化结果以类似于终端输出
			return [
				false,
				`Command executed${wasTerminated ? " (terminated after 30s)" : ""} with exit code ${
					result.exitCode
				}.${output.length > 0 ? `\nOutput:\n${output}` : ""}`,
			]
		} catch (error) {
			// 处理可能发生的任何错误
			const errorMessage = error instanceof Error ? error.message : String(error)
			return [false, `Error executing command: ${errorMessage}`]
		}
	}

	async executeCommandTool(command: string): Promise<[boolean, ToolResponse]> {
		Logger.info("IS_TEST: " + isInTestMode())

		// 检查是否处于测试模式
		if (isInTestMode()) {
			// 在测试模式下，直接在 Node 中执行命令
			Logger.info("Executing command in Node: " + command)
			return this.executeCommandInNode(command)
		}
		Logger.info("Executing command in VS code terminal: " + command)

		const terminalInfo = await this.terminalManager.getOrCreateTerminal(cwd)
		terminalInfo.terminal.show() // 创建新终端时（即使是手动创建）出现的奇怪视觉错误，顶部会有一个空格。
		const process = this.terminalManager.runCommand(terminalInfo, command)

		let userFeedback: { text?: string; images?: string[] } | undefined
		let didContinue = false

		// 分块终端输出缓冲
		const CHUNK_LINE_COUNT = 20
		const CHUNK_BYTE_SIZE = 2048 // 2KB
		const CHUNK_DEBOUNCE_MS = 100

		let outputBuffer: string[] = []
		let outputBufferSize: number = 0
		let chunkTimer: NodeJS.Timeout | null = null
		let chunkEnroute = false

		const flushBuffer = async (force = false) => {
			if (chunkEnroute || outputBuffer.length === 0) {
				if (force && !chunkEnroute && outputBuffer.length > 0) {
					// 如果 force 为 true且没有正在传输的块，则无论如何都刷新
				} else {
					return
				}
			}
			const chunk = outputBuffer.join("\n")
			outputBuffer = []
			outputBufferSize = 0
			chunkEnroute = true
			try {
				const { response, text, images } = await this.ask("command_output", chunk)
				if (response === "yesButtonClicked") {
					// 运行时继续
				} else {
					userFeedback = { text, images }
				}
				didContinue = true
				process.continue()
			} catch {
				Logger.error("Error while asking for command output")
			} finally {
				chunkEnroute = false
				// 如果在块传输期间累积了更多输出，则再次刷新
				if (outputBuffer.length > 0) {
					await flushBuffer()
				}
			}
		}

		const scheduleFlush = () => {
			if (chunkTimer) {
				clearTimeout(chunkTimer)
			}
			chunkTimer = setTimeout(async () => await flushBuffer(), CHUNK_DEBOUNCE_MS)
		}

		let result = ""
		process.on("line", async (line) => {
			result += line + "\n"

			if (!didContinue) {
				outputBuffer.push(line)
				outputBufferSize += Buffer.byteLength(line, "utf8")
				// 如果缓冲区足够大则刷新
				if (outputBuffer.length >= CHUNK_LINE_COUNT || outputBufferSize >= CHUNK_BYTE_SIZE) {
					await flushBuffer()
				} else {
					scheduleFlush()
				}
			} else {
				this.say("command_output", line)
			}
		})

		let completed = false
		process.once("completed", async () => {
			completed = true
			// 刷新所有剩余的缓冲输出
			if (!didContinue && outputBuffer.length > 0) {
				if (chunkTimer) {
					clearTimeout(chunkTimer)
					chunkTimer = null
				}
				await flushBuffer(true)
			}
		})

		process.once("no_shell_integration", async () => {
			await this.say("shell_integration_warning")
		})

		await process

		// 等待一小段时间以确保所有消息都发送到 webview
		// 此延迟允许创建非等待的 promise
		// 并将其关联的消息发送到 webview，从而保持
		// 消息的正确顺序（尽管 webview 很智能
		// 无论如何都会对 command_output 消息进行分组，即使存在间隙）
		await setTimeoutPromise(50)

		result = result.trim()

		if (userFeedback) {
			await this.say("user_feedback", userFeedback.text, userFeedback.images)
			await this.saveCheckpoint()
			return [
				true,
				formatResponse.toolResult(
					`Command is still running in the user's terminal.${
						result.length > 0 ? `\nHere's the output so far:\n${result}` : ""
					}\n\nThe user provided the following feedback:\n<feedback>\n${userFeedback.text}\n</feedback>`,
					userFeedback.images,
				),
			]
		}

		if (completed) {
			return [false, `Command executed.${result.length > 0 ? `\nOutput:\n${result}` : ""}`]
		} else {
			return [
				false,
				`Command is still running in the user's terminal.${
					result.length > 0 ? `\nHere's the output so far:\n${result}` : ""
				}\n\nYou will be updated on the terminal status and new output in the future.`,
			]
		}
	}

	// 根据设置检查工具是否应自动批准
	// 对于大多数工具返回布尔值，对于具有嵌套设置的工具返回元组
	shouldAutoApproveTool(toolName: ToolUseName): boolean | [boolean, boolean] {
		if (this.autoApprovalSettings.enabled) {
			switch (toolName) {
				case "read_file":
				case "list_files":
				case "list_code_definition_names":
				case "search_files":
					return [
						this.autoApprovalSettings.actions.readFiles,
						this.autoApprovalSettings.actions.readFilesExternally ?? false,
					]
				case "new_rule":
				case "write_to_file":
				case "replace_in_file":
					return [
						this.autoApprovalSettings.actions.editFiles,
						this.autoApprovalSettings.actions.editFilesExternally ?? false,
					]
				case "execute_command":
					return [
						this.autoApprovalSettings.actions.executeSafeCommands ?? false,
						this.autoApprovalSettings.actions.executeAllCommands ?? false,
					]
				case "browser_action":
					return this.autoApprovalSettings.actions.useBrowser
				case "access_mcp_resource":
				case "use_mcp_tool":
					return this.autoApprovalSettings.actions.useMcp
			}
		}
		return false
	}

	// 根据设置检查工具是否应自动批准
	// 以及操作的路径。如果工具应根据用户设置和操作路径自动批准，则返回 true
	shouldAutoApproveToolWithPath(blockname: ToolUseName, autoApproveActionpath: string | undefined): boolean {
		let isLocalRead: boolean = false
		if (autoApproveActionpath) {
			const absolutePath = path.resolve(cwd, autoApproveActionpath)
			isLocalRead = absolutePath.startsWith(cwd)
		} else {
			// 如果由于某种原因我们没有获取到路径，则默认为（更安全的）false 返回
			isLocalRead = false
		}

		// 获取本地和外部编辑的自动批准设置
		const autoApproveResult = this.shouldAutoApproveTool(blockname)
		const [autoApproveLocal, autoApproveExternal] = Array.isArray(autoApproveResult)
			? autoApproveResult
			: [autoApproveResult, false]

		if ((isLocalRead && autoApproveLocal) || (!isLocalRead && autoApproveLocal && autoApproveExternal)) {
			return true
		} else {
			return false
		}
	}

	private formatErrorWithStatusCode(error: any): string {
		const statusCode = error.status || error.statusCode || (error.response && error.response.status)
		const message = error.message ?? JSON.stringify(serializeError(error), null, 2)

		// 仅当状态码尚未成为消息的一部分时才在其前面添加
		return statusCode && !message.includes(statusCode.toString()) ? `${statusCode} - ${message}` : message
	}

	/**
	 * 将 disableBrowserTool 设置从 VSCode 配置迁移到 browserSettings
	 */
	private async migrateDisableBrowserToolSetting(): Promise<void> {
		const config = vscode.workspace.getConfiguration("cline")
		const disableBrowserTool = config.get<boolean>("disableBrowserTool")

		if (disableBrowserTool !== undefined) {
			this.browserSettings.disableToolUse = disableBrowserTool
			// 从 VSCode 配置中移除
			await config.update("disableBrowserTool", undefined, true)
		}
	}

	private async migratePreferredLanguageToolSetting(): Promise<void> {
		const config = vscode.workspace.getConfiguration("cline")
		const preferredLanguage = config.get<LanguageDisplay>("preferredLanguage")
		if (preferredLanguage !== undefined) {
			this.chatSettings.preferredLanguage = preferredLanguage
			// 从 VSCode 配置中移除
			await config.update("preferredLanguage", undefined, true)
		}
	}

	async *attemptApiRequest(previousApiReqIndex: number): ApiStream {
		// 等待 MCP 服务器连接后再生成系统提示
		await pWaitFor(() => this.mcpHub.isConnecting !== true, { timeout: 10_000 }).catch(() => {
			console.error("MCP servers failed to connect in time")
		})

		await this.migrateDisableBrowserToolSetting()
		const disableBrowserTool = this.browserSettings.disableToolUse ?? false
		// cline 浏览器工具使用图像识别进行导航（需要模型图像支持）。
		const modelSupportsBrowserUse = this.api.getModel().info.supportsImages ?? false

		const supportsBrowserUse = modelSupportsBrowserUse && !disableBrowserTool // 仅当模型支持且用户未禁用浏览器使用时才启用

		let systemPrompt = await SYSTEM_PROMPT(cwd, supportsBrowserUse, this.mcpHub, this.browserSettings)

		let settingsCustomInstructions = this.customInstructions?.trim()
		await this.migratePreferredLanguageToolSetting()
		const preferredLanguage = getLanguageKey(this.chatSettings.preferredLanguage as LanguageDisplay)
		const preferredLanguageInstructions =
			preferredLanguage && preferredLanguage !== DEFAULT_LANGUAGE_SETTINGS
				? `# 首选语言\n\nSpeak in ${preferredLanguage}.`
				: ""

		const { globalToggles, localToggles } = await refreshClineRulesToggles(this.getContext(), cwd)
		const { windsurfLocalToggles, cursorLocalToggles } = await refreshExternalRulesToggles(this.getContext(), cwd)

		const globalClineRulesFilePath = await ensureRulesDirectoryExists()
		const globalClineRulesFileInstructions = await getGlobalClineRules(globalClineRulesFilePath, globalToggles)

		const localClineRulesFileInstructions = await getLocalClineRules(cwd, localToggles)
		const [localCursorRulesFileInstructions, localCursorRulesDirInstructions] = await getLocalCursorRules(
			cwd,
			cursorLocalToggles,
		)
		const localWindsurfRulesFileInstructions = await getLocalWindsurfRules(cwd, windsurfLocalToggles)

		const clineIgnoreContent = this.clineIgnoreController.clineIgnoreContent
		let clineIgnoreInstructions: string | undefined
		if (clineIgnoreContent) {
			clineIgnoreInstructions = formatResponse.clineIgnoreInstructions(clineIgnoreContent)
		}

		if (
			settingsCustomInstructions ||
			globalClineRulesFileInstructions ||
			localClineRulesFileInstructions ||
			localCursorRulesFileInstructions ||
			localCursorRulesDirInstructions ||
			localWindsurfRulesFileInstructions ||
			clineIgnoreInstructions ||
			preferredLanguageInstructions
		) {
			// 在任务中途更改系统提示会破坏提示缓存，但从长远来看，这种情况不会经常发生，因此最好不要像处理 <potentially relevant details> 那样用它来污染用户消息
			const userInstructions = addUserInstructions(
				settingsCustomInstructions,
				globalClineRulesFileInstructions,
				localClineRulesFileInstructions,
				localCursorRulesFileInstructions,
				localCursorRulesDirInstructions,
				localWindsurfRulesFileInstructions,
				clineIgnoreInstructions,
				preferredLanguageInstructions,
			)
			systemPrompt += userInstructions
		}
		const contextManagementMetadata = await this.contextManager.getNewContextMessagesAndMetadata(
			this.apiConversationHistory,
			this.clineMessages,
			this.api,
			this.conversationHistoryDeletedRange,
			previousApiReqIndex,
			await ensureTaskDirectoryExists(this.getContext(), this.taskId),
		)

		if (contextManagementMetadata.updatedConversationHistoryDeletedRange) {
			this.conversationHistoryDeletedRange = contextManagementMetadata.conversationHistoryDeletedRange
			await this.saveClineMessagesAndUpdateHistory() // 保存任务历史记录项，我们用它来跟踪对话历史记录的已删除范围
		}

		let stream = this.api.createMessage(systemPrompt, contextManagementMetadata.truncatedConversationHistory)

		const iterator = stream[Symbol.asyncIterator]()

		try {
			// 等待第一个数据块以查看是否会引发错误
			this.isWaitingForFirstChunk = true
			const firstChunk = await iterator.next()
			yield firstChunk.value
			this.isWaitingForFirstChunk = false
		} catch (error) {
			const isOpenRouter = this.api instanceof OpenRouterHandler || this.api instanceof ClineHandler
			const isAnthropic = this.api instanceof AnthropicHandler
			const isOpenRouterContextWindowError = checkIsOpenRouterContextWindowError(error) && isOpenRouter
			const isAnthropicContextWindowError = checkIsAnthropicContextWindowError(error) && isAnthropic

			if (isAnthropic && isAnthropicContextWindowError && !this.didAutomaticallyRetryFailedApiRequest) {
				this.conversationHistoryDeletedRange = this.contextManager.getNextTruncationRange(
					this.apiConversationHistory,
					this.conversationHistoryDeletedRange,
					"quarter", // 强制积极截断
				)
				await this.saveClineMessagesAndUpdateHistory()
				await this.contextManager.triggerApplyStandardContextTruncationNoticeChange(
					Date.now(),
					await ensureTaskDirectoryExists(this.getContext(), this.taskId),
				)

				this.didAutomaticallyRetryFailedApiRequest = true
			} else if (isOpenRouter && !this.didAutomaticallyRetryFailedApiRequest) {
				if (isOpenRouterContextWindowError) {
					this.conversationHistoryDeletedRange = this.contextManager.getNextTruncationRange(
						this.apiConversationHistory,
						this.conversationHistoryDeletedRange,
						"quarter", // 强制积极截断
					)
					await this.saveClineMessagesAndUpdateHistory()
					await this.contextManager.triggerApplyStandardContextTruncationNoticeChange(
						Date.now(),
						await ensureTaskDirectoryExists(this.getContext(), this.taskId),
					)
				}

				console.log("first chunk failed, waiting 1 second before retrying")
				await setTimeoutPromise(1000)
				this.didAutomaticallyRetryFailedApiRequest = true
			} else {
				// 自动重试一次后请求失败，询问用户是否要再次重试
				// 请注意，此 api_req_failed 请求的独特之处在于，仅当 API 尚未流式传输任何内容时（即由于第一个数据块而失败），我们才会提供此选项，因为这将允许他们点击重试按钮。但是，如果 API 在流式传输中途失败，它可能处于任何任意状态，某些工具可能已经执行，因此该错误的处理方式不同，需要完全取消任务。

				if (isOpenRouterContextWindowError || isAnthropicContextWindowError) {
					const truncatedConversationHistory = this.contextManager.getTruncatedMessages(
						this.apiConversationHistory,
						this.conversationHistoryDeletedRange,
					)

					// 如果对话包含超过 3 条消息，我们可以再次截断。否则，对话将无法继续。
					// 待办：如果出现这种情况，允许用户更改其输入。
					if (truncatedConversationHistory.length > 3) {
						error = new Error("Context window exceeded. Click retry to truncate the conversation and try again.")
						this.didAutomaticallyRetryFailedApiRequest = false
					}
				}

				const errorMessage = this.formatErrorWithStatusCode(error)

				// 更新 'api_req_started' 消息以反映最终失败，然后再要求用户手动重试
				const lastApiReqStartedIndex = findLastIndex(this.clineMessages, (m) => m.say === "api_req_started")
				if (lastApiReqStartedIndex !== -1) {
					const currentApiReqInfo: ClineApiReqInfo = JSON.parse(this.clineMessages[lastApiReqStartedIndex].text || "{}")
					delete currentApiReqInfo.retryStatus

					this.clineMessages[lastApiReqStartedIndex].text = JSON.stringify({
						...currentApiReqInfo, // 展开修改后的信息（已移除 retryStatus）
						cancelReason: "retries_exhausted", // 表明自动重试已用尽
						streamingFailedMessage: errorMessage,
					} satisfies ClineApiReqInfo)
					// this.ask 将触发 postStateToWebview，因此应获取此更改。
				}

				const { response } = await this.ask("api_req_failed", errorMessage)

				if (response !== "yesButtonClicked") {
					// 这永远不会发生，因为如果点击了 noButtonClicked，我们将清除当前任务，从而中止此实例
					throw new Error("API request failed")
				}

				await this.say("api_req_retried")
			}
			// 委托来自递归调用的生成器输出
			yield* this.attemptApiRequest(previousApiReqIndex)
			return
		}

		// 没有错误，因此我们可以继续产生所有剩余的数据块
		// （需要放在 try/catch 之外，因为我们希望调用者处理的错误不是 api_req_failed，该错误仅保留给第一个数据块失败的情况）
		// 这会将控制权委托给另一个生成器或可迭代对象。在这种情况下，它表示“从此迭代器产生所有剩余的值”。这有效地传递了原始流中的所有后续数据块。
		yield* iterator
	}

	async presentAssistantMessage() {
		if (this.abort) {
			throw new Error("Cline instance aborted")
		}

		if (this.presentAssistantMessageLocked) {
			this.presentAssistantMessageHasPendingUpdates = true
			return
		}
		this.presentAssistantMessageLocked = true
		this.presentAssistantMessageHasPendingUpdates = false

		if (this.currentStreamingContentIndex >= this.assistantMessageContent.length) {
			// 如果最后一个内容块在流式传输完成之前已完成，则可能会发生这种情况。如果流式传输已完成，并且我们超出范围，则意味着我们已经呈现/执行了最后一个内容块，并准备好继续下一个请求
			if (this.didCompleteReadingStream) {
				this.userMessageContentReady = true
			}
			// console.log("no more content blocks to stream! this shouldn't happen?")
			this.presentAssistantMessageLocked = false
			return
			//throw new Error("No more content blocks to stream! This shouldn't happen...") // 删除并在测试后直接返回
		}

		const block = cloneDeep(this.assistantMessageContent[this.currentStreamingContentIndex]) // 需要创建副本，因为当流更新数组时，它也可能更新引用块的属性
		switch (block.type) {
			case "text": {
				if (this.didRejectTool || this.didAlreadyUseTool) {
					break
				}
				let content = block.content
				if (content) {
					// （对于部分和完整的内容都必须这样做，因为发送到 Markdown 渲染器的 thinking 标签中的内容会自动删除）
					// 删除 <thinking 或 </thinking 的末尾子字符串（下面的 XML 解析仅适用于开始标签）
					// （现在通过下面的 XML 解析完成此操作，但在此处保留以供参考）
					// content = content.replace(/<\/?t(?:h(?:i(?:n(?:k(?:i(?:n(?:g)?)?)?)?)?)?)?$/, "")
					// 删除所有 <thinking>（其后可选换行符）和 </thinking>（其前可选换行符）的实例
					// - 需要分开处理，因为我们不想删除第一个标签之前的换行符
					// - 需要在下面的 XML 解析之前发生
					content = content.replace(/<thinking>\s?/g, "")
					content = content.replace(/\s?<\/thinking>/g, "")

					// 删除内容末尾的部分 XML 标签（用于工具使用和 thinking 标签）
					// （防止在自动删除标签时滚动视图跳动）
					const lastOpenBracketIndex = content.lastIndexOf("<")
					if (lastOpenBracketIndex !== -1) {
						const possibleTag = content.slice(lastOpenBracketIndex)
						// 检查最后一个 '<' 之后是否有 '>'（即标签是否完整）（完整的 thinking 和 tool 标签此时应该已经被删除）
						const hasCloseBracket = possibleTag.includes(">")
						if (!hasCloseBracket) {
							// 提取潜在的标签名称
							let tagContent: string
							if (possibleTag.startsWith("</")) {
								tagContent = possibleTag.slice(2).trim()
							} else {
								tagContent = possibleTag.slice(1).trim()
							}
							// 检查 tagContent 是否可能是未完成的标签名称（仅包含字母和下划线）
							const isLikelyTagName = /^[a-zA-Z_]+$/.test(tagContent)
							// 预先删除 < 或 </ 以防止这些片段出现在聊天中（也处理闭合的 thinking 标签）
							const isOpeningOrClosing = possibleTag === "<" || possibleTag === "</"
							// 如果标签未完成且位于末尾，则从内容中删除它
							if (isOpeningOrClosing || isLikelyTagName) {
								content = content.slice(0, lastOpenBracketIndex).trim()
							}
						}
					}
				}

				if (!block.partial) {
					// 某些模型会在文本内容末尾添加代码块片段（围绕工具调用）
					// 匹配字符串末尾以 ``` 开头且最后一个反引号后至少有一个字符的模式
					const match = content?.trimEnd().match(/```[a-zA-Z0-9_-]+$/)
					if (match) {
						const matchLength = match[0].length
						content = content.trimEnd().slice(0, -matchLength)
					}
				}

				await this.say("text", content, undefined, block.partial)
				break
			}
			case "tool_use":
				const toolDescription = () => {
					switch (block.name) {
						case "execute_command":
							return `[${block.name} for '${block.params.command}']`
						case "read_file":
							return `[${block.name} for '${block.params.path}']`
						case "write_to_file":
							return `[${block.name} for '${block.params.path}']`
						case "replace_in_file":
							return `[${block.name} for '${block.params.path}']`
						case "search_files":
							return `[${block.name} for '${block.params.regex}'${
								block.params.file_pattern ? ` in '${block.params.file_pattern}'` : ""
							}]`
						case "list_files":
							return `[${block.name} for '${block.params.path}']`
						case "list_code_definition_names":
							return `[${block.name} for '${block.params.path}']`
						case "browser_action":
							return `[${block.name} for '${block.params.action}']`
						case "use_mcp_tool":
							return `[${block.name} for '${block.params.server_name}']`
						case "access_mcp_resource":
							return `[${block.name} for '${block.params.server_name}']`
						case "ask_followup_question":
							return `[${block.name} for '${block.params.question}']`
						case "plan_mode_respond":
							return `[${block.name}]`
						case "load_mcp_documentation":
							return `[${block.name}]`
						case "attempt_completion":
							return `[${block.name}]`
						case "new_task":
							return `[${block.name} for creating a new task]`
						case "condense":
							return `[${block.name}]`
						case "report_bug":
							return `[${block.name}]`
						case "new_rule":
							return `[${block.name} for '${block.params.path}']`
					}
				}

				if (this.didRejectTool) {
					// 用户拒绝一次工具后，忽略任何工具内容
					if (!block.partial) {
						this.userMessageContent.push({
							type: "text",
							text: `Skipping tool ${toolDescription()} due to user rejecting a previous tool.`,
						})
					} else {
						// 用户拒绝先前工具后的部分工具
						this.userMessageContent.push({
							type: "text",
							text: `Tool ${toolDescription()} was interrupted and not executed due to user rejecting a previous tool.`,
						})
					}
					break
				}

				if (this.didAlreadyUseTool) {
					// 工具已使用后忽略任何内容
					this.userMessageContent.push({
						type: "text",
						text: formatResponse.toolAlreadyUsed(block.name),
					})
					break
				}

				const pushToolResult = (content: ToolResponse) => {
					this.userMessageContent.push({
						type: "text",
						text: `${toolDescription()} Result:`,
					})
					if (typeof content === "string") {
						this.userMessageContent.push({
							type: "text",
							text: content || "(tool did not return anything)",
						})
					} else {
						this.userMessageContent.push(...content)
					}
					// 一旦收集到工具结果，忽略所有其他工具使用，因为每个消息只应呈现一个工具结果
					this.didAlreadyUseTool = true
				}

				// 用户可以批准、拒绝或提供反馈（拒绝）。但是，用户也可能在批准的同时发送消息，在这种情况下，我们会添加一条单独的用户消息以及此反馈。
				const pushAdditionalToolFeedback = (feedback?: string, images?: string[]) => {
					if (!feedback && !images) {
						return
					}
					const content = formatResponse.toolResult(
						`The user provided the following feedback:\n<feedback>\n${feedback}\n</feedback>`,
						images,
					)
					if (typeof content === "string") {
						this.userMessageContent.push({
							type: "text",
							text: content,
						})
					} else {
						this.userMessageContent.push(...content)
					}
				}

				const askApproval = async (type: ClineAsk, partialMessage?: string) => {
					const { response, text, images } = await this.ask(type, partialMessage, false)
					if (response !== "yesButtonClicked") {
						// 用户按下了拒绝按钮或通过消息回应，我们将其视为拒绝
						pushToolResult(formatResponse.toolDenied())
						if (text || images?.length) {
							pushAdditionalToolFeedback(text, images)
							await this.say("user_feedback", text, images)
							await this.saveCheckpoint()
						}
						this.didRejectTool = true // 阻止在此消息中进一步使用工具
						return false
					} else {
						// 用户点击了批准按钮，并且可能提供了反馈
						if (text || images?.length) {
							pushAdditionalToolFeedback(text, images)
							await this.say("user_feedback", text, images)
							await this.saveCheckpoint()
						}
						return true
					}
				}

				const showNotificationForApprovalIfAutoApprovalEnabled = (message: string) => {
					if (this.autoApprovalSettings.enabled && this.autoApprovalSettings.enableNotifications) {
						showSystemNotification({
							subtitle: "需要批准",
							message,
						})
					}
				}

				const handleError = async (action: string, error: Error) => {
					if (this.abandoned) {
						console.log("任务已放弃，忽略错误（例如，重置后取消任务）")
						return
					}
					const errorString = `操作 ${action} 出错：${JSON.stringify(serializeError(error))}`
					await this.say(
						"error",
						`操作 ${action} 出错：\n${error.message ?? JSON.stringify(serializeError(error), null, 2)}`,
					)
					// this.toolResults.push({
					// 	type: "tool_result",
					// 	tool_use_id: toolUseId,
					// 	content: await this.formatToolError(errorString),
					// })
					pushToolResult(formatResponse.toolError(errorString))
				}

				// 如果块是部分的，则删除部分结束标签，使其不呈现给用户
				const removeClosingTag = (tag: ToolParamName, text?: string) => {
					if (!block.partial) {
						return text || ""
					}
					if (!text) {
						return ""
					}
					// 此正则表达式动态构建一个模式以匹配结束标签：
					// - 可选地匹配标签前的空白字符
					// - 匹配 '<' 或 '</'，其后可选地跟有标签名称中的任何字符子集
					const tagRegex = new RegExp(
						`\\s?<\/?${tag
							.split("")
							.map((char) => `(?:${char})?`)
							.join("")}$`,
						"g",
					)
					return text.replace(tagRegex, "")
				}

				if (block.name !== "browser_action") {
					await this.browserSession.closeBrowser()
				}

				switch (block.name) {
					case "new_rule":
					case "write_to_file":
					case "replace_in_file": {
						const relPath: string | undefined = block.params.path
						let content: string | undefined = block.params.content // for write_to_file
						let diff: string | undefined = block.params.diff // for replace_in_file
						if (!relPath || (!content && !diff)) {
							// 检查 content/diff 以确保 relPath 完整
							// 等待，以便我们可以确定是新文件还是编辑现有文件
							break
						}

						const accessAllowed = this.clineIgnoreController.validateAccess(relPath)
						if (!accessAllowed) {
							await this.say("clineignore_error", relPath)
							pushToolResult(formatResponse.toolError(formatResponse.clineIgnoreError(relPath)))
							await this.saveCheckpoint()
							break
						}

						// 使用缓存的映射或 fs.access 检查文件是否存在
						let fileExists: boolean
						if (this.diffViewProvider.editType !== undefined) {
							fileExists = this.diffViewProvider.editType === "modify"
						} else {
							const absolutePath = path.resolve(cwd, relPath)
							fileExists = await fileExistsAtPath(absolutePath)
							this.diffViewProvider.editType = fileExists ? "modify" : "create"
						}

						try {
							// 从 diff 构建 newContent
							let newContent: string
							if (diff) {
								if (!this.api.getModel().id.includes("claude")) {
									// deepseek 模型倾向于在 diff 中使用未转义的 html 实体
									diff = fixModelHtmlEscaping(diff)
									diff = removeInvalidChars(diff)
								}

								// 如果编辑器尚未打开，则打开它。这是为了修复当模型提供正确的搜索替换文本但 Cline 因文件未打开而引发错误时的 diff 错误。
								if (!this.diffViewProvider.isEditing) {
									await this.diffViewProvider.open(relPath)
								}

								try {
									newContent = await constructNewFileContent(
										diff,
										this.diffViewProvider.originalContent || "",
										!block.partial,
									)
								} catch (error) {
									await this.say("diff_error", relPath)

									// 如果可能，从错误消息中提取错误类型，或使用通用类型
									const errorType =
										error instanceof Error && error.message.includes("does not match anything")
											? "search_not_found"
											: "other_diff_error"

									// 为 diff 编辑失败添加遥测
									telemetryService.captureDiffEditFailure(this.taskId, this.api.getModel().id, errorType)

									pushToolResult(
										formatResponse.toolError(
											`${(error as Error)?.message}\n\n` +
												formatResponse.diffError(relPath, this.diffViewProvider.originalContent),
										),
									)
									await this.diffViewProvider.revertChanges()
									await this.diffViewProvider.reset()
									await this.saveCheckpoint()
									break
								}
							} else if (content) {
								newContent = content

								// 对 newContent 进行预处理，以处理较弱模型可能添加诸如 markdown 代码块标记 (deepseek/llama) 或额外转义字符 (gemini) 等伪影的情况
								if (newContent.startsWith("```")) {
									// 这处理了它包含语言说明符（如 ```python ```js）的情况
									newContent = newContent.split("\n").slice(1).join("\n").trim()
								}
								if (newContent.endsWith("```")) {
									newContent = newContent.split("\n").slice(0, -1).join("\n").trim()
								}

								if (!this.api.getModel().id.includes("claude")) {
									// 似乎不仅 llama 模型会这样做，gemini 和其他模型也可能这样做
									newContent = fixModelHtmlEscaping(newContent)
									newContent = removeInvalidChars(newContent)
								}
							} else {
								// 不可能发生，因为我们上面已经检查了 content/diff。但需要这样做以避免类型错误
								break
							}

							newContent = newContent.trimEnd() // 删除任何尾随换行符，因为编辑器会自动插入

							const sharedMessageProps: ClineSayTool = {
								tool: fileExists ? "editedExistingFile" : "newFileCreated",
								path: getReadablePath(cwd, removeClosingTag("path", relPath)),
								content: diff || content,
								operationIsLocatedInWorkspace: isLocatedInWorkspace(relPath),
							}

							if (block.partial) {
								// 更新 gui 消息
								const partialMessage = JSON.stringify(sharedMessageProps)

								if (this.shouldAutoApproveToolWithPath(block.name, relPath)) {
									this.removeLastPartialMessageIfExistsWithType("ask", "tool") // 以防用户在流式传输过程中更改自动批准设置
									await this.say("tool", partialMessage, undefined, block.partial)
								} else {
									this.removeLastPartialMessageIfExistsWithType("say", "tool")
									await this.ask("tool", partialMessage, block.partial).catch(() => {})
								}
								// 更新编辑器
								if (!this.diffViewProvider.isEditing) {
									// 打开编辑器并准备流式传输内容
									await this.diffViewProvider.open(relPath)
								}
								// 编辑器已打开，流式传输内容
								await this.diffViewProvider.update(newContent, false)
								break
							} else {
								if (!relPath) {
									this.consecutiveMistakeCount++
									pushToolResult(await this.sayAndCreateMissingParamError(block.name, "path"))
									await this.diffViewProvider.reset()
									await this.saveCheckpoint()
									break
								}
								if (block.name === "replace_in_file" && !diff) {
									this.consecutiveMistakeCount++
									pushToolResult(await this.sayAndCreateMissingParamError("replace_in_file", "diff"))
									await this.diffViewProvider.reset()
									await this.saveCheckpoint()
									break
								}
								if (block.name === "write_to_file" && !content) {
									this.consecutiveMistakeCount++
									pushToolResult(await this.sayAndCreateMissingParamError("write_to_file", "content"))
									await this.diffViewProvider.reset()
									await this.saveCheckpoint()
									break
								}
								if (block.name === "new_rule" && !content) {
									this.consecutiveMistakeCount++
									pushToolResult(await this.sayAndCreateMissingParamError("new_rule", "content"))
									await this.diffViewProvider.reset()
									await this.saveCheckpoint()
									break
								}

								this.consecutiveMistakeCount = 0

								// 如果 isEditingFile 为 false，则表示我们已经拥有文件的完整内容。
								// 重要的是要注意此函数的工作方式，您不能假设 block.partial 条件将始终被调用，因为它可能立即获取完整的、非部分的数据。因此，这部分逻辑将始终被调用。
								// 换句话说，您必须始终在此处重复 block.partial 逻辑
								if (!this.diffViewProvider.isEditing) {
									// 在显示编辑动画之前显示 gui 消息
									const partialMessage = JSON.stringify(sharedMessageProps)
									await this.ask("tool", partialMessage, true).catch(() => {}) // 即使不是部分消息，也发送 true，这会在内容流式传输到编辑器之前显示编辑行
									await this.diffViewProvider.open(relPath)
								}
								await this.diffViewProvider.update(newContent, true)
								await setTimeoutPromise(300) // 等待 diff 视图更新
								this.diffViewProvider.scrollToFirstDiff()
								// showOmissionWarning(this.diffViewProvider.originalContent || "", newContent)

								const completeMessage = JSON.stringify({
									...sharedMessageProps,
									content: diff || content,
									operationIsLocatedInWorkspace: isLocatedInWorkspace(relPath),
									// ? formatResponse.createPrettyPatch(
									// 		relPath,
									// 		this.diffViewProvider.originalContent,
									// 		newContent,
									// 	)
									// : undefined,
								} satisfies ClineSayTool)
								if (this.shouldAutoApproveToolWithPath(block.name, relPath)) {
									this.removeLastPartialMessageIfExistsWithType("ask", "tool")
									await this.say("tool", completeMessage, undefined, false)
									this.consecutiveAutoApprovedRequestsCount++
									telemetryService.captureToolUsage(this.taskId, block.name, true, true)

									// 我们需要人为延迟以使诊断赶上更改
									await setTimeoutPromise(3_500)
								} else {
									// 如果启用了自动批准但此工具未自动批准，则发送通知
									showNotificationForApprovalIfAutoApprovalEnabled(
										`Cline 想要${fileExists ? "编辑" : "创建"} ${path.basename(relPath)}`,
									)
									this.removeLastPartialMessageIfExistsWithType("say", "tool")

									// 需要更自定义的文件编辑工具响应，以突出显示文件未更新的事实（对于 deepseek 尤其重要）
									let didApprove = true
									const { response, text, images } = await this.ask("tool", completeMessage, false)
									if (response !== "yesButtonClicked") {
										// 用户发送了消息或按下了拒绝按钮
										// TODO: 为其他工具拒绝响应添加类似的上下文，以强调例如命令未运行
										const fileDeniedNote = fileExists
											? "文件未更新，并保留其原始内容。"
											: "文件未创建。"
										pushToolResult(`用户拒绝了此操作。${fileDeniedNote}`)
										if (text || images?.length) {
											pushAdditionalToolFeedback(text, images)
											await this.say("user_feedback", text, images)
											await this.saveCheckpoint()
										}
										this.didRejectTool = true
										didApprove = false
										telemetryService.captureToolUsage(this.taskId, block.name, false, false)
									} else {
										// 用户点击了批准按钮，并且可能提供了反馈
										if (text || images?.length) {
											pushAdditionalToolFeedback(text, images)
											await this.say("user_feedback", text, images)
											await this.saveCheckpoint()
										}
										telemetryService.captureToolUsage(this.taskId, block.name, false, true)
									}

									if (!didApprove) {
										await this.diffViewProvider.revertChanges()
										await this.saveCheckpoint()
										break
									}
								}

								// 将文件标记为由 Cline 编辑，以防止错误的“最近修改”警告
								this.fileContextTracker.markFileAsEditedByCline(relPath)

								const { newProblemsMessage, userEdits, autoFormattingEdits, finalContent } =
									await this.diffViewProvider.saveChanges()
								this.didEditFile = true // 用于确定在发送 api 请求之前是否应等待繁忙的终端更新

								// 跟踪文件编辑操作
								await this.fileContextTracker.trackFileContext(relPath, "cline_edited")

								if (userEdits) {
									// 跟踪文件编辑操作
									await this.fileContextTracker.trackFileContext(relPath, "user_edited")

									await this.say(
										"user_feedback_diff",
										JSON.stringify({
											tool: fileExists ? "editedExistingFile" : "newFileCreated",
											path: getReadablePath(cwd, relPath),
											diff: userEdits,
										} satisfies ClineSayTool),
									)
									pushToolResult(
										formatResponse.fileEditWithUserChanges(
											relPath,
											userEdits,
											autoFormattingEdits,
											finalContent,
											newProblemsMessage,
										),
									)
								} else {
									pushToolResult(
										formatResponse.fileEditWithoutUserChanges(
											relPath,
											autoFormattingEdits,
											finalContent,
											newProblemsMessage,
										),
									)
								}

								if (!fileExists) {
									this.workspaceTracker.populateFilePaths()
								}

								await this.diffViewProvider.reset()

								await this.saveCheckpoint()

								break
							}
						} catch (error) {
							await handleError("写入文件", error)
							await this.diffViewProvider.revertChanges()
							await this.diffViewProvider.reset()
							await this.saveCheckpoint()
							break
						}
					}
					case "read_file": {
						const relPath: string | undefined = block.params.path
						const sharedMessageProps: ClineSayTool = {
							tool: "readFile",
							path: getReadablePath(cwd, removeClosingTag("path", relPath)),
						}
						try {
							if (block.partial) {
								const partialMessage = JSON.stringify({
									...sharedMessageProps,
									content: undefined,
									operationIsLocatedInWorkspace: isLocatedInWorkspace(relPath),
								} satisfies ClineSayTool)
								if (this.shouldAutoApproveToolWithPath(block.name, block.params.path)) {
									this.removeLastPartialMessageIfExistsWithType("ask", "tool")
									await this.say("tool", partialMessage, undefined, block.partial)
								} else {
									this.removeLastPartialMessageIfExistsWithType("say", "tool")
									await this.ask("tool", partialMessage, block.partial).catch(() => {})
								}
								break
							} else {
								if (!relPath) {
									this.consecutiveMistakeCount++
									pushToolResult(await this.sayAndCreateMissingParamError("read_file", "path"))
									await this.saveCheckpoint()
									break
								}

								const accessAllowed = this.clineIgnoreController.validateAccess(relPath)
								if (!accessAllowed) {
									await this.say("clineignore_error", relPath)
									pushToolResult(formatResponse.toolError(formatResponse.clineIgnoreError(relPath)))
									await this.saveCheckpoint()
									break
								}

								this.consecutiveMistakeCount = 0
								const absolutePath = path.resolve(cwd, relPath)
								const completeMessage = JSON.stringify({
									...sharedMessageProps,
									content: absolutePath,
									operationIsLocatedInWorkspace: isLocatedInWorkspace(relPath),
								} satisfies ClineSayTool)
								if (this.shouldAutoApproveToolWithPath(block.name, block.params.path)) {
									this.removeLastPartialMessageIfExistsWithType("ask", "tool")
									await this.say("tool", completeMessage, undefined, false) // 需要发送 partialValue 布尔值，因为 undefined 有其自身的用途，即消息既不被视为部分消息，也不被视为部分消息的完成，而是被视为单个完整的消息
									this.consecutiveAutoApprovedRequestsCount++
									telemetryService.captureToolUsage(this.taskId, block.name, true, true)
								} else {
									showNotificationForApprovalIfAutoApprovalEnabled(
										`Cline 想要读取 ${path.basename(absolutePath)}`,
									)
									this.removeLastPartialMessageIfExistsWithType("say", "tool")
									const didApprove = await askApproval("tool", completeMessage)
									if (!didApprove) {
										await this.saveCheckpoint()
										telemetryService.captureToolUsage(this.taskId, block.name, false, false)
										break
									}
									telemetryService.captureToolUsage(this.taskId, block.name, false, true)
								}
								// 现在像往常一样执行工具
								const content = await extractTextFromFile(absolutePath)

								// 跟踪文件读取操作
								await this.fileContextTracker.trackFileContext(relPath, "read_tool")

								pushToolResult(content)
								await this.saveCheckpoint()
								break
							}
						} catch (error) {
							await handleError("读取文件", error)
							await this.saveCheckpoint()
							break
						}
					}
					case "list_files": {
						const relDirPath: string | undefined = block.params.path
						const recursiveRaw: string | undefined = block.params.recursive
						const recursive = recursiveRaw?.toLowerCase() === "true"
						const sharedMessageProps: ClineSayTool = {
							tool: !recursive ? "listFilesTopLevel" : "listFilesRecursive",
							path: getReadablePath(cwd, removeClosingTag("path", relDirPath)),
						}
						try {
							if (block.partial) {
								const partialMessage = JSON.stringify({
									...sharedMessageProps,
									content: "",
									operationIsLocatedInWorkspace: isLocatedInWorkspace(block.params.path),
								} satisfies ClineSayTool)
								if (this.shouldAutoApproveToolWithPath(block.name, block.params.path)) {
									this.removeLastPartialMessageIfExistsWithType("ask", "tool")
									await this.say("tool", partialMessage, undefined, block.partial)
								} else {
									this.removeLastPartialMessageIfExistsWithType("say", "tool")
									await this.ask("tool", partialMessage, block.partial).catch(() => {})
								}
								break
							} else {
								if (!relDirPath) {
									this.consecutiveMistakeCount++
									pushToolResult(await this.sayAndCreateMissingParamError("list_files", "path"))
									await this.saveCheckpoint()
									break
								}
								this.consecutiveMistakeCount = 0

								const absolutePath = path.resolve(cwd, relDirPath)

								const [files, didHitLimit] = await listFiles(absolutePath, recursive, 200)

								const result = formatResponse.formatFilesList(
									absolutePath,
									files,
									didHitLimit,
									this.clineIgnoreController,
								)
								const completeMessage = JSON.stringify({
									...sharedMessageProps,
									content: result,
									operationIsLocatedInWorkspace: isLocatedInWorkspace(block.params.path),
								} satisfies ClineSayTool)
								if (this.shouldAutoApproveToolWithPath(block.name, block.params.path)) {
									this.removeLastPartialMessageIfExistsWithType("ask", "tool")
									await this.say("tool", completeMessage, undefined, false)
									this.consecutiveAutoApprovedRequestsCount++
									telemetryService.captureToolUsage(this.taskId, block.name, true, true)
								} else {
									showNotificationForApprovalIfAutoApprovalEnabled(
										`Cline 想要查看目录 ${path.basename(absolutePath)}/`,
									)
									this.removeLastPartialMessageIfExistsWithType("say", "tool")
									const didApprove = await askApproval("tool", completeMessage)
									if (!didApprove) {
										telemetryService.captureToolUsage(this.taskId, block.name, false, false)
										await this.saveCheckpoint()
										break
									}
									telemetryService.captureToolUsage(this.taskId, block.name, false, true)
								}
								pushToolResult(result)
								await this.saveCheckpoint()
								break
							}
						} catch (error) {
							await handleError("列出文件", error)
							await this.saveCheckpoint()
							break
						}
					}
					case "list_code_definition_names": {
						const relDirPath: string | undefined = block.params.path
						const sharedMessageProps: ClineSayTool = {
							tool: "listCodeDefinitionNames",
							path: getReadablePath(cwd, removeClosingTag("path", relDirPath)),
						}
						try {
							if (block.partial) {
								const partialMessage = JSON.stringify({
									...sharedMessageProps,
									content: "",
									operationIsLocatedInWorkspace: isLocatedInWorkspace(block.params.path),
								} satisfies ClineSayTool)
								if (this.shouldAutoApproveToolWithPath(block.name, block.params.path)) {
									this.removeLastPartialMessageIfExistsWithType("ask", "tool")
									await this.say("tool", partialMessage, undefined, block.partial)
								} else {
									this.removeLastPartialMessageIfExistsWithType("say", "tool")
									await this.ask("tool", partialMessage, block.partial).catch(() => {})
								}
								break
							} else {
								if (!relDirPath) {
									this.consecutiveMistakeCount++
									pushToolResult(await this.sayAndCreateMissingParamError("list_code_definition_names", "path"))
									await this.saveCheckpoint()
									break
								}

								this.consecutiveMistakeCount = 0

								const absolutePath = path.resolve(cwd, relDirPath)
								const result = await parseSourceCodeForDefinitionsTopLevel(
									absolutePath,
									this.clineIgnoreController,
								)

								const completeMessage = JSON.stringify({
									...sharedMessageProps,
									content: result,
									operationIsLocatedInWorkspace: isLocatedInWorkspace(block.params.path),
								} satisfies ClineSayTool)
								if (this.shouldAutoApproveToolWithPath(block.name, block.params.path)) {
									this.removeLastPartialMessageIfExistsWithType("ask", "tool")
									await this.say("tool", completeMessage, undefined, false)
									this.consecutiveAutoApprovedRequestsCount++
									telemetryService.captureToolUsage(this.taskId, block.name, true, true)
								} else {
									showNotificationForApprovalIfAutoApprovalEnabled(
										`Cline 想要查看 ${path.basename(absolutePath)}/ 中的源代码定义`,
									)
									this.removeLastPartialMessageIfExistsWithType("say", "tool")
									const didApprove = await askApproval("tool", completeMessage)
									if (!didApprove) {
										telemetryService.captureToolUsage(this.taskId, block.name, false, false)
										await this.saveCheckpoint()
										break
									}
									telemetryService.captureToolUsage(this.taskId, block.name, false, true)
								}
								pushToolResult(result)
								await this.saveCheckpoint()
								break
							}
						} catch (error) {
							await handleError("解析源代码定义", error)
							await this.saveCheckpoint()
							break
						}
					}
					case "search_files": {
						const relDirPath: string | undefined = block.params.path
						const regex: string | undefined = block.params.regex
						const filePattern: string | undefined = block.params.file_pattern
						const sharedMessageProps: ClineSayTool = {
							tool: "searchFiles",
							path: getReadablePath(cwd, removeClosingTag("path", relDirPath)),
							regex: removeClosingTag("regex", regex),
							filePattern: removeClosingTag("file_pattern", filePattern),
						}
						try {
							if (block.partial) {
								const partialMessage = JSON.stringify({
									...sharedMessageProps,
									content: "",
									operationIsLocatedInWorkspace: isLocatedInWorkspace(block.params.path),
								} satisfies ClineSayTool)
								if (this.shouldAutoApproveToolWithPath(block.name, block.params.path)) {
									this.removeLastPartialMessageIfExistsWithType("ask", "tool")
									await this.say("tool", partialMessage, undefined, block.partial)
								} else {
									this.removeLastPartialMessageIfExistsWithType("say", "tool")
									await this.ask("tool", partialMessage, block.partial).catch(() => {})
								}
								break
							} else {
								if (!relDirPath) {
									this.consecutiveMistakeCount++
									pushToolResult(await this.sayAndCreateMissingParamError("search_files", "path"))
									await this.saveCheckpoint()
									break
								}
								if (!regex) {
									this.consecutiveMistakeCount++
									pushToolResult(await this.sayAndCreateMissingParamError("search_files", "regex"))
									await this.saveCheckpoint()
									break
								}
								this.consecutiveMistakeCount = 0

								const absolutePath = path.resolve(cwd, relDirPath)
								const results = await regexSearchFiles(
									cwd,
									absolutePath,
									regex,
									filePattern,
									this.clineIgnoreController,
								)

								const completeMessage = JSON.stringify({
									...sharedMessageProps,
									content: results,
									operationIsLocatedInWorkspace: isLocatedInWorkspace(block.params.path),
								} satisfies ClineSayTool)
								if (this.shouldAutoApproveToolWithPath(block.name, block.params.path)) {
									this.removeLastPartialMessageIfExistsWithType("ask", "tool")
									await this.say("tool", completeMessage, undefined, false)
									this.consecutiveAutoApprovedRequestsCount++
									telemetryService.captureToolUsage(this.taskId, block.name, true, true)
								} else {
									showNotificationForApprovalIfAutoApprovalEnabled(
										`Cline 想要在 ${path.basename(absolutePath)}/ 中搜索文件`,
									)
									this.removeLastPartialMessageIfExistsWithType("say", "tool")
									const didApprove = await askApproval("tool", completeMessage)
									if (!didApprove) {
										telemetryService.captureToolUsage(this.taskId, block.name, false, false)
										await this.saveCheckpoint()
										break
									}
									telemetryService.captureToolUsage(this.taskId, block.name, false, true)
								}
								pushToolResult(results)
								await this.saveCheckpoint()
								break
							}
						} catch (error) {
							await handleError("搜索文件", error)
							await this.saveCheckpoint()
							break
						}
					}
					case "browser_action": {
						const action: BrowserAction | undefined = block.params.action as BrowserAction
						const url: string | undefined = block.params.url
						const coordinate: string | undefined = block.params.coordinate
						const text: string | undefined = block.params.text
						if (!action || !browserActions.includes(action)) {
							// 检查 action 以确保其完整且有效
							if (!block.partial) {
								// 如果块已完成且我们没有有效的 action，则这是一个错误
								this.consecutiveMistakeCount++
								pushToolResult(await this.sayAndCreateMissingParamError("browser_action", "action"))
								await this.browserSession.closeBrowser()
								await this.saveCheckpoint()
							}
							break
						}

						try {
							if (block.partial) {
								if (action === "launch") {
									if (this.shouldAutoApproveTool(block.name)) {
										this.removeLastPartialMessageIfExistsWithType("ask", "browser_action_launch")
										await this.say(
											"browser_action_launch",
											removeClosingTag("url", url),
											undefined,
											block.partial,
										)
									} else {
										this.removeLastPartialMessageIfExistsWithType("say", "browser_action_launch")
										await this.ask(
											"browser_action_launch",
											removeClosingTag("url", url),
											block.partial,
										).catch(() => {})
									}
								} else {
									await this.say(
										"browser_action",
										JSON.stringify({
											action: action as BrowserAction,
											coordinate: removeClosingTag("coordinate", coordinate),
											text: removeClosingTag("text", text),
										} satisfies ClineSayBrowserAction),
										undefined,
										block.partial,
									)
								}
								break
							} else {
								let browserActionResult: BrowserActionResult
								if (action === "launch") {
									if (!url) {
										this.consecutiveMistakeCount++
										pushToolResult(await this.sayAndCreateMissingParamError("browser_action", "url"))
										await this.browserSession.closeBrowser()
										await this.saveCheckpoint()
										break
									}
									this.consecutiveMistakeCount = 0

									if (this.shouldAutoApproveTool(block.name)) {
										this.removeLastPartialMessageIfExistsWithType("ask", "browser_action_launch")
										await this.say("browser_action_launch", url, undefined, false)
										this.consecutiveAutoApprovedRequestsCount++
									} else {
										showNotificationForApprovalIfAutoApprovalEnabled(
											`Cline 想要使用浏览器并启动 ${url}`,
										)
										this.removeLastPartialMessageIfExistsWithType("say", "browser_action_launch")
										const didApprove = await askApproval("browser_action_launch", url)
										if (!didApprove) {
											await this.saveCheckpoint()
											break
										}
									}

									// 注意：调用此消息是可以的，因为部分 inspect_site 已完成流式传输。我们唯一需要避免的情况是在消息数组末尾存在部分消息时发送消息。例如，api_req_finished 消息会干扰部分消息，因此我们需要删除它。
									// await this.say("inspect_site_result", "") // 没有结果，启动加载微调器等待结果
									await this.say("browser_action_result", "") // 启动加载微调器

									// 重新创建 browserSession 以确保应用最新设置
									if (this.context) {
										await this.browserSession.dispose()
										this.browserSession = new BrowserSession(this.context, this.browserSettings)
									} else {
										console.warn("browserSession 没有可用的控制器上下文")
									}
									await this.browserSession.launchBrowser()
									browserActionResult = await this.browserSession.navigateToUrl(url)
								} else {
									if (action === "click") {
										if (!coordinate) {
											this.consecutiveMistakeCount++
											pushToolResult(
												await this.sayAndCreateMissingParamError("browser_action", "coordinate"),
											)
											await this.browserSession.closeBrowser()
											await this.saveCheckpoint()
											break // 不能在内部 switch 中
										}
									}
									if (action === "type") {
										if (!text) {
											this.consecutiveMistakeCount++
											pushToolResult(await this.sayAndCreateMissingParamError("browser_action", "text"))
											await this.browserSession.closeBrowser()
											await this.saveCheckpoint()
											break
										}
									}
									this.consecutiveMistakeCount = 0
									await this.say(
										"browser_action",
										JSON.stringify({
											action: action as BrowserAction,
											coordinate,
											text,
										} satisfies ClineSayBrowserAction),
										undefined,
										false,
									)
									switch (action) {
										case "click":
											browserActionResult = await this.browserSession.click(coordinate!)
											break
										case "type":
											browserActionResult = await this.browserSession.type(text!)
											break
										case "scroll_down":
											browserActionResult = await this.browserSession.scrollDown()
											break
										case "scroll_up":
											browserActionResult = await this.browserSession.scrollUp()
											break
										case "close":
											browserActionResult = await this.browserSession.closeBrowser()
											break
									}
								}

								switch (action) {
									case "launch":
									case "click":
									case "type":
									case "scroll_down":
									case "scroll_up":
										await this.say("browser_action_result", JSON.stringify(browserActionResult))
										pushToolResult(
											formatResponse.toolResult(
												`浏览器操作已执行。控制台日志和屏幕截图已捕获供您分析。\n\n控制台日志：\n${
													browserActionResult.logs || "(无新日志)"
												}\n\n（请记住：如果您需要继续使用非 \`browser_action\` 工具或启动新浏览器，则必须首先关闭此浏览器。例如，如果在分析日志和屏幕截图后需要编辑文件，则必须先关闭浏览器才能使用 write_to_file 工具。）`,
												browserActionResult.screenshot ? [browserActionResult.screenshot] : [],
											),
										)
										await this.saveCheckpoint()
										break
									case "close":
										pushToolResult(
											formatResponse.toolResult(
												`浏览器已关闭。您现在可以继续使用其他工具。`,
											),
										)
										await this.saveCheckpoint()
										break
								}

								break
							}
						} catch (error) {
							await this.browserSession.closeBrowser() // 如果发生任何错误，浏览器会话将终止
							await handleError("执行浏览器操作", error)
							await this.saveCheckpoint()
							break
						}
					}
					case "execute_command": {
						let command: string | undefined = block.params.command
						const requiresApprovalRaw: string | undefined = block.params.requires_approval
						const requiresApprovalPerLLM = requiresApprovalRaw?.toLowerCase() === "true"

						try {
							if (block.partial) {
								if (this.shouldAutoApproveTool(block.name)) {
									// 由于取决于即将到来的参数 requiresApproval，这可能会变成一个 ask - 我们不能过早地部分流式传输 say。因此，在这种特殊情况下，我们必须等待 requiresApproval 参数完成后才能呈现它。
									// await this.say(
									// 	"command",
									// 	removeClosingTag("command", command),
									// 	undefined,
									// 	block.partial,
									// ).catch(() => {})
								} else {
									// 不需要删除最后一个部分，因为我们无法流式传输 say
									await this.ask("command", removeClosingTag("command", command), block.partial).catch(() => {})
								}
								break
							} else {
								if (!command) {
									this.consecutiveMistakeCount++
									pushToolResult(await this.sayAndCreateMissingParamError("execute_command", "command"))
									await this.saveCheckpoint()
									break
								}
								if (!requiresApprovalRaw) {
									this.consecutiveMistakeCount++
									pushToolResult(
										await this.sayAndCreateMissingParamError("execute_command", "requires_approval"),
									)
									await this.saveCheckpoint()
									break
								}
								this.consecutiveMistakeCount = 0

								// gemini 模型倾向于在命令中使用未转义的 html 实体
								if (this.api.getModel().id.includes("gemini")) {
									command = fixModelHtmlEscaping(command)
								}

								const ignoredFileAttemptedToAccess = this.clineIgnoreController.validateCommand(command)
								if (ignoredFileAttemptedToAccess) {
									await this.say("clineignore_error", ignoredFileAttemptedToAccess)
									pushToolResult(
										formatResponse.toolError(formatResponse.clineIgnoreError(ignoredFileAttemptedToAccess)),
									)
									await this.saveCheckpoint()
									break
								}

								let didAutoApprove = false

								// 如果模型认为此命令是安全的，并且安全命令的自动批准为 true，则执行该命令
								// 如果模型认为该命令有风险，但*两个*自动批准设置都为 true，则执行该命令
								const autoApproveResult = this.shouldAutoApproveTool(block.name)
								const [autoApproveSafe, autoApproveAll] = Array.isArray(autoApproveResult)
									? autoApproveResult
									: [autoApproveResult, false]

								if (
									(!requiresApprovalPerLLM && autoApproveSafe) ||
									(requiresApprovalPerLLM && autoApproveSafe && autoApproveAll)
								) {
									this.removeLastPartialMessageIfExistsWithType("ask", "command")
									await this.say("command", command, undefined, false)
									this.consecutiveAutoApprovedRequestsCount++
									didAutoApprove = true
								} else {
									showNotificationForApprovalIfAutoApprovalEnabled(
										`Cline 想要执行命令：${command}`,
									)
									// this.removeLastPartialMessageIfExistsWithType("say", "command")
									const didApprove = await askApproval(
										"command",
										command +
											`${this.shouldAutoApproveTool(block.name) && requiresApprovalPerLLM ? COMMAND_REQ_APP_STRING : ""}`, // 丑陋的 hack，直到我们重构 combineCommandSequences
									)
									if (!didApprove) {
										await this.saveCheckpoint()
										break
									}
								}

								let timeoutId: NodeJS.Timeout | undefined
								if (didAutoApprove && this.autoApprovalSettings.enableNotifications) {
									// 如果命令已自动批准，并且运行时间较长，我们需要在一段时间后通知用户
									timeoutId = setTimeout(() => {
										showSystemNotification({
											subtitle: "命令仍在运行",
											message:
												"一个自动批准的命令已运行 30 秒，可能需要您的注意。",
										})
									}, 30_000)
								}

								const [userRejected, result] = await this.executeCommandTool(command)
								if (timeoutId) {
									clearTimeout(timeoutId)
								}
								if (userRejected) {
									this.didRejectTool = true
								}

								// 重新填充文件路径，以防命令修改了工作区（除非用户手动创建/删除文件，否则 vscode 侦听器不会触发）
								this.workspaceTracker.populateFilePaths()

								pushToolResult(result)

								await this.saveCheckpoint()

								break
							}
						} catch (error) {
							await handleError("执行命令", error)
							await this.saveCheckpoint()
							break
						}
					}
					case "use_mcp_tool": {
						const server_name: string | undefined = block.params.server_name
						const tool_name: string | undefined = block.params.tool_name
						const mcp_arguments: string | undefined = block.params.arguments
						try {
							if (block.partial) {
								const partialMessage = JSON.stringify({
									type: "use_mcp_tool",
									serverName: removeClosingTag("server_name", server_name),
									toolName: removeClosingTag("tool_name", tool_name),
									arguments: removeClosingTag("arguments", mcp_arguments),
								} satisfies ClineAskUseMcpServer)

								if (this.shouldAutoApproveTool(block.name)) {
									this.removeLastPartialMessageIfExistsWithType("ask", "use_mcp_server")
									await this.say("use_mcp_server", partialMessage, undefined, block.partial)
								} else {
									this.removeLastPartialMessageIfExistsWithType("say", "use_mcp_server")
									await this.ask("use_mcp_server", partialMessage, block.partial).catch(() => {})
								}

								break
							} else {
								if (!server_name) {
									this.consecutiveMistakeCount++
									pushToolResult(await this.sayAndCreateMissingParamError("use_mcp_tool", "server_name"))
									await this.saveCheckpoint()
									break
								}
								if (!tool_name) {
									this.consecutiveMistakeCount++
									pushToolResult(await this.sayAndCreateMissingParamError("use_mcp_tool", "tool_name"))
									await this.saveCheckpoint()
									break
								}
								// 参数是可选的，但如果提供，则必须是有效的 JSON
								// if (!mcp_arguments) {
								// 	this.consecutiveMistakeCount++
								// 	pushToolResult(await this.sayAndCreateMissingParamError("use_mcp_tool", "arguments"))
								// 	break
								// }
								let parsedArguments: Record<string, unknown> | undefined
								if (mcp_arguments) {
									try {
										parsedArguments = JSON.parse(mcp_arguments)
									} catch (error) {
										this.consecutiveMistakeCount++
										await this.say(
											"error",
											`Cline 尝试使用 ${tool_name} 但 JSON 参数无效。正在重试...`,
										)
										pushToolResult(
											formatResponse.toolError(
												formatResponse.invalidMcpToolArgumentError(server_name, tool_name),
											),
										)
										await this.saveCheckpoint()
										break
									}
								}
								this.consecutiveMistakeCount = 0
								const completeMessage = JSON.stringify({
									type: "use_mcp_tool",
									serverName: server_name,
									toolName: tool_name,
									arguments: mcp_arguments,
								} satisfies ClineAskUseMcpServer)

								const isToolAutoApproved = this.mcpHub.connections
									?.find((conn) => conn.server.name === server_name)
									?.server.tools?.find((tool) => tool.name === tool_name)?.autoApprove

								if (this.shouldAutoApproveTool(block.name) && isToolAutoApproved) {
									this.removeLastPartialMessageIfExistsWithType("ask", "use_mcp_server")
									await this.say("use_mcp_server", completeMessage, undefined, false)
									this.consecutiveAutoApprovedRequestsCount++
								} else {
									showNotificationForApprovalIfAutoApprovalEnabled(
										`Cline 想要在 ${server_name} 上使用 ${tool_name}`,
									)
									this.removeLastPartialMessageIfExistsWithType("say", "use_mcp_server")
									const didApprove = await askApproval("use_mcp_server", completeMessage)
									if (!didApprove) {
										await this.saveCheckpoint()
										break
									}
								}

								// 现在执行工具
								await this.say("mcp_server_request_started") // 与 browser_action_result 相同
								const toolResult = await this.mcpHub.callTool(server_name, tool_name, parsedArguments)

								// TODO: 添加进度指示器

								const toolResultImages =
									toolResult?.content
										.filter((item) => item.type === "image")
										.map((item) => `data:${item.mimeType};base64,${item.data}`) || []
								let toolResultText =
									(toolResult?.isError ? "错误：\n" : "") +
										toolResult?.content
											.map((item) => {
												if (item.type === "text") {
													return item.text
												}
												if (item.type === "resource") {
													const { blob, ...rest } = item.resource
													return JSON.stringify(rest, null, 2)
												}
												return ""
											})
											.filter(Boolean)
											.join("\n\n") || "(无响应)"
								// webview 从文本响应中提取图像以在 UI 中显示
								const toolResultToDisplay =
									toolResultText + toolResultImages?.map((image) => `\n\n${image}`).join("")
								await this.say("mcp_server_response", toolResultToDisplay)

								// MCP 可能会返回图像以显示给用户，但模型可能不支持它们
								const supportsImages = this.api.getModel().info.supportsImages ?? false
								if (toolResultImages.length > 0 && !supportsImages) {
									toolResultText += `\n\n[响应中提供了 ${toolResultImages.length} 张图像，虽然它们已显示给用户，但您无法查看它们。]`
								}

								// 仅当模型支持时才传入图像
								pushToolResult(
									formatResponse.toolResult(toolResultText, supportsImages ? toolResultImages : undefined),
								)

								await this.saveCheckpoint()

								break
							}
						} catch (error) {
							await handleError("执行 MCP 工具", error)
							await this.saveCheckpoint()
							break
						}
					}
					case "access_mcp_resource": {
						const server_name: string | undefined = block.params.server_name
						const uri: string | undefined = block.params.uri
						try {
							if (block.partial) {
								const partialMessage = JSON.stringify({
									type: "access_mcp_resource",
									serverName: removeClosingTag("server_name", server_name),
									uri: removeClosingTag("uri", uri),
								} satisfies ClineAskUseMcpServer)

								if (this.shouldAutoApproveTool(block.name)) {
									this.removeLastPartialMessageIfExistsWithType("ask", "use_mcp_server")
									await this.say("use_mcp_server", partialMessage, undefined, block.partial)
								} else {
									this.removeLastPartialMessageIfExistsWithType("say", "use_mcp_server")
									await this.ask("use_mcp_server", partialMessage, block.partial).catch(() => {})
								}

								break
							} else {
								if (!server_name) {
									this.consecutiveMistakeCount++
									pushToolResult(await this.sayAndCreateMissingParamError("access_mcp_resource", "server_name"))
									await this.saveCheckpoint()
									break
								}
								if (!uri) {
									this.consecutiveMistakeCount++
									pushToolResult(await this.sayAndCreateMissingParamError("access_mcp_resource", "uri"))
									await this.saveCheckpoint()
									break
								}
								this.consecutiveMistakeCount = 0
								const completeMessage = JSON.stringify({
									type: "access_mcp_resource",
									serverName: server_name,
									uri,
								} satisfies ClineAskUseMcpServer)

								if (this.shouldAutoApproveTool(block.name)) {
									this.removeLastPartialMessageIfExistsWithType("ask", "use_mcp_server")
									await this.say("use_mcp_server", completeMessage, undefined, false)
									this.consecutiveAutoApprovedRequestsCount++
								} else {
									showNotificationForApprovalIfAutoApprovalEnabled(
										`Cline 想要在 ${server_name} 上访问 ${uri}`,
									)
									this.removeLastPartialMessageIfExistsWithType("say", "use_mcp_server")
									const didApprove = await askApproval("use_mcp_server", completeMessage)
									if (!didApprove) {
										await this.saveCheckpoint()
										break
									}
								}

								// now execute the tool
								await this.say("mcp_server_request_started")
								const resourceResult = await this.mcpHub.readResource(server_name, uri)
								const resourceResultPretty =
									resourceResult?.contents
										.map((item) => {
											if (item.text) {
												return item.text
											}
											return ""
										})
										.filter(Boolean)
										.join("\n\n") || "(空响应)"
								await this.say("mcp_server_response", resourceResultPretty)
								pushToolResult(formatResponse.toolResult(resourceResultPretty))
								await this.saveCheckpoint()
								break
							}
						} catch (error) {
							await handleError("访问 MCP 资源", error)
							await this.saveCheckpoint()
							break
						}
					}
					case "ask_followup_question": {
						const question: string | undefined = block.params.question
						const optionsRaw: string | undefined = block.params.options
						const sharedMessage = {
							question: removeClosingTag("question", question),
							options: parsePartialArrayString(removeClosingTag("options", optionsRaw)),
						} satisfies ClineAskQuestion
						try {
							if (block.partial) {
								await this.ask("followup", JSON.stringify(sharedMessage), block.partial).catch(() => {})
								break
							} else {
								if (!question) {
									this.consecutiveMistakeCount++
									pushToolResult(await this.sayAndCreateMissingParamError("ask_followup_question", "question"))
									await this.saveCheckpoint()
									break
								}
								this.consecutiveMistakeCount = 0

								if (this.autoApprovalSettings.enabled && this.autoApprovalSettings.enableNotifications) {
									showSystemNotification({
										subtitle: "Cline 有一个问题...",
										message: question.replace(/\n/g, " "),
									})
								}

								// 存储选项数量以进行遥测
								const options = parsePartialArrayString(optionsRaw || "[]")

								const { text, images } = await this.ask("followup", JSON.stringify(sharedMessage), false)

								// 检查选项是否包含文本响应
								if (optionsRaw && text && parsePartialArrayString(optionsRaw).includes(text)) {
									// 选择了有效选项，不在 UI 中显示用户消息
									// 使用选定选项更新最后一条跟进消息
									const lastFollowupMessage = findLast(this.clineMessages, (m) => m.ask === "followup")
									if (lastFollowupMessage) {
										lastFollowupMessage.text = JSON.stringify({
											...sharedMessage,
											selected: text,
										} satisfies ClineAskQuestion)
										await this.saveClineMessagesAndUpdateHistory()
										telemetryService.captureOptionSelected(this.taskId, options.length, "act")
									}
								} else {
									// 未选择选项，发送用户反馈
									telemetryService.captureOptionsIgnored(this.taskId, options.length, "act")
									await this.say("user_feedback", text ?? "", images)
								}

								pushToolResult(formatResponse.toolResult(`<answer>\n${text}\n</answer>`, images))
								await this.saveCheckpoint()
								break
							}
						} catch (error) {
							await handleError("提问问题", error)
							await this.saveCheckpoint()
							break
						}
					}
					case "new_task": {
						const context: string | undefined = block.params.context
						try {
							if (block.partial) {
								await this.ask("new_task", removeClosingTag("context", context), block.partial).catch(() => {})
								break
							} else {
								if (!context) {
									this.consecutiveMistakeCount++
									pushToolResult(await this.sayAndCreateMissingParamError("new_task", "context"))
									await this.saveCheckpoint()
									break
								}
								this.consecutiveMistakeCount = 0

								if (this.autoApprovalSettings.enabled && this.autoApprovalSettings.enableNotifications) {
									showSystemNotification({
										subtitle: "Cline 想要开始一个新任务...",
										message: `Cline 建议使用以下内容开始一个新任务: ${context}`,
									})
								}

								const { text, images } = await this.ask("new_task", context, false)

								// 如果用户提供了响应，则将其视为反馈
								if (text || images?.length) {
									await this.say("user_feedback", text ?? "", images)
									pushToolResult(
										formatResponse.toolResult(
											`用户提供了反馈，而不是创建新任务：\n<feedback>\n${text}\n</feedback>`,
											images,
										),
									)
								} else {
									// 如果没有响应，则用户点击了“创建新任务”按钮
									pushToolResult(
										formatResponse.toolResult(`用户已使用提供的上下文创建了一个新任务。`),
									)
								}
								await this.saveCheckpoint()
								break
							}
						} catch (error) {
							await handleError("创建新任务", error)
							await this.saveCheckpoint()
							break
						}
					}
					case "condense": {
						const context: string | undefined = block.params.context
						try {
							if (block.partial) {
								await this.ask("condense", removeClosingTag("context", context), block.partial).catch(() => {})
								break
							} else {
								if (!context) {
									this.consecutiveMistakeCount++
									pushToolResult(await this.sayAndCreateMissingParamError("condense", "context"))
									await this.saveCheckpoint()
									break
								}
								this.consecutiveMistakeCount = 0

								if (this.autoApprovalSettings.enabled && this.autoApprovalSettings.enableNotifications) {
									showSystemNotification({
										subtitle: "Cline 想要精简对话...",
										message: `Cline 建议使用以下内容精简您的对话: ${context}`,
									})
								}

								const { text, images } = await this.ask("condense", context, false)

								// 如果用户提供了响应，则将其视为反馈
								if (text || images?.length) {
									await this.say("user_feedback", text ?? "", images)
									pushToolResult(
										formatResponse.toolResult(
											`用户对精简的对话摘要提供了反馈：\n<feedback>\n${text}\n</feedback>`,
											images,
										),
									)
								} else {
									// 如果没有响应，则用户接受了精简版本
									pushToolResult(formatResponse.toolResult(formatResponse.condense()))

									const lastMessage = this.apiConversationHistory[this.apiConversationHistory.length - 1]
									const summaryAlreadyAppended = lastMessage && lastMessage.role === "assistant"
									const keepStrategy = summaryAlreadyAppended ? "lastTwo" : "none"

									// 此时清除上下文历史记录
									this.conversationHistoryDeletedRange = this.contextManager.getNextTruncationRange(
										this.apiConversationHistory,
										this.conversationHistoryDeletedRange,
										keepStrategy,
									)
									await this.saveClineMessagesAndUpdateHistory()
									await this.contextManager.triggerApplyStandardContextTruncationNoticeChange(
										Date.now(),
										await ensureTaskDirectoryExists(this.getContext(), this.taskId),
									)
								}
								await this.saveCheckpoint()
								break
							}
						} catch (error) {
							await handleError("精简上下文窗口", error)
							await this.saveCheckpoint()
							break
						}
					}
					case "report_bug": {
						const title = block.params.title
						const what_happened = block.params.what_happened
						const steps_to_reproduce = block.params.steps_to_reproduce
						const api_request_output = block.params.api_request_output
						const additional_context = block.params.additional_context

						try {
							if (block.partial) {
								await this.ask(
									"report_bug",
									JSON.stringify({
										title: removeClosingTag("title", title),
										what_happened: removeClosingTag("what_happened", what_happened),
										steps_to_reproduce: removeClosingTag("steps_to_reproduce", steps_to_reproduce),
										api_request_output: removeClosingTag("api_request_output", api_request_output),
										additional_context: removeClosingTag("additional_context", additional_context),
									}),
									block.partial,
								).catch(() => {})
								break
							} else {
								if (!title) {
									this.consecutiveMistakeCount++
									pushToolResult(await this.sayAndCreateMissingParamError("report_bug", "title"))
									await this.saveCheckpoint()
									break
								}
								if (!what_happened) {
									this.consecutiveMistakeCount++
									pushToolResult(await this.sayAndCreateMissingParamError("report_bug", "what_happened"))
									await this.saveCheckpoint()
									break
								}
								if (!steps_to_reproduce) {
									this.consecutiveMistakeCount++
									pushToolResult(await this.sayAndCreateMissingParamError("report_bug", "steps_to_reproduce"))
									await this.saveCheckpoint()
									break
								}
								if (!api_request_output) {
									this.consecutiveMistakeCount++
									pushToolResult(await this.sayAndCreateMissingParamError("report_bug", "api_request_output"))
									await this.saveCheckpoint()
									break
								}
								if (!additional_context) {
									this.consecutiveMistakeCount++
									pushToolResult(await this.sayAndCreateMissingParamError("report_bug", "additional_context"))
									await this.saveCheckpoint()
									break
								}

								this.consecutiveMistakeCount = 0

								if (this.autoApprovalSettings.enabled && this.autoApprovalSettings.enableNotifications) {
									showSystemNotification({
										subtitle: "Cline 想要创建一个 github 问题...",
										message: `Cline 建议使用标题创建 github 问题: ${title}`,
									})
								}

								// 通过算法派生系统信息值
								const operatingSystem = os.platform() + " " + os.release()
								const clineVersion =
									vscode.extensions.getExtension("saoudrizwan.claude-dev")?.packageJSON.version || "未知"
								const systemInfo = `VSCode: ${vscode.version}, Node.js: ${process.version}, Architecture: ${os.arch()}`
								const providerAndModel = `${(await getGlobalState(this.getContext(), "apiProvider")) as string} / ${this.api.getModel().id}`

								// 请求用户确认
								const bugReportData = JSON.stringify({
									title,
									what_happened,
									steps_to_reproduce,
									api_request_output,
									additional_context,
									// 在 JSON 中包含派生值以供显示
									provider_and_model: providerAndModel,
									operating_system: operatingSystem,
									system_info: systemInfo,
									cline_version: clineVersion,
								})

								const { text, images } = await this.ask("report_bug", bugReportData, false)

								// 如果用户提供了响应，则将其视为反馈
								if (text || images?.length) {
									await this.say("user_feedback", text ?? "", images)
									pushToolResult(
										formatResponse.toolResult(
											`用户未提交错误，而是对生成的 Github 问题提供了反馈：\n<feedback>\n${text}\n</feedback>`,
											images,
										),
									)
								} else {
									// 如果没有响应，则用户接受了创建 Github 问题
									pushToolResult(
										formatResponse.toolResult(`用户接受了创建 Github 问题。`),
									)

									try {
										// 为 GitHub 问题创建一个参数映射
										const params = new Map<string, string>()
										params.set("title", title)
										params.set("operating-system", operatingSystem)
										params.set("cline-version", clineVersion)
										params.set("system-info", systemInfo)
										params.set("additional-context", additional_context)
										params.set("what-happened", what_happened)
										params.set("steps", steps_to_reproduce)
										params.set("provider-model", providerAndModel)
										params.set("logs", api_request_output)

										// 使用我们的实用函数创建并打开 GitHub 问题 URL
										// 这绕过了 VS Code 处理特殊字符时的 URI 问题
										await createAndOpenGitHubIssue("cline", "cline", "bug_report.yml", params)
									} catch (error) {
										console.error(`尝试报告错误时发生错误: ${error}`)
									}
								}
								await this.saveCheckpoint()
								break
							}
						} catch (error) {
							await handleError("报告错误", error)
							await this.saveCheckpoint()
							break
						}
					}
					case "plan_mode_respond": {
						const response: string | undefined = block.params.response
						const optionsRaw: string | undefined = block.params.options
						const sharedMessage = {
							response: removeClosingTag("response", response),
							options: parsePartialArrayString(removeClosingTag("options", optionsRaw)),
						} satisfies ClinePlanModeResponse
						try {
							if (block.partial) {
								await this.ask("plan_mode_respond", JSON.stringify(sharedMessage), block.partial).catch(() => {})
								break
							} else {
								if (!response) {
									this.consecutiveMistakeCount++
									pushToolResult(await this.sayAndCreateMissingParamError("plan_mode_respond", "response"))
									//
									break
								}
								this.consecutiveMistakeCount = 0

								// if (this.autoApprovalSettings.enabled && this.autoApprovalSettings.enableNotifications) {
								// 	showSystemNotification({
								// 		subtitle: "Cline 有一个响应...",
								// 		message: response.replace(/\n/g, " "),
								// 	})
								// }

								// 存储选项数量以进行遥测
								const options = parsePartialArrayString(optionsRaw || "[]")

								this.isAwaitingPlanResponse = true
								let { text, images } = await this.ask("plan_mode_respond", JSON.stringify(sharedMessage), false)
								this.isAwaitingPlanResponse = false

								// webview 调用 sendMessage 将发送此标记，以便将 webview 置于正确状态（响应询问）并作为用户切换到 ACT 模式的扩展标志。
								if (text === "PLAN_MODE_TOGGLE_RESPONSE") {
									text = ""
								}

								// 检查选项是否包含文本响应
								if (optionsRaw && text && parsePartialArrayString(optionsRaw).includes(text)) {
									// 选择了有效选项，不在 UI 中显示用户消息
									// 使用选定选项更新最后一条计划消息
									const lastPlanMessage = findLast(this.clineMessages, (m) => m.ask === "plan_mode_respond")
									if (lastPlanMessage) {
										lastPlanMessage.text = JSON.stringify({
											...sharedMessage,
											selected: text,
										} satisfies ClinePlanModeResponse)
										await this.saveClineMessagesAndUpdateHistory()
										telemetryService.captureOptionSelected(this.taskId, options.length, "plan")
									}
								} else {
									// 未选择选项，发送用户反馈
									if (text || images?.length) {
										telemetryService.captureOptionsIgnored(this.taskId, options.length, "plan")
										await this.say("user_feedback", text ?? "", images)
										await this.saveCheckpoint()
									}
								}

								if (this.didRespondToPlanAskBySwitchingMode) {
									pushToolResult(
										formatResponse.toolResult(
											`[用户已切换到行动模式，因此您现在可以继续执行任务。]` +
												(text
													? `\n\n用户在切换到行动模式时还提供了以下消息：\n<user_message>\n${text}\n</user_message>`
													: ""),
											images,
										),
									)
								} else {
									// 如果我们没有切换到行动模式，那么我们可以只发送 user_feedback 消息
									pushToolResult(formatResponse.toolResult(`<user_message>\n${text}\n</user_message>`, images))
								}

								//
								break
							}
						} catch (error) {
							await handleError("响应查询", error)
							//
							break
						}
					}
					case "load_mcp_documentation": {
						try {
							if (block.partial) {
								// 不应该发生
								break
							} else {
								await this.say("load_mcp_documentation", "", undefined, false)
								pushToolResult(await loadMcpDocumentation(this.mcpHub))
								break
							}
						} catch (error) {
							await handleError("加载 MCP 文档", error)
							break
						}
					}
					case "attempt_completion": {
						/*
						this.consecutiveMistakeCount = 0
						let resultToSend = result
						if (command) {
							await this.say("completion_result", resultToSend)
							// TODO: 目前我们不处理此命令失败的情况，让 cline知道并重试可能很有用
							const [didUserReject, commandResult] = await this.executeCommand(command, true)
							// 如果我们收到非空字符串，则命令被拒绝或失败
							if (commandResult) {
								return [didUserReject, commandResult]
							}
							resultToSend = ""
						}
						const { response, text, images } = await this.ask("completion_result", resultToSend) // 这将提示 webview 显示“新任务”按钮，并启用文本输入（此处为“文本”）
						if (response === "yesButtonClicked") {
							return [false, ""] // 向递归循环发出停止信号（目前这永远不会发生，因为 yesButtonClicked 将触发一个新任务）
						}
						await this.say("user_feedback", text ?? "", images)
						return [
						*/
						const result: string | undefined = block.params.result
						const command: string | undefined = block.params.command

						const addNewChangesFlagToLastCompletionResultMessage = async () => {
							// 如果工作区有新更改，则添加 newchanges 标志

							const hasNewChanges = await this.doesLatestTaskCompletionHaveNewChanges()
							const lastCompletionResultMessage = findLast(this.clineMessages, (m) => m.say === "completion_result")
							if (
								lastCompletionResultMessage &&
								hasNewChanges &&
								!lastCompletionResultMessage.text?.endsWith(COMPLETION_RESULT_CHANGES_FLAG)
							) {
								lastCompletionResultMessage.text += COMPLETION_RESULT_CHANGES_FLAG
							}
							await this.saveClineMessagesAndUpdateHistory()
						}

						try {
							const lastMessage = this.clineMessages.at(-1)
							if (block.partial) {
								if (command) {
									// attempt_completion 文本已完成，现在我们正在获取命令
									// 删除先前的部分 attempt_completion ask，替换为 say，将状态发布到 webview，然后流式传输命令

									// const secondLastMessage = this.clineMessages.at(-2)
									// 注意：我们不希望自动批准作为 attempt_completion 工具一部分运行的命令
									if (lastMessage && lastMessage.ask === "command") {
										// 更新命令
										await this.ask("command", removeClosingTag("command", command), block.partial).catch(
											() => {},
										)
									} else {
										// 最后一条消息是 completion_result
										// 我们有命令字符串，这意味着我们也有结果，所以完成它（它不必已经存在）
										await this.say("completion_result", removeClosingTag("result", result), undefined, false)
										await this.saveCheckpoint(true)
										await addNewChangesFlagToLastCompletionResultMessage()
										await this.ask("command", removeClosingTag("command", command), block.partial).catch(
											() => {},
										)
									}
								} else {
									// 没有命令，仍在输出部分结果
									await this.say(
										"completion_result",
										removeClosingTag("result", result),
										undefined,
										block.partial,
									)
								}
								break
							} else {
								if (!result) {
									this.consecutiveMistakeCount++
									pushToolResult(await this.sayAndCreateMissingParamError("attempt_completion", "result"))
									break
								}
								this.consecutiveMistakeCount = 0

								if (this.autoApprovalSettings.enabled && this.autoApprovalSettings.enableNotifications) {
									showSystemNotification({
										subtitle: "任务已完成",
										message: result.replace(/\n/g, " "),
									})
								}

								let commandResult: ToolResponse | undefined
								if (command) {
									if (lastMessage && lastMessage.ask !== "command") {
										// 尚未发送命令消息，因此首先发送 completion_result 然后发送命令
										await this.say("completion_result", result, undefined, false)
										await this.saveCheckpoint(true)
										await addNewChangesFlagToLastCompletionResultMessage()
										telemetryService.captureTaskCompleted(this.taskId)
									} else {
										// 我们已经发送了一条命令消息，这意味着完整的 completion 消息也已发送
										await this.saveCheckpoint(true)
									}

									// 完成命令消息
									const didApprove = await askApproval("command", command)
									if (!didApprove) {
										await this.saveCheckpoint()
										break
									}
									const [userRejected, execCommandResult] = await this.executeCommandTool(command!)
									if (userRejected) {
										this.didRejectTool = true
										pushToolResult(execCommandResult)
										await this.saveCheckpoint()
										break
									}
									// 用户没有拒绝，但命令可能有输出
									commandResult = execCommandResult
								} else {
									await this.say("completion_result", result, undefined, false)
									await this.saveCheckpoint(true)
									await addNewChangesFlagToLastCompletionResultMessage()
									telemetryService.captureTaskCompleted(this.taskId)
								}

								// 我们已经发送了 completion_result says，空字符串的 asks 会放弃对按钮和字段的控制
								const { response, text, images } = await this.ask("completion_result", "", false)
								if (response === "yesButtonClicked") {
									pushToolResult("") // 向递归循环发出停止信号（目前这永远不会发生，因为 yesButtonClicked 将触发一个新任务）
									break
								}
								await this.say("user_feedback", text ?? "", images)
								await this.saveCheckpoint()

								const toolResults: (Anthropic.TextBlockParam | Anthropic.ImageBlockParam)[] = []
								if (commandResult) {
									if (typeof commandResult === "string") {
										toolResults.push({
											type: "text",
											text: commandResult,
										})
									} else if (Array.isArray(commandResult)) {
										toolResults.push(...commandResult)
									}
								}
								toolResults.push({
									type: "text",
									text: `用户对结果提供了反馈。请考虑他们的输入以继续任务，然后再次尝试完成。\n<feedback>\n${text}\n</feedback>`,
								})
								toolResults.push(...formatResponse.imageBlocks(images))
								this.userMessageContent.push({
									type: "text",
									text: `${toolDescription()} 结果:`,
								})
								this.userMessageContent.push(...toolResults)

								//
								break
							}
						} catch (error) {
							await handleError("尝试完成", error)
							await this.saveCheckpoint()
							break
						}
					}
				}
				break
		}

		/*
		看到越界是正常的，这意味着下一个工具调用正在构建中，并准备好添加到 assistantMessageContent 以进行呈现。
		当您在此期间看到 UI 不活动时，这意味着某个工具在没有呈现任何 UI 的情况下中断了。例如，当 relpath 未定义时，write_to_file 工具会中断，对于无效的 relpath，它从未呈现 UI。
		*/
		this.presentAssistantMessageLocked = false // 这需要放在这里，否则下面调用 this.presentAssistantMessage 会（有时）因为被锁定而失败
		// 注意：当工具被拒绝时，迭代器流会中断并等待 userMessageContentReady 为 true。未来的 present 调用将跳过执行，因为 didRejectTool 并迭代直到 contentIndex 设置为消息长度，并且它自己将 userMessageContentReady 设置为 true（而不是在迭代器中抢先执行）
		if (!block.partial || this.didRejectTool || this.didAlreadyUseTool) {
			// 块已完成流式传输和执行
			if (this.currentStreamingContentIndex === this.assistantMessageContent.length - 1) {
				// 如果我们增加 !didCompleteReadingStream 也没关系，它只会因为越界而返回，并且随着流式传输的继续，如果新块准备就绪，它将调用 presentAssistantMessage。如果流式传输完成，则当越界时我们将 userMessageContentReady 设置为 true。这优雅地允许流继续进行并呈现所有潜在的内容块。
				// 最后一个块已完成并且已执行完毕
				this.userMessageContentReady = true // 将允许 pwaitfor 继续
			}

			// 如果存在下一个块则调用它（如果不存在，则读取流将在准备就绪时调用它）
			this.currentStreamingContentIndex++ // 无论如何都需要增加，因此当读取流再次调用此函数时，它将流式传输下一个块

			if (this.currentStreamingContentIndex < this.assistantMessageContent.length) {
				// 已经有更多的内容块要流式传输，所以我们将自己调用这个函数
				// await this.presentAssistantContent()

				this.presentAssistantMessage()
				return
			}
		}
		// 块是部分的，但读取流可能已经完成
		if (this.presentAssistantMessageHasPendingUpdates) {
			this.presentAssistantMessage()
		}
	}

	async recursivelyMakeClineRequests(userContent: UserContent, includeFileDetails: boolean = false): Promise<boolean> {
		if (this.abort) {
			throw new Error("Cline 实例已中止")
		}

		// 用于了解任务中使用了哪些模型，以便用户在需要导出元数据以进行错误报告时使用
		const currentProviderId = (await getGlobalState(this.getContext(), "apiProvider")) as string
		if (currentProviderId && this.api.getModel().id) {
			try {
				await this.modelContextTracker.recordModelUsage(currentProviderId, this.api.getModel().id, this.chatSettings.mode)
			} catch {}
		}

		if (this.consecutiveMistakeCount >= 3) {
			if (this.autoApprovalSettings.enabled && this.autoApprovalSettings.enableNotifications) {
				showSystemNotification({
					subtitle: "错误",
					message: "Cline 遇到了麻烦。您想继续执行任务吗？",
				})
			}
			const { response, text, images } = await this.ask(
				"mistake_limit_reached",
				this.api.getModel().id.includes("claude")
					? `这可能表明其思考过程失败或无法正确使用工具，可以通过一些用户指导来缓解（例如，“尝试将任务分解为更小的步骤”）。`
					: "Cline 使用复杂的提示和迭代任务执行，这对于能力较弱的模型可能具有挑战性。为获得最佳结果，建议使用 Claude 3.7 Sonnet，因为它具有先进的代理编码能力。",
			)
			if (response === "messageResponse") {
				userContent.push(
					...[
						{
							type: "text",
							text: formatResponse.tooManyMistakes(text),
						} as Anthropic.Messages.TextBlockParam,
						...formatResponse.imageBlocks(images),
					],
				)
			}
			this.consecutiveMistakeCount = 0
		}

		if (
			this.autoApprovalSettings.enabled &&
			this.consecutiveAutoApprovedRequestsCount >= this.autoApprovalSettings.maxRequests
		) {
			if (this.autoApprovalSettings.enableNotifications) {
				showSystemNotification({
					subtitle: "已达到最大请求数",
					message: `Cline 已自动批准 ${this.autoApprovalSettings.maxRequests.toString()} 个 API 请求。`,
				})
			}
			await this.ask(
				"auto_approval_max_req_reached",
				`Cline 已自动批准 ${this.autoApprovalSettings.maxRequests.toString()} 个 API 请求。您想重置计数并继续执行任务吗？`,
			)
			// 如果我们通过了 promise，则意味着用户已批准并且没有开始新任务
			this.consecutiveAutoApprovedRequestsCount = 0
		}

		// 获取先前 api 请求的索引以检查令牌使用情况并确定是否需要截断对话历史记录
		const previousApiReqIndex = findLastIndex(this.clineMessages, (m) => m.say === "api_req_started")

		// 如果是第一个 API 请求，则保存检查点
		const isFirstRequest = this.clineMessages.filter((m) => m.say === "api_req_started").length === 0

		// 获取详细信息是一项昂贵的操作，它使用 globby 自上而下构建项目的文件结构，对于大型项目可能需要几秒钟
		// 为了获得最佳用户体验，我们在此过程中显示一个带有加载指示器的占位符 api_req_started 消息
		await this.say(
			"api_req_started",
			JSON.stringify({
				request: userContent.map((block) => formatContentBlockToMarkdown(block)).join("\n\n") + "\n\n加载中...",
			}),
		)

		// 如果已启用并且是第一个请求，则首先初始化检查点跟踪器
		if (isFirstRequest && this.enableCheckpoints && !this.checkpointTracker && !this.checkpointTrackerErrorMessage) {
			try {
				this.checkpointTracker = await pTimeout(
					CheckpointTracker.create(this.taskId, this.context.globalStorageUri.fsPath, this.enableCheckpoints),
					{
						milliseconds: 15_000,
						message:
							"检查点初始化时间过长。请考虑在使​​用 git 的项目中重新打开 Cline，或禁用检查点。",
					},
				)
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : "未知错误"
				console.error("初始化检查点跟踪器失败：", errorMessage)
				this.checkpointTrackerErrorMessage = errorMessage // 将立即显示，因为我们接下来会保存 saveClineMessages，它会将状态发布到 webview
			}
		}

		// 现在，如果是第一个请求并且检查点已启用并且跟踪器已成功初始化，则说“checkpoint_created”并执行提交。
		if (isFirstRequest && this.enableCheckpoints && this.checkpointTracker) {
			await this.say("checkpoint_created") // 现在这是有条件的
			const commitHash = await this.checkpointTracker.commit() // 实际提交
			const lastCheckpointMessage = findLast(this.clineMessages, (m) => m.say === "checkpoint_created")
			if (lastCheckpointMessage) {
				lastCheckpointMessage.lastCheckpointHash = commitHash
				// saveClineMessagesAndUpdateHistory 将在 API 响应后稍后调用，因此除非这是对此消息的唯一修改，否则无需在此处调用它。
				// 目前，假设稍后处理。
			}
		} else if (isFirstRequest && this.enableCheckpoints && !this.checkpointTracker && this.checkpointTrackerErrorMessage) {
			// 检查点已启用，但跟踪器初始化失败。
			// checkpointTrackerErrorMessage 已设置并将成为状态的一部分。
			// 此处没有明确的 UI 消息，错误消息将在 ExtensionState 中。
		}

		const [parsedUserContent, environmentDetails, clinerulesError] = await this.loadContext(userContent, includeFileDetails)

		// 如果用户使用 /newrule 命令并且其 .clinerules 是文件，则进行错误处理，因为文件读取操作无法正常工作
		if (clinerulesError === true) {
			await this.say(
				"error",
				"处理 /newrule 命令时出现问题。请仔细检查，如果“.clinerules”已存在，它是否是目录而不是文件。否则，引用此文件/目录时出现问题。",
			)
		}

		userContent = parsedUserContent
		// 将环境详细信息添加为其自己的文本块，与工具结果分开
		userContent.push({ type: "text", text: environmentDetails })

		await this.addToApiConversationHistory({
			role: "user",
			content: userContent,
		})

		telemetryService.captureConversationTurnEvent(this.taskId, currentProviderId, this.api.getModel().id, "user", true)

		// 由于我们在等待实际启动 API 请求（例如加载潜在详细信息）时发送了一个占位符 api_req_started 消息以更新 webview，因此我们需要更新该消息的文本
		const lastApiReqIndex = findLastIndex(this.clineMessages, (m) => m.say === "api_req_started")
		this.clineMessages[lastApiReqIndex].text = JSON.stringify({
			request: userContent.map((block) => formatContentBlockToMarkdown(block)).join("\n\n"),
		} satisfies ClineApiReqInfo)
		await this.saveClineMessagesAndUpdateHistory()
		await this.postStateToWebview()

		try {
			let cacheWriteTokens = 0
			let cacheReadTokens = 0
			let inputTokens = 0
			let outputTokens = 0
			let totalCost: number | undefined

			// 更新 api_req_started。我们不能再使用 api_req_finished，因为它是一种特殊情况，它可能出现在流式消息之后（即在更新或执行过程中）
			// 幸运的是，api_req_finished 总是为 GUI 解析出来，因此它仅用于遗留目的，以跟踪历史任务中的价格
			// （几个月后值得删除）
			const updateApiReqMsg = (cancelReason?: ClineApiReqCancelReason, streamingFailedMessage?: string) => {
				const currentApiReqInfo: ClineApiReqInfo = JSON.parse(this.clineMessages[lastApiReqIndex].text || "{}")
				delete currentApiReqInfo.retryStatus // 请求最终确定后清除重试状态

				this.clineMessages[lastApiReqIndex].text = JSON.stringify({
					...currentApiReqInfo, // 传播修改后的信息（已删除 retryStatus）
					tokensIn: inputTokens,
					tokensOut: outputTokens,
					cacheWrites: cacheWriteTokens,
					cacheReads: cacheReadTokens,
					cost:
						totalCost ??
						calculateApiCostAnthropic(
							this.api.getModel().info,
							inputTokens,
							outputTokens,
							cacheWriteTokens,
							cacheReadTokens,
						),
					cancelReason,
					streamingFailedMessage,
				} satisfies ClineApiReqInfo)
			}

			const abortStream = async (cancelReason: ClineApiReqCancelReason, streamingFailedMessage?: string) => {
				if (this.diffViewProvider.isEditing) {
					await this.diffViewProvider.revertChanges() // 关闭差异视图
				}

				// 如果最后一条消息是部分的，我们需要更新并保存它
				const lastMessage = this.clineMessages.at(-1)
				if (lastMessage && lastMessage.partial) {
					// 不要更新 ts，因为它用作 virtuoso 列表的键
					lastMessage.partial = false
					// 我们不流式传输 partialMessage 事件，而是像往常一样保存并发布以持久化到磁盘
					console.log("更新部分消息", lastMessage)
					// await this.saveClineMessagesAndUpdateHistory()
				}

				// 让助手知道他们的响应在任务恢复时被中断了
				await this.addToApiConversationHistory({
					role: "assistant",
					content: [
						{
							type: "text",
							text:
								assistantMessage +
								`\n\n[${
									cancelReason === "streaming_failed"
										? "响应因 API 错误而中断"
										: "响应被用户中断"
								}]`,
						},
					],
				})

				// 更新 api_req_started 以包含已取消和成本，以便我们可以显示部分流的成本
				updateApiReqMsg(cancelReason, streamingFailedMessage)
				await this.saveClineMessagesAndUpdateHistory()

				telemetryService.captureConversationTurnEvent(
					this.taskId,
					currentProviderId,
					this.api.getModel().id,
					"assistant",
					true,
				)

				// 向提供程序发出信号，表明它可以从磁盘检索保存的消息，因为 abortTask 本质上不能被等待
				this.didFinishAbortingStream = true
			}

			// 重置流状态
			this.currentStreamingContentIndex = 0
			this.assistantMessageContent = []
			this.didCompleteReadingStream = false
			this.userMessageContent = []
			this.userMessageContentReady = false
			this.didRejectTool = false
			this.didAlreadyUseTool = false
			this.presentAssistantMessageLocked = false
			this.presentAssistantMessageHasPendingUpdates = false
			this.didAutomaticallyRetryFailedApiRequest = false
			await this.diffViewProvider.reset()

			const stream = this.attemptApiRequest(previousApiReqIndex) // 仅当第一个块成功时才产生，否则将允许用户重试请求（很可能是由于速率限制错误，该错误在第一个块上抛出）
			let assistantMessage = ""
			let reasoningMessage = ""
			this.isStreaming = true
			let didReceiveUsageChunk = false
			try {
				for await (const chunk of stream) {
					if (!chunk) {
						continue
					}
					switch (chunk.type) {
						case "usage":
							didReceiveUsageChunk = true
							inputTokens += chunk.inputTokens
							outputTokens += chunk.outputTokens
							cacheWriteTokens += chunk.cacheWriteTokens ?? 0
							cacheReadTokens += chunk.cacheReadTokens ?? 0
							totalCost = chunk.totalCost
							break
						case "reasoning":
							// 推理将始终在助手消息之前
							reasoningMessage += chunk.reasoning
							// 修复了取消任务 > 中止任务 > for 循环可能在流式传输推理过程中 > say 函数在​​我们有机会正确清理和取消任务之前抛出错误的 bug。
							if (!this.abort) {
								await this.say("reasoning", reasoningMessage, undefined, true)
							}
							break
						case "text":
							if (reasoningMessage && assistantMessage.length === 0) {
								// 完成推理消息
								await this.say("reasoning", reasoningMessage, undefined, false)
							}
							assistantMessage += chunk.text
							// 将原始助手消息解析为内容块
							const prevLength = this.assistantMessageContent.length
							this.assistantMessageContent = parseAssistantMessageV2(assistantMessage)
							if (this.assistantMessageContent.length > prevLength) {
								this.userMessageContentReady = false // 我们需要呈现的新内容，如果先前的内容将其设置为 true，则重置为 false
							}
							// 向用户呈现内容
							this.presentAssistantMessage()
							break
					}

					if (this.abort) {
						console.log("正在中止流...")
						if (!this.abandoned) {
							// 仅当此实例未被放弃时才需要正常中止（有时 openrouter 流会挂起，在这种情况下会影响 cline 的未来实例）
							await abortStream("user_cancelled")
						}
						break // 中止流
					}

					if (this.didRejectTool) {
						// userContent 有一个工具拒绝，因此中断助手的响应以呈现用户的反馈
						assistantMessage += "\n\n[响应被用户反馈中断]"
						// 我们不抢先设置它，而是允许 present 迭代器完成并在准备就绪时设置 userMessageContentReady
						break
					}

					// 先前：我们需要让请求完成，以便 openrouter 获取生成详细信息
					// 更新：以无法检索 API 成本为代价中断请求是更好的用户体验
					if (this.didAlreadyUseTool) {
						assistantMessage +=
							"\n\n[响应被工具使用结果中断。一次只能使用一个工具，并且应将其放在消息的末尾。]"
						break
					}
				}
			} catch (error) {
				// 当扩展不再等待 cline 实例完成中止时会发生放弃（当 for 循环中的任何函数由于 this.abort 而抛出错误时会在此处抛出错误）
				if (!this.abandoned) {
					this.abortTask() // 如果流失败，任务可能处于各种状态（即可能已经流式传输了用户可能已执行的一些工具），因此我们只采取复制取消任务的方法
					const errorMessage = this.formatErrorWithStatusCode(error)

					await abortStream("streaming_failed", errorMessage)
					await this.reinitExistingTaskFromId(this.taskId)
				}
			} finally {
				this.isStreaming = false
			}

			// OpenRouter/Cline 可能不会在流中返回令牌使用情况（因为它可能会提前中止），因此我们在流完成后获取
			// （下面的 updateApiReq 将使用使用详细信息更新 api_req_started 消息。我们异步执行此操作，以便它在后台更新 api_req_started 消息）
			if (!didReceiveUsageChunk) {
				this.api.getApiStreamUsage?.().then(async (apiStreamUsage) => {
					if (apiStreamUsage) {
						inputTokens += apiStreamUsage.inputTokens
						outputTokens += apiStreamUsage.outputTokens
						cacheWriteTokens += apiStreamUsage.cacheWriteTokens ?? 0
						cacheReadTokens += apiStreamUsage.cacheReadTokens ?? 0
						totalCost = apiStreamUsage.totalCost
					}
					updateApiReqMsg()
					await this.saveClineMessagesAndUpdateHistory()
					await this.postStateToWebview()
				})
			}

			// 如果流被中止，需要在此处调用
			if (this.abort) {
				throw new Error("Cline 实例已中止")
			}

			this.didCompleteReadingStream = true

			// 将任何块设置为完成，以允许 presentAssistantMessage 完成并将 userMessageContentReady 设置为 true
			// （可能是一个没有后续工具使用的文本块，或者是一个位于最末尾的文本块，或者是一个无效的工具使用等。无论如何，presentAssistantMessage 依赖于这些块要么完成，要么用户拒绝一个块才能继续并最终将 userMessageContentReady 设置为 true）
			const partialBlocks = this.assistantMessageContent.filter((block) => block.partial)
			partialBlocks.forEach((block) => {
				block.partial = false
			})
			// this.assistantMessageContent.forEach((e) => (e.partial = false)) // 不能这样做，因为工具可能正在执行中 ()
			if (partialBlocks.length > 0) {
				this.presentAssistantMessage() // 如果有内容要更新，它将完成并将 this.userMessageContentReady 更新为 true，我们在发出下一个请求之前等待它。所有这些实际上只是呈现我们刚刚设置为完成的最后一条部分消息
			}

			updateApiReqMsg()
			await this.saveClineMessagesAndUpdateHistory()
			await this.postStateToWebview()

			// 现在添加到 apiconversationhistory
			// 在继续使用工具之前需要将助手响应保存到文件，因为用户随时可能退出，我们将无法保存助手的响应
			let didEndLoop = false
			if (assistantMessage.length > 0) {
				telemetryService.captureConversationTurnEvent(
					this.taskId,
					currentProviderId,
					this.api.getModel().id,
					"assistant",
					true,
				)

				await this.addToApiConversationHistory({
					role: "assistant",
					content: [{ type: "text", text: assistantMessage }],
				})

				// 注意：此注释供将来参考 - 这是 userMessageContent 未设置为 true 的一种解决方法。这是因为它在 didRejectTool 时没有递归调用部分块，因此它会卡住等待部分块完成才能继续。
				// 以防内容块完成
				// API 流可能在最后一个解析的内容块执行后完成，因此我们能够检测到越界并将 userMessageContentReady 设置为 true（注意，您不应调用 presentAssistantMessage，因为如果最后一个块已完成，它将再次呈现）
				// const completeBlocks = this.assistantMessageContent.filter((block) => !block.partial) // 如果在流结束后有任何部分块，我们可以认为它们无效
				// if (this.currentStreamingContentIndex >= completeBlocks.length) {
				// 	this.userMessageContentReady = true
				// }

				await pWaitFor(() => this.userMessageContentReady)

				// 如果模型没有使用工具，那么我们需要告诉它要么使用工具，要么尝试完成
				const didToolUse = this.assistantMessageContent.some((block) => block.type === "tool_use")

				if (!didToolUse) {
					// 需要使用工具的正常请求
					this.userMessageContent.push({
						type: "text",
						text: formatResponse.noToolsUsed(),
					})
					this.consecutiveMistakeCount++
				}

				const recDidEndLoop = await this.recursivelyMakeClineRequests(this.userMessageContent)
				didEndLoop = recDidEndLoop
			} else {
				// 如果没有 assistant_responses，这意味着我们没有从 API 获取任何文本或 tool_use 内容块，我们应该假定这是一个错误
				await this.say(
					"error",
					"意外的 API 响应：语言模型未提供任何助手消息。这可能表示 API 或模型的输出存在问题。",
				)
				await this.addToApiConversationHistory({
					role: "assistant",
					content: [
						{
							type: "text",
							text: "失败：我没有提供响应。",
						},
					],
				})
			}

			return didEndLoop // 目前将始终为 false
		} catch (error) {
			// 这不应该发生，因为唯一可能抛出错误的是 attemptApiRequest，它被包装在一个 try catch 中，该 try catch 发送一个 ask，如果 noButtonClicked，将清除当前任务并销毁此实例。但是，为了避免未处理的 promise 拒绝，我们将结束此循环，这将结束此实例的执行（请参阅 startTask）
			return true // 需要为 true，以便父循环知道结束任务
		}
	}

	async loadContext(userContent: UserContent, includeFileDetails: boolean = false): Promise<[UserContent, string, boolean]> {
		// 跟踪是否需要检查 clinerulesFile
		let needsClinerulesFileCheck = false

		const workflowToggles = await refreshWorkflowToggles(this.getContext(), cwd)

		const processUserContent = async () => {
			// 这是一种从工具结果中动态加载上下文提及的临时解决方案。它检查是否存在指示工具被拒绝并提供了反馈的标签（请参阅 formatToolDeniedFeedback、attemptCompletion、executeCommand 和 consecutiveMistakeCount >= 3）或“<answer>”（请参阅 askFollowupQuestion），我们将所有用户生成的内容放在这些标签中，以便它们可以有效地用作我们应该解析提及的标记）。但是，如果我们将来允许多个工具响应，我们将需要专门在用户内容标签中解析提及。
			// （注意：这导致了 @/ 导入别名错误，其中文件内容也被解析，因为 v2 将工具结果转换为文本块）
			return await Promise.all(
				userContent.map(async (block) => {
					if (block.type === "text") {
						// 我们需要确保任何用户生成的内容都包含在这些标签之一中，以便我们知道要解析提及
						// FIXME：仅解析这些标签之间的文本，而不是可能包含其他工具结果的整个文本块。这是我们首先不应该使用正则表达式解析提及（即对于文件路径包含空格的情况）这一更大问题的一部分
						if (
							block.text.includes("<feedback>") ||
							block.text.includes("<answer>") ||
							block.text.includes("<task>") ||
							block.text.includes("<user_message>")
						) {
							const parsedText = await parseMentions(
								block.text,
								cwd,
								this.urlContentFetcher,
								this.fileContextTracker,
							)

							// 解析斜杠命令时，我们仍然希望允许用户提供他们期望的上下文
							const { processedText, needsClinerulesFileCheck: needsCheck } = await parseSlashCommands(
								parsedText,
								workflowToggles,
							)

							if (needsCheck) {
								needsClinerulesFileCheck = true
							}

							return {
								...block,
								text: processedText,
							}
						}
					}
					return block
				}),
			)
		}

		// 并行运行初始 promise
		const [processedUserContent, environmentDetails] = await Promise.all([
			processUserContent(),
			this.getEnvironmentDetails(includeFileDetails),
		])

		// 处理内容后，如果需要，检查 clinerulesData
		let clinerulesError = false
		if (needsClinerulesFileCheck) {
			clinerulesError = await ensureLocalClineDirExists(cwd, GlobalFileNames.clineRules)
		}

		// 返回所有结果
		return [processedUserContent, environmentDetails, clinerulesError]
	}

	async getEnvironmentDetails(includeFileDetails: boolean = false) {
		let details = ""

		// 让 cline 知道用户是否在消息之间从一个或没有文件切换到另一个文件可能很有用，因此我们始终包含此上下文
		details += "\n\n# VSCode 可见文件"
		const visibleFilePaths = vscode.window.visibleTextEditors
			?.map((editor) => editor.document?.uri?.fsPath)
			.filter(Boolean)
			.map((absolutePath) => path.relative(cwd, absolutePath))

		// 通过 clineIgnoreController 过滤路径
		const allowedVisibleFiles = this.clineIgnoreController
			.filterPaths(visibleFilePaths)
			.map((p) => p.toPosix())
			.join("\n")

		if (allowedVisibleFiles) {
			details += `\n${allowedVisibleFiles}`
		} else {
			details += "\n(没有可见文件)"
		}

		details += "\n\n# VSCode 打开的选项卡"
		const openTabPaths = vscode.window.tabGroups.all
			.flatMap((group) => group.tabs)
			.map((tab) => (tab.input as vscode.TabInputText)?.uri?.fsPath)
			.filter(Boolean)
			.map((absolutePath) => path.relative(cwd, absolutePath))

		// 通过 clineIgnoreController 过滤路径
		const allowedOpenTabs = this.clineIgnoreController
			.filterPaths(openTabPaths)
			.map((p) => p.toPosix())
			.join("\n")

		if (allowedOpenTabs) {
			details += `\n${allowedOpenTabs}`
		} else {
			details += "\n(没有打开的选项卡)"
		}

		const busyTerminals = this.terminalManager.getTerminals(true)
		const inactiveTerminals = this.terminalManager.getTerminals(false)
		// const allTerminals = [...busyTerminals, ...inactiveTerminals]

		if (busyTerminals.length > 0 && this.didEditFile) {
			//  || this.didEditFile
			await setTimeoutPromise(300) // 保存文件后延迟以使终端赶上
		}

		// let terminalWasBusy = false
		if (busyTerminals.length > 0) {
			// 等待终端冷却
			// terminalWasBusy = allTerminals.some((t) => this.terminalManager.isProcessHot(t.id))
			await pWaitFor(() => busyTerminals.every((t) => !this.terminalManager.isProcessHot(t.id)), {
				interval: 100,
				timeout: 15_000,
			}).catch(() => {})
		}

		// 我们希望在终端冷却后获取诊断信息，原因有几个：终端可能正在搭建项目，开发服务器（如 webpack 等编译器）会首先重新编译然后发送诊断信息等
		/*
		let diagnosticsDetails = ""
		const diagnostics = await this.diagnosticsMonitor.getCurrentDiagnostics(this.didEditFile || terminalWasBusy) // 如果 cline 运行了命令（例如 npm install）或编辑了工作区，则等待一段时间以获取更新的诊断信息
		for (const [uri, fileDiagnostics] of diagnostics) {
			const problems = fileDiagnostics.filter((d) => d.severity === vscode.DiagnosticSeverity.Error)
			if (problems.length > 0) {
				diagnosticsDetails += `\n## ${path.relative(cwd, uri.fsPath)}`
				for (const diagnostic of problems) {
					// let severity = diagnostic.severity === vscode.DiagnosticSeverity.Error ? "Error" : "Warning"
					const line = diagnostic.range.start.line + 1 // VSCode 行是 0 索引的
					const source = diagnostic.source ? `[${diagnostic.source}] ` : ""
					diagnosticsDetails += `\n- ${source}Line ${line}: ${diagnostic.message}`
				}
			}
		}
		*/
		this.didEditFile = false // 重置，这让我们知道何时等待保存的文件更新终端

		// 等待更新的诊断信息使终端输出尽可能最新
		let terminalDetails = ""
		if (busyTerminals.length > 0) {
			// 终端已冷却，让我们检索它们的输出
			terminalDetails += "\n\n# 活动运行的终端"
			for (const busyTerminal of busyTerminals) {
				terminalDetails += `\n## 原始命令: \`${busyTerminal.lastCommand}\``
				const newOutput = this.terminalManager.getUnretrievedOutput(busyTerminal.id)
				if (newOutput) {
					terminalDetails += `\n### 新输出\n${newOutput}`
				} else {
					// details += `\n(Still running, no new output)` // 不希望在运行命令后立即显示此内容
				}
			}
		}
		// 仅当有输出要显示时才显示非活动终端
		if (inactiveTerminals.length > 0) {
			const inactiveTerminalOutputs = new Map<number, string>()
			for (const inactiveTerminal of inactiveTerminals) {
				const newOutput = this.terminalManager.getUnretrievedOutput(inactiveTerminal.id)
				if (newOutput) {
					inactiveTerminalOutputs.set(inactiveTerminal.id, newOutput)
				}
			}
			if (inactiveTerminalOutputs.size > 0) {
				terminalDetails += "\n\n# 非活动终端"
				for (const [terminalId, newOutput] of inactiveTerminalOutputs) {
					const inactiveTerminal = inactiveTerminals.find((t) => t.id === terminalId)
					if (inactiveTerminal) {
						terminalDetails += `\n## ${inactiveTerminal.lastCommand}`
						terminalDetails += `\n### 新输出\n${newOutput}`
					}
				}
			}
		}

		// details += "\n\n# VSCode 工作区错误"
		// if (diagnosticsDetails) {
		// 	details += diagnosticsDetails
		// } else {
		// 	details += "\n(未检测到错误)"
		// }

		if (terminalDetails) {
			details += terminalDetails
		}

		// 添加最近修改的文件部分
		const recentlyModifiedFiles = this.fileContextTracker.getAndClearRecentlyModifiedFiles()
		if (recentlyModifiedFiles.length > 0) {
			details +=
				"\n\n# 最近修改的文件\n自您上次访问这些文件以来，这些文件已被修改（文件刚刚编辑过，因此您可能需要在编辑之前重新阅读）："
			for (const filePath of recentlyModifiedFiles) {
				details += `\n${filePath}`
			}
		}

		// 添加带时区的当前时间信息
		const now = new Date()
		const formatter = new Intl.DateTimeFormat(undefined, {
			year: "numeric",
			month: "numeric",
			day: "numeric",
			hour: "numeric",
			minute: "numeric",
			second: "numeric",
			hour12: true,
		})
		const timeZone = formatter.resolvedOptions().timeZone
		const timeZoneOffset = -now.getTimezoneOffset() / 60 // 转换为小时并反转符号以匹配常规表示法
		const timeZoneOffsetStr = `${timeZoneOffset >= 0 ? "+" : ""}${timeZoneOffset}:00`
		details += `\n\n# 当前时间\n${formatter.format(now)} (${timeZone}, UTC${timeZoneOffsetStr})`

		if (includeFileDetails) {
			details += `\n\n# 当前工作目录 (${cwd.toPosix()}) 文件\n`
			const isDesktop = arePathsEqual(cwd, path.join(os.homedir(), "Desktop"))
			if (isDesktop) {
				// 不希望立即访问桌面，因为它会显示权限弹出窗口
				details += "（桌面文件不会自动显示。如果需要，请使用 list_files 进行浏览。）"
			} else {
				const [files, didHitLimit] = await listFiles(cwd, true, 200)
				const result = formatResponse.formatFilesList(cwd, files, didHitLimit, this.clineIgnoreController)
				details += result
			}
		}

		// 添加上下文窗口使用信息
		const { contextWindow, maxAllowedSize } = getContextWindowInfo(this.api)

		// 从最近的 API 请求中获取令牌计数以准确反映上下文管理
		const getTotalTokensFromApiReqMessage = (msg: ClineMessage) => {
			if (!msg.text) {
				return 0
			}
			try {
				const { tokensIn, tokensOut, cacheWrites, cacheReads } = JSON.parse(msg.text)
				return (tokensIn || 0) + (tokensOut || 0) + (cacheWrites || 0) + (cacheReads || 0)
			} catch (e) {
				return 0
			}
		}

		const modifiedMessages = combineApiRequests(combineCommandSequences(this.clineMessages.slice(1)))
		const lastApiReqMessage = findLast(modifiedMessages, (msg) => {
			if (msg.say !== "api_req_started") {
				return false
			}
			return getTotalTokensFromApiReqMessage(msg) > 0
		})

		const lastApiReqTotalTokens = lastApiReqMessage ? getTotalTokensFromApiReqMessage(lastApiReqMessage) : 0
		const usagePercentage = Math.round((lastApiReqTotalTokens / contextWindow) * 100)

		details += "\n\n# 上下文窗口使用情况"
		details += `\n${lastApiReqTotalTokens.toLocaleString()} / ${(contextWindow / 1000).toLocaleString()}K 令牌已使用 (${usagePercentage}%)`

		details += "\n\n# 当前模式"
		if (this.chatSettings.mode === "plan") {
			details += "\nPLAN MODE\n" + formatResponse.planModeInstructions()
		} else {
			details += "\nACT MODE"
		}

		return `<environment_details>\n${details.trim()}\n</environment_details>`
	}
}
