import { getCwd } from "@/utils/path"
import os from "node:os"
import path from "node:path"
import fs from "node:fs/promises"
import type Anthropic from "@anthropic-ai/sdk"
import { execa } from "execa"
import readline from "readline"
import { ClaudeCodeMessage } from "./types"
import crypto from "node:crypto"

type ClaudeCodeOptions = {
	systemPrompt: string
	messages: Anthropic.Messages.MessageParam[]
	path?: string
	modelId: string
	thinkingBudgetTokens?: number
	shouldUseFile?: boolean
}

type ProcessState = {
	partialData: string | null
	error: Error | null
	stderrLogs: string
	exitCode: number | null
}

// The maximum argument length is longer than this,
// but environment variables and other factors can reduce it.
// We use a conservative limit to avoid issues while supporting older Claude Code versions that don't support file input.
export const MAX_SYSTEM_PROMPT_LENGTH = 65536

export async function* runClaudeCode(options: ClaudeCodeOptions): AsyncGenerator<ClaudeCodeMessage | string> {
	const isSystemPromptTooLong = options.systemPrompt.length > MAX_SYSTEM_PROMPT_LENGTH
	const uniqueId = crypto.randomUUID()
	const tempFilePath = path.join(os.tmpdir(), `cline-system-prompt-${uniqueId}.txt`)
	if (os.platform() === "win32" || isSystemPromptTooLong) {
		// Use a temporary file to prevent ENAMETOOLONG and E2BIG errors
		// https://github.com/anthropics/claude-code/issues/3411#issuecomment-3082068547
		await fs.writeFile(tempFilePath, options.systemPrompt, "utf8")
		options.systemPrompt = tempFilePath
		options.shouldUseFile = true
	}

	const cProcess = runProcess(options, await getCwd())

	const rl = readline.createInterface({
		input: cProcess.stdout,
	})

	const processState: ProcessState = {
		error: null,
		stderrLogs: "",
		exitCode: null,
		partialData: null,
	}

	try {
		cProcess.stderr.on("data", (data) => {
			processState.stderrLogs += data.toString()
		})

		cProcess.on("close", (code) => {
			processState.exitCode = code
		})

		cProcess.on("error", (err) => {
			processState.error = err
		})

		for await (const line of rl) {
			if (processState.error) {
				throw processState.error
			}

			if (line.trim()) {
				const chunk = parseChunk(line, processState)

				if (!chunk) {
					continue
				}

				yield chunk
			}
		}

		// We rely on the assistant message. If the output was truncated, it's better having a poorly formatted message
		// from which to extract something, than throwing an error/showing the model didn't return any messages.
		if (processState.partialData && processState.partialData.startsWith(`{"type":"assistant"`)) {
			yield processState.partialData
		}

		const { exitCode } = await cProcess
		if (exitCode !== null && exitCode !== 0) {
			const errorOutput = processState.error?.message || processState.stderrLogs?.trim()
			throw new Error(`Claude Code 进程退出代码 ${exitCode}.${errorOutput ? ` 返回错误: ${errorOutput}` : ""}`)
		}
	} catch (err) {
		console.error(`Error during Claude Code execution:`, err)

		if (processState.stderrLogs.includes("unknown option '--system-prompt-file'")) {
			throw new Error(`Claude Code 可执行文件已过时。请将其更新至最新版本.`, {
				cause: err,
			})
		}

		if (err instanceof Error) {
			if (err.message.includes("ENOENT")) {
				throw new Error(
					`找不到 Claude 代码可执行文件。请确保它已安装并位于您的 PATH 中，或者已在您的提供程序设置中正确设置。`,
					{ cause: err },
				)
			}

			if (err.message.includes("E2BIG")) {
				throw new Error(
					`由于系统提示过长，执行 Claude Code 执行失败。参数最大长度为 131072 字节。
规则和工作流程会导致系统提示过长，请考虑暂时禁用部分规则和工作流程以缩短提示长度。
Anthropic 已意识到此问题，正在考虑修复。: https://github.com/anthropics/claude-code/issues/3411.
`,
					{ cause: err },
				)
			}

			if (err.message.includes("ENAMETOOLONG")) {
				throw new Error(
					`由于系统提示过长，执行 Claude Code 失败。Windows 系统字符数限制为 8191 个字符，这导致与 Cline 的集成无法正常工作。
请查看我们的文档，了解如何在 Windows 上将 Claude Code 与 Cline 集成：https://docs.cline.bot/provider-config/claude-code#windows-setup。
Anthropic 已意识到此问题，并正在考虑修复。: https://github.com/anthropics/claude-code/issues/3411.
`,
					{ cause: err },
				)
			}

			// When the command fails, execa throws an error with the arguments, which include the whole system prompt.
			// We want to log that, but not show it to the user.
			const startOfCommand = err.message.indexOf(": ")
			if (startOfCommand !== -1) {
				const messageWithoutCommand = err.message.slice(0, startOfCommand).trim()

				throw new Error(`${messageWithoutCommand}\n${processState.stderrLogs?.trim()}`, { cause: err })
			}
		}

		throw err
	} finally {
		rl.close()
		if (!cProcess.killed) {
			cProcess.kill()
		}

		if (options.shouldUseFile) {
			fs.unlink(tempFilePath).catch(console.error)
		}
	}
}

