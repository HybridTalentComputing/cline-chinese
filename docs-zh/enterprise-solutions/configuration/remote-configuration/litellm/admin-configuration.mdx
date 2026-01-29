---
title: "配置 LiteLLM 提供商（管理员）"
sidebarTitle: "配置 LiteLLM（管理员）"
description: "本指南解释管理员如何将 LiteLLM 配置为 Cline 的组织级 LLM 提供商。"


作为管理员，你可以通过托管管理控制台为所有 Cline 用户添加 LiteLLM 作为组织级 LLM 提供商。这种集中式方法通过你的 LiteLLM 代理界面提供对多个 AI 模型的统一访问。

## 开始之前

要开始将 LiteLLM 设置为你组织的 LLM 提供商，你需要准备一些事项。

**对 Cline 管理控制台的管理员访问权限**  
你需要管理员权限来在整个组织中强制执行提供商设置。如果你可以在 [app.cline.bot](https://app.cline.bot) 的管理控制台中导航到 **设置 → Cline 设置**，则你具有正确的访问级别。

<Info>
**快速检查**：现在尝试访问设置页面。如果你可以看到提供商配置选项，则你可以继续。
</Info>

**运行中的 LiteLLM 代理实例**  
你需要一个团队可以访问的已部署 LiteLLM 代理。这可以是自托管的或通过云提供商管理。

<Note>
如果你尚未部署 LiteLLM，请与你的基础设施团队合作以设置 LiteLLM 代理实例。
</Note>

**LiteLLM 端点详细信息**  
你需要 LiteLLM 代理的基础 URL，如果部署需要身份验证，还需要一个主密钥。

<Tip>
确保你的 LiteLLM 代理可从你团队的开发环境访问，并且已配置你想要提供的模型。
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

<Step title="选择 LiteLLM 作为 API 提供商">
打开 **API 提供商** 下拉菜单并选择 **LiteLLM**。这将打开 LiteLLM 配置面板，你将在其中配置所有组织范围的设置。
</Step>

<Step title="配置 LiteLLM 设置">
配置面板包含控制 LiteLLM 为你组织工作的设置：

<AccordionGroup>
<Accordion title="基础 URL（必需）">
输入你的 LiteLLM 代理端点 URL。这应该是你的 LiteLLM 代理可访问的完整 URL，例如 `https://litellm.yourcompany.com` 或 `http://your-proxy:4000`。

<Tip>
在生产环境中使用 HTTPS 端点以确保安全。确保 URL 可从你团队的开发环境访问。
</Tip>
</Accordion>

<Accordion title="主密钥（可选）">
如果你的 LiteLLM 代理需要身份验证，请在此输入主密钥。这将用于验证所有组织成员的请求。

<Note>
**集中式 API 密钥管理**：通过在组织级别配置主密钥，你启用了集中式 API 密钥管理。组织成员无需管理自己的个人 API 密钥——访问完全通过此集中式配置管理。
</Note>

<Warning>
主密钥提供对你的 LiteLLM 代理的完全访问权限。仅当你的代理需要身份验证并且你想要集中式密钥管理时才输入此项。
</Warning>
</Accordion>
</AccordionGroup>
</Step>

<Step title="保存配置">
配置设置后，关闭提供商配置面板并单击设置页面上的 **保存** 以持久化你的更改。

保存后，所有登录到 Cline 扩展的组织成员将自动使用具有你配置设置的 LiteLLM。他们将无法选择其他提供商或切换到其个人 Cline 账户。

<Warning>
启用远程配置后，成员无法切换到个人 Cline 账户或加入其他组织。这确保了团队中一致的提供商使用。
</Warning>
</Step>
</Steps>

## 验证

要验证配置：

1. 检查提供商在已启用提供商字段中显示为 "LiteLLM"
2. 确认刷新页面后设置保持不变
3. 使用成员账户测试以确保他们仅将 LiteLLM 视为提供商
4. 验证配置的模型在模型下拉列表中可用

## 故障排除

**成员看不到配置的提供商**  
确保在关闭配置面板后单击了保存。验证成员账户属于正确的组织，并且你的 LiteLLM 代理可从他们的网络访问。

**连接到 LiteLLM 代理的错误**  
验证基础 URL 正确且可访问。检查任何防火墙或安全组是否允许来自你团队 IP 地址或开发环境的访问。

**身份验证失败**  
如果使用主密钥，验证其是否正确输入并在你的 LiteLLM 部署中具有适当的权限。检查 LiteLLM 代理日志以查找身份验证错误。

**模型不可用**  
确认模型在你的 LiteLLM 代理部署中正确配置。可用模型取决于你的 LiteLLM 代理的配置方式。

**配置更改不持久化**  
确保单击主设置页面上的保存按钮，而不仅仅是关闭配置面板。

**稍后需要更改端点或密钥**  
你可以随时更新这些设置。更改对所有组织成员立即生效。

有关 LiteLLM 部署和配置的更多详细信息，请查阅 [LiteLLM 文档](https://docs.litellm.ai/) 并与你的基础设施团队协调。
