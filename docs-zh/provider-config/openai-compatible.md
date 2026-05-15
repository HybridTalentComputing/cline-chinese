---
title: "OpenAI Compatible"
description: "了解如何配置 Cline 与各种提供 OpenAI 兼容 API 的 AI 模型提供商。"
---

Cline 支持广泛的 AI 模型提供商，这些提供商提供与 OpenAI API 标准兼容的 API。这允许您使用来自 OpenAI _以外_的提供商的模型，同时仍然使用熟悉的 API 界面。这包括：

-   通过 Ollama 和 LM Studio 等工具运行的**本地模型**（这些在其各自的章节中介绍）。
-   **云提供商**，如 Perplexity、Together AI、Anyscale 和许多其他提供商。
-   **任何其他提供商**，只要它们提供 OpenAI 兼容的 API 端点。

本文档重点介绍设置官方 OpenAI API _以外_的提供商（官方 OpenAI API 有其自己的[专用配置页面](/provider-config/openai)）。

### 通用配置

使用 OpenAI 兼容提供商与 Cline 的关键是配置这些主要设置：

1.  **基础 URL：** 这是特定于提供商的 API 端点。它_不会_是 `https://api.openai.com/v1`（该 URL 用于官方 OpenAI API）。
2.  **API 密钥：** 这是从您选择的提供商获得的秘密密钥。
3.  **模型 ID：** 这是您希望使用的模型的特定名称或标识符。

您将在 Cline 设置面板中找到这些设置（点击 ⚙️ 图标）：

-   **API 提供商：** 选择"OpenAI Compatible"。
-   **基础 URL：** 输入您选择的提供商提供的基础 URL。**这是至关重要的一步。**
-   **API 密钥：** 输入您的提供商的 API 密钥。
-   **模型：** 选择或输入模型 ID。
-   **模型配置：** 此部分允许您为模型自定义高级参数，例如：
    -   最大输出 Tokens
    -   上下文窗口大小
    - 图像支持能力
    - 计算机使用（例如，对于具有工具/函数调用的模型）
    - 输入价格（每 token/百万 tokens）
    -   输出价格（每 token/百万 tokens）

### 支持的模型（用于 OpenAI 原生端点）

虽然"OpenAI Compatible"提供商类型允许连接到各种端点，但如果您直接连接到官方 OpenAI API（或完全镜像它的端点），Cline 会根据其源代码中的 `openAiNativeModels` 定义识别以下模型 ID：

-   `o3-mini`
-   `o3-mini-high`
-   `o3-mini-low`
-   `o1`
-   `o1-preview`
-   `o1-mini`
-   `gpt-4o`
-   `gpt-4o-mini`

**注意：** 如果您使用不同的 OpenAI 兼容提供商（例如 Together AI、Anyscale 等），可用的模型 ID 将有所不同。请始终参考您的特定提供商的文档以了解其支持的模型名称和任何独特的配置详细信息。

### Cline 中的 v0 (Vercel SDK)：

-   对于使用 v0 的开发人员，他们的 [AI SDK 文档](https://vercel.com/docs/v0/cline)提供了有价值的见解和示例，用于集成各种模型，其中许多是 OpenAI 兼容的。这是一个有用的资源，有助于理解在与部署在 Vercel 上或与 Vercel 集成的服务一起使用 Cline 时如何构建调用和管理配置。

-   v0 可以在 Cline 中与 OpenAI Compatible 提供商一起使用。

-   ### 快速入门

-   1. 选择 OpenAI Compatible 提供商后，将基础 URL 设置为 https://api.v0.dev/v1。
-   2. 粘贴您的 v0 API 密钥
-   3. 设置模型 ID：v0-1.0-md
-   4. 点击验证以确认连接。

### 故障排除

-   **"无效的 API 密钥"：** 仔细检查您是否正确输入了 API 密钥，并且它是否是正确的提供商的密钥。
-   **"未找到模型"：** 确保您使用的是所选提供商的有效模型 ID，并且它在指定的基础 URL 处可用。
-   **连接错误：** 验证基础 URL 是否正确，您的提供商的 API 是否可以从您的机器访问，以及是否存在防火墙或网络问题。
-   **意外结果：** 如果您获得意外输出，请尝试不同的模型或仔细检查所有配置参数。

通过使用 OpenAI 兼容的提供商，您可以利用 Cline 的灵活性和更广泛的 AI 模型。请始终参考您的提供商的文档以获取最准确和最新的信息。
