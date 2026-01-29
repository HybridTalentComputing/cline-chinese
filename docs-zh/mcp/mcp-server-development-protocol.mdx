---
title: "MCP 服务器开发协议"
description: "该协议旨在简化使用 Cline 构建 MCP 服务器的开发过程。"
---

> **构建并与世界分享你的 MCP 服务器。**一旦你创建了一个很棒的 MCP 服务器，将其提交到 [Cline MCP 市场](https://github.com/cline/mcp-marketplace)，使其可以被数千名开发者发现并可一键安装。

## 什么是 MCP 服务器？

模型上下文协议 (MCP) 服务器通过赋予 AI 助手（如 Cline）以下能力来扩展它们：

-   访问外部 API 和服务
-   检索实时数据
-   控制应用程序和本地系统
-   执行超出文本提示词本身能力的操作

没有 MCP，AI 助手功能强大但是隔离的。有了 MCP，它们获得了与几乎任何数字系统交互的能力。

## 开发协议

有效的 MCP 服务器开发的核心是遵循结构化协议。该协议通过位于你的 MCP 工作目录根目录（/Users/your-name/Documents/Cline/MCP）的 `.clinerules` 文件实现。

### 使用 `.clinerules` 文件

`.clinerules` 文件是一种特殊配置，Cline 在放置它的目录中工作时会自动读取。这些文件：

-   配置 Cline 的行为并强制执行最佳实践
-   将 Cline 切换到专用的 MCP 开发模式
-   提供构建服务器的分步协议
-   实施安全措施，如防止过早完成
-   引导你完成规划、实施和测试阶段

以下是应放置在 `.clinerules` 文件中的完整 MCP 服务器开发协议：

````markdown
# MCP 服务器开发协议

关键：在测试之前不要使用 attempt_completion

## 步骤 1：规划（计划模式）

-   这个工具解决什么问题？
-   它将使用什么 API/服务？
-   身份验证要求是什么？
    □ 标准 API 密钥
    □ OAuth（需要单独的设置脚本）
    □ 其他凭证

## 步骤 2：实施（执行模式）

1. 引导启动

    - 对于 Web 服务、JavaScript 集成或 Node.js 环境：
        ```bash
        npx @modelcontextprotocol/create-server my-server
        cd my-server
        npm install
        ```
    - 对于数据科学、ML 工作流或 Python 环境：
        ```bash
        pip install mcp
        # 或使用 uv（推荐）
        uv add "mcp[cli]"
        ```

2. 核心实施

    - 使用 MCP SDK
    - 实施全面的日志记录
        - TypeScript（用于 Web/JS 项目）：
            ```typescript
            console.error("[Setup] 正在初始化服务器...")
            console.error("[API] 请求端点：", endpoint)
            console.error("[Error] 失败原因：", error)
            ```
        - Python（用于数据科学/ML 项目）：
            ```python
            import logging
            logging.error('[Setup] 正在初始化服务器...')
            logging.error(f'[API] 请求端点：{endpoint}')
            logging.error(f'[Error] 失败原因：{str(error)}')
            ```
    - 添加类型定义
    - 处理带有上下文的错误
    - 如果需要，实施速率限制

3. 配置

    - 如果需要，从用户获取凭证
    - 添加到 MCP 设置：

        - 对于 TypeScript 项目：
            ```json
            {
            	"mcpServers": {
            		"my-server": {
            			"command": "node",
            			"args": ["path/to/build/index.js"],
            			"env": {
            				"API_KEY": "key"
            			},
            			"disabled": false,
            			"autoApprove": []
            		}
            	}
            }
            ```
        - 对于 Python 项目：

            ```bash
            # 直接使用命令行
            mcp install server.py -v API_KEY=key

            # 或在 settings.json 中
            {
              "mcpServers": {
                "my-server": {
                  "command": "python",
                  "args": ["server.py"],
                  "env": {
                    "API_KEY": "key"
                  },
                  "disabled": false,
                  "autoApprove": []
                }
              }
            }
            ```

## 步骤 3：测试（阻止器 ⛔️）

<thinking>
在使用 attempt_completion 之前，我必须验证：
□ 我是否测试了每个工具？
□ 我是否确认每个测试都获得了用户的成功反馈？
□ 我是否记录了测试结果？

如果任何答案为"否"，我绝不能使用 attempt_completion。
</thinking>

1. 测试每个工具（必需）
   □ 使用有效输入测试每个工具
   □ 验证输出格式正确
   在所有工具测试完成之前不要继续

## 步骤 4：完成

❗ 停止并验证：
□ 每个工具都使用有效输入进行了测试
□ 每个工具的输出格式正确

只有在所有工具都测试完成后才能使用 attempt_completion。

## 关键要求

-   ✓ 必须使用 MCP SDK
-   ✓ 必须有全面的日志记录
-   ✓ 必须单独测试每个工具
-   ✓ 必须优雅地处理错误
-   绝不在完成之前跳过测试
````

当你的工作目录中存在此 `.clinerules` 文件时，Cline 将：

1. 从**计划模式**开始，在实施之前设计你的服务器
2. 在**执行模式**中强制执行正确的实施模式
3. 要求在允许完成之前测试所有工具
4. 引导你完成整个开发生命周期

## 入门

创建 MCP 服务器只需几个简单的步骤即可开始：

### 1. 创建 `.clinerules` 文件（重要）

首先，使用上面的协议将 `.clinerules` 文件添加到 MCP 工作目录的根目录。此文件配置 Cline 在此文件夹中工作时使用 MCP 开发协议。

### 2. 以清晰的描述开始聊天

通过清楚地描述你想要构建的内容来开始 Cline 聊天。具体说明：

-   你的 MCP 服务器的目的
-   你想要集成的 API 或服务
-   你需要的任何特定工具或功能

例如：

```plaintext
我想为 AlphaAdvantage 金融 API 构建 MCP 服务器。
它应该允许我获取实时股票数据、执行技术
分析并检索公司财务信息。
```

### 3. 按照协议工作

Cline 将自动以计划模式开始，引导你完成规划过程：

-   讨论问题范围
-   审查 API 文档
-   规划身份验证方法
-   设计工具接口

准备好后，使用聊天底部的切换按钮切换到执行模式以开始实施。

### 4. 尽早提供 API 文档

帮助 Cline 构建 MCP 服务器的最有效方法之一是在开始时分享官方 API 文档：

```plaintext
这是该服务的 API 文档：
[在此处粘贴 API 文档]
```

提供全面的 API 详细信息（端点、身份验证、数据结构）显著提高 Cline 实施有效 MCP 服务器的能力。

## 了解两种模式

### 计划模式

在这个协作阶段，你与 Cline 一起设计你的 MCP 服务器：

-   定义问题范围
-   选择适当的 API
-   规划身份验证方法
-   设计工具接口
-   确定数据格式

### 执行模式

规划完成后，Cline 帮助实施服务器：

-   设置项目结构
-   编写实施代码
-   配置设置
-   彻底测试每个组件
-   完成文档

## 案例研究：AlphaAdvantage 股票分析服务器

让我们来了解我们的 AlphaAdvantage MCP 服务器的开发过程，该服务器提供股票数据分析和报告功能。

### 规划阶段

<Frame>
	<img
		src="https://storage.googleapis.com/cline_public_images/docs/assets/planning-phase.gif"
		alt="规划阶段演示"
		/>
</Frame>

在规划阶段，我们：

1. **定义了问题**：用户需要直接通过 AI 助手访问财务数据、股票分析和市场洞察
2. **选择了 API**：用于金融市场数据的 AlphaAdvantage API
    - 标准 API 密钥身份验证
    - 每分钟 5 次请求的速率限制（免费层）
    - 不同财务数据类型的各种端点
3. **设计了所需的工具**：
    - 股票概览信息（当前价格、公司详情）
    - 带有指标的技术分析（RSI、MACD 等）
    - 基本面分析（财务报表、比率）
    - 收益报告数据
    - 新闻和情绪分析
4. **规划了数据格式化**：
    - 干净、格式良好的 markdown 输出
    - 用于结构化数据的表格
    - 趋势的视觉指示器（↑/↓）
    - 财务数字的适当格式

### 实施

<Frame>
	<img
		src="https://storage.googleapis.com/cline_public_images/docs/assets/building-mcp-plugin.gif"
		alt="构建 MCP 插件演示"
		/>
</Frame>

我们通过引导启动项目开始：

```bash
npx @modelcontextprotocol/create-server alphaadvantage-mcp
cd alphaadvantage-mcp
npm install axios node-cache
```

接下来，我们用以下结构构建了项目：

```plaintext
src/
  ├── api/
  │   └── alphaAdvantageClient.ts  # 带有速率限制和缓存的 API 客户端
  ├── formatters/
  │   └── markdownFormatter.ts     # 用于干净 markdown 输出的格式化器
  └── index.ts                     # 主要 MCP 服务器实施
```

#### API 客户端实施

API 客户端实施包括：

-   **速率限制**：强制执行每分钟 5 次请求的限制
-   **缓存**：通过战略性缓存减少 API 调用
-   **错误处理**：强大的错误检测和报告
-   **类型化接口**：所有数据的清晰 TypeScript 类型

关键实施细节：

```typescript
/**
 * 基于免费层管理速率限制（每分钟 5 次调用）
 */
private async enforceRateLimit() {
  if (this.requestsThisMinute >= 5) {
    console.error("[Rate Limit] 达到速率限制。等待下一分钟...");
    return new Promise<void>((resolve) => {
      const remainingMs = 60 * 1000 - (Date.now() % (60 * 1000));
      setTimeout(resolve, remainingMs + 100); // 添加 100ms 缓冲
    });
  }

  this.requestsThisMinute++;
  return Promise.resolve();
}
```

#### Markdown 格式化

我们实施了格式化器以美观地显示财务数据：

```typescript
/**
 * 将公司概览格式化为 markdown
 */
export function formatStockOverview(overviewData: any, quoteData: any): string {
	// 提取数据
	const overview = overviewData
	const quote = quoteData["Global Quote"]

	// 计算价格变化
	const currentPrice = parseFloat(quote["05. price"] || "0")
	const priceChange = parseFloat(quote["09. change"] || "0")
	const changePercent = parseFloat(quote["10. change percent"]?.replace("%", "") || "0")

	// 格式化 markdown
	let markdown = `# ${overview.Symbol} (${overview.Name}) - ${formatCurrency(currentPrice)} ${addTrendIndicator(priceChange)}${changePercent > 0 ? "+" : ""}${changePercent.toFixed(2)}%\n\n`

	// 添加更多详细信息...

	return markdown
}
```

#### 工具实施

我们用清晰的接口定义了五个工具：

```typescript
server.setRequestHandler(ListToolsRequestSchema, async () => {
	console.error("[Setup] 列出可用工具")

	return {
		tools: [
			{
				name: "get_stock_overview",
				description: "获取股票代码的基本公司信息和当前报价",
				inputSchema: {
					type: "object",
					properties: {
						symbol: {
							type: "string",
							description: "股票代码（例如，'AAPL'）",
						},
						market: {
							type: "string",
							description: "可选市场（例如，'US'）",
							default: "US",
						},
					},
					required: ["symbol"],
				},
			},
			// 此处定义的其他工具...
		],
	}
})
```

每个工具的处理程序包括：

-   输入验证
-   带有错误处理的 API 客户端调用
-   响应的 Markdown 格式化
-   全面的日志记录

### 测试阶段

这个关键阶段涉及系统地测试每个工具：

1. 首先，我们在设置中配置了 MCP 服务器：

```json
{
	"mcpServers": {
		"alphaadvantage-mcp": {
			"command": "node",
			"args": ["/path/to/alphaadvantage-mcp/build/index.js"],
			"env": {
				"ALPHAVANTAGE_API_KEY": "YOUR_API_KEY"
			},
			"disabled": false,
			"autoApprove": []
		}
	}
}
```

2. 然后我们单独测试了每个工具：

-   **get_stock_overview**：检索了 AAPL 股票概览信息

    ```markdown
    # AAPL (Apple Inc) - $241.84 ↑+1.91%

    **Sector:** TECHNOLOGY
    **Industry:** ELECTRONIC COMPUTERS
    **Market Cap:** 3.63T
    **P/E Ratio:** 38.26
    ...
    ```

-   **get_technical_analysis**：获得了价格行为和 RSI 数据

    ```markdown
    # Technical Analysis: AAPL

    ## Daily Price Action

    Current Price: $241.84 (↑$4.54, +1.91%)

    ### Recent Daily Prices

    | Date       | Open    | High    | Low     | Close   | Volume |
    | ---------- | ------- | ------- | ------- | ------- | ------ |
    | 2025-02-28 | $236.95 | $242.09 | $230.20 | $241.84 | 56.83M |

    ...
    ```

-   **get_earnings_report**：检索了 MSFT 收益历史并格式化了报告

    ```markdown
    # Earnings Report: MSFT (Microsoft Corporation)

    **Sector:** TECHNOLOGY
    **Industry:** SERVICES-PREPACKAGED SOFTWARE
    **Current EPS:** $12.43

    ## Recent Quarterly Earnings

    | Quarter    | Date       | EPS Estimate | EPS Actual | Surprise % |
    | ---------- | ---------- | ------------ | ---------- | ---------- |
    | 2024-12-31 | 2025-01-29 | $3.11        | $3.23      | ↑4.01%     |

    ...
    ```

### 挑战和解决方案

在开发过程中，我们遇到了几个挑战：

1. **API 速率限制**：
    - **挑战**：免费层限制为每分钟 5 次调用
    - **解决方案**：实施了排队、强制执行速率限制并添加了全面的缓存
2. **数据格式化**：
    - **挑战**：原始 API 数据对用户不友好
    - **解决方案**：创建了格式化工具以一致地显示财务数据
3. **超时问题**：
    - **挑战**：进行多个 API 调用的复杂工具可能会超时
    - **解决方案**：建议将复杂工具分解为更小的部分，优化缓存

### 经验教训

我们的 AlphaAdvantage 实施教会了我们几个关键教训：

1. **规划 API 限制**：从一开始了解并围绕 API 速率限制进行设计
2. **战略性缓存**：识别高价值的缓存机会以提高性能
3. **格式化以提高可读性**：投资良好的数据格式化以改善用户体验
4. **测试每条路径**：在完成之前单独测试所有工具
5. **处理 API 复杂性**：对于需要多次调用的 API，用更简单的范围设计工具

## 核心实施最佳实践

### 全面的日志记录

有效的日志记录对于调试 MCP 服务器至关重要：

```typescript
// 启动日志记录
console.error("[Setup] 正在初始化 AlphaAdvantage MCP 服务器...")

