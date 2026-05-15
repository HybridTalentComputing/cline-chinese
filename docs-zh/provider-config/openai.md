---
title: "OpenAI"
description: "了解如何配置和使用官方 OpenAI 模型与 Cline。"
---

Cline 支持通过官方 OpenAI API 直接访问模型。

**网站：** [https://openai.com/](https://openai.com/)

### 获取 API 密钥

1.  **注册/登录：** 访问 [OpenAI Platform](https://platform.openai.com/)。您需要创建账户或如果您已有账户则登录。
2.  **导航到 API 密钥：** 登录后，转到您账户的 [API 密钥部分](https://platform.openai.com/api-keys)。
3.  **创建密钥：** 点击"创建新的秘密密钥"。为您的密钥指定描述性名称（例如"Cline API 密钥"）是一个好习惯。
4.  **复制密钥：** **至关重要：** 立即复制生成的 API 密钥。出于安全原因，OpenAI 不会再次向您显示它。将此密钥存储在安全的位置。

### 支持的模型

Cline 与各种 OpenAI 模型兼容，包括但不限于：

-   'o3'
-   `o3-mini`（中等推理努力）
-   'o4-mini'
-   `o3-mini-high`（高推理努力）
-   `o3-mini-low`（低推理努力）
-   `o1`
-   `o1-preview`
-   `o1-mini`
-   `gpt-4o`
-   `gpt-4o-mini`
-   'gpt-4.1'
-   'gpt-4.1-mini'

有关可用模型及其功能的最新列表，请参阅官方 [OpenAI 模型文档](https://platform.openai.com/docs/models)。

### 在 Cline 中配置

1.  **打开 Cline 设置：** 在 Cline 面板中点击设置齿轮图标（⚙️）。
2.  **选择提供商：** 从"API 提供商"下拉菜单中选择"OpenAI"。
3.  **输入 API 密钥：** 将您的 OpenAI API 密钥粘贴到"OpenAI API 密钥"字段中。
4.  **选择模型：** 从"模型"下拉列表中选择您想要的模型。
5.  **（可选）基础 URL：** 如果您需要为 OpenAI API 使用代理或自定义基础 URL，您可以在此处输入。大多数用户不需要从默认值更改此项。

### 提示和注意事项

-   **定价：** 务必查看 [OpenAI 定价页面](https://openai.com/pricing)以获取与不同模型相关的成本的详细信息。
-   **Azure OpenAI 服务：** 如果您想要使用 Azure OpenAI 服务，请注意可能会找到单独的关于 Azure OpenAI 与 Cline 的文档，或者如果 Cline 支持自定义配置的此类功能，您可能需要将其配置为 OpenAI 兼容的端点。
