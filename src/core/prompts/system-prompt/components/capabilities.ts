import { isZhCN } from "../i18n/getLocaleText"
import { SystemPromptSection } from "../templates/placeholders"
import { TemplateEngine } from "../templates/TemplateEngine"
import type { PromptVariant, SystemPromptContext } from "../types"

const getCapabilitiesTemplateText = (context: SystemPromptContext) => `CAPABILITIES

- You have access to tools that let you execute CLI commands on the user's computer, list files, view source code definitions, regex search{{BROWSER_SUPPORT}}, read and edit files${context.yoloModeToggled !== true ? ", and ask follow-up questions" : ""}. These tools help you effectively accomplish a wide range of tasks, such as writing code, making edits or improvements to existing files, understanding the current state of a project, performing system operations, and much more.
- When the user initially gives you a task, a recursive list of all filepaths in the current working directory ('{{CWD}}') will be included in environment_details. This provides an overview of the project's file structure, offering key insights into the project from directory/file names (how developers conceptualize and organize their code) and file extensions (the language used). This can also guide decision-making on which files to explore further. If you need to further explore directories such as outside the current working directory, you can use the list_files tool. If you pass 'true' for the recursive parameter, it will list files recursively. Otherwise, it will list files at the top level, which is better suited for generic directories where you don't necessarily need the nested structure, like the Desktop.
- You can use search_files to perform regex searches across files in a specified directory, outputting context-rich results that include surrounding lines. This is particularly useful for understanding code patterns, finding specific implementations, or identifying areas that need refactoring.
- You can use the list_code_definition_names tool to get an overview of source code definitions for all files at the top level of a specified directory. This can be particularly useful when you need to understand the broader context and relationships between certain parts of the code. You may need to call this tool multiple times to understand various parts of the codebase related to the task.
    - For example, when asked to make edits or improvements you might analyze the file structure in the initial environment_details to get an overview of the project, then use list_code_definition_names to get further insight using source code definitions for files located in relevant directories, then read_file to examine the contents of relevant files, analyze the code and suggest improvements or make necessary edits, then use the replace_in_file tool to implement changes. If you refactored code that could affect other parts of the codebase, you could use search_files to ensure you update other files as needed.
- You can use the execute_command tool to run commands on the user's computer whenever you feel it can help accomplish the user's task. When you need to execute a CLI command, you must provide a clear explanation of what the command does. Prefer to execute complex CLI commands over creating executable scripts, since they are more flexible and easier to run. Prefer non-interactive commands when possible: use flags to disable pagers (e.g., '--no-pager'), auto-confirm prompts (e.g., '-y' when safe), provide input via flags/arguments rather than stdin, suppress interactive behavior, etc. For commands that may fail, consider redirecting stderr to stdout (e.g., \`command 2>&1\`) so you can see error messages in the output. For long-running commands, the user may keep them running in the background and you will be kept updated on their status along the way. Each command you execute is run in a new terminal instance.{{BROWSER_CAPABILITIES}}{{WEB_TOOLS_CAPABILITIES}}
- You have access to MCP servers that may provide additional tools and resources. Each server may provide different capabilities that you can use to accomplish tasks more effectively.`

const getCapabilitiesTemplateTextZhCN = (context: SystemPromptContext) => `CAPABILITIES

- 你可以使用工具在用户的计算机上执行 CLI 命令、列出文件、查看源代码定义、正则搜索{{BROWSER_SUPPORT}}、读取和编辑文件${context.yoloModeToggled !== true ? "，以及提出后续问题" : ""}。这些工具帮助你高效完成各种任务，如编写代码、对现有文件进行编辑或改进、了解项目的当前状态、执行系统操作等等。
- 当用户首次给你一个任务时，environment_details 中会包含当前工作目录（'{{CWD}}'）中所有文件路径的递归列表。这提供了项目文件结构的概览，从目录/文件名（开发者如何概念化和组织他们的代码）和文件扩展名（使用的语言）中提供关键洞察。这也可以指导你决定进一步探索哪些文件。如果你需要进一步探索当前工作目录之外的目录，可以使用 list_files 工具。如果为 recursive 参数传递 'true'，它将递归列出文件。否则，它将列出顶级目录中的文件，这更适合你不需要嵌套结构的通用目录，如桌面。
- 你可以使用 search_files 在指定目录中的文件中执行正则搜索，输出包含周围行的丰富上下文结果。这对于理解代码模式、查找特定实现或识别需要重构的区域特别有用。
- 你可以使用 list_code_definition_names 工具获取指定目录顶层所有文件的源代码定义概览。当你需要了解代码的更广泛上下文和某些部分之间的关系时，这特别有用。你可能需要多次调用此工具来了解与任务相关的代码库的各个部分。
    - 例如，当被要求进行编辑或改进时，你可以分析初始 environment_details 中的文件结构以获取项目概览，然后使用 list_code_definition_names 获取相关目录中文件的源代码定义的进一步洞察，然后使用 read_file 检查相关文件的内容，分析代码并建议改进或进行必要的编辑，然后使用 replace_in_file 工具实施更改。如果你重构了可能影响代码库其他部分的代码，可以使用 search_files 确保按需更新其他文件。
- 你可以使用 execute_command 工具在你认为有助于完成用户任务时在用户的计算机上运行命令。当你需要执行 CLI 命令时，必须提供该命令功能的清晰说明。优先执行复杂的 CLI 命令而不是创建可执行脚本，因为它们更灵活且更易于运行。尽可能优先使用非交互式命令：使用标志禁用分页器（例如 '--no-pager'），自动确认提示（例如在安全时使用 '-y'），通过标志/参数而非 stdin 提供输入，抑制交互行为等。对于可能失败的命令，考虑将 stderr 重定向到 stdout（例如 \`command 2>&1\`），以便在输出中看到错误消息。对于长时间运行的命令，用户可以将其保持在后台运行，你将在过程中收到其状态更新。你执行的每个命令都在一个新的终端实例中运行。{{BROWSER_CAPABILITIES}}{{WEB_TOOLS_CAPABILITIES}}
- 你可以访问 MCP 服务器，它们可能提供额外的工具和资源。每个服务器可能提供不同的能力，你可以利用这些能力更有效地完成任务。`

