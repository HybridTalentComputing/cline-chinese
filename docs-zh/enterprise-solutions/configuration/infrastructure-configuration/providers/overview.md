---
title: "AI 提供商配置"
sidebarTitle: "概述"
description: "为你的 Cline 部署配置 AI 提供商设置"
---

<Info>
**配置路径：自托管**

本节介绍自托管部署的提供商配置。有关通过 app.cline.bot 进行基于 Web 的配置，请参阅 [SaaS 提供商配置](/enterprise-solutions/configuration/remote-configuration/overview)。
</Info>

配置你的团队可以使用的 AI 提供商并集中管理提供商凭证。Cline 支持具有企业级身份验证选项的主要 AI 提供商。

## 支持的提供商

<CardGroup cols={2}>
  <Card title="AWS Bedrock" icon="aws" href="/enterprise-solutions/configuration/infrastructure-configuration/providers/aws-bedrock">
    Amazon 用于 Claude 和其他基础模型的托管服务
  </Card>
  
  <Card title="Google Vertex AI" icon="google" href="/enterprise-solutions/configuration/infrastructure-configuration/providers/google-vertex">
    Google Cloud 的 AI 平台，具有 Gemini 和 PaLM 模型
  </Card>
  
  <Card title="LiteLLM" icon="zap" href="/enterprise-solutions/configuration/infrastructure-configuration/providers/litellm">
    通过统一 API 访问 100 多个 AI 模型的通用代理
  </Card>
  
  <Card title="自定义提供商" icon="plug" href="/enterprise-solutions/configuration/infrastructure-configuration/providers/custom">
    OpenAI 兼容的 API 和自托管模型
  </Card>
</CardGroup>

## 什么是提供商配置？

Cline 中的提供商配置允许管理员：

1. **集中管理凭证**：在一个地方存储 API 密钥和身份验证详细信息
2. **控制模型访问**：指定团队可以使用哪些模型
3. **强制提供商使用**：将所有团队成员引导到批准的提供商

## 工作原理

提供商设置通过你的远程配置 JSON 文件配置：

```json
{
  "providerSettings": {
    "provider": "bedrock",
    "bedrockRegion": "us-east-1",
    "bedrockServiceRole": "arn:aws:iam::..."
  }
}
```

配置后，这些设置：
- 自动应用于所有团队成员
- 覆盖个人用户设置
- 确保团队中一致的提供商使用

## 配置选项

### 提供商选择

从支持的提供商中选择：
- **bedrock**：使用 AWS Bedrock
- **vertex**：使用 Google Vertex AI  
- **openai**：使用 OpenAI API
- **azure**：使用 Azure OpenAI
- **litellm**：使用 LiteLLM 代理

### 身份验证

每个提供商支持不同的身份验证方法：

**AWS Bedrock:**
- 具有跨账户访问的 IAM 角色
- 访问密钥（不推荐用于生产环境）

**Google Vertex AI:**
- 服务账户 JSON 密钥
- 工作负载身份（用于 GKE 部署）

**OpenAI/Azure:**
- API 密钥

**LiteLLM:**
- 端点 URL + API 密钥

## 示例配置

### 使用 IAM 角色的 AWS Bedrock
```json
{
  "providerSettings": {
    "provider": "bedrock",
    "bedrockRegion": "us-east-1",
    "bedrockServiceRole": "arn:aws:iam::123456789012:role/ClineBedrockRole"
  }
}
```

### Google Vertex AI
```json
{
  "providerSettings": {
    "provider": "vertex",
    "vertexProject": "my-project-id",
    "vertexRegion": "us-central1"
  }
}
```

### LiteLLM 代理
```json
{
  "providerSettings": {
    "provider": "litellm",
    "litellmBaseUrl": "https://litellm.company.com",
    "litellmApiKey": "sk-..."
  }
}
```

## 下一步

<CardGroup cols={2}>
  <Card title="配置 AWS Bedrock" icon="aws" href="/enterprise-solutions/configuration/infrastructure-configuration/providers/aws-bedrock">
    设置 AWS Bedrock 集成
  </Card>
  
  <Card title="配置 Google Vertex" icon="google" href="/enterprise-solutions/configuration/infrastructure-configuration/providers/google-vertex">
    设置 Google Vertex AI 集成
  </Card>
  
  <Card title="配置 LiteLLM" icon="zap" href="/enterprise-solutions/configuration/infrastructure-configuration/providers/litellm">
    设置 LiteLLM 代理集成
  </Card>
  
  <Card title="配置自定义提供商" icon="plug" href="/enterprise-solutions/configuration/infrastructure-configuration/providers/custom">
    设置自定义 OpenAI 兼容提供商
  </Card>
</CardGroup>
