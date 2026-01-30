---
title: "Claude Code"
description: "使用您的 Claude Max 或 Pro 订阅与 Cline，而不是按 token 付费。了解如何设置和配置 Claude Code 提供商。"
---

**网站：** [https://docs.anthropic.com/en/docs/claude-code/setup](https://docs.anthropic.com/en/docs/claude-code/setup)

Claude Code 提供商允许您将现有的 Claude 订阅与 Cline 一起使用。如果您有 Claude Max 或 Pro，这意味着您可以在 Cline 中使用 Claude 而无需支付额外的 API 费用。

<Frame>
	<img
		src="https://storage.googleapis.com/cline_public_images/docs/assets/claude-code-use-opus.gif"
		alt="在 Cline 中使用 Claude Code 提供商和 Opus 模型"
	/>
</Frame>

## 设置

首先，您需要在系统上安装并验证 Claude Code：

1. **安装 Claude Code**：按照 Anthropic 的[官方设置指南](https://docs.anthropic.com/en/docs/claude-code/setup)安装并验证 Claude CLI。

2. **在 Cline 中配置**：
    - 打开 Cline 设置（⚙️ 图标）
    - 从 **API 提供商**下拉菜单中选择 **Claude Code**
    - 设置您的 Claude CLI 可执行文件的路径（如果它在您的 PATH 中，通常只是 `claude`）

<Frame>
	<img
		src="https://storage.googleapis.com/cline_public_images/docs/assets/claude-code-setup.gif"
		alt="在 Cline 中设置 Claude Code 提供商"
	/>
</Frame>

<br />

### 查找您的 Claude Code 路径

-   **macOS / Linux / WSL / Git Bash**：`which claude`
-   **Windows 命令提示符**：`where claude`

## 支持的模型

Claude Code 提供商支持以下模型：

-   `claude-sonnet-4-20250514`（推荐）
-   `claude-opus-4-1-20250805`
-   `claude-opus-4-20250514`
-   `claude-3-7-sonnet-20250219`
-   `claude-3-5-sonnet-20241022`
-   `claude-3-5-haiku-20241022`

## 工作原理

当您在 Cline 中使用 Claude Code 时，幕后会发生以下情况：

Cline 包装 Claude Code CLI 来处理您的请求。每次您发送消息时，Cline 会启动一个新的 `claude` 进程，发送您的对话，并将响应流回。AI 推理来自 Claude Code，但所有实际的文件编辑、终端命令和其他工具都由 Cline 处理。

您会注意到的主要区别是，响应不会像其他提供商那样逐字符流式传输。相反，Claude Code 在发回完整响应之前会处理您的完整请求。

## 限制

使用 Claude Code 时需要注意以下几点：

-   消息中的图像会转换为文本占位符，因为 Claude Code 不支持通过 CLI 上传图像
-   此提供商不提供提示词缓存
-   响应不会像其他提供商那样实时流式传输

## 故障排除

如果您遇到问题：

**身份验证问题**：确保您使用订阅账户登录了 Claude Code。运行 `claude auth status` 进行检查。

**路径问题**：仔细检查 Cline 设置中的 Claude CLI 路径是否正确。尝试在终端中运行 `claude --version` 以验证它是否正常工作。

**仍有问题？** 我们正在积极改进此集成。在我们的 [GitHub](https://github.com/cline/cline/issues)上报告问题或在我们的 [Discord](https://discord.gg/cline)中寻求帮助。

## 与订阅一起使用

如果您有 Claude Max 订阅，您在 Cline 中的使用情况在计费界面中显示为 $0.00，因为您没有支付额外的 API 费用。您的使用情况仍然计入您的订阅限制，但您不会看到按 token 计费的费用。

有关使用 Claude Code 与您的订阅的更多详细信息，请查看 Anthropic 的文档：

-   [Claude Code 设置指南](https://docs.anthropic.com/en/docs/claude-code/setup)
-   [使用 Claude Code 与 Pro/Max 计划](https://support.anthropic.com/en/articles/11145838-using-claude-code-with-your-pro-or-max-plan)