export async function getCapabilitiesSection(variant: PromptVariant, context: SystemPromptContext): Promise<string> {
	const templateFn = isZhCN(context.locale) ? getCapabilitiesTemplateTextZhCN : getCapabilitiesTemplateText
	const template = variant.componentOverrides?.[SystemPromptSection.CAPABILITIES]?.template || templateFn

	const browserSupportEn = ", use the browser"
	const browserSupportZh = "、使用浏览器"
	const browserSupport = isZhCN(context.locale)
		? context.supportsBrowserUse
			? browserSupportZh
			: ""
		: context.supportsBrowserUse
			? browserSupportEn
			: ""

	const browserCapabilitiesEn = context.supportsBrowserUse
		? `\n- You can use the browser_action tool to interact with websites (including html files and locally running development servers) through a Puppeteer-controlled browser when you feel it is necessary in accomplishing the user's task. This tool is particularly useful for web development tasks as it allows you to launch a browser, navigate to pages, interact with elements through clicks and keyboard input, and capture the results through screenshots and console logs. This tool may be useful at key stages of web development tasks-such as after implementing new features, making substantial changes, when troubleshooting issues, or to verify the result of your work. You can analyze the provided screenshots to ensure correct rendering or identify errors, and review console logs for runtime issues.\n\t- For example, if asked to add a component to a react website, you might create the necessary files, use execute_command to run the site locally, then use browser_action to launch the browser, navigate to the local server, and verify the component renders & functions correctly before closing the browser.`
		: ""
	const browserCapabilitiesZh = context.supportsBrowserUse
		? `\n- 你可以使用 browser_action 工具通过 Puppetee 控制的浏览器与网站（包括 html 文件和本地运行的开发服务器）进行交互，当你认为有必要完成用户任务时。此工具对于 Web 开发任务特别有用，因为它允许你启动浏览器、导航到页面、通过点击和键盘输入与元素交互，并通过截图和控制台日志捕获结果。此工具在 Web 开发任务的关键阶段可能很有用——例如在实现新功能后、进行重大更改时、排查问题时，或验证你的工作结果时。你可以分析提供的截图以确保正确渲染或识别错误，并查看控制台日志以排查运行时问题。\n\t- 例如，如果被要求向 React 网站添加组件，你可能会创建必要的文件，使用 execute_command 在本地运行站点，然后使用 browser_action 启动浏览器，导航到本地服务器，并在关闭浏览器之前验证组件是否正确渲染和运行。`
		: ""
	const browserCapabilities = isZhCN(context.locale) ? browserCapabilitiesZh : browserCapabilitiesEn

	const webToolsCapabilitiesEn =
		context.providerInfo.providerId === "cline" && context.clineWebToolsEnabled === true
			? `\n- When the task requires or could benefit from getting up to date information on a topic (e.g. latest best practices, latest documentation, latest news, etc.), use the web_search tool to find current results, then use the web_fetch tool to retrieve and analyze the content from relevant URLs.`
			: ""
	const webToolsCapabilitiesZh =
		context.providerInfo.providerId === "cline" && context.clineWebToolsEnabled === true
			? `\n- 当任务需要或可能受益于获取某个主题的最新信息（例如最新最佳实践、最新文档、最新新闻等）时，使用 web_search 工具查找当前结果，然后使用 web_fetch 工具检索和分析相关 URL 的内容。`
			: ""
	const webToolsCapabilities = isZhCN(context.locale) ? webToolsCapabilitiesZh : webToolsCapabilitiesEn

	const templateEngine = new TemplateEngine()
	return templateEngine.resolve(template, context, {
		BROWSER_SUPPORT: browserSupport,
		BROWSER_CAPABILITIES: browserCapabilities,
		WEB_TOOLS_CAPABILITIES: webToolsCapabilities,
		CWD: context.cwd || process.cwd(),
	})
}
