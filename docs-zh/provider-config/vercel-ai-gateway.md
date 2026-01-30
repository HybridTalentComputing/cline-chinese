---
title: "Vercel AI Gateway"
description: "在 Cline 中使用 Vercel AI Gateway 从一个端点访问 100 多个模型，具有路由、重试和花费可观测性。"
---

Vercel AI Gateway 为您提供单个 API 以访问来自许多提供商的模型。您可以通过模型 ID 进行切换，而无需更换 SDK 或管理多个密钥。Cline 直接集成，因此您可以在下拉列表中选择 Gateway 模型，像使用任何其他提供商一样使用它，并在流中查看 token 和缓存使用情况。

有用的链接：
- 团队仪表板：https://vercel.com/d?to=%2F%5Bteam%5D%2F%7E%2Fai
- 模型目录：https://vercel.com/ai-gateway/models
- 文档：https://vercel.com/docs/ai-gateway

## 您将获得什么

- 用于 100 多个模型的单个端点，使用单个密钥
- 您在仪表板上配置的自动重试和回退
- 花费监控，按模型、token 计数、缓存使用情况、延迟百分位数和成本进行请求
- OpenAI 兼容的界面，使现有客户端可以工作

## 获取 API 密钥

1. 在 https://vercel.com 登录
2. 仪表板 → AI Gateway → API 密钥 → 创建密钥
3. 复制密钥

有关身份验证和 OIDC 选项的更多信息，请参阅 https://vercel.com/docs/ai-gateway/authentication

## 在 Cline 中配置

1. 打开 Cline 设置
2. 选择 **Vercel AI Gateway**作为 API 提供商
3. 粘贴您的 Gateway API 密钥
4. 从列表中选择一个模型。Cline 自动获取目录。您也可以粘贴精确的 ID

注意：
- 模型 ID 通常遵循 `provider/model` 格式。从目录复制精确的 ID  
  示例：
  - `openai/gpt-5`
  - `anthropic/claude-sonnet-4`
  - `google/gemini-2.5-pro`
  - `groq/llama-3.1-70b`
  - `deepseek/deepseek-v3`

## 您可以采取行动的可观测性

<Frame>
  <img src="https://assets.vercel.com/image/upload/v1753121283/gateway-overhead-dark_zhqwwj.svg" alt="Vercel AI Gateway 可观测性，包括按模型、tokens、缓存、延迟和成本的请求。" />
</Frame>

需要关注的内容：
- 按模型的请求 - 确认路由和采用情况
- Tokens - 输入与输出，包括推理（如果暴露）
- 缓存 - 缓存的输入和缓存创建 tokens
- 延迟 - p75 持续时间和到第一个 token 的 p75 时间
- 成本 - 每个项目和每个模型

使用它来：
- 在模型更改前后比较每个请求的输出 tokens
- 通过跟踪缓存读取和写入创建来验证缓存策略
- 在实验期间捕获 TTFT（到第一个 token 的时间）回归
- 使预算与实际使用情况保持一致

## 支持的模型

Gateway 支持大量且不断变化的模型集。Cline 从 Gateway API 拉取列表并在本地缓存它。有关当前目录，请参阅 https://vercel.com/ai-gateway/models

## 提示

<Tip>
为每个环境（开发、暂存、生产）使用单独的 Gateway 密钥。这保持仪表板清洁和预算隔离。
</Tip>

<Note>
定价是按提供商列表价格的透传。自带密钥的加价为 0%。您仍然需要支付提供商和处理费用。
</Note>

<Info>
Vercel 不添加速率限制。上游提供商可能会添加。新账户每 30 天获得 5 美元额度，直到首次付款。
</Info>

## 故障排除

- 401 - 将 Gateway 密钥发送到 Gateway 端点，而不是上游 URL
- 404 模型 - 从 Vercel 目录复制精确的 ID
- 第一个 token 慢 - 在仪表板中检查 p75 TTFT 并尝试针对流式传输优化的模型
- 成本激增 - 在仪表板中按模型细分并限制或路由流量

## 灵感

- 多模型评估 - 在 Cline 中仅更改模型 ID 并比较延迟和输出 tokens
- 渐进式推出 - 在仪表板中将小百分比路由到新模型，并通过指标逐步增加
- 预算执行 - 在不更改代码的情况下设置每个项目的限制

## 交叉链接

- OpenAI 兼容设置：/provider-config/openai-compatible
- 模型选择指南：/getting-started/model-selection-guide
- 了解上下文管理：/getting-started/understanding-context-management
