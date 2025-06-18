function escapeXml(text: string): string {
	// 任何可能被解释为标记的内容都必须进行实体编码
	return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

export interface ToolDefinition {
	name: string
	description?: string
	descriptionForAgent?: string
	inputSchema: {
		type: string
		properties: Record<string, any>
		required?: string[]
		[key: string]: any
	}
}

/**
 * 将单个工具定义（JSON schema）转换为<function>标签格式。
 * 这是用于*定义*工具，而不是调用工具。
 * @param toolDef 工具定义对象
 * @returns 包装在<function>标签中的JSON字符串形式的工具定义
 */
export function toolDefinitionToAntmlDefinition(toolDef: ToolDefinition): string {
	// 重构参数对象以匹配预期的顺序
	const { type, properties, required, ...rest } = toolDef.inputSchema
	const parameters = {
		properties,
		required,
		type,
		...rest,
	}

	const functionDef = {
		description: toolDef.descriptionForAgent || toolDef.description || "",
		name: toolDef.name,
		parameters,
	}

	// 1. 创建具有我们想要的确切格式的自定义JSON字符串
	let rawJson = `{"description": "${functionDef.description}", "name": "${functionDef.name}", "parameters": {`

	// 添加属性
	rawJson += `"properties": {`
	const propEntries = Object.entries(parameters.properties)
	propEntries.forEach(([propName, propDef], index) => {
		rawJson += `"${propName}": {`
		rawJson += `"description": "${(propDef as any).description || ""}", `
		rawJson += `"type": "${(propDef as any).type || "string"}"`
		rawJson += `}`
		if (index < propEntries.length - 1) {
			rawJson += ", "
		}
	})
	rawJson += `}, `

	// 添加必需字段
	rawJson += `"required": ${JSON.stringify(parameters.required || [])}, `

	// 添加类型
	rawJson += `"type": "object"`

	// 关闭参数和整个对象
	rawJson += `}}`

	// 2. 转义<、>和&，以便JSON可以安全地位于XML标签内。
	//    （引号不需要转义 - 它们不是标记。）
	const safeJson = escapeXml(rawJson)

	// 3. 返回包装在<function>标签中的内容
	return `<function>${safeJson}</function>`
}

/**
 * 将多个工具定义转换为完整的<functions>块。
 * 这是用于*定义*工具。
 * @param toolDefs 工具定义对象数组
 * @returns 包含所有工具定义的完整<functions>块
 */
export function toolDefinitionsToAntmlDefinitions(toolDefs: ToolDefinition[]): string {
	const functionTags = toolDefs.map(toolDefinitionToAntmlDefinition)
	return `Here are the functions available in JSONSchema format:
<functions>
${functionTags.join("\n")}
</functions>`
}

/**
 * 为给定的工具定义创建ANTML工具调用示例。
 * 这是用于*调用*工具。
 * @param toolDef 工具定义对象
 * @param exampleValues 参数的可选示例值
 * @returns ANTML函数调用示例字符串
 */
export function toolDefinitionToAntmlCallExample(toolDef: ToolDefinition, exampleValues: Record<string, any> = {}): string {
	const props = toolDef.inputSchema.properties ?? {}

	const paramLines = Object.keys(props).length
		? Object.entries(props)
				.map(([name]) => {
					const value = exampleValues[name] ?? `$${name.toUpperCase()}` // 占位符
					// 这里不转义XML - 示例应该显示原始格式
					return `<parameter name="${name}">${value}</parameter>`
				})
				.join("\n")
		: ""

	// 只包含一个invoke块
	return ["<function_calls>", `<invoke name="${toolDef.name}">`, paramLines, "</invoke>", "</function_calls>"]
		.filter(Boolean)
		.join("\n")
}

/**
 * 为ANTML格式的工具创建完整的系统提示部分，
 * 包括指令和工具定义。
 * @param toolDefs 工具定义对象数组
 * @param includeInstructions 是否包含标准工具调用指令
 * @returns ANTML工具的完整系统提示部分
 */
export function createAntmlToolPrompt(toolDefs: ToolDefinition[], includeInstructions = true, systemPrompt = ""): string {
	if (toolDefs.length === 0) {
		if (!includeInstructions) {
			return ""
		}

		const noToolsMessage = [
			"在此环境中，你可以访问一套工具来回答用户的问题。",
			'你可以通过编写一个 "<function_calls>" 块来调用函数，作为你回复用户的一部分：',
			"<function_calls>",
			'<invoke name="$FUNCTION_NAME">',
			'<parameter name="$PARAMETER_NAME">$PARAMETER_VALUE</parameter>',
			"...",
			"</invoke>",
			"</function_calls>",
			"",
			"字符串和标量参数应该按原样指定，而列表和对象应该使用JSON格式。",
			"",
			"但是，当前没有可用的工具。",
		].join("\n")

		return noToolsMessage
	}

	let prompt = ""

	if (includeInstructions) {
		const instructionLines = [
			"在此环境中，你可以访问一套工具来回答用户的问题。",
			'你可以通过编写一个 "<function_calls>" 块来调用函数，作为你回复用户的一部分：',
			"<function_calls>",
			'<invoke name="$FUNCTION_NAME">',
			'<parameter name="$PARAMETER_NAME">$PARAMETER_VALUE</parameter>',
			"...",
			"</invoke>",
			"</function_calls>",
			"",
			"字符串和标量参数应该按原样指定，而列表和对象应该使用JSON格式。",
			"",
		]
		prompt += instructionLines.join("\n")
	}

	prompt += toolDefinitionsToAntmlDefinitions(toolDefs)

	if (includeInstructions) {
		const closingInstructions = [
			"",
			"",
			systemPrompt,
			"",
			"",
			"使用相关工具（如果可用）回答用户的请求。检查每个工具调用的所有必需参数是否已提供或可以从上下文中合理推断。如果没有相关工具或必需参数缺少值，请要求用户提供这些值；否则继续进行工具调用。如果用户为参数提供了特定值（例如在引号中提供），请确保完全使用该值。不要为可选参数编造值或询问可选参数。仔细分析请求中的描述性术语，因为它们可能指示应包含的必需参数值，即使没有明确引用。",
		]
		prompt += closingInstructions.join("\n")
	}

	return prompt // 不修剪 - 保留精确格式
}

// --- SimpleXML函数（Cline的内部格式）---

/**
 * 将单个工具定义转换为SimpleXML格式
 * 作为Cline当前系统提示用于非ANTML模型。
 * @param toolDef 工具定义对象
 * @returns 格式化为SimpleXML用法的工具定义
 */
export function toolDefinitionToSimpleXml(toolDef: ToolDefinition): string {
	const description = toolDef.descriptionForAgent || toolDef.description || ""
	const properties = toolDef.inputSchema.properties || {}
	const required = toolDef.inputSchema.required || []

	let parameterDocs = ""
	if (Object.keys(properties).length > 0) {
		parameterDocs = "参数：\n"
		for (const [paramName, paramDef] of Object.entries(properties)) {
			const isRequired = required.includes(paramName)
			const requiredText = isRequired ? "（必需）" : "（可选）"
			const paramDescription = (paramDef as any).description || "无描述。"
			parameterDocs += `- ${paramName}：${requiredText} ${paramDescription}\n`
		}
	}

	const exampleParams = Object.keys(properties)
		.map((paramName) => `<${paramName}>${paramName} value here</${paramName}>`)
		.join("\n")

	const usageExample = `用法：
<${toolDef.name}>
${exampleParams.length > 0 ? exampleParams + "\n" : ""}</${toolDef.name}>`

	return `## ${toolDef.name}
描述：${description}
${parameterDocs.trim()}
${usageExample}`
}

/**
 * 将多个工具定义转换为完整的SimpleXML格式。
 * @param toolDefs 工具定义对象数组
 * @returns SimpleXML格式的完整工具文档
 */
export function toolDefinitionsToSimpleXml(toolDefs: ToolDefinition[]): string {
	const toolDocs = toolDefs.map((toolDef) => toolDefinitionToSimpleXml(toolDef))
	return `# 工具

${toolDocs.join("\n\n")}`
}

/**
 * 为SimpleXML格式的工具创建完整的系统提示部分。
 * @param toolDefs 工具定义对象数组
 * @param includeInstructions 是否包含标准工具调用指令
 * @returns SimpleXML工具的完整系统提示部分
 */
export function createSimpleXmlToolPrompt(toolDefs: ToolDefinition[], includeInstructions: boolean = true): string {
	if (toolDefs.length === 0) {
		return ""
	}

	let prompt = ""

	if (includeInstructions) {
		prompt += `工具使用

您可以访问一组在用户批准后执行的工具。您每条消息可以使用一个工具，并且会在用户的响应中收到该工具使用的结果。您使用工具逐步完成给定任务，每次工具使用都基于上一次工具使用的结果。

# 工具使用格式

工具使用采用XML样式标签格式。工具名称被包含在开始和结束标签中，每个参数也类似地包含在自己的标签集中。结构如下：

<tool_name>
<parameter1_name>value1</parameter1_name>
<parameter2_name>value2</parameter2_name>
...
</tool_name>

例如：

<read_file>
<path>src/main.js</path>
</read_file>

始终遵循此格式进行工具使用，以确保正确解析和执行。
`
	}

	prompt += toolDefinitionsToSimpleXml(toolDefs)

	if (includeInstructions) {
		prompt += `

# 工具使用指南

1. 根据任务和提供的工具描述选择最合适的工具。
2. 如果需要多个操作，每条消息使用一个工具来迭代完成任务。
3. 使用为每个工具指定的XML格式来制定您的工具使用。
4. 在每次工具使用后，用户将响应该工具使用的结果。
5. 在进行下一步之前，始终等待用户在每次工具使用后的确认。`
	}
	return prompt.trimEnd()
}