// API 请求日志记录
console.error(`[API] 获取 ${symbol} 的股票概览`)

// 带有上下文的错误处理
console.error(`[Error] 工具执行失败：${error.message}`)

// 缓存操作
console.error(`[Cache] 使用 ${cacheKey} 的缓存数据`)
```

### 强类型

类型定义防止错误并提高可维护性：

```typescript
export interface AlphaAdvantageConfig {
	apiKey: string
	cacheTTL?: Partial<typeof DEFAULT_CACHE_TTL>
	baseURL?: string
}

/**
 * 验证是否提供了股票代码并且看起来有效
 */
function validateSymbol(symbol: unknown): asserts symbol is string {
	if (typeof symbol !== "string" || symbol.trim() === "") {
		throw new McpError(ErrorCode.InvalidParams, "需要有效的股票代码")
	}

	// 基本代码验证（字母、数字、点）
	const symbolRegex = /^[A-Za-z0-9.]+$/
	if (!symbolRegex.test(symbol)) {
		throw new McpError(ErrorCode.InvalidParams, `无效的股票代码：${symbol}`)
	}
}
```

### 智能缓存

减少 API 调用并提高性能：

```typescript
// 默认缓存 TTL（以秒为单位）
const DEFAULT_CACHE_TTL = {
	STOCK_OVERVIEW: 60 * 60, // 1 小时
	TECHNICAL_ANALYSIS: 60 * 30, // 30 分钟
	FUNDAMENTAL_ANALYSIS: 60 * 60 * 24, // 24 小时
	EARNINGS_REPORT: 60 * 60 * 24, // 24 小时
	NEWS: 60 * 15, // 15 分钟
}

