---
title: "OpenRouter"
description: "了解如何使用 OpenRouter 与 Cline 通过单个 API 访问各种语言模型。"
---

OpenRouter 是一个 AI 平台，提供来自不同提供商的各种语言模型的访问，所有这些都通过单个 API。这可以简化设置并允许您轻松尝试不同的模型。

**网站：** [https://openrouter.ai/](https://openrouter.ai/)

### 获取 API 密钥

1.  **注册/登录：** 访问 [OpenRouter 网站](https://openrouter.ai/)。使用您的 Google 或 GitHub 账户登录。
2.  **获取 API 密钥：** 转到 [密钥页面](https://openrouter.ai/keys)。您应该看到列出的 API 密钥。如果没有，创建一个新密钥。
3.  **复制密钥：** 复制 API 密钥。

### 支持的模型

OpenRouter 支持大量且不断增长的模型数量。Cline 自动获取可用模型列表。请参阅 [OpenRouter 模型页面](https://openrouter.ai/models)获取完整和最新的列表。

### 在 Cline 中配置

1.  **打开 Cline 设置：** 在 Cline 面板中点击设置图标（⚙️）。
2.  **选择提供商：** 从"API 提供商"下拉菜单中选择"OpenRouter"。
3.  **输入 API 密钥：** 将您的 OpenRouter API 密钥粘贴到"OpenRouter API 密钥"字段中。
4.  **选择模型：** 从"模型"下拉菜单中选择您想要的模型。
5.  **（可选）自定义基础 URL：** 如果您需要为 OpenRouter API 使用自定义基础 URL，请勾选"使用自定义基础 URL"并输入 URL。对于大多数用户，请留空此项。

### 支持的转换

OpenRouter 提供一个[可选的"中间输出"消息转换](https://openrouter.ai/docs/features/message-transforms)以帮助处理超过模型最大上下文大小的提示词。您可以通过勾选"压缩提示词和消息链以适应上下文大小"框来启用它。

### 提示和注意事项

-   **模型选择：** OpenRouter 提供广泛的模型范围。尝试找到最适合您需求的模型。
-   **定价：** OpenRouter 基于底层模型的定价收费。请参阅 [OpenRouter 模型页面](https://openrouter.ai/models)了解详细信息。
-   **提示词缓存：**
    -   OpenRouter 将缓存请求传递给支持它的底层模型。检查 [OpenRouter 模型页面](https://openrouter.ai/models)以查看哪些模型提供缓存。
    -   对于大多数模型，如果模型本身支持缓存，则应该自动激活（类似于 Requesty 的工作方式）。
    -   **通过 OpenRouter 的 Gemini 模型例外：** 由于通过 OpenRouter 访问时有时会观察到 Google 的缓存机制导致的响应延迟，对于 **Gemini 模型特别需要**手动激活步骤。
    -   如果通过 OpenRouter 使用 **Gemini 模型**，您**必须手动勾选**提供商设置中的"启用提示词缓存"框以激活该模型的缓存。此复选框用作临时变通方法。对于 OpenRouter 上的非 Gemini 模型，不需要此复选框即可进行缓存。
