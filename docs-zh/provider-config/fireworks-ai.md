---
title: "Fireworks AI"
description: "了解如何配置和使用 Fireworks AI 模型与 Cline。访问高性能开源语言模型，享受快速、经济高效的 API。"
---

Cline 支持通过 Fireworks AI 平台访问模型，该平台提供快速、经济高效的各种最先进开源语言模型访问。构建用于速度和可靠性，Fireworks AI 提供无服务器部署选项，具有 OpenAI 兼容 API 和高达 256,000 tokens 的上下文窗口。

**网站：** [https://fireworks.ai/](https://fireworks.ai/)

### 获取 API 密钥

1. **注册/登录：** 访问 [Fireworks AI](https://fireworks.ai/) 并创建账户或登录。
2. **导航到 API 密钥：** 登录后，转到账户设置中的[API 密钥页面](https://app.fireworks.ai/settings/users/api-keys)。
3. **创建密钥：** 点击"创建 API 密钥"并为您的密钥指定描述性名称（例如"Cline"）。
4. **复制密钥：** **重要：** _立即_复制 API 密钥。您将无法再次查看它。安全存储它。

### 支持的模型

Cline 支持以下 Fireworks AI 模型：

-   `accounts/fireworks/models/kimi-k2-instruct`（默认）
-   `accounts/fireworks/models/qwen3-235b-a22b-instruct-2507`
-   `accounts/fireworks/models/qwen3-coder-480b-a35b-instruct`
-   `accounts/fireworks/models/deepseek-r1-0528`
-   `accounts/fireworks/models/deepseek-v3`

**模型详细信息：**

| 模型 | 上下文窗口 | 最适合 | 定价（每 1M tokens）|
|-------|----------------|----------|-------------------------|
| Kimi K2 | 128K | 通用任务、智能体能力 | \$0.60 输入，\$2.50 输出 |
| Qwen3 235B | 256K | 经济高效的通用使用 | \$0.22 输入，\$0.88 输出 |
| Qwen3 Coder | 256K | 代码生成和调试 | \$0.45 输入，\$1.80 输出 |
| DeepSeek R1 | 160K | 复杂推理、函数调用 | \$3.00 输入，\$8.00 输出 |
| DeepSeek V3 | 128K | 强大的通用性能 | \$0.90 输入，\$0.90 输出 |

### 在 Cline 中配置

1. **打开 Cline 设置：** 在 Cline 面板中点击设置图标（⚙️）。
2. **选择提供商：** 从"API 提供商"下拉菜单中选择"Fireworks AI"。
3. **输入 API 密钥：** 将您的 Fireworks AI API 密钥粘贴到"Fireworks AI API 密钥"字段中。
4. **选择模型：** 从"模型"下拉菜单中选择您想要的模型。默认模型是 Kimi K2。

### 提示和注意事项

-   **成本效益：** Fireworks AI 提供比专有模型低得多的定价，同时保持竞争性能。
-   **大上下文窗口：** 大多数模型支持 128K-256K tokens，适合处理大型文档和保持扩展对话。
-   **OpenAI 兼容性：** 提供商使用 OpenAI 兼容的 API 格式，具有流式传输支持和使用跟踪。
-   **速率限制：** Fireworks AI 具有基于使用情况的速率限制。在仪表板中监控您的使用情况，并在需要时考虑升级您的计划。
-   **API 密钥：** 出于安全考虑，存储在您的本地计算机上。
-   **定价：** 查看 [Fireworks AI 定价页面](https://fireworks.ai/pricing)了解当前费率。显示的价格为每百万 tokens 的价格。
