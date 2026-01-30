---
title: "MCP 概述"
description: "了解模型上下文协议 (MCP) 服务器、它们的能力以及 Cline 如何帮助构建和使用它们。MCP 标准化了应用程序如何向 LLM 提供上下文，就像 AI 应用程序的 USB-C 端口。"
---

## 快速链接

-   [从 GitHub 构建 MCP 服务器](/mcp/adding-mcp-servers-from-github)
-   [从头开始构建自定义 MCP 服务器](/mcp/mcp-server-development-protocol)

## 概述

模型上下文协议是一个开放协议，标准化了应用程序如何向 LLM 提供上下文。将 MCP 视为 AI 应用程序的 USB-C 端口；它提供了一种标准化方式将 AI 模型连接到不同的数据源和工具。MCP 服务器充当大语言模型（如 Claude）与外部工具或数据源之间的中介。它们是向 LLM 暴露功能的小程序，使它们能够通过 MCP 与外部世界交互。MCP 服务器本质上就像 LLM 可以使用的 API。

<Frame>
	<img
		src="https://storage.googleapis.com/cline_public_images/docs/assets/mcp-diagram.png"
		alt="MCP 图表，显示 MCP 服务器如何将 LLM 连接到外部工具和数据源"
		/>
</Frame>

## 关键概念

MCP 服务器定义了一组 LLM 可以执行的"**工具**"。这些工具提供了广泛的功能。

**MCP 的工作原理如下：**

-   **MCP 主机**发现连接服务器的功能并加载它们的工具、提示词和资源。
-   **资源**提供对只读数据的一致访问，类似于文件路径或数据库查询。
-   **安全性**得到保障，因为服务器隔离凭证和敏感数据。交互需要明确的用户批准。

## 用例

MCP 服务器的潜力是巨大的。它们可以用于各种目的。

**以下是一些 MCP 服务器如何使用的具体示例：**

-   **Web 服务和 API 集成：**
    -   监控 GitHub 仓库的新问题
    -   基于特定触发器在 Twitter 上发布更新
    -   检索基于位置服务的实时天气数据
-   **浏览器自动化：**
    -   自动化 Web 应用程序测试
    -   抓取电子商务网站进行价格比较
    -   生成网站监控的屏幕截图
-   **数据库查询：**
    -   生成每周销售报告
    -   分析客户行为模式
    -   为业务指标创建实时仪表板
-   **项目和任务管理：**
    -   基于代码提交自动化 Jira 工单创建
    -   生成每周进度报告
    -   基于项目需求创建任务依赖关系
-   **代码库文档：**
    -   从代码注释生成 API 文档
    -   从代码结构创建架构图
    -   维护最新的 README 文件

## 入门

Cline 不附带任何预安装的 MCP 服务器。你需要单独查找和安装它们。

**为你的需求选择正确的方法：**

-   **社区仓库**：检查 GitHub 上社区维护的 MCP 服务器列表。请参阅[从 GitHub 添加 MCP 服务器](/mcp/adding-mcp-servers-from-github)
-   **Cline 市场**：从 Cline 的 [MCP 市场](/mcp/mcp-marketplace)安装一个
-   **询问 Cline**：你可以请求 Cline 帮助你查找或创建 MCP 服务器
-   **构建你自己的**：使用 [MCP SDK](https://github.com/modelcontextprotocol/)创建自定义 MCP 服务器
-   **自定义现有服务器**：修改现有服务器以适应你的特定需求

## 与 Cline 集成

Cline 通过其 AI 功能简化了 MCP 服务器的构建和使用。

### 构建 MCP 服务器

-   **自然语言理解**：用自然语言指示 Cline 构建一个 MCP 服务器，通过描述其功能。Cline 将解释你的指令并生成必要的代码。
-   **克隆和构建服务器**：Cline 可以从 GitHub 克隆现有的 MCP 服务器仓库并自动构建它们。
-   **配置和依赖管理**：Cline 处理配置文件、环境变量和依赖项。
-   **故障排除和调试**：Cline 帮助识别和解决开发过程中的错误。

### 使用 MCP 服务器

-   **工具执行**：Cline 与 MCP 服务器无缝集成，允许你执行其定义的工具。
-   **上下文感知交互**：Cline 可以根据对话上下文智能建议使用相关工具。
-   **动态集成**：结合多个 MCP 服务器功能以完成复杂任务。例如，Cline 可以使用 GitHub 服务器获取数据并使用 Notion 服务器创建格式化的报告。

## 安全考虑

在使用 MCP 服务器时，遵循安全最佳实践很重要：

-   **身份验证**：始终使用安全的身份验证方法进行 API 访问
-   **环境变量**：将敏感信息存储在环境变量中
-   **访问控制**：仅限授权用户访问服务器
-   **数据验证**：验证所有输入以防止注入攻击
-   **日志记录**：实施安全的日志记录实践，而不暴露敏感数据

## 资源

有多种资源可用于查找和学习 MCP 服务器。

**以下是一些用于查找和学习 MCP 服务器的资源链接：**

-   **GitHub 仓库**：[https://github.com/modelcontextprotocol/servers](https://github.com/modelcontextprotocol/servers) 和 [https://github.com/punkpeye/awesome-mcp-servers](https://github.com/punkpeye/awesome-mcp-servers)
-   **在线目录**：[https://mcpservers.org/](https://mcpservers.org/)、[https://mcp.so/](https://mcp.so/) 和 [https://glama.ai/mcp/servers](https://glama.ai/mcp/servers)
-   **PulseMCP**：[https://www.pulsemcp.com/](https://www.pulsemcp.com/)
-   **YouTube 教程 (AI-Driven Coder)**：用于构建和使用 MCP 服务器的视频指南：[https://www.youtube.com/watch?v=b5pqTNiuuJg](https://www.youtube.com/watch?v=b5pqTNiuuJg)
