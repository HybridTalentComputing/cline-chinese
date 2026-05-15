---
title: "VS Code 语言模型 API"
description: "了解如何使用 Cline 与实验性的 VS Code 语言模型 API，启用从 GitHub Copilot 和其他兼容扩展访问模型。"
---

Cline 提供 [VS Code 语言模型 API](https://code.visualstudio.com/api/extension-guides/language-model)的_实验性_支持。此 API 使扩展能够在 VS Code 环境中直接授予对语言模型的访问权限。因此，您可能能够利用以下来源的模型：

-   **GitHub Copilot：** 如果您有活跃的 Copilot 订阅和已安装的扩展。
-   **其他 VS Code 扩展：** 任何实现语言模型 API 的扩展。

**重要说明：** 此集成目前处于实验阶段，可能无法按预期执行。其功能依赖于其他扩展正确实现 VS Code 语言模型 API。

### 先决条件

-   **VS Code：** 语言模型 API 可通过 VS Code 访问（目前不被 Cursor 支持）。
-   **语言模型提供商扩展：** 需要一个提供语言模型的扩展。示例包括：
    -   **GitHub Copilot：** 使用 Copilot 订阅，GitHub Copilot 和 GitHub Copilot Chat 扩展可以作为模型提供商。
    -   **替代扩展：** 在 VS Code Marketplace 中探索提及"语言模型 API"或"lm"的扩展。可能提供其他实验性选项

### 配置步骤

1.  **确保 Copilot 账户处于活动状态并且扩展已安装：** 登录到 Copilot 或 Copilot Chat 扩展的用户应该能够通过 Cline 获得访问。
2.  **访问 Cline 设置：** 点击 Cline 面板中位于的齿轮图标（⚙️）。
3.  **选择提供商：** 从"API 提供商"下拉菜单中选择"VS Code LM API"。
4.  **选择模型：** 如果安装了 Copilot 扩展并且用户登录到其 Copilot 账户，"语言模型"下拉菜单将在短暂时间后填充可用模型。命名约定是 `vendor/family`。例如，如果 Copilot 处于活动状态，您可能会遇到以下选项：
    - `copilot - gpt-3.5-turbo`
    - `copilot - gpt-4o-mini`
    - `copilot - gpt-4`
    - `copilot - gpt-4-turbo`
    - `copilot - gpt-4o`
    - `copilot - claude-3.5-sonnet` **注意：** 此模型不工作。
    - `copilot - gemini-2.0-flash`
    - `copilot - gpt-4.1`

对于 VSCode LM API 提供商的最佳结果，我们建议使用 OpenAI 模型（GPT 3、4、4.1、4o 等）

### 当前限制

-   **实验性 API 状态：** VS Code 语言模型 API 仍在积极开发中。预期潜在的变化和不稳定性。
-   **对扩展的依赖：** 此功能完全取决于其他扩展使模型可用。Cline 不直接控制可访问模型的列表。
-   **受限的功能：** VS Code 语言模型 API 可能不包含通过其他 API 提供商可用的所有功能（例如，图像输入能力、流式响应、详细的使用指标）。
-   **无直接成本管理：** 用户受提供模型的扩展的服务定价结构和条款约束。Cline 无法直接监控或管理相关成本。
-   **GitHub Copilot 速率限制：** 在 VS Code LM API 中使用 GitHub Copilot 时，请注意 GitHub 可能会对 Copilot 使用强制执行速率限制。这些限制由 GitHub 管理，而非 Cline。

### 故障排除提示

-   **模型未出现：**
    -   确认已安装 VS Code。
    -   验证语言模型提供商扩展（例如 GitHub Copilot、GitHub Copilot Chat）已安装并启用。
    -   如果使用 Copilot，确保您之前已使用所需模型发送过 Copilot Chat 消息。
-   **意外操作：** 如果您遇到意外行为，这很可能是一个源自底层语言模型 API 或提供商扩展的问题。考虑向提供商扩展的开发人员报告问题。
