import { Client } from "@modelcontextprotocol/sdk/client/index.js"
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js"
import {
	CallToolResultSchema,
	ListResourcesResultSchema,
	ListResourceTemplatesResultSchema,
	ListToolsResultSchema,
	ReadResourceResultSchema,
} from "@modelcontextprotocol/sdk/types.js"
import chokidar, { FSWatcher } from "chokidar"
import { setTimeout as setTimeoutPromise } from "node:timers/promises"
import deepEqual from "fast-deep-equal"
import * as fs from "fs/promises"
import * as path from "path"
import * as vscode from "vscode"
import { z } from "zod"
import {
	DEFAULT_MCP_TIMEOUT_SECONDS,
	McpMode,
	McpResource,
	McpResourceResponse,
	McpResourceTemplate,
	McpServer,
	McpTool,
	McpToolCallResponse,
	MIN_MCP_TIMEOUT_SECONDS,
} from "@shared/mcp"
import { fileExistsAtPath } from "@utils/fs"
import { arePathsEqual } from "@utils/path"
import { secondsToMs } from "@utils/time"
import { GlobalFileNames } from "@core/storage/disk"
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js"
import { ExtensionMessage } from "@shared/ExtensionMessage"

// 内部 MCP 数据请求的默认超时时间（毫秒）；与存储为 DEFAULT_MCP_TIMEOUT_SECONDS 的面向用户的超时不同
const DEFAULT_REQUEST_TIMEOUT_MS = 5000

export type McpConnection = {
	server: McpServer
	client: Client
	transport: StdioClientTransport | SSEClientTransport
}

export type McpTransportType = "stdio" | "sse"

export type McpServerConfig = z.infer<typeof ServerConfigSchema>

const AutoApproveSchema = z.array(z.string()).default([])

const BaseConfigSchema = z.object({
	autoApprove: AutoApproveSchema.optional(),
	disabled: z.boolean().optional(),
	timeout: z.number().min(MIN_MCP_TIMEOUT_SECONDS).optional().default(DEFAULT_MCP_TIMEOUT_SECONDS),
})

const SseConfigSchema = BaseConfigSchema.extend({
	url: z.string().url(),
}).transform((config) => ({
	...config,
	transportType: "sse" as const,
}))

const StdioConfigSchema = BaseConfigSchema.extend({
	command: z.string(),
	args: z.array(z.string()).optional(),
	env: z.record(z.string()).optional(),
}).transform((config) => ({
	...config,
	transportType: "stdio" as const,
}))

const ServerConfigSchema = z.union([StdioConfigSchema, SseConfigSchema])

const McpSettingsSchema = z.object({
	mcpServers: z.record(ServerConfigSchema),
})

export class McpHub {
	getMcpServersPath: () => Promise<string>
	private getSettingsDirectoryPath: () => Promise<string>
	private postMessageToWebview: (message: ExtensionMessage) => Promise<void>
	private clientVersion: string

	private disposables: vscode.Disposable[] = []
	private settingsWatcher?: vscode.FileSystemWatcher
	private fileWatchers: Map<string, FSWatcher> = new Map()
	connections: McpConnection[] = []
	isConnecting: boolean = false // 是否正在连接

	constructor(
		getMcpServersPath: () => Promise<string>,
		getSettingsDirectoryPath: () => Promise<string>,
		postMessageToWebview: (message: ExtensionMessage) => Promise<void>,
		clientVersion: string,
	) {
		this.getMcpServersPath = getMcpServersPath
		this.getSettingsDirectoryPath = getSettingsDirectoryPath
		this.postMessageToWebview = postMessageToWebview
		this.clientVersion = clientVersion
		this.watchMcpSettingsFile() // 监视 MCP 配置文件
		this.initializeMcpServers() // 初始化 MCP 服务器
	}

	getServers(): McpServer[] {
		// 仅返回启用的服务器
		return this.connections.filter((conn) => !conn.server.disabled).map((conn) => conn.server)
	}

