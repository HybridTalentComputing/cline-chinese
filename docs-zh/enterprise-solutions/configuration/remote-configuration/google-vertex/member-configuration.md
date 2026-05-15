---
title: "在 VS Code 中配置 Google Vertex AI（成员）"
sidebarTitle: "配置 Google Vertex（成员）"
description: "工程师在管理员设置后通过 VS Code 连接到组织的 Google Vertex AI 设置的指南"
---

作为团队成员，你可以将本地开发环境连接到组织的 Google Vertex AI 设置。本指南将引导你在 VS Code 中配置 Google Cloud 凭证，以便你可以开始通过组织配置的项目和区域设置使用 Vertex AI 模型。你的管理员已经配置了提供商设置——你只需要添加你的凭证即可开始。

## 开始之前

要成功连接到组织的 Google Vertex AI 设置，你需要准备一些事项。

**安装并配置了 Cline 扩展**  
必须在 VS Code 中安装 Cline 扩展，并且你需要登录到组织账户。如果你尚未安装 Cline，请遵循我们的[安装指南](/getting-started/installing-cline)。

<Info>
**快速检查**：在 VS Code 中打开 Cline 面板。如果你在左下角看到你的组织名称，则你已正确登录。
</Info>

**具有 Vertex AI 访问权限的 Google Cloud 凭证**  
你需要具有在组织配置的项目和区域中访问 Vertex AI 权限的 Google Cloud 凭证。

<Note>
如果你不确定使用哪种方法，请与你的管理员或 IT 团队联系，了解你的组织如何配置 Google Cloud 访问。
</Note>

## 配置步骤

<Steps>
<Step title="打开 Cline 设置">
打开 VS Code 并使用以下任一方法访问 Cline 设置面板：

- 在 Cline 面板中单击设置图标（⚙️）
- 单击位于聊天区域正下方的 API 提供商下拉菜单（它将显示为 `vertex_ai/gemini-pro` 或类似内容）

</Step>

<Step title="选择你的身份验证方法">
选择以下任一凭证实证方法以通过 Google Vertex AI 进行身份验证：

<AccordionGroup>
<Accordion title="服务账户密钥">
使用服务账户 JSON 密钥文件进行 Vertex AI 访问。