// We want the model to use our custom tool format instead of built-in tools.
// Disabling built-in tools prevents tool-only responses and ensures text output.
const claudeCodeTools = [
	"Task",
	"Bash",
	"Glob",
	"Grep",
	"LS",
	"exit_plan_mode",
	"Read",
	"Edit",
	"MultiEdit",
	"Write",
	"NotebookRead",
	"NotebookEdit",
	"WebFetch",
	"TodoRead",
	"TodoWrite",
	"WebSearch",
].join(",")

const CLAUDE_CODE_TIMEOUT = 600000 // 10 minutes
// https://github.com/sindresorhus/execa/blob/main/docs/api.md#optionsmaxbuffer
const BUFFER_SIZE = 20_000_000 // 20 MB

// This is the limit imposed by the CLI
const CLAUDE_CODE_MAX_OUTPUT_TOKENS = "32000"

function runProcess(
	{ systemPrompt, messages, path, modelId, thinkingBudgetTokens, shouldUseFile }: ClaudeCodeOptions,
	cwd: string,
) {
	const claudePath = path?.trim() || "claude"

	const args = [
		shouldUseFile ? "--system-prompt-file" : "--system-prompt",
		systemPrompt,
		"--verbose",
		"--output-format",
		"stream-json",
		"--disallowedTools",
		claudeCodeTools,
		// Cline will handle recursive calls
		"--max-turns",
		"1",
		"--model",
		modelId,
		"-p",
	]

	/**
	 * @see {@link https://docs.anthropic.com/en/docs/claude-code/settings#environment-variables}
	 */
	const env: NodeJS.ProcessEnv = {
		...process.env,
		// Respect the user's environment variables but set defaults.
		CLAUDE_CODE_MAX_OUTPUT_TOKENS: process.env.CLAUDE_CODE_MAX_OUTPUT_TOKENS || CLAUDE_CODE_MAX_OUTPUT_TOKENS,
		// Disable telemetry, auto-updater and error reporting.
		CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC: process.env.CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC || "1",
		DISABLE_NON_ESSENTIAL_MODEL_CALLS: process.env.DISABLE_NON_ESSENTIAL_MODEL_CALLS || "1",
		MAX_THINKING_TOKENS: (thinkingBudgetTokens || 0).toString(),
	}

	// We don't want to consume the user's ANTHROPIC_API_KEY,
	// and will allow Claude Code to resolve auth by itself
	delete env["ANTHROPIC_API_KEY"]

	const claudeCodeProcess = execa(claudePath, args, {
		stdin: "pipe",
		stdout: "pipe",
		stderr: "pipe",
		env,
		cwd,
		maxBuffer: BUFFER_SIZE,
		timeout: CLAUDE_CODE_TIMEOUT,
	})

	claudeCodeProcess.stdin.write(JSON.stringify(messages))
	claudeCodeProcess.stdin.end()

	return claudeCodeProcess
}

function parseChunk(data: string, processState: ProcessState) {
	if (processState.partialData) {
		processState.partialData += data

		const chunk = attemptParseChunk(processState.partialData)

		if (!chunk) {
			return null
		}

		processState.partialData = null
		return chunk
	}

	const chunk = attemptParseChunk(data)

	if (!chunk) {
		processState.partialData = data
	}

	return chunk
}

function attemptParseChunk(data: string): ClaudeCodeMessage | null {
	try {
		return JSON.parse(data)
	} catch (error) {
		console.error("Error parsing chunk:", error, data.length)
		return null
	}
}