	async getMcpSettingsFilePath(): Promise<string> {
		const mcpSettingsFilePath = path.join(await this.getSettingsDirectoryPath(), GlobalFileNames.mcpSettings)
		const fileExists = await fileExistsAtPath(mcpSettingsFilePath)
		if (!fileExists) {
			await fs.writeFile(
				mcpSettingsFilePath,
				`{
  "mcpServers": {
    
  }
}`,
			)
		}
		return mcpSettingsFilePath
	}

	private async readAndValidateMcpSettingsFile(): Promise<z.infer<typeof McpSettingsSchema> | undefined> {
		try {
			const settingsPath = await this.getMcpSettingsFilePath()
			const content = await fs.readFile(settingsPath, "utf-8")

			let config: any

			// 解析 JSON 文件内容
			try {
				config = JSON.parse(content)
			} catch (error) {
				vscode.window.showErrorMessage(
					"MCP 设置格式无效。请确保您的设置遵循正确的 JSON 格式。",
				)
				return undefined
			}

			// 根据模式验证
			const result = McpSettingsSchema.safeParse(config)
			if (!result.success) {
				vscode.window.showErrorMessage("MCP 设置模式无效。")
				return undefined
			}

			return result.data
		} catch (error) {
			console.error("读取 MCP 设置失败：", error)
			return undefined
		}
	}

	private async watchMcpSettingsFile(): Promise<void> {
		const settingsPath = await this.getMcpSettingsFilePath()
		this.disposables.push(
			vscode.workspace.onDidSaveTextDocument(async (document) => {
				if (arePathsEqual(document.uri.fsPath, settingsPath)) {
					const settings = await this.readAndValidateMcpSettingsFile()
					if (settings) {
						try {
							vscode.window.showInformationMessage("正在更新 MCP 服务器...")
							await this.updateServerConnections(settings.mcpServers)
							vscode.window.showInformationMessage("MCP 服务器已更新")
						} catch (error) {
							console.error("处理 MCP 设置更改失败：", error)
						}
					}
				}
			}),
		)
	}

	private async initializeMcpServers(): Promise<void> {
		const settings = await this.readAndValidateMcpSettingsFile()
		if (settings) {
			await this.updateServerConnections(settings.mcpServers)
		}
	}

