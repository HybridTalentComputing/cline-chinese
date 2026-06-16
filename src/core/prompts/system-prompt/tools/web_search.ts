import { ModelFamily } from "@/shared/prompts"
import { ClineDefaultTool } from "@/shared/tools"
import { isZhCN } from "../i18n/getLocaleText"
import type { ClineToolSpec } from "../spec"
import type { SystemPromptContext } from "../types"
import { TASK_PROGRESS_PARAMETER } from "../types"

const DESCRIPTION_GENERIC_EN = `Performs a web search and returns relevant results
- Takes a search query as input and returns search results with titles and URLs
- Optionally filter results by allowed or blocked domains
- Use this tool when you need to search the web for information
- IMPORTANT: If an MCP-provided web search tool is available, prefer using that tool instead of this one, as it may have fewer restrictions.
- The query must be at least 2 characters
- You may provide either allowed_domains OR blocked_domains, but NOT both
- Domains should be provided as a JSON array of strings
- This tool is read-only and does not modify any files`

const DESCRIPTION_GENERIC_ZH_CN = `执行网络搜索并返回相关结果
- 接受搜索查询作为输入，并返回带有标题和 URL 的搜索结果
- 可以通过允许或阻止的域名过滤结果
- 当您需要在线搜索信息时，请使用此工具
- 重要提示：如果提供了 MCP 提供的网络搜索工具，请优先使用该工具而不是此工具，因为它可能具有更少的限制。
- 查询必须至少包含 2 个字符
- 您可以提供 allowed_domains 或 blocked_domains，但不能同时提供两者
- 域名应作为字符串的 JSON 数组提供
- 此工具是只读的，不会修改任何文件`

const DESCRIPTION_NATIVE_EN =
	"Performs a web search and returns relevant results with titles and URLs. IMPORTANT: If an MCP-provided web search tool is available, prefer using that tool instead of this one, as it may have fewer restrictions."

const DESCRIPTION_NATIVE_ZH_CN =
	"执行网络搜索并返回带有标题和 URL 的相关结果。重要提示：如果提供了 MCP 提供的网络搜索工具，请优先使用该工具而不是此工具，因为它可能具有更少的限制。"

const INSTRUCTION_QUERY_EN = "The search query to use"
const INSTRUCTION_QUERY_ZH_CN = "要使用的搜索查询"

const INSTRUCTION_ALLOWED_DOMAINS_EN = "JSON array of domains to restrict results to"
const INSTRUCTION_ALLOWED_DOMAINS_ZH_CN = "用于限制结果的域名的 JSON 数组"

const INSTRUCTION_BLOCKED_DOMAINS_EN = "JSON array of domains to exclude from results"
const INSTRUCTION_BLOCKED_DOMAINS_ZH_CN = "要从结果中排除的域名的 JSON 数组"

const GENERIC: ClineToolSpec = {
	variant: ModelFamily.GENERIC,
	id: ClineDefaultTool.WEB_SEARCH,
	name: "web_search",
	description: (context: SystemPromptContext) => (isZhCN(context.locale) ? DESCRIPTION_GENERIC_ZH_CN : DESCRIPTION_GENERIC_EN),
	contextRequirements: (context) => context.providerInfo.providerId === "cline" && context.clineWebToolsEnabled === true,
	parameters: [
		{
			name: "query",
			required: true,
			instruction: (context: SystemPromptContext) =>
				isZhCN(context.locale) ? INSTRUCTION_QUERY_ZH_CN : INSTRUCTION_QUERY_EN,
			usage: "latest developments in AI",
		},
		{
			name: "allowed_domains",
			required: false,
			instruction: (context: SystemPromptContext) =>
				isZhCN(context.locale) ? INSTRUCTION_ALLOWED_DOMAINS_ZH_CN : INSTRUCTION_ALLOWED_DOMAINS_EN,
			usage: '["example.com", "github.com"]',
		},
		{
			name: "blocked_domains",
			required: false,
			instruction: (context: SystemPromptContext) =>
				isZhCN(context.locale) ? INSTRUCTION_BLOCKED_DOMAINS_ZH_CN : INSTRUCTION_BLOCKED_DOMAINS_EN,
			usage: '["ads.com", "spam.com"]',
		},
		TASK_PROGRESS_PARAMETER,
	],
}

const NATIVE_NEXT_GEN: ClineToolSpec = {
	variant: ModelFamily.NATIVE_NEXT_GEN,
	id: ClineDefaultTool.WEB_SEARCH,
	name: "web_search",
	description: (context: SystemPromptContext) => (isZhCN(context.locale) ? DESCRIPTION_NATIVE_ZH_CN : DESCRIPTION_NATIVE_EN),
	contextRequirements: (context) => context.providerInfo.providerId === "cline" && context.clineWebToolsEnabled === true,
	parameters: [
		{
			name: "query",
			required: true,
			instruction: (context: SystemPromptContext) =>
				isZhCN(context.locale) ? INSTRUCTION_QUERY_ZH_CN : INSTRUCTION_QUERY_EN,
		},
		{
			name: "allowed_domains",
			required: false,
			instruction: (context: SystemPromptContext) =>
				isZhCN(context.locale) ? INSTRUCTION_ALLOWED_DOMAINS_ZH_CN : INSTRUCTION_ALLOWED_DOMAINS_EN,
		},
		{
			name: "blocked_domains",
			required: false,
			instruction: (context: SystemPromptContext) =>
				isZhCN(context.locale) ? INSTRUCTION_BLOCKED_DOMAINS_ZH_CN : INSTRUCTION_BLOCKED_DOMAINS_EN,
		},
		TASK_PROGRESS_PARAMETER,
	],
}

const NATIVE_GPT_5: ClineToolSpec = {
	...NATIVE_NEXT_GEN,
	variant: ModelFamily.NATIVE_GPT_5,
}

export const web_search_variants = [GENERIC, NATIVE_GPT_5, NATIVE_NEXT_GEN]