// 首先检查缓存
const cachedData = this.cache.get<T>(cacheKey)
if (cachedData) {
	console.error(`[Cache] 使用 ${cacheKey} 的缓存数据`)
	return cachedData
}

// 缓存成功的响应
this.cache.set(cacheKey, response.data, cacheTTL)
```

### 优雅的错误处理

实施强大的错误处理，保持良好的用户体验：

```typescript
try {
	switch (request.params.name) {
		case "get_stock_overview": {
			// 实施...
		}

		// 其他情况...

		default:
			throw new McpError(ErrorCode.MethodNotFound, `未知工具：${request.params.name}`)
	}
} catch (error) {
	console.error(`[Error] 工具执行失败：${error instanceof Error ? error.message : String(error)}`)

	if (error instanceof McpError) {
		throw error
	}

	return {
		content: [
			{
				type: "text",
				text: `Error: ${error instanceof Error ? error.message : String(error)}`,
			},
		],
		isError: true,
	}
}
```

## MCP 资源

资源让你的 MCP 服务器向 Cline 暴露数据而无需执行代码。它们非常适合提供上下文，如文件、API 响应或 Cline 在对话期间可以引用的数据库记录。

### 将资源添加到你的 MCP 服务器

1. **定义**你的服务器将暴露的资源：

```typescript
server.setRequestHandler(ListResourcesRequestSchema, async () => {
	return {
		resources: [
			{
				uri: "file:///project/readme.md",
				name: "Project README",
				mimeType: "text/markdown",
			},
		],
	}
})
```

2. **实施读取处理程序**以交付内容：

```typescript
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
	if (request.params.uri === "file:///project/readme.md") {
		const content = await fs.promises.readFile("/path/to/readme.md", "utf-8")
		return {
			contents: [
				{
					uri: request.params.uri,
					mimeType: "text/markdown",
					text: content,
				},
			],
		}
	}

	throw new Error("Resource not found")
})
```

资源使你的 MCP 服务器更加上下文感知，允许 Cline 访问特定信息而无需你复制/粘贴。有关更多信息，请参阅[官方文档](https://modelcontextprotocol.io/docs/concepts/resources)。

## 常见挑战和解决方案

### API 身份验证复杂性

**挑战**：API 通常有不同的身份验证方法。

**解决方案**：

-   对于 API 密钥，在 MCP 配置中使用环境变量
-   对于 OAuth，创建单独的脚本来获取刷新令牌
-   安全存储敏感令牌

```typescript
// 使用来自环境的 API 密钥进行身份验证
const API_KEY = process.env.ALPHAVANTAGE_API_KEY
if (!API_KEY) {
	console.error("[Error] 缺少 ALPHAVANTAGE_API_KEY 环境变量")
	process.exit(1)
}

// 初始化 API 客户端
const apiClient = new AlphaAdvantageClient({
	apiKey: API_KEY,
})
```

### 缺失或有限的 API 功能

**挑战**：API 可能不提供你需要的所有功能。

**解决方案**：

-   使用可用端点实施回退
-   在必要时创建模拟功能
-   转换 API 数据以匹配你的需求

### API 速率限制

**挑战**：大多数 API 都有速率限制，可能导致失败。

**解决方案**：

-   实施适当的速率限制
-   添加智能缓存
-   提供优雅的降级
-   添加关于速率限制的透明错误

```typescript
if (this.requestsThisMinute >= 5) {
	console.error("[Rate Limit] 达到速率限制。等待下一分钟...")
	return new Promise<void>((resolve) => {
		const remainingMs = 60 * 1000 - (Date.now() % (60 * 1000))
		setTimeout(resolve, remainingMs + 100) // 添加 100ms 缓冲
	})
}
```

## 其他资源

-   [MCP 协议文档](https://github.com/modelcontextprotocol/mcp)
-   [MCP SDK 文档](https://github.com/modelcontextprotocol/sdk-js)
-   [MCP 服务器示例](https://github.com/modelcontextprotocol/servers)
