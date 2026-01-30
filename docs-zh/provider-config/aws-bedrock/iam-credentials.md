---
title: "IAM 凭证"
sidebarTitle: "IAM 凭证"
description: "使用 IAM 访问密钥和秘密密钥凭据设置 AWS Bedrock 与 Cline。最适合具有既定 IAM 策略的企业环境。"
---

### 概述

-   **AWS Bedrock：** 通过 AWS 提供对领先生成式 AI 模型（例如 Anthropic Claude、Amazon Nova）的完全托管服务。\
    [了解有关 AWS Bedrock 的更多信息](https://docs.aws.amazon.com/bedrock/latest/userguide/what-is-bedrock.html)。
-   **Cline：** 通过与 AI 模型集成充当编码助手的 VS Code 扩展——赋予开发者生成代码、调试和分析数据的能力。
-   **企业专注：** 本指南专针对具有既定 AWS 环境（使用 IAM 角色、AWS SSO、AWS 组织等）的组织，以确保安全和合规的使用。

---

### 步骤 1：准备您的 AWS 环境

#### 1.1 创建或使用 IAM 角色/用户

1.  **登录 AWS 管理控制台：**\
    [AWS 控制台](https://aws.amazon.com/console/)
2.  **访问 IAM：**
    -   在 AWS 控制台中搜索 **IAM（身份和访问管理）**。
    -   创建新的 IAM 用户或使用您企业的 AWS SSO 来假设用于 Bedrock 访问的专用角色。
    -   [AWS IAM 用户指南](https://docs.aws.amazon.com/IAM/latest/UserGuide/introduction.html)

#### 1.2 附加所需策略

为确保 Cline 可以与 AWS Bedrock 交互，您的 IAM 用户或角色需要特定权限。虽然 `AmazonBedrockLimitedAccess` 托管策略提供全面访问权限，但为了更受限和安全的设置，遵循最小权限原则，以下最小权限对于 Cline 的核心模型调用功能就足够了：

-   `bedrock:InvokeModel`
-   `bedrock:InvokeModelWithResponseStream`

您可以使用这些权限创建自定义 IAM 策略并将其附加到您的 IAM 用户或角色。

**选项 1：最小权限（推荐用于生产和最小权限）**

1.  在 AWS IAM 控制台中，创建一个新策略。
2.  使用 JSON 编辑器添加以下策略文档：
    ```json
    {
    	"Version": "2012-10-17",
    	"Statement": [
    		{
    			"Effect": "Allow",
    			"Action": ["bedrock:InvokeModel", "bedrock:InvokeModelWithResponseStream"],
    			"Resource": "*" // 为了增强安全性，如果可能，请将此范围限制为特定的模型 ARN。
    		}
    	]
    }
    ```
3.  命名策略（例如 `ClineBedrockInvokeAccess`）并将其附加到您的 IAM 用户或角色。

**选项 2：使用托管策略（更简单的初始设置）**

-   或者，您可以附加 AWS 托管策略 **`AmazonBedrockLimitedAccess`**。这授予更广泛的权限，包括列出模型、管理配置和其他 Bedrock 功能的能力。这对于初始设置或如果您需要这些更广泛的功能可能更简单。
    [查看 AmazonBedrockLimitedAccess 策略详细信息](https://docs.aws.amazon.com/bedrock/latest/userguide/security-iam.html)

**重要注意事项：**

-   **Cline 中的模型列表：** 如果您在 Cline 设置中直接指定模型 ID，则最小权限（`bedrock:InvokeModel`、`bedrock:InvokeModelWithResponseStream`）足以让 Cline _使用_ 模型。如果您依赖 Cline 动态列出可用的 Bedrock 模型，您可能需要额外的权限，如 `bedrock:ListFoundationModels`。
-   **AWS Marketplace 订阅：** 对于第三方模型（例如 Anthropic Claude），确保您具有活跃的 AWS Marketplace 订阅。这通常在 AWS Bedrock 控制台的"模型访问权限"下管理，如果尚未处理，可能需要 `aws-marketplace:Subscribe` 权限。
-   _企业提示：_ 始终应用最小权限实践。如果可能，请将 IAM 策略中的资源 ARN 范围限制为特定的模型或区域。在 AWS 组织中利用 [服务控制策略（SCP）](https://docs.aws.amazon.com/organizations/latest/userguide/orgs_manage_policies_scps.html)进行全面治理。

---

### 步骤 2：验证区域和模型访问

#### 2.1 选择并确认区域

1.  **选择一个区域：**\
    AWS Bedrock 在多个区域可用（例如美国东部、欧洲、亚太地区）。选择满足您的延迟和合规性需求的区域。\
    [AWS 全球基础设施](https://aws.amazon.com/about-aws/global-infrastructure/regions_az/)
2.  **验证模型访问权限：**
    -   在 AWS Bedrock 控制台中，确认您的团队所需的模型（例如 Anthropic Claude、Amazon Nova）被标记为"已授予访问权限"。
    -   **注意：** 某些高级模型如果无法按需访问，可能需要[推理配置文件](https://docs.aws.amazon.com/bedrock/latest/userguide/inference-profiles-support.html)。

#### 2.2 设置 AWS Marketplace 订阅（如果需要）

1.  **订阅第三方模型：**
    -   导航到 AWS Bedrock 控制台并找到模型订阅部分。
    -   对于来自第三方提供商的模型（例如 Anthropic），接受条款以订阅。
    -   [AWS Marketplace](https://aws.amazon.com/marketplace/)
2.  **企业提示：**
    -   模型订阅通常由中央管理。如果存在标准订阅流程，请与您的云团队确认。

---

### 步骤 3：配置 Cline VS Code 扩展

#### 3.1 安装并打开 Cline

1.  **安装 VS Code：**\
    从 [VS Code 网站](https://code.visualstudio.com/)下载。
2.  **安装 Cline 扩展：**
    -   打开 VS Code。
    -   转到扩展市场（`Ctrl+Shift+X` 或 `Cmd+Shift+X`）。
    -   搜索 **Cline** 并安装它。

#### 3.2 配置 Cline 设置

1.  **打开 Cline 设置：**
    -   点击设置 ⚙️ 以选择您的 API 提供商。
2.  **选择 AWS Bedrock 作为 API 提供商：**
    -   从 API 提供商下拉菜单中，选择 **AWS Bedrock**。
3.  **输入您的 AWS 凭证：**
    -   输入您的 **访问密钥**和**秘密密钥**（如果使用 AWS SSO，则使用临时凭据）。
    -   指定正确的 **AWS 区域**（例如 `us-east-1` 或您的企业批准的区域）。
4.  **选择模型：**
    -   选择一个按需模型（例如 **anthropic.claude-3-5-sonnet-20241022-v2:0**）。
5.  **保存并测试：**
    -   点击 **完成/保存**以应用您的设置。
    -   通过发送简单的提示词（例如"生成一个 Python 函数来检查数字是否为质数。"）来测试集成。

---

### 步骤 4：安全、监控和最佳实践

1.  **安全访问：**
    -   尽可能优先使用 AWS SSO/联合角色而不是长期 IAM 凭据。
    -   [AWS IAM 最佳实践](https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html)
2.  **增强网络安全：**
    -   考虑设置 [AWS PrivateLink](https://docs.aws.amazon.com/vpc/latest/userguide/endpoint-services-overview.html)以安全地连接到 Bedrock。
3.  **监控和日志记录活动：**
    -   启用 AWS CloudTrail 以记录 Bedrock API 调用。
    -   使用 CloudWatch 监控调用计数、延迟和 token 使用等指标。
    -   为异常活动设置警报。
4.  **处理错误和管理成本：**
    -   实现指数退避以应对限流错误。
    -   使用 AWS 成本浏览器并设置计费警报以跟踪使用情况。\
      [AWS 成本管理](https://docs.aws.amazon.com/cost-management/latest/userguide/what-is-aws-cost-management.html)
5.  **定期审计和合规性：**
    -   定期审查 IAM 角色和 CloudTrail 日志。
    -   遵循内部数据隐私和治理策略。

---

### 结论

通过遵循这些步骤，您的企业团队可以安全地将 AWS Bedrock 与 Cline VS Code 扩展集成以加速开发：

1.  **准备您的 AWS 环境：** 创建或使用安全的 IAM 角色/用户，附加 `AmazonBedrockLimitedAccess` 策略，并确保必要权限。
2.  **验证区域和模型访问权限：** 确认您选择的区域支持您所需的模型，并在需要时通过 AWS Marketplace 订阅。
3.  **在 VS Code 中配置 Cline：** 使用您的 AWS 凭据安装和设置 Cline 并选择合适的模型。
4.  **实施安全和监控：** 对 IAM、网络安全、监控和成本管理使用最佳实践。

有关更多详细信息，请参阅 [AWS Bedrock 文档](https://docs.aws.amazon.com/bedrock/latest/userguide/what-is-bedrock.html)并与您的内部云团队协调。祝您编码愉快！

---

_本指南将随着 AWS Bedrock 和 Cline 的发展而更新。始终参考最新文档和内部策略以获取最新实践。_