	private async connectToServer(
		name: string,
		config: z.infer<typeof StdioConfigSchema> | z.infer<typeof SseConfigSchema>,
	): Promise<void> {
		// 如果存在现有连接，则将其删除（这不应该发生，连接应该事先删除）
		this.connections = this.connections.filter((conn) => conn.server.name !== name)

		try {
			// 每个 MCP 服务器都需要自己的传输连接，并具有独特的功能、配置和错误处理。拥有独立的客户端还允许对资源/工具进行适当的作用域划分以及独立的服务器管理（如重新连接）。
			const client = new Client(
				{
					name: "Cline", // 客户端名称，保持英文
					version: this.clientVersion,
				},
				{
					capabilities: {},
				},
			)

			let transport: StdioClientTransport | SSEClientTransport

			if (config.transportType === "sse") {
				transport = new SSEClientTransport(new URL(config.url), {})
			} else {
				transport = new StdioClientTransport({
					command: config.command,
					args: config.args,
					env: {
						...config.env,
						...(process.env.PATH ? { PATH: process.env.PATH } : {}),
						// ...(process.env.NODE_PATH ? { NODE_PATH: process.env.NODE_PATH } : {}),
					},
					stderr: "pipe", // stderr 可用所必需
				})
			}

			transport.onerror = async (error) => {
				console.error(`服务器 "${name}" 的传输错误：`, error)
				const connection = this.connections.find((conn) => conn.server.name === name)
				if (connection) {
					connection.server.status = "disconnected"
					this.appendErrorMessage(connection, error.message)
				}
				await this.notifyWebviewOfServerChanges()
			}

			transport.onclose = async () => {
				const connection = this.connections.find((conn) => conn.server.name === name)
				if (connection) {
					connection.server.status = "disconnected"
				}
				await this.notifyWebviewOfServerChanges()
			}

			const connection: McpConnection = {
				server: {
					name,
					config: JSON.stringify(config),
					status: "connecting", // 状态标识符，保持英文
					disabled: config.disabled,
				},
				client,
				transport,
			}
			this.connections.push(connection)

			if (config.transportType === "stdio") {
				// transport.stderr 仅在进程启动后可用。但是，我们无法将其与 .connect() 调用分开启动，因为它也会启动传输。而且我们不能在 connect 调用之后放置它，因为我们需要在建立连接之前捕获 stderr 流，以便捕获连接过程中的错误。
				// 作为一种解决方法，我们自己启动传输，然后对 start 方法进行猴子补丁以使其不执行任何操作，这样 .connect() 就不会尝试再次启动它。
				await transport.start()
				const stderrStream = (transport as StdioClientTransport).stderr
				if (stderrStream) {
					stderrStream.on("data", async (data: Buffer) => {
						const output = data.toString()
						// 检查输出是否包含 INFO 级别的日志
						const isInfoLog = !/\berror\b/i.test(output)

						if (isInfoLog) {
							// 记录正常的参考信息
							console.info(`服务器 "${name}" 信息：`, output)
						} else {
							// 视为错误日志
							console.error(`服务器 "${name}" stderr：`, output)
							const connection = this.connections.find((conn) => conn.server.name === name)
							if (connection) {
								this.appendErrorMessage(connection, output)
								// 仅当服务器已断开连接时才通知 webview
								if (connection.server.status === "disconnected") {
									await this.notifyWebviewOfServerChanges()
								}
							}
						}
					})
				} else {
					console.error(`服务器 ${name} 没有 stderr 流`)
				}
				transport.start = async () => {} // 现在不执行任何操作，.connect() 不会失败
			}

			// 连接
			await client.connect(transport)

			connection.server.status = "connected" // 状态标识符，保持英文
			connection.server.error = ""

			// 初始获取工具和资源
			connection.server.tools = await this.fetchToolsList(name)
			connection.server.resources = await this.fetchResourcesList(name)
			connection.server.resourceTemplates = await this.fetchResourceTemplatesList(name)
		} catch (error) {
			// 更新状态并附带错误
			const connection = this.connections.find((conn) => conn.server.name === name)
			if (connection) {
				connection.server.status = "disconnected"
				this.appendErrorMessage(connection, error instanceof Error ? error.message : String(error))
			}
			throw error
		}
	}

	private appendErrorMessage(connection: McpConnection, error: string) {
		const newError = connection.server.error ? `${connection.server.error}\n${error}` : error
		connection.server.error = newError //.slice(0, 800)
	}

	private async fetchToolsList(serverName: string): Promise<McpTool[]> {
		try {
			const connection = this.connections.find((conn) => conn.server.name === serverName)

			if (!connection) {
				throw new Error(`未找到服务器 ${serverName} 的连接`)
			}

			const response = await connection.client.request({ method: "tools/list" }, ListToolsResultSchema, {
				timeout: DEFAULT_REQUEST_TIMEOUT_MS,
			})

			// 获取 autoApprove 设置
			const settingsPath = await this.getMcpSettingsFilePath()
			const content = await fs.readFile(settingsPath, "utf-8")
			const config = JSON.parse(content)
			const autoApproveConfig = config.mcpServers[serverName]?.autoApprove || []

			// 根据设置将工具标记为始终允许
			const tools = (response?.tools || []).map((tool) => ({
				...tool,
				autoApprove: autoApproveConfig.includes(tool.name),
			}))

			return tools
		} catch (error) {
			console.error(`为服务器 ${serverName} 获取工具失败：`, error)
			return []
		}
	}

	private async fetchResourcesList(serverName: string): Promise<McpResource[]> {
		try {
			const response = await this.connections
				.find((conn) => conn.server.name === serverName)
				?.client.request({ method: "resources/list" }, ListResourcesResultSchema, { timeout: DEFAULT_REQUEST_TIMEOUT_MS })
			return response?.resources || []
		} catch (error) {
			// console.error(`为服务器 ${serverName} 获取资源失败：`, error)
			return []
		}
	}

