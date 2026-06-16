import { isZhCN } from "../../i18n/getLocaleText"
import { TemplateEngine } from "../../templates/TemplateEngine"
import type { PromptVariant, SystemPromptContext } from "../../types"

export async function getToolUseFormattingSection(_variant: PromptVariant, context: SystemPromptContext): Promise<string> {
	// Return the placeholder that will be replaced with actual tools
	const isZh = isZhCN(context.locale)
	const template = isZh ? TOOL_USE_FORMATTING_TEMPLATE_TEXT_ZH_CN : TOOL_USE_FORMATTING_TEMPLATE_TEXT

	const focusChainEnabled = context.focusChainSettings?.enabled

	const templateEngine = new TemplateEngine()
	return templateEngine.resolve(template, context, {
		FOCUS_CHATIN_FORMATTING: focusChainEnabled ? FOCUS_CHATIN_FORMATTING_TEMPLATE : "",
	})
}

const FOCUS_CHATIN_FORMATTING_TEMPLATE = `<task_progress>
Checklist here (optional)
</task_progress>
`

const TOOL_USE_FORMATTING_TEMPLATE_TEXT = `# Tool Use Formatting

Tool use is formatted using XML-style tags. The tool name is enclosed in opening and closing tags, and each parameter is similarly enclosed within its own set of tags. Here's the structure:

<tool_name>
<parameter1_name>value1</parameter1_name>
<parameter2_name>value2</parameter2_name>
...
</tool_name>

For example:

<read_file>
<path>src/main.js</path>
{{FOCUS_CHATIN_FORMATTING}}</read_file>

Always adhere to this format for the tool use to ensure proper parsing and execution.`

const TOOL_USE_FORMATTING_TEMPLATE_TEXT_ZH_CN = `# 工具使用格式

工具使用使用 XML 风格的标签进行格式化。工具名称包含在开始和结束标签中，每个参数同样包含在其自己的标签集中。结构如下：

<tool_name>
<parameter1_name>value1</parameter1_name>
<parameter2_name>value2</parameter2_name>
...
</tool_name>

例如：

<read_file>
<path>src/main.js</path>
{{FOCUS_CHATIN_FORMATTING}}</read_file>

始终遵循此格式进行工具使用，以确保正确的解析和执行。`
