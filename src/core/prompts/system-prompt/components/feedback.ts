import { isZhCN } from "../i18n/getLocaleText"
import { SystemPromptSection } from "../templates/placeholders"
import { TemplateEngine } from "../templates/TemplateEngine"
import type { PromptVariant, SystemPromptContext } from "../types"

const FEEDBACK_TEMPLATE_TEXT = `
If the user asks for help or wants to give feedback inform them of the following:
- To give feedback, users should report the issue using the /reportbug slash command in the chat.

When the user directly asks about Cline (eg 'can Cline do...', 'does Cline have...') or asks in second person (eg 'are you able...', 'can you do...'), first use the web_fetch tool to gather information to answer the question from Cline docs at https://docs.cline.bot.
  - The available sub-pages are \`getting-started\` (Intro for new coders, installing Cline and dev essentials), \`model-selection\` (Model Selection Guide, Custom Model Configs, Bedrock, Vertex, Codestral, LM Studio, Ollama), \`features\` (Auto approve, Checkpoints, Cline rules, Drag & Drop, Plan & Act, Workflows, etc), \`task-management\` (Task and Context Management in Cline), \`prompt-engineering\` (Improving your prompting skills, Prompt Engineering Guide), \`cline-tools\` (Cline Tools Reference Guide, New Task Tool, Remote Browser Support, Slash Commands), \`mcp\` (MCP Overview, Adding/Configuring Servers, Transport Mechanisms, MCP Dev Protocol), \`enterprise\` (Cloud provider integration, Security concerns, Custom instructions), \`more-info\` (Telemetry and other reference content)
  - Example: https://docs.cline.bot/features/auto-approve`

const FEEDBACK_TEMPLATE_TEXT_ZH_CN = `
如果用户寻求帮助或想要提供反馈，请告知他们以下信息：
- 如需提供反馈，用户应在聊天中使用 /reportbug 斜杠命令报告问题。

当用户直接询问关于 Cline 的问题（例如「Cline 能否...」「Cline 是否有...」）或以第二人称提问（例如「你能否...」「你能做...」）时，首先使用 web_fetch 工具从 Cline 文档网站 https://docs.cline.bot 收集信息来回答问题。
  - 可用的子页面包括：\`getting-started\`（新手入门，安装 Cline 和开发基础）、\`model-selection\`（模型选择指南，自定义模型配置，Bedrock，Vertex，Codestral，LM Studio，Ollama）、\`features\`（自动批准，检查点，Cline 规则，拖放，计划与执行，工作流等）、\`task-management\`（Cline 中的任务和上下文管理）、\`prompt-engineering\`（提升你的提示技巧，提示工程指南）、\`cline-tools\`（Cline 工具参考指南，新任务工具，远程浏览器支持，斜杠命令）、\`mcp\`（MCP 概述，添加/配置服务器，传输机制，MCP 开发协议）、\`enterprise\`（云服务提供商集成，安全问题，自定义指令）、\`more-info\`（遥测和其他参考内容）
  - 示例：https://docs.cline.bot/features/auto-approve`

export async function getFeedbackSection(variant: PromptVariant, context: SystemPromptContext): Promise<string | undefined> {
	if (!context.focusChainSettings?.enabled) {
		return undefined
	}

	const defaultTemplate = isZhCN(context.locale) ? FEEDBACK_TEMPLATE_TEXT_ZH_CN : FEEDBACK_TEMPLATE_TEXT
	const template = variant.componentOverrides?.[SystemPromptSection.FEEDBACK]?.template || defaultTemplate

	return new TemplateEngine().resolve(template, context, {})
}