	private async fetchResourceTemplatesList(serverName: string): Promise<McpResourceTemplate[]> {
		try {
			const response = await this.connections
				.find((conn) => conn.server.name === serverName)
				?.client.request({ method: "resources/templates/list" }, ListResourceTemplatesResultSchema, {
					timeout: DEFAULT_REQUEST_TIMEOUT_MS,
				})

			return response?.resourceTemplates || []
		} catch (error) {
			// console.error(`为服务器 ${serverName} 获取资源模板失败：`, error)
			return []
		}
	}

	async deleteConnection(name: string): Promise<void> {
		const connection = this.connections.find((conn) => conn.server.name === name)
		if (connection) {
			try {
				await connection.transport.close()
				await connection.client.close()
			} catch (error) {
				console.error(`关闭服务器 ${name} 的传输失败：`, error)
			}
			this.connections = this.connections.filter((conn) => conn.server.name !== name)
		}
	}

	async updateServerConnectionsRPC(newServers: Record<string, McpServerConfig>): Promise<void> {
		this.isConnecting = true
		this.removeAllFileWatchers()
		const currentNames = new Set(this.connections.map((conn) => conn.server.name))
		const newNames = new Set(Object.keys(newServers))

		// 删除已移除的服务器
		for (const name of currentNames) {
			if (!newNames.has(name)) {
				await this.deleteConnection(name)
				console.log(`已删除 MCP 服务器：${name}`)
			}
		}

		// 更新或添加服务器
		for (const [name, config] of Object.entries(newServers)) {
			const currentConnection = this.connections.find((conn) => conn.server.name === name)

			if (!currentConnection) {
				// 新服务器
				try {
					if (config.transportType === "stdio") {
						this.setupFileWatcher(name, config)
					}
					await this.connectToServer(name, config)
				} catch (error) {
					console.error(`连接到新的 MCP 服务器 ${name} 失败：`, error)
				}
			} else if (!deepEqual(JSON.parse(currentConnection.server.config), config)) {
				// 配置已更改的现有服务器
				try {
					if (config.transportType === "stdio") {
						this.setupFileWatcher(name, config)
					}
					await this.deleteConnection(name)
					await this.connectToServer(name, config)
					console.log(`已使用更新的配置重新连接 MCP 服务器：${name}`)
				} catch (error) {
					console.error(`重新连接 MCP 服务器 ${name} 失败：`, error)
				}
			}
			// 如果服务器存在且配置相同，则不执行任何操作
		}

		this.isConnecting = false
	}

	async updateServerConnections(newServers: Record<string, McpServerConfig>): Promise<void> {
		this.isConnecting = true
		this.removeAllFileWatchers()
		const currentNames = new Set(this.connections.map((conn) => conn.server.name))
		const newNames = new Set(Object.keys(newServers))

		// 删除已移除的服务器
		for (const name of currentNames) {
			if (!newNames.has(name)) {
				await this.deleteConnection(name)
				console.log(`已删除 MCP 服务器：${name}`)
			}
		}

		// 更新或添加服务器
		for (const [name, config] of Object.entries(newServers)) {
			const currentConnection = this.connections.find((conn) => conn.server.name === name)

			if (!currentConnection) {
				// 新服务器
				try {
					if (config.transportType === "stdio") {
						this.setupFileWatcher(name, config)
					}
					await this.connectToServer(name, config)
				} catch (error) {
					console.error(`连接到新的 MCP 服务器 ${name} 失败：`, error)
				}
			} else if (!deepEqual(JSON.parse(currentConnection.server.config), config)) {
				// 配置已更改的现有服务器
				try {
					if (config.transportType === "stdio") {
						this.setupFileWatcher(name, config)
					}
					await this.deleteConnection(name)
					await this.connectToServer(name, config)
					console.log(`已使用更新的配置重新连接 MCP 服务器：${name}`)
				} catch (error) {
					console.error(`重新连接 MCP 服务器 ${name} 失败：`, error)
				}
			}
			// 如果服务器存在且配置相同，则不执行任何操作
		}
		await this.notifyWebviewOfServerChanges()
		this.isConnecting = false
	}

