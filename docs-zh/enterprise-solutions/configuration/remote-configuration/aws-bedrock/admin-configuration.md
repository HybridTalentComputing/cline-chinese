---
title: "配置 AWS Bedrock 提供商（管理员）"
sidebarTitle: "配置 AWS Bedrock（管理员）"
description: "本指南解释管理员如何将 AWS Bedrock 配置为 Cline 的组织级 LLM 提供商。"


作为管理员，你可以通过托管管理控制台为所有 Cline 用户添加 AWS Bedrock 作为组织级 LLM 提供商。这种集中式方法通过区域控制和基本配置选项确保对 Amazon AI 模型的一致访问，同时维护你组织的安全和合规要求。

## 开始之前

要开始将 AWS Bedrock 设置为你组织的 LLM 提供商，你需要准备一些事项。

**对 Cline 管理控制台的管理员访问权限**  
你需要管理员权限来在整个组织中强制执行提供商设置。如果你可以在 [app.cline.bot](https://app.cline.bot) 的管理控制台中导航到 **设置 → Cline 设置**，则你具有正确的访问级别。


**具有正确权限的 AWS Bedrock 账户**  
你的 AWS 账户需要特定的 Bedrock 权限才能与 Cline 一起工作。 

<Note>
如果你没有直接的 AWS 访问权限，请与你的云团队协调，在继续之前设置这些权限。
</Note>

**你首选的 AWS 区域**  
仔细选择你的主要 AWS 区域，因为这将对所有用户强制执行。

<Tip>
首先检查你的区域中有哪些模型可用。一些较新的模型可能尚未在所有区域中可用。
</Tip>

<Frame>
	<img
		src="https://storage.googleapis.com/cline-static-assets-prod/assets/AWS%20Remote%20Config.gif"
	/>
</Frame>

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

<Step title="选择 AWS Bedrock 作为 API 提供商">
打开 **API 提供商** 下拉菜单并选择 **Amazon Bedrock**。这将打开 Bedrock 配置面板，你将在其中配置所有组织范围的设置。
</Step>

<Step title="配置 Bedrock 设置">
配置面板包含多个控制 Bedrock 为你组织工作的设置。配置你需要的内容：

<AccordionGroup>
<Accordion title="区域（必需）">
输入你首选的 AWS 区域，如 `us-west-2` 或 `us-east-1`。此区域将对所有组织成员强制执行。

[查看 AWS 全球基础设施](https://aws.amazon.com/about-aws/global-infrastructure/regions_az/)

<Tip>
对于大多数组织，建议使用 `us-east-1` 或 `us-west-2`，因为它们具有最佳的模型可用性。
</Tip>
</Accordion>

<Accordion title="自定义 VPC 端点（可选）">
如果你的组织为 Bedrock 使用私有 VPC 端点，请在此处指定它以确保所有 API 调用都通过网络基础设施进行。

[了解有关 AWS PrivateLink 的更多信息](https://docs.aws.amazon.com/vpc/latest/userguide/endpoint-services-overview.html)
</Accordion>

<Accordion title="跨区域推理（可选）">
启用此选项可以让 Bedrock 在主区域具有容量限制时自动将请求路由到其他区域。这在高需求期间保持可用性很有用。

[了解有关推理配置文件的更多信息](https://docs.aws.amazon.com/bedrock/latest/userguide/inference-profiles-support.html)
</Accordion>

<Accordion title="全局推理配置文件（可选）">
打开此选项以使用 AWS 的全局推理路由，该路由根据可用性和延迟自动将请求引导到最佳区域。
</Accordion>

<Accordion title="提示缓存（可选）">
启用提示缓存以降低成本和延迟。Bedrock 缓存请求中保持一致的提示部分，使重复交互更快、更便宜。

[了解有关提示缓存的更多信息](https://docs.aws.amazon.com/bedrock/latest/userguide/prompt-caching.html)
</Accordion>
</AccordionGroup>
</Step>

<Step title="保存配置">
配置设置后，关闭提供商配置面板并单击设置页面上的 **保存** 以持久化你的更改。

保存后，所有登录到 Cline 扩展的组织成员将自动使用具有你配置设置的 AWS Bedrock。他们将无法选择其他提供商或切换到其个人 Cline 账户。

<Warning>
启用远程配置后，成员无法切换到个人 Cline 账户或加入其他组织。这确保了团队中一致的提供商使用。
</Warning>
</Step>
</Steps>

## 验证

要验证配置：

1. 检查提供商在已启用提供商字段中显示为 "Amazon Bedrock"
2. 确认刷新页面后设置保持不变
3. 使用成员账户测试以确保他们仅将 Bedrock 视为提供商

## 故障排除

**成员看不到配置的提供商**  
确保在关闭配置面板后单击了保存。验证成员账户属于正确的组织。

**配置更改不持久化**  
确保单击主设置页面上的保存按钮，而不仅仅是关闭配置面板。

**稍后需要更改区域**  
你可以随时更新区域。成员需要确保其本地 AWS 凭证有权访问新区域。有关更多信息，请参阅 [AWS Bedrock 文档](https://docs.aws.amazon.com/bedrock/latest/userguide/what-is-bedrock.html)。

有关更多详细信息，请查阅 [AWS Bedrock 文档](https://docs.aws.amazon.com/bedrock/latest/userguide/what-is-bedrock.html) 并与你的内部云团队协调。
