---
title: "在 VS Code 中配置 AWS Bedrock（成员）"
sidebarTitle: "配置 AWS Bedrock（成员）"
description: "管理员设置后工程师在 VS Code 中配置 AWS Bedrock 凭证的指南"
---

作为团队成员，你可以将本地开发环境连接到组织的 AWS Bedrock 设置。本指南将引导你在 VS Code 中配置 AWS 凭证，以便你可以开始通过组织的 Bedrock 基础设施使用模型。你的管理员已经配置了提供商设置——你只需要添加你的凭证即可开始。

## 开始之前

要成功连接到组织的 AWS Bedrock 设置，你需要准备一些事项。

**安装并配置了 Cline 扩展**  
必须在 VS Code 中安装 Cline 扩展，并且你需要登录到组织账户。如果你尚未安装 Cline，请遵循我们的[安装指南](/getting-started/installing-cline)。

<Info>
**快速检查**：在 VS Code 中打开 Cline 面板。如果你在左下角看到你的组织名称，则你已正确登录。
</Info>

**具有 Bedrock 访问权限的 AWS 凭证**  
你需要具有在组织配置的区域中访问 Bedrock 权限的 AWS 凭证。

<Note>
如果你还没有 AWS 凭证，请联系你的 IT 或云团队以获取访问密钥或配置了必要 Bedrock 权限的 AWS CLI 配置文件。
</Note>


<Frame>
	<img
		src="https://storage.googleapis.com/cline-static-assets-prod/assets/VS%20Code%20Bedrock%20API%20Key.gif"
	/>
</Frame>

## 配置步骤

<Steps>
<Step title="打开 Cline 设置">
打开 VS Code 并使用以下任一方法访问 Cline 设置面板：

- 在 Cline 面板中单击设置图标（⚙️）
- 单击位于聊天区域正下方的 API 提供商下拉菜单（它将显示为 `bedrock.anthropic.claude-sonnet-4-20250514-v1:0` 或类似内容）

</Step>

<Step title="选择你的身份验证方法">
选择以下任一凭证实证方法以通过 AWS Bedrock 进行身份验证：

<AccordionGroup>
<Accordion title="AWS Bedrock API 密钥">
使用专门用于 Bedrock 访问的 AWS 访问密钥。

[了解有关 AWS Bedrock API 密钥的更多信息](https://docs.aws.amazon.com/bedrock/latest/userguide/api-keys.html)

1. 选择 **API 密钥** 单选按钮
2. 输入你的 AWS 访问密钥 ID 和秘密访问密钥
3. 这些凭证本地存储，仅由 VS Code 扩展使用
</Accordion>

<Accordion title="AWS 配置文件">
使用你机器上配置的现有 AWS CLI 配置文件。

[了解有关 AWS CLI 配置文件的更多信息](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-profiles.html)

1. 选择 **AWS 配置文件** 单选按钮
2. 从你的 `~/.aws/credentials` 文件中选择或输入配置文件名称
3. Cline 将使用与该配置文件关联的凭证
</Accordion>

<Accordion title="AWS 凭证">
使用你的默认 AWS 凭证链（环境变量、EC2 实例角色等）。

1. 选择 **AWS 凭证** 单选按钮
2. Cline 将使用标准 AWS 凭证提供程序链从你的环境中自动检测凭证据
</Accordion>
</AccordionGroup>

<Note>
AWS 区域由你的管理员预配置，无需在扩展中设置。
</Note>
</Step>

<Step title="验证配置">
选择身份验证方法后，扩展将显示已启用功能的复选标记：

- ✓ 支持图像
- ✓ 支持浏览器使用
- ✓ 支持提示缓存

其他设置（如跨区域推理和全局推理配置文件）将被锁定（显示锁定图标 🔒），因为它们由你的管理员控制。
</Step>

<Step title="测试连接">
在 Cline 中发送测试消息以验证你的凭证与配置的 Bedrock 区域正常工作。

<Tip>
**测试建议**

建议在计划模式下测试连接，以便在将其用于实际任务之前验证一切正常工作。
</Tip>
</Step>
</Steps>


## 故障排除

**身份验证错误（"Access Denied" 或 "Invalid Credentials"）**  
验证你选择的凭证实证方法具有在配置区域调用 Bedrock 所需的必要 IAM 权限。所需权限包括 `bedrock:InvokeModel` 和 `bedrock:InvokeModelWithResponseStream`。有关更多信息，请参阅 [AWS Bedrock IAM 权限](https://docs.aws.amazon.com/bedrock/latest/userguide/security-iam.html)。

**区域相关错误或"model not available"**  
请管理员确认为你的组织配置了哪个区域。确保你的 AWS 凭证有权访问该特定区域中的 Bedrock。[查看 AWS 全球基础设施](https://aws.amazon.com/about-aws/global-infrastructure/regions_az/)

**看不到 AWS Bedrock 选项**  
确认你登录到了正确的 Cline 组织。验证你的管理员已保存 Bedrock 配置。尝试注销并重新登录扩展。

**AWS 凭证选项找不到凭证据  
验证已安装 AWS CLI 并使用 `aws configure` 配置（[AWS CLI 安装指南](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)）。检查 `~/.aws/credentials` 中是否存在凭证据。对于 EC2/ECS 环境，确保 IAM 角色正确附加。如果使用环境变量，请设置 `AWS_ACCESS_KEY_ID` 和 `AWS_SECRET_ACCESS_KEY`。


## 安全最佳实践

配置 AWS 凭证时，请遵循这些安全指南：

- 使用具有最低所需权限的 IAM 角色（[AWS IAM 最佳实践](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html)）
- 如果使用 API 密钥方法，请定期轮换访问密钥
- 永远不要在代码或版本控制中存储凭证据
- 首选 AWS 配置文件方法以获得更好的凭据管理
- 考虑使用 AWS SSO/联合角色以增强安全性

你的组织管理员控制哪些模型可用。扩展将根据你区域的 Bedrock 配置自动显示可用模型。有关可用模型的更多信息，请参阅 [AWS Bedrock 模型访问文档](https://docs.aws.amazon.com/bedrock/latest/userguide/model-access.html)。

如需进一步帮助，请查阅 [AWS Bedrock 文档](https://docs.aws.amazon.com/bedrock/latest/userguide/what-is-bedrock.html) 并与你的组织云管理员协调。