	private setupFileWatcher(name: string, config: Extract<McpServerConfig, { transportType: "stdio" }>) {
		const filePath = config.args?.find((arg: string) => arg.includes("build/index.js"))
		if (filePath) {
			// 我们使用 chokidar 而不是 onDidSaveTextDocument，因为它不需要在编辑器中打开文件。设置配置更适合 onDidSave，因为它将由用户或 Cline 手动更新（我们希望检测保存事件，而不是每个文件更改）
			const watcher = chokidar.watch(filePath, {
				// persistent: true,
				// ignoreInitial: true,
				// awaitWriteFinish: true, // 这有助于原子写入
			})

			watcher.on("change", () => {
				console.log(`检测到 ${filePath} 中的更改。正在重新启动服务器 ${name}...`)
				this.restartConnection(name)
			})

			this.fileWatchers.set(name, watcher)
		}
	}

	private removeAllFileWatchers() {
		this.fileWatchers.forEach((watcher) => watcher.close())
		this.fileWatchers.clear()
	}

	async restartConnection(serverName: string): Promise<void> {
		this.isConnecting = true

		// 获取现有连接并更新其状态
		const connection = this.connections.find((conn) => conn.server.name === serverName)
		const config = connection?.server.config
		if (config) {
			vscode.window.showInformationMessage(`正在重新启动 ${serverName} MCP 服务器...`)
			connection.server.status = "connecting"
			connection.server.error = ""
			await this.notifyWebviewOfServerChanges()
			await setTimeoutPromise(500) // 人为延迟以向用户显示服务器正在重新启动
			try {
				await this.deleteConnection(serverName)
				// 尝试使用现有配置再次连接
				await this.connectToServer(serverName, JSON.parse(config))
				vscode.window.showInformationMessage(`${serverName} MCP 服务器已连接`)
			} catch (error) {
				console.error(`为服务器 ${serverName} 重新启动连接失败：`, error)
				vscode.window.showErrorMessage(`连接到 ${serverName} MCP 服务器失败`)
			}
		}

		await this.notifyWebviewOfServerChanges()
		this.isConnecting = false
	}

	/**
	 * 获取根据设置中定义的顺序排序的 MCP 服务器
	 * @param serverOrder 设置中显示的服务器名称顺序数组
	 * @returns 根据设置顺序排序的 McpServer 对象数组
	 */
	private getSortedMcpServers(serverOrder: string[]): McpServer[] {
		return [...this.connections]
			.sort((a, b) => {
				const indexA = serverOrder.indexOf(a.server.name)
				const indexB = serverOrder.indexOf(b.server.name)
				return indexA - indexB
			})
			.map((connection) => connection.server)
	}

	private async notifyWebviewOfServerChanges(): Promise<void> {
		// 服务器应始终按照它们在设置文件中的定义顺序排序
		const settingsPath = await this.getMcpSettingsFilePath()
		const content = await fs.readFile(settingsPath, "utf-8")
		const config = JSON.parse(content)
		const serverOrder = Object.keys(config.mcpServers || {})
		await this.postMessageToWebview({
			type: "mcpServers",
			mcpServers: this.getSortedMcpServers(serverOrder),
		})
	}

	async sendLatestMcpServers() {
		await this.notifyWebviewOfServerChanges()
	}

	// 使用服务器

	// 服务器管理的公共方法

	public async toggleServerDisabledRPC(serverName: string, disabled: boolean): Promise<McpServer[]> {
		try {
			const config = await this.readAndValidateMcpSettingsFile()
			if (!config) {
				throw new Error("读取或验证 MCP 设置失败")
			}

			if (config.mcpServers[serverName]) {
				config.mcpServers[serverName].disabled = disabled

				const settingsPath = await this.getMcpSettingsFilePath()
				await fs.writeFile(settingsPath, JSON.stringify(config, null, 2))

				const connection = this.connections.find((conn) => conn.server.name === serverName)
				if (connection) {
					connection.server.disabled = disabled
				}

				const serverOrder = Object.keys(config.mcpServers || {})
				return this.getSortedMcpServers(serverOrder)
			}
			console.error(`在 MCP 配置中找不到服务器 "${serverName}"`)
			throw new Error(`在 MCP 配置中找不到服务器 "${serverName}"`)
		} catch (error) {
			console.error("更新服务器禁用状态失败：", error)
			if (error instanceof Error) {
				console.error("错误详情：", error.message, error.stack)
			}
			vscode.window.showErrorMessage(
				`更新服务器状态失败：${error instanceof Error ? error.message : String(error)}`,
			)
			throw error
		}
	}

