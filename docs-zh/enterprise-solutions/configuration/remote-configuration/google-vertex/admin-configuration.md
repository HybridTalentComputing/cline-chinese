---
title: "配置 Google Vertex AI 提供商（管理员）"
sidebarTitle: "配置 Google Vertex（管理员）"
description: "本指南解释管理员如何将 Google Vertex AI 配置为 Cline 的组织级 LLM 提供商。"


作为管理员，你可以通过托管管理控制台为所有 Cline 用户添加 Google Vertex AI 作为组织级 LLM 提供商。这种集中式方法确保对 Google 的 Gemini 模型的一致访问，同时维护你组织的项目边界和区域设置。

## 开始之前

要开始将 Google Vertex AI 设置为你组织的 LLM 提供商，你需要准备一些事项。

**对 Cline 管理控制台的管理员访问权限**  
你需要管理员权限来在整个组织中强制执行提供商设置。如果你可以在 [app.cline.bot](https://app.cline.bot) 的管理控制台中导航到 **设置 → Cline 设置**，则你具有正确的访问级别。


**启用了 Vertex AI 的 Google Cloud 项目**  
你需要一个启用了 Vertex AI API 并可访问适当模型的 Google Cloud 项目。

<Note>
如果你尚未设置 Google Cloud 或 Vertex AI，请与你的云团队合作以启用 Vertex AI API 并确保配置了必要的配额。
</Note>

**项目配置详细信息**  
你需要你的 Google Cloud 项目 ID 和用于 Vertex AI 模型访问的首选区域。

<Tip>
服务账户应具有 Vertex AI 访问所需的最低 IAM 权限，以遵循安全最佳实践。
</Tip>

## 配置步骤

<Steps>
<Step title="访问 Cline 设置">
导航到 [app.cline.bot](https://app.cline.bot) 并使用你的管理员账户登录。转到 **设置 → Cline 设置**。

<Info>
如果你具有正确的管理员访问级别，你应该看到提供商配置选项。
</Info>
</Step>

<Step title="启用远程提供商配置">
打开 **启用设置** 以显示远程提供商配置选项。这允许你在整个组织中强制执行提供商设置。
</Step>

<Step title="选择 Google Vertex AI 作为 API 提供商">
打开 **API 提供商** 下拉菜单并选择 **Google Vertex AI**。这将打开 Vertex AI 配置面板，你将在其中配置所有组织范围的设置。
</Step>

<Step title="配置 Vertex AI 设置">
配置面板包含控制 Vertex AI 为你组织工作的设置：

<AccordionGroup>
<Accordion title="项目 ID（必需）">
输入启用了 Vertex AI 的 Google Cloud 项目 ID。该项目将用于组织成员的所有 AI 模型请求。

<Tip>
使用专用项目处理 AI 工作负载以更好地跟踪使用和成本。确保项目具有团队预期使用量的足够配额。
</Tip>
</Accordion>

<Accordion title="区域（必需）">
选择应访问 Vertex AI 模型的 Google Cloud 区域。常见选项包括 `us-central1`、`us-east4` 或 `europe-west4`。

[查看 Google Cloud 区域](https://cloud.google.com/docs/geography-and-regions)

<Note>
选择靠近你团队位置的区域以获得最佳性能。某些模型可能并非在所有区域中都可用。
</Note>
</Accordion>
</AccordionGroup>
</Step>

<Step title="保存配置">
配置设置后，关闭提供商配置面板并单击设置页面上的 **保存** 以持久化你的更改。

保存后，所有登录到 Cline 扩展的组织成员将自动使用具有你配置设置的 Google Vertex AI。他们将无法选择其他提供商或切换到其个人 Cline 账户。

<Warning>
启用远程配置后，成员无法切换到个人 Cline 账户或加入其他组织。这确保了团队中一致的提供商使用。
</Warning>
</Step>
</Steps>

## 验证

要验证配置：

1. 检查提供商在已启用提供商字段中显示为 "Google Vertex AI"
2. 确认刷新页面后设置保持不变
3. 使用成员账户测试以确保他们仅将 Vertex AI 视为提供商
4. 验证 Gemini 模型在模型下拉列表中可用

## 故障排除

**成员看不到配置的提供商**  
确保在关闭配置面板后单击了保存。验证成员账户属于正确的组织，并且你的 Google Cloud 项目已启用 Vertex AI API。

**项目访问错误**  
验证项目 ID 正确并已启用 Vertex AI API。检查项目是否配置了适当的计费且未超过配额。

**区域可用性问题**  
确认所选区域支持你要使用的 Gemini 模型。某些较新的模型可能仅在特定区域中可用。

**配置更改不持久化**  
确保单击主设置页面上的保存按钮，而不仅仅是关闭配置面板。

**稍后需要更改项目或区域**  
你可以随时更新这些设置。成员需要确保其本地 Google Cloud 凭证有权访问新项目/区域。

有关更多详细信息，请查阅 [Google Cloud Vertex AI 文档](https://cloud.google.com/vertex-ai/docs) 并与你的内部云团队协调。
