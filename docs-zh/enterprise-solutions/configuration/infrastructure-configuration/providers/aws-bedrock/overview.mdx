---
title: "AWS Bedrock 配置"
sidebarTitle: "AWS Bedrock"
description: "为你的 Cline 部署配置 AWS Bedrock"
---

<Info>
**配置路径：自托管**

本指南介绍自托管部署的 Bedrock 配置。有关简单的基于 Web 的设置，请参阅 [AWS Bedrock SaaS 配置](/enterprise-solutions/configuration/remote-configuration/aws-bedrock/admin-configuration)。
</Info>

配置 Cline 以使用 AWS Bedrock 通过 Amazon 的托管服务对企业级访问 Claude 和其他基础模型。

## 配置格式

通过你的远程配置 JSON 使用 `providerSettings.AwsBedrock` 部分配置 Bedrock：

```json
{
  "providerSettings": {
    "AwsBedrock": {
      "models": [
        {
          "id": "anthropic.claude-3-5-sonnet-20241022-v2:0",
          "name": "Claude 3.5 Sonnet"
        }
      ],
      "awsRegion": "us-east-1"
    }
  }
}
```

## 配置字段

| 字段 | 类型 | 描述 | 必需 |
|-------|------|-------------|----------|
| `models` | 数组 | 模型配置列表 | 是 |
| `awsRegion` | 字符串 | AWS 区域（例如，`us-east-1`）| 是 |
| `awsUseCrossRegionInference` | 布尔值 | 启用跨区域推理 | 否 |
| `awsUseGlobalInference` | 布尔值 | 启用全局推理路由 | 否 |
| `awsBedrockUsePromptCache` | 布尔值 | 启用提示缓存 | 否 |
| `awsBedrockEndpoint` | 字符串 | 自定义 Bedrock 端点 URL | 否 |
| `customModels` | 数组 | 自定义模型配置 | 否 |

### 模型配置

`models` 数组中的每个模型需要：

```json
{
  "id": "anthropic.claude-3-5-sonnet-20241022-v2:0",
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
| `anthropic.claude-3-5-sonnet-20241022-v2:0` | 最新 Claude Sonnet | 200K tokens |
| `anthropic.claude-3-5-haiku-20241022-v1:0` | 最新 Claude Haiku | 200K tokens |
| `anthropic.claude-3-opus-20240229-v1:0` | Claude Opus | 200K tokens |

<Note>
模型可用性因区域而异。请参阅 [AWS Bedrock 文档](https://docs.aws.amazon.com/bedrock/latest/userguide/models-regions.html)以了解区域特定的模型可用性。
</Note>

## 示例配置

### 基本配置

```json
{
  "providerSettings": {
    "AwsBedrock": {
      "models": [
        {
          "id": "anthropic.claude-3-5-sonnet-20241022-v2:0",
          "name": "Claude 3.5 Sonnet"
        }
      ],
      "awsRegion": "us-east-1"
    }
  }
}
```

### 带有提示缓存

```json
{
  "providerSettings": {
    "AwsBedrock": {
      "models": [
        {
          "id": "anthropic.claude-3-5-sonnet-20241022-v2:0",
          "name": "Claude 3.5 Sonnet"
        }
      ],
      "awsRegion": "us-east-1",
      "awsBedrockUsePromptCache": true
    }
  }
}
```

### 多个模型

```json
{
  "providerSettings": {
    "AwsBedrock": {
      "models": [
        {
          "id": "anthropic.claude-3-5-sonnet-20241022-v2:0",
          "name": "Claude 3.5 Sonnet"
        },
        {
          "id": "anthropic.claude-3-5-haiku-20241022-v1:0",
          "name": "Claude 3.5 Haiku"
        }
      ],
      "awsRegion": "us-east-1"
    }
  }
}
```

## 先决条件

在配置 Cline 使用 Bedrock 之前，你需要：

1. **已启用 Bedrock 访问的 AWS 账户**
2. **用于 Bedrock API 调用的 IAM 权限**（`bedrock:InvokeModel`、`bedrock:InvokeModelWithResponseStream`）
3. **模型访问**在 Bedrock 控制台中为所需模型启用
4. **AWS 凭证**已配置（IAM 角色、访问密钥或 AWS 配置文件）

<Tip>
有关 AWS 账户设置和 IAM 配置，请参阅 [AWS Bedrock 文档](https://docs.aws.amazon.com/bedrock/latest/userguide/getting-started.html)。
</Tip>

## 故障排除

**"访问被拒绝"错误**

确保你的 AWS 凭证具有所需的 Bedrock 权限。请参阅 [AWS IAM 文档](https://docs.aws.amazon.com/bedrock/latest/userguide/security-iam.html)以了解权限要求。

**"找不到模型"错误**

验证在 AWS Bedrock 控制台中启用了模型访问，并且模型在你配置的区域中可用。

**高延迟**

考虑使用更接近用户的区域或启用跨区域推理以获得更好的性能。

## 相关资源

<CardGroup cols={2}>
  <Card title="AWS Bedrock 文档" icon="book" href="https://docs.aws.amazon.com/bedrock/">
    完整的 AWS Bedrock 文档
  </Card>
  
  <Card title="模型访问" icon="key" href="https://docs.aws.amazon.com/bedrock/latest/userguide/model-access.html">
    如何启用模型访问
  </Card>
  
  <Card title="IAM 权限" icon="shield" href="https://docs.aws.amazon.com/bedrock/latest/userguide/security-iam.html">
    所需的 IAM 权限
  </Card>
  
  <Card title="定价" icon="dollar-sign" href="https://aws.amazon.com/bedrock/pricing/">
    AWS Bedrock 定价详情
  </Card>
</CardGroup>