	async readResource(serverName: string, uri: string): Promise<McpResourceResponse> {
		const connection = this.connections.find((conn) => conn.server.name === serverName)
		if (!connection) {
			throw new Error(`未找到服务器 ${serverName} 的连接`)
		}
		if (connection.server.disabled) {
			throw new Error(`服务器 "${serverName}" 已禁用`)
		}

		return await connection.client.request(
			{
				method: "resources/read",
				params: {
					uri,
				},
			},
			ReadResourceResultSchema,
		)
	}

	async callTool(serverName: string, toolName: string, toolArguments?: Record<string, unknown>): Promise<McpToolCallResponse> {
		const connection = this.connections.find((conn) => conn.server.name === serverName)
		if (!connection) {
			throw new Error(
				`未找到服务器 ${serverName} 的连接。请确保使用“已连接的 MCP 服务器”下可用的 MCP 服务器。`,
			)
		}

		if (connection.server.disabled) {
			throw new Error(`服务器 "${serverName}" 已禁用且无法使用`)
		}

		let timeout = secondsToMs(DEFAULT_MCP_TIMEOUT_SECONDS) // sdk 需要毫秒单位

		try {
			const config = JSON.parse(connection.server.config)
			const parsedConfig = ServerConfigSchema.parse(config)
			timeout = secondsToMs(parsedConfig.timeout)
		} catch (error) {
			console.error(`解析服务器 ${serverName} 的超时配置失败：${error}`)
		}

		return await connection.client.request(
			{
				method: "tools/call",
				params: {
					name: toolName,
					arguments: toolArguments,
				},
			},
			CallToolResultSchema,
			{
				timeout,
			},
		)
	}

	async toggleToolAutoApprove(serverName: string, toolNames: string[], shouldAllow: boolean): Promise<void> {
		try {
			const settingsPath = await this.getMcpSettingsFilePath()
			const content = await fs.readFile(settingsPath, "utf-8")
			const config = JSON.parse(content)

			// 如果 autoApprove 不存在，则初始化它
			if (!config.mcpServers[serverName].autoApprove) {
				config.mcpServers[serverName].autoApprove = []
			}

			const autoApprove = config.mcpServers[serverName].autoApprove
			for (const toolName of toolNames) {
				const toolIndex = autoApprove.indexOf(toolName)

				if (shouldAllow && toolIndex === -1) {
					// 将工具添加到 autoApprove 列表
					autoApprove.push(toolName)
				} else if (!shouldAllow && toolIndex !== -1) {
					// 从 autoApprove 列表中删除工具
					autoApprove.splice(toolIndex, 1)
				}
			}

			await fs.writeFile(settingsPath, JSON.stringify(config, null, 2))

			// 更新工具列表以反映更改
			const connection = this.connections.find((conn) => conn.server.name === serverName)
			if (connection && connection.server.tools) {
				// 更新内存中服务器对象中每个工具的 autoApprove 属性
				connection.server.tools = connection.server.tools.map((tool) => ({
					...tool,
					autoApprove: autoApprove.includes(tool.name),
				}))
				await this.notifyWebviewOfServerChanges()
			}
		} catch (error) {
			console.error("更新 autoApprove 设置失败：", error)
			vscode.window.showErrorMessage("更新 autoApprove 设置失败")
			throw error // 重新抛出以确保错误得到正确处理
		}
	}