[了解有关服务账户密钥的更多信息](https://cloud.google.com/iam/docs/service-accounts)

1. 选择 **服务账户密钥** 身份验证方法
2. 上传或粘贴你的服务账户 JSON 密钥内容
3. 密钥应具有 `aiplatform.user` 或类似的 Vertex AI 权限
4. 这些凭证本地存储，仅由 VS Code 扩展使用
</Accordion>

<Accordion title="Google Cloud SDK">
使用你机器上安装的 Google Cloud SDK 和你已认证的账户。

[了解有关 Google Cloud SDK 的更多信息](https://cloud.google.com/sdk/docs/install)

1. 选择 **Google Cloud SDK** 身份验证方法
2. 确保你已使用 `gcloud auth login` 进行身份验证
3. 验证你的账户有权访问组织的 Vertex AI 项目
4. Cline 将自动使用你的默认 Google Cloud 凭证
</Accordion>

<Accordion title="应用程序默认凭证据">
使用 Google Cloud 的应用程序默认凭证据（ADC）链。

1. 选择 **应用程序默认凭证据** 方法
2. 确保在你的环境中正确配置了 ADC
3. 这适用于 Google Cloud 凭证据 centrally 管理的环境
4. Cline 将自动从你的环境中检测凭证据
</Accordion>
</AccordionGroup>

<Note>
Google Cloud 项目 ID 和区域由你的管理员预配置，无需在扩展中设置。
</Note>
</Step>

<Step title="验证配置">
选择身份验证方法后，扩展将显示已启用功能的复选标记：

- ✓ 支持图像（适用于 Gemini Pro Vision 和类似模型）
- ✓ 支持多模态输入
- ✓ 支持函数调用（适用于支持的模型）

项目 ID 和区域设置将被锁定（显示锁定图标 🔒），因为它们由你的管理员控制。
</Step>

<Step title="测试连接">
在 Cline 中发送测试消息以验证你的凭证与配置的 Vertex AI 项目和区域正常工作。

<Tip>
**测试建议**

首先尝试简单的测试，如"你好"，以验证基本连接，然后如果需要，通过共享图像测试多模态功能。
</Tip>
</Step>
</Steps>

## 模型使用

### 可用的模型系列
通过组织的 Vertex AI 设置可用的模型通常包括：

**Gemini 模型：**
- **Gemini Pro**：高级推理、代码生成和多模态功能
- **Gemini Pro Vision**：图像理解和视觉问答
- **Gemini Ultra**：用于复杂推理任务的最强大模型

**PaLM 模型：**
- **PaLM 2 for Text**：文本生成和补全
- **PaLM 2 for Chat**：对话式 AI 交互
- **Codey**：专门用于代码生成和解释

**专用模型：**
- **Text Embedding**：用于语义搜索和相似性任务  
- **自定义模型**：你的组织的微调变体（如果可用）

### 模型选择策略
根据你的开发需求选择模型：

- **通用任务**：大多数文本和推理任务使用 Gemini Pro
- **视觉内容**：处理图像时使用 Gemini Pro Vision
- **重度代码工作**：编程任务使用 Codey 模型
- **复杂推理**：复杂问题解决使用 Gemini Ultra
- **嵌入任务**：语义操作使用 Text Embedding 模型

### 多模态功能
利用 Vertex AI 的多模态功能：

- **图像分析**：在 Cline 中直接上传图像进行分析
- **视觉问答**：询问有关图像的问题
- **代码截图**：从截图获取代码解释
- **文档处理**：分析图表、图形和视觉数据

## 故障排除

**Google Vertex AI 不作为提供商选项可用**  
确认你登录到了正确的 Cline 组织。验证你的管理员已保存 Vertex AI 配置，并且你具有最新版本的 Cline 扩展。

**身份验证错误（"Access Denied" 或 "Invalid Credentials"）**  
验证你选择的凭证实证方法具有在配置的项目和区域中访问 Vertex AI 所需的必要 IAM 权限。所需权限包括 `aiplatform.endpoints.predict` 和 `aiplatform.models.predict`。

**项目访问错误**  
请管理员确认为你的组织配置了哪个 Google Cloud 项目。确保你的 Google Cloud 凭证有权访问该特定项目。

**区域访问错误**  
验证你的凭证据有权访问配置区域中的 Vertex AI。某些模型可能并非在所有区域中都可用，因此请与你的管理员确认所选区域。

**Google Cloud SDK 身份验证问题**  
确保正确安装和验证了 Google Cloud SDK：
```bash
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
gcloud auth application-default login
```

**服务账户密钥错误**  
验证服务账户密钥有效且未过期。检查服务账户在组织项目中是否具有适当的 Vertex AI 权限。确保 JSON 密钥文件格式正确且包含所有必需字段。

**模型访问错误或"model not found"**  
某些模型可能未在组织的项目或区域中启用。如果特定模型不可用，请联系管理员。验证你的组织已在 Google Cloud Console 中启用了你要使用的模型。

## 安全最佳实践

配置 Google Cloud 凭证时，请遵循这些安全指南：

- 使用具有 Vertex AI 访问所需最低权限的服务账户
- 定期轮换服务账户密钥（建议每 90 天）
- 永远不要在代码或版本控制中存储凭证据
- 尽可能使用 Google Cloud SDK 以获得更好的凭据管理
- 考虑为容器化开发环境使用 Workload Identity
- 报告任何可疑活动或未授权的访问尝试

你的组织管理员控制哪些模型和区域可用。扩展将根据你项目的配置和区域可用性自动显示可用模型。

有关 Google Cloud 身份验证和 Vertex AI 权限的更多信息，请参阅 [Google Cloud IAM 文档](https://cloud.google.com/iam/docs) 并与你的组织云管理员协调。
