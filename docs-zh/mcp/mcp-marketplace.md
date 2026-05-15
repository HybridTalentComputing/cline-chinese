---
title: "MCP 轻松使用"
description: "了解如何使用 MCP 市场来发现、安装和配置 MCP 服务器，通过额外的工具和资源增强 Cline 的能力。"
---

## 什么是 MCP 服务器？

MCP 服务器是增强 Cline 能力的专用扩展。它们使 Cline 能够执行额外的任务，如获取网页、处理图像、访问 API 等等。

## MCP 市场演练

MCP 市场为各种类别的数百个 MCP 服务器提供一键安装体验。

### 1. 访问市场

-   在 Cline 中，单击顶部工具栏中的"扩展"按钮（方形图标）
-   MCP 市场将打开，按类别显示可用的服务器

### 2. 浏览和选择服务器

-   按类别浏览服务器（搜索、文件系统、浏览器自动化、研究数据等）
-   单击服务器以查看其能力和要求的详细信息

### 3. 安装和配置

-   为你选择的服务器单击安装按钮
-   如果服务器需要 API 密钥（大多数都需要），Cline 将引导你完成：
    -   在哪里获取 API 密钥
    -   如何安全地输入它
-   服务器将自动添加到你的 MCP 设置

### 4. 验证安装

-   安装完成后，Cline 将显示确认
-   在 Cline 的 MCP 设置 UI 中检查服务器状态

### 5. 使用你的新服务器

-   成功安装后，Cline 将自动集成服务器的功能
-   你将在 Cline 的系统提示词中看到新的工具和资源
-   只需要求 Cline 使用新服务器的功能
-   示例："使用 Perplexity 搜索网络上的最新 React 更新"

**企业用户**：如果你在企业环境中使用 Cline，请确保你拥有根据你组织的安全策略安装第三方 MCP 服务器的权限。

## 幕后发生的事情

当你安装 MCP 服务器时，几件事会自动发生：

### 1. 安装过程

-   服务器代码被克隆/安装到 `/Users/<username>/Documents/Cline/MCP/`
-   依赖项被安装
-   服务器被构建（TypeScript/JavaScript 编译或 Python 包安装）

### 2. 配置

-   MCP 设置文件使用你的服务器配置更新
-   此文件位于：`/Users/<username>/Library/Application Support/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`
-   环境变量（如 API 密钥）被安全存储
-   服务器路径被注册

### 3. 服务器启动

-   Cline 检测配置更改
-   Cline 作为单独进程启动你的服务器
-   通过 stdio 或 HTTP 建立通信

### 4. 与 Cline 集成

-   你的服务器的功能被添加到 Cline 的系统提示词
-   工具通过 `use_mcp_tool` 命令变得可用
-   资源通过 `access_mcp_resource` 命令变得可用
-   当被用户提示时，Cline 现在可以使用这些功能

## 故障排除

### 系统要求

确保你的系统满足这些要求：

-   **Node.js 18.x 或更新版本**
    -   通过运行检查：`node --version`
    -   从以下位置安装：https://nodejs.org/
    -   JavaScript/TypeScript 实现所需
-   **Python 3.10 或更新版本**
    -   通过运行检查：`python --version`
    -   从以下位置安装：https://python.org/
    -   注意：某些专用实现可能需要 Python 3.11+
-   **UV 包管理器**
    -   用于依赖隔离的现代 Python 包管理器
    -   使用以下命令安装：
        ```bash
        curl -LsSf https://astral.sh/uv/install.sh | sh
        ```
        或：`pip install uv`
    -   通过以下命令验证：`uv --version`

如果任何这些命令失败或显示旧版本，请在继续之前安装/更新！

### 常见安装问题

-   确保你的互联网连接稳定
-   检查你是否拥有安装新软件的必要权限
-   验证 API 密钥是否正确输入（如果需要）
-   在 MCP 设置 UI 中检查服务器状态以获取任何错误消息

### 如何删除 MCP 服务器

要完全删除有问题的 MCP 服务器：

1. 打开 MCP 设置文件：`/Users/<username>/Library/Application Support/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json`
2. 从 `mcpServers` 对象中删除服务器的整个条目
3. 保存文件
4. 重启 Cline

### 我仍然遇到错误

如果你在使用 MCP 服务器时遇到错误，你可以尝试以下操作：

-   检查 MCP 设置文件是否存在错误
-   使用 Claude Sonnet 模型进行安装
-   验证服务器文件的路径是否正确
-   确保设置了所有必需的环境变量
-   检查另一个进程是否正在使用相同的端口（对于基于 HTTP 的服务器）
-   尝试删除并重新安装服务器（从 `cline_mcp_settings.json` 文件和 `/Users/<username>/Documents/Cline/MCP/` 目录中删除）
-   使用终端直接使用其参数运行命令。这将允许你看到与 Cline 相同的错误

## MCP 服务器规则

Cline 已经知道你活动的 MCP 服务器及其用途，但当你启用了很多 MCP 服务器时，定义何时使用每个服务器可能很有用。

利用 `.clinerules` 文件或自定义指令，通过基于关键字的触发器支持智能 MCP 服务器激活，使 Cline 的工具选择更加直观和上下文感知。

### MCP 规则如何工作

MCP 规则将你连接的 MCP 服务器分组到功能类别，并定义在与 Cline 的对话中检测到时自动激活它们的触发关键字。

```json
{
	"mcpRules": {
		"webInteraction": {
			"servers": ["firecrawl-mcp-server", "fetch-mcp"],
			"triggers": ["web", "scrape", "browse", "website"],
			"description": "用于网页浏览和抓取的工具"
		}
	}
}
```

### 配置结构

1. **类别**：对相关服务器进行分组（例如，"webInteraction"、"mediaAndDesign"）
2. **服务器**：在每个类别中列出服务器名称
3. **触发器**：激活这些服务器的关键字
4. **描述**：人类可读的类别说明

### MCP 规则的好处

-   **上下文工具选择**：Cline 根据对话上下文选择适当的工具
-   **减少摩擦**：无需手动指定使用哪个工具
-   **有组织的能力**：逻辑地对相关工具和服务器进行分组
-   **优先级**：使用明确的优先级顺序处理模棱两可的情况

### 示例用法

当你写"你能抓取这个网站吗？"时，Cline 检测到"scrape"和"website"作为触发器，自动选择与网络相关的 MCP 服务器。

对于像"苹果的股票价格是多少？"这样的金融任务，像"stock"和"price"这样的关键字会触发与金融相关的服务器。

### 快速入门模板

```json
{
	"mcpRules": {
		"category1": {
			"servers": ["server-name-1", "server-name-2"],
			"triggers": ["keyword1", "keyword2", "phrase1", "phrase2"],
			"description": "这些工具做什么的描述"
		},
		"category2": {
			"servers": ["server-name-3"],
			"triggers": ["keyword3", "keyword4", "phrase3"],
			"description": "这些工具做什么的描述"
		},
		"category3": {
			"servers": ["server-name-4", "server-name-5"],
			"triggers": ["keyword5", "keyword6", "phrase4"],
			"description": "这些工具做什么的描述"
		}
	},
	"defaultBehavior": {
		"priorityOrder": ["category1", "category2", "category3"],
		"fallbackBehavior": "询问用户哪个工具最合适"
	}
}
```

将其添加到你的 `.clinerules` 文件或自定义指令中，使 Cline 的 MCP 服务器选择更加直观和上下文感知。