	public async addRemoteServer(serverName: string, serverUrl: string): Promise<McpServer[]> {
		try {
			const settings = await this.readAndValidateMcpSettingsFile()
			if (!settings) {
				throw new Error("读取 MCP 设置失败")
			}

			if (settings.mcpServers[serverName]) {
				throw new Error(`名称为 "${serverName}" 的 MCP 服务器已存在`)
			}

			const urlValidation = z.string().url().safeParse(serverUrl)
			if (!urlValidation.success) {
				throw new Error(`无效的服务器 URL：${serverUrl}。请输入有效的 URL。`)
			}

			const serverConfig = {
				url: serverUrl,
				disabled: false,
				autoApprove: [],
			}

			const parsedConfig = ServerConfigSchema.parse(serverConfig)

			settings.mcpServers[serverName] = parsedConfig
			const settingsPath = await this.getMcpSettingsFilePath()

			// 我们不将 zod 转换后的版本写入文件。
			// 上面的 parse() 调用会将 transportType 字段添加到服务器配置中
			// 如果写入此内容也可以，但我们不想用内部细节来扰乱文件

			// 待办：我们可以从反映未转换/已转换版本的输入/输出类型中受益
			await fs.writeFile(
				settingsPath,
				JSON.stringify({ mcpServers: { ...settings.mcpServers, [serverName]: serverConfig } }, null, 2),
			)

			await this.updateServerConnectionsRPC(settings.mcpServers)

			const serverOrder = Object.keys(settings.mcpServers || {})
			return this.getSortedMcpServers(serverOrder)
		} catch (error) {
			console.error("添加远程 MCP 服务器失败：", error)
			throw error
		}
	}

	public async deleteServer(serverName: string) {
		try {
			const settingsPath = await this.getMcpSettingsFilePath()
			const content = await fs.readFile(settingsPath, "utf-8")
			const config = JSON.parse(content)
			if (!config.mcpServers || typeof config.mcpServers !== "object") {
				config.mcpServers = {}
			}
			if (config.mcpServers[serverName]) {
				delete config.mcpServers[serverName]
				const updatedConfig = {
					mcpServers: config.mcpServers,
				}
				await fs.writeFile(settingsPath, JSON.stringify(updatedConfig, null, 2))
				await this.updateServerConnections(config.mcpServers)
				vscode.window.showInformationMessage(`已删除 ${serverName} MCP 服务器`)
			} else {
				vscode.window.showWarningMessage(`${serverName} 在 MCP 配置中未找到`)
			}
		} catch (error) {
			vscode.window.showErrorMessage(
				`删除 MCP 服务器失败：${error instanceof Error ? error.message : String(error)}`,
			)
			throw error
		}
	}

	public async updateServerTimeoutRPC(serverName: string, timeout: number): Promise<McpServer[]> {
		try {
			// 根据模式验证超时
			const setConfigResult = BaseConfigSchema.shape.timeout.safeParse(timeout)
			if (!setConfigResult.success) {
				throw new Error(`无效的超时值：${timeout}。必须至少为 ${MIN_MCP_TIMEOUT_SECONDS} 秒。`)
			}

			const settingsPath = await this.getMcpSettingsFilePath()
			const content = await fs.readFile(settingsPath, "utf-8")
			const config = JSON.parse(content)

			if (!config.mcpServers?.[serverName]) {
				throw new Error(`在设置中找不到服务器 "${serverName}"`)
			}

			config.mcpServers[serverName] = {
				...config.mcpServers[serverName],
				timeout,
			}

			await fs.writeFile(settingsPath, JSON.stringify(config, null, 2))

			await this.updateServerConnectionsRPC(config.mcpServers)

			const serverOrder = Object.keys(config.mcpServers || {})
			return this.getSortedMcpServers(serverOrder)
		} catch (error) {
			console.error("更新服务器超时失败：", error)
			if (error instanceof Error) {
				console.error("错误详情：", error.message, error.stack)
			}
			vscode.window.showErrorMessage(
				`更新服务器超时失败：${error instanceof Error ? error.message : String(error)}`,
			)
			throw error
		}
	}

	async dispose(): Promise<void> {
		this.removeAllFileWatchers()
		for (const connection of this.connections) {
			try {
				await this.deleteConnection(connection.server.name)
			} catch (error) {
				console.error(`关闭服务器 ${connection.server.name} 的连接失败：`, error)
			}
		}
		this.connections = []
		if (this.settingsWatcher) {
			this.settingsWatcher.dispose()
		}
		this.disposables.forEach((d) => d.dispose())
	}
}
