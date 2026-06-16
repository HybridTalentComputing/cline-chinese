import { ModelFamily } from "@/shared/prompts"
import { ClineDefaultTool } from "@/shared/tools"
import { isZhCN } from "../i18n/getLocaleText"
import type { ClineToolSpec } from "../spec"
import type { SystemPromptContext } from "../types"

const id = ClineDefaultTool.BROWSER

const DESCRIPTION_EN = `Request to interact with a Puppeteer-controlled browser. Every action, except \`close\`, will be responded to with a screenshot of the browser's current state, along with any new console logs. You may only perform one browser action per message, and wait for the user's response including a screenshot and logs to determine the next action.
- The sequence of actions **must always start with** launching the browser at a URL, and **must always end with** closing the browser. If you need to visit a new URL that is not possible to navigate to from the current webpage, you must first close the browser, then launch again at the new URL.
- While the browser is active, only the \`browser_action\` tool can be used. No other tools should be called during this time. You may proceed to use other tools only after closing the browser. For example if you run into an error and need to fix a file, you must close the browser, then use other tools to make the necessary changes, then re-launch the browser to verify the result.
- The browser window has a resolution of **{{BROWSER_VIEWPORT_WIDTH}}x{{BROWSER_VIEWPORT_HEIGHT}}** pixels. When performing any click actions, ensure the coordinates are within this resolution range.
- Before clicking on any elements such as icons, links, or buttons, you must consult the provided screenshot of the page to determine the coordinates of the element. The click should be targeted at the **center of the element**, not on its edges.`

const DESCRIPTION_ZH_CN = `请求与 Puppeteer 控制的浏览器交互。除了 \`close\` 之外的每个操作都将通过浏览器当前状态的屏幕截图以及任何新的控制台日志来响应。每条消息只能执行一个浏览器操作，并等待用户的响应（包括屏幕截图和日志）以确定下一个操作。
- 操作序列**必须始终以**在 URL 启动浏览器**开始**，并**必须始终以**关闭浏览器**结束**。如果您需要访问无法从当前网页导航到的新 URL，必须先关闭浏览器，然后在新 URL 处重新启动。
- 在浏览器处于活动状态时，只能使用\`browser_action\`工具。在此期间不应调用其他工具。只有在关闭浏览器后才能继续使用其他工具。例如，如果遇到错误需要修复文件，必须关闭浏览器，然后使用其他工具进行必要的更改，然后重新启动浏览器以验证结果。
- 浏览器窗口的分辨率为 **{{BROWSER_VIEWPORT_WIDTH}}x{{BROWSER_VIEWPORT_HEIGHT}}** 像素。执行任何点击操作时，确保坐标在此分辨率范围内。
- 在点击任何元素（如图标、链接或按钮）之前，必须查看提供的页面屏幕截图以确定元素的坐标。点击应针对**元素的中心**，而不是其边缘。`

const INSTRUCTION_ACTION_EN = `The action to perform. The available actions are:
		* launch: Launch a new Puppeteer-controlled browser instance at the specified URL. This **must always be the first action**.
			- Use with the \`url\` parameter to provide the URL.
			- Ensure the URL is valid and includes the appropriate protocol (e.g. http://localhost:3000/page, file:///path/to/file.html, etc.)
		* click: Click at a specific x,y coordinate.
			- Use with the \`coordinate\` parameter to specify the location.
			- Always click in the center of an element (icon, button, link, etc.) based on coordinates derived from a screenshot.
		* type: Type a string of text on the keyboard. You might use this after clicking on a text field to input text.
			- Use with the \`text\` parameter to provide the string to type.
		* scroll_down: Scroll down the page by one page height.
		* scroll_up: Scroll up the page by one page height.
		* close: Close the Puppeteer-controlled browser instance. This **must always be the final browser action**.
		    - Example: \`<action>close</action>\``

const INSTRUCTION_ACTION_ZH_CN = `要执行的操作。可用的操作有：
		* launch：在指定的 URL 启动一个新的 Puppeteer 控制的浏览器实例。这**必须始终是第一个操作**。
			- 与\`url\`参数一起使用以提供 URL。
			- 确保 URL 有效并包含适当的协议（例如 http://localhost:3000/page、file:///path/to/file.html 等）
		* click：在特定的 x,y 坐标处点击。
			- 与\`coordinate\`参数一起使用以指定位置。
			- 始终根据从屏幕截图得出的坐标点击元素（图标、按钮、链接等）的中心。
		* type：在键盘上输入一段文本。您可以在单击文本字段后使用它来输入文本。
			- 与\`text\`参数一起使用以提供要输入的字符串。
		* scroll_down：向下滚动页面一个页面高度。
		* scroll_up：向上滚动页面一个页面高度。
		* close：关闭 Puppeteer 控制的浏览器实例。这**必须始终是最后的浏览器操作**。
		    - 示例：\`<action>close</action>\``

const INSTRUCTION_URL_GENERIC_EN = `Use this for providing the URL for the \`launch\` action.
		* Example: <url>https://example.com</url>`

const INSTRUCTION_URL_GENERIC_ZH_CN = `用于为\`launch\`操作提供 URL。
		* 示例：<url>https://example.com</url>`

