---
title: "Google Vertex AI 配置"
sidebarTitle: "Google Vertex"
description: "为你的 Cline 部署配置 Google Vertex AI"
---

<Info>
**配置路径：自托管**

本指南介绍自托管部署的 Vertex AI 配置。有关简单的基于 Web 的设置，请参阅 [Google Vertex SaaS 配置](/enterprise-solutions/configuration/remote-configuration/google-vertex/admin-configuration)。
</Info>

配置 Cline 以使用 Google Vertex AI 通过 Google Cloud 平台对企业级访问 Gemini 和其他 Google AI 模型。

## 配置格式

通过你的远程配置 JSON 使用 `providerSettings.Vertex` 部分配置 Vertex AI：

```json
{
  "providerSettings": {
    "Vertex": {
      "models": [
        {
          "id": "claude-3-5-sonnet-v2@20241022",
          "name": "Claude 3.5 Sonnet"
        }
      ],
      "vertexProjectId": "my-project-id",
      "vertexRegion": "us-central1"
    }
  }
}
```

## 配置字段

| 字段 | 类型 | 描述 | 必需 |
|-------|------|-------------|----------|
| `models` | 数组 | 模型配置列表 | 是 |
| `vertexProjectId` | 字符串 | Google Cloud 项目 ID | 是 |
| `vertexRegion` | 字符串 | GCP 区域（例如，`us-central1`）| 是 |

### 模型配置

`models` 数组中的每个模型需要：

```json
{
  "id": "claude-3-5-sonnet-v2@20241022",
  "name": "Claude 3.5 Sonnet",
  "info": {
    "maxTokens": 8192,
    "contextWindow": 200000,
    "supportsImages": true,
    "supportsPromptCache": true
  }
}
```

## 常见模型 ID

| 模型 ID | 描述 | 上下文窗口 |
|----------|-------------|----------------|
| `claude-3-5-sonnet-v2@20241022` | Claude 3.5 Sonnet | 200K tokens |
| `claude-3-5-haiku@20241022` | Claude 3.5 Haiku | 200K tokens |
| `claude-3-opus@20240229` | Claude 3 Opus | 200K tokens |
| `gemini-2.0-flash-exp` | Gemini Flash（实验性）| 1M tokens |
| `gemini-1.5-pro-002` | Gemini Pro | 2M tokens |
| `gemini-1.5-flash-002` | Gemini Flash | 1M tokens |

<Note>
模型可用性因区域而异。请参阅 [Vertex AI 文档](https://cloud.google.com/vertex-ai/docs/generative-ai/learn/models)以了解区域特定的模型可用性。
</Note>

## 示例配置

### 基本配置

```json
{
  "providerSettings": {
    "Vertex": {
      "models": [
        {
          "id": "claude-3-5-sonnet-v2@20241022",
          "name": "Claude 3.5 Sonnet"
        }
      ],
      "vertexProjectId": "my-company-prod",
      "vertexRegion": "us-central1"
    }
  }
}
```

### 多个模型

```json
{
  "providerSettings": {
    "Vertex": {
      "models": [
        {
          "id": "claude-3-5-sonnet-v2@20241022",
          "name": "Claude 3.5 Sonnet"
        },
        {
          "id": "gemini-1.5-pro-002",
          "name": "Gemini Pro"
        }
      ],
      "vertexProjectId": "my-company-prod",
      "vertexRegion": "us-central1"
    }
  }
}
```

### 带有扩展思考

```json
{
  "providerSettings": {
    "Vertex": {
      "models": [
        {
          "id": "claude-3-5-sonnet-v2@20241022",
          "name": "Claude 3.5 Sonnet",
          "thinkingBudgetTokens": 1600
        }
      ],
      "vertexProjectId": "my-company-prod",
      "vertexRegion": "us-central1"
    }
  }
}
```

## 先决条件

在配置 Cline 使用 Vertex AI 之前，你需要：

1. **已启用 Vertex AI API 的 Google Cloud 项目**
2. **具有 Vertex AI 用户角色**的服务账户（`roles/aiplatform.user`）
3. **服务账户凭据**已配置用于身份验证
4. **模型访问**在你的项目和区域中验证

<Tip>
有关 Google Cloud 设置和身份验证配置，请参阅 [Vertex AI 文档](https://cloud.google.com/vertex-ai/docs/generative-ai/start/quickstarts/quickstart-multimodal)。
</Tip>

## 故障排除

**"权限被拒绝"错误**

确保你的服务账户具有所需的 Vertex AI 权限。请参阅 [Google Cloud IAM 文档](https://cloud.google.com/vertex-ai/docs/general/access-control)以了解权限要求。

**"API 未启用"错误**

验证在你的 Google Cloud 项目中启用了 Vertex AI API。

**"找不到模型"错误**

检查模型在你配置的区域中可用，并且你的项目有权访问它。

## 相关资源

<CardGroup cols={2}>
  <Card title="Vertex AI 文档" icon="book" href="https://cloud.google.com/vertex-ai/docs">
    完整的 Vertex AI 文档
  </Card>
  
  <Card title="服务账户" icon="key" href="https://cloud.google.com/iam/docs/service-accounts">
    服务账户最佳实践
  </Card>
  
  <Card title="模型指南" icon="brain" href="https://cloud.google.com/vertex-ai/docs/generative-ai/learn/models">
    可用模型和功能
  </Card>
  
  <Card title="定价" icon="dollar-sign" href="https://cloud.google.com/vertex-ai/pricing">
    Vertex AI 定价详情
  </Card>
</CardGroup>
