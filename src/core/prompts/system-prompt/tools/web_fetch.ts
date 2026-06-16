import { ModelFamily } from "@/shared/prompts"
import { ClineDefaultTool } from "@/shared/tools"
import { isZhCN } from "../i18n/getLocaleText"
import type { ClineToolSpec } from "../spec"
import type { SystemPromptContext } from "../types"
import { TASK_PROGRESS_PARAMETER } from "../types"

const DESCRIPTION_GENERIC_EN = `Fetches content from a specified URL and analyzes it using your prompt
- Takes a URL and analysis prompt as input
- Fetches the URL content and processes based on your prompt
- Use this tool when you need to retrieve and analyze web content
- IMPORTANT: If an MCP-provided web fetch tool is available, prefer using that tool instead of this one, as it may have fewer restrictions.
- The URL must be a fully-formed valid URL
- The prompt must be at least 2 characters
- HTTP URLs will be automatically upgraded to HTTPS
- This tool is read-only and does not modify any files`

const DESCRIPTION_GENERIC_ZH_CN = `从指定的 URL 获取内容并使用您的提示对其进行分析
- 接受 URL 和分析提示作为输入
- 获取 URL 内容并根据您的提示进行处理
- 当您需要检索和分析网络内容时，请使用此工具
- 重要提示：如果提供了 MCP 提供的网络获取工具，请优先使用该工具而不是此工具，因为它可能具有更少的限制。
- URL 必须是完整格式的有效 URL
- 提示必须至少包含 2 个字符
- HTTP URL 将自动升级到 HTTPS
- 此工具是只读的，不会修改任何文件`

const DESCRIPTION_NATIVE_EN =
	"Fetches and analyzes content from a specified URL. IMPORTANT: If an MCP-provided web fetch tool is available, prefer using that tool instead of this one, as it may have fewer restrictions."

const DESCRIPTION_NATIVE_ZH_CN =
	"从指定的 URL 获取并分析内容。重要提示：如果提供了 MCP 提供的网络获取工具，请优先使用该工具而不是此工具，因为它可能具有更少的限制。"

const INSTRUCTION_URL_EN = "The URL to fetch content from"
const INSTRUCTION_URL_ZH_CN = "要从中获取内容的 URL"

const INSTRUCTION_PROMPT_GENERIC_EN = "The prompt to use for analyzing the webpage content"
const INSTRUCTION_PROMPT_GENERIC_ZH_CN = "用于分析网页内容的提示"

const INSTRUCTION_PROMPT_NATIVE_EN = "Prompt for analyzing the webpage content"
const INSTRUCTION_PROMPT_NATIVE_ZH_CN = "用于分析网页内容的提示"

const GENERIC: ClineToolSpec = {
	variant: ModelFamily.GENERIC,
	id: ClineDefaultTool.WEB_FETCH,
	name: "web_fetch",
	description: (context: SystemPromptContext) => (isZhCN(context.locale) ? DESCRIPTION_GENERIC_ZH_CN : DESCRIPTION_GENERIC_EN),
	contextRequirements: (context) => context.providerInfo.providerId === "cline" && context.clineWebToolsEnabled === true,
	parameters: [
		{
			name: "url",
			required: true,
			instruction: (context: SystemPromptContext) => (isZhCN(context.locale) ? INSTRUCTION_URL_ZH_CN : INSTRUCTION_URL_EN),
			usage: "https://example.com/docs",
		},
		{
			name: "prompt",
			required: true,
			instruction: (context: SystemPromptContext) =>
				isZhCN(context.locale) ? INSTRUCTION_PROMPT_GENERIC_ZH_CN : INSTRUCTION_PROMPT_GENERIC_EN,
			usage: "Summarize the main points and key takeaways",
		},
		TASK_PROGRESS_PARAMETER,
	],
}

const NATIVE_NEXT_GEN: ClineToolSpec = {
	variant: ModelFamily.NATIVE_NEXT_GEN,
	id: ClineDefaultTool.WEB_FETCH,
	name: "web_fetch",
	description: (context: SystemPromptContext) => (isZhCN(context.locale) ? DESCRIPTION_NATIVE_ZH_CN : DESCRIPTION_NATIVE_EN),
	contextRequirements: (context) => context.providerInfo.providerId === "cline" && context.clineWebToolsEnabled === true,
	parameters: [
		{
			name: "url",
			required: true,
			instruction: (context: SystemPromptContext) => (isZhCN(context.locale) ? INSTRUCTION_URL_ZH_CN : INSTRUCTION_URL_EN),
		},
		{
			name: "prompt",
			required: true,
			instruction: (context: SystemPromptContext) =>
				isZhCN(context.locale) ? INSTRUCTION_PROMPT_NATIVE_ZH_CN : INSTRUCTION_PROMPT_NATIVE_EN,
		},
		TASK_PROGRESS_PARAMETER,
	],
}

const NATIVE_GPT_5: ClineToolSpec = {
	...NATIVE_NEXT_GEN,
	variant: ModelFamily.NATIVE_GPT_5,
}

export const web_fetch_variants = [GENERIC, NATIVE_GPT_5, NATIVE_NEXT_GEN]