const INSTRUCTION_COORDINATE_GENERIC_EN = `The X and Y coordinates for the \`click\` action. Coordinates should be within the **{{BROWSER_VIEWPORT_WIDTH}}x{{BROWSER_VIEWPORT_HEIGHT}}** resolution.
		* Example: <coordinate>450,300</coordinate>`

const INSTRUCTION_COORDINATE_GENERIC_ZH_CN = `\`click\`操作的 X 和 Y 坐标。坐标应在 **{{BROWSER_VIEWPORT_WIDTH}}x{{BROWSER_VIEWPORT_HEIGHT}}** 分辨率范围内。
		* 示例：<coordinate>450,300</coordinate>`

const INSTRUCTION_TEXT_GENERIC_EN = `Use this for providing the text for the \`type\` action.
		* Example: <text>Hello, world!</text>`

const INSTRUCTION_TEXT_GENERIC_ZH_CN = `用于为\`type\`操作提供文本。
		* 示例：<text>Hello, world!</text>`

const INSTRUCTION_URL_NATIVE_EN = `Use this for providing the URL for the \`launch\` action.`
const INSTRUCTION_URL_NATIVE_ZH_CN = `用于为\`launch\`操作提供 URL。`

const INSTRUCTION_COORDINATE_NATIVE_EN =
	"x,y coordinates - The X and Y coordinates for the `click` action. Coordinates should be within the **{{BROWSER_VIEWPORT_WIDTH}}x{{BROWSER_VIEWPORT_HEIGHT}}** resolution. Example: '450,300'"

const INSTRUCTION_COORDINATE_NATIVE_ZH_CN =
	"x,y 坐标 - `click`操作的 X 和 Y 坐标。坐标应在 **{{BROWSER_VIEWPORT_WIDTH}}x{{BROWSER_VIEWPORT_HEIGHT}}** 分辨率范围内。示例：'450,300'"

const INSTRUCTION_TEXT_NATIVE_EN = `Use this for providing the text for the \`type\` action. Example: 'Hello, world!'`
const INSTRUCTION_TEXT_NATIVE_ZH_CN = `用于为\`type\`操作提供文本。示例：'Hello, world!'`

const GENERIC: ClineToolSpec = {
	variant: ModelFamily.GENERIC,
	id,
	name: "browser_action",
	description: (context: SystemPromptContext) => (isZhCN(context.locale) ? DESCRIPTION_ZH_CN : DESCRIPTION_EN),
	contextRequirements: (context) => context.supportsBrowserUse === true,
	parameters: [
		{
			name: "action",
			required: true,
			instruction: (context: SystemPromptContext) =>
				isZhCN(context.locale) ? INSTRUCTION_ACTION_ZH_CN : INSTRUCTION_ACTION_EN,
			usage: "Action to perform (e.g., launch, click, type, scroll_down, scroll_up, close)",
		},
		{
			name: "url",
			required: false,
			instruction: (context: SystemPromptContext) =>
				isZhCN(context.locale) ? INSTRUCTION_URL_GENERIC_ZH_CN : INSTRUCTION_URL_GENERIC_EN,
			usage: "URL to launch the browser at (optional)",
		},
		{
			name: "coordinate",
			required: false,
			instruction: (context: SystemPromptContext) =>
				isZhCN(context.locale) ? INSTRUCTION_COORDINATE_GENERIC_ZH_CN : INSTRUCTION_COORDINATE_GENERIC_EN,
			usage: "x,y coordinates (optional)",
		},
		{
			name: "text",
			required: false,
			instruction: (context: SystemPromptContext) =>
				isZhCN(context.locale) ? INSTRUCTION_TEXT_GENERIC_ZH_CN : INSTRUCTION_TEXT_GENERIC_EN,
			usage: "Text to type (optional)",
		},
	],
}

const NATIVE_NEXT_GEN: ClineToolSpec = {
	variant: ModelFamily.NATIVE_NEXT_GEN,
	id,
	name: "browser_action",
	description: (context: SystemPromptContext) => (isZhCN(context.locale) ? DESCRIPTION_ZH_CN : DESCRIPTION_EN),
	contextRequirements: (context) => context.supportsBrowserUse === true,
	parameters: [
		{
			name: "action",
			required: true,
			instruction: (context: SystemPromptContext) =>
				isZhCN(context.locale) ? INSTRUCTION_ACTION_ZH_CN : INSTRUCTION_ACTION_EN,
		},
		{
			name: "url",
			required: false,
			instruction: (context: SystemPromptContext) =>
				isZhCN(context.locale) ? INSTRUCTION_URL_NATIVE_ZH_CN : INSTRUCTION_URL_NATIVE_EN,
		},
		{
			name: "coordinate",
			required: false,
			instruction: (context: SystemPromptContext) =>
				isZhCN(context.locale) ? INSTRUCTION_COORDINATE_NATIVE_ZH_CN : INSTRUCTION_COORDINATE_NATIVE_EN,
		},
		{
			name: "text",
			required: false,
			instruction: (context: SystemPromptContext) =>
				isZhCN(context.locale) ? INSTRUCTION_TEXT_NATIVE_ZH_CN : INSTRUCTION_TEXT_NATIVE_EN,
		},
	],
}

export const browser_action_variants = [GENERIC, NATIVE_NEXT_GEN]
