---
title: "API 密钥（简单设置）"
sidebarTitle: "API 密钥"
description: "使用 Bedrock API 密钥设置 AWS Bedrock 与 Cline。个人开发者访问前沿模型的最简单设置。"
---

### 概述

-   **AWS Bedrock：** 通过 AWS 提供对领先生成式 AI 模型（例如 Anthropic Claude、Amazon Nova）的完全托管服务。\
    [了解有关 AWS Bedrock 的更多信息](https://docs.aws.amazon.com/bedrock/latest/userguide/what-is-bedrock.html)。
-   **Cline：** 通过与 AI 模型集成充当编码助手的 VS Code 扩展——赋予开发者生成代码、调试和分析数据的能力。
-   **开发者专注：** 本指南专希望通过使用 API 密钥的简化设置通过 AWS Bedrock 启用对前沿模型访问的个人开发者。

---

### 步骤 1：准备您的 AWS 环境

#### 1.1 个人用户设置 - 创建 Bedrock API 密钥

有关更详细的说明，请查看[文档](https://docs.aws.amazon.com/bedrock/latest/userguide/api-keys.html)。

1.  **登录 AWS 管理控制台：**\
    [AWS 控制台](https://aws.amazon.com/console/)
2.  **访问 Bedrock 控制台：**
    -   [Bedrock 控制台](https://console.aws.amazon.com/bedrock)
    -   创建一个新的长期 API 密钥。此 API 密钥将默认具有 `AmazonBedrockLimitedAccess` IAM 策略
      [查看 AmazonBedrockLimitedAccess 策略详细信息](https://docs.aws.amazon.com/bedrock/latest/userguide/security-iam.html)

#### 1.2 创建或修改策略

为确保 Cline 可以与 AWS Bedrock 交互，您的 IAM 用户或角色需要特定权限。虽然 `AmazonBedrockLimitedAccess` 托管策略提供全面访问权限，但为了更受限和安全的设置，遵循最小权限原则，以下最小权限对于 Cline 的核心模型调用功能就足够了：

-   `bedrock:InvokeModel`
-   `bedrock:InvokeModelWithResponseStream`
-   `bedrock:CallWithBearerToken`

您可以使用这些权限创建自定义 IAM 策略并将其附加到您的 IAM 用户或角色。

1.  在 AWS IAM 控制台中，创建一个新策略。
2.  使用 JSON 编辑器添加以下策略文档：
    ```json
    {
    	"Version": "2012-10-17",
    	"Statement": [
    		{
    			"Effect": "Allow",
    			"Action": ["bedrock:InvokeModel", "bedrock:InvokeModelWithResponseStream", "bedrock:CallWithBearerToken"],
    			"Resource": "*" // 为了增强安全性，如果可能，请将此范围限制为特定的模型 ARN。
    		}
    	]
    }
    ```
3.  命名策略（例如 `ClineBedrockInvokeAccess`）并将其附加到与您创建的密钥关联的 IAM 用户。IAM 用户和 API 密钥具有相同的前缀。

**重要注意事项：**

-   **Cline 中的模型列表：** 如果您在 Cline 设置中直接指定模型 ID，则最小权限（`bedrock:InvokeModel`、`bedrock:InvokeModelWithResponseStream`）足以让 Cline _使用_ 模型。如果您依赖 Cline 动态列出可用的 Bedrock 模型，您可能需要额外的权限，如 `bedrock:ListFoundationModels`。
-   **AWS Marketplace 订阅：** 对于第三方模型（例如 Anthropic Claude），**`AmazonBedrockLimitedAccess`** 策略授予您通过 AWS Marketplace 订阅的必要权限。无需显式访问权限。对于 Anthropic 模型，您仍然需要通过控制台提交首次使用（FTU）表单。如果您在 Cline 聊天中收到以下消息 `[ERROR] 无法处理响应：此账户尚未提交模型用例详细信息。在使用模型之前填写 Anthropic 用例详细信息表单。`，然后打开 [AWS Bedrock 控制台中的 Playground](https://console.aws.amazon.com/bedrock/home?#/text-generation-playground)，选择任何 Anthropic 模型并填写表单（您可能需要先发送提示词）

---

### 步骤 2：验证区域和模型访问

#### 2.1 选择并确认区域

1.  **选择一个区域：**\
    AWS Bedrock 在多个区域可用（例如美国东部、欧洲、亚太地区）。选择满足您的延迟和合规性需求的区域。\
    [AWS 全球基础设施](https://aws.amazon.com/about-aws/global-infrastructure/regions_az/)
2.  **验证模型访问权限：**
    -   **注意：** 某些模型只能通过[推理配置文件](https://docs.aws.amazon.com/bedrock/latest/userguide/inference-profiles-support.html)访问。在这种情况下，勾选"跨区域推理"复选框。

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
3.  **输入您的 AWS API 密钥：**
    -   输入您的 **API 密钥**
    -   指定正确的 **AWS 区域**（例如 `us-east-1` 或您的企业批准的区域）。
4.  **选择模型：**
    -   选择一个按需模型（例如 **anthropic.claude-3-5-sonnet-20241022-v2:0**）。
5.  **保存并测试：**
    -   点击 **完成/保存**以应用您的设置。
    -   通过发送简单的提示词（例如"生成一个 Python 函数来检查数字是否为质数。"）来测试集成。

---

### 步骤 4：安全、监控和最佳实践

1.  **安全访问：**
    -   尽可能优先使用 AWS SSO/联合角色而不是长期 API 密钥。
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

通过遵循这些步骤，您可以快速将 AWS Bedrock 与 Cline VS Code 扩展集成以加速开发：

1.  **准备您的 AWS 环境：** 创建具有必要权限的 Bedrock API 密钥。
2.  **验证区域和模型访问权限：** 确认您选择的区域支持您所需的模型。
3.  **在 VS Code 中配置 Cline：** 使用您的 AWS API 密钥安装和设置 Cline 并选择合适的模型。
4.  **实施安全和监控：** 对 IAM、网络安全、监控和成本管理使用最佳实践。

有关更多详细信息，请参阅 [AWS Bedrock 文档](https://docs.aws.amazon.com/bedrock/latest/userguide/what-is-bedrock.html)。祝您编码愉快！

---

_本指南将随着 AWS Bedrock 和 Cline 的发展而更新。始终参考最新文档和内部策略以获取最新实践。_
