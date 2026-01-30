---
title: "LiteLLM 配置"
sidebarTitle: "LiteLLM"
description: "为你的 Cline 部署配置 LiteLLM 代理"
---

<Info>
**配置路径：自托管**

本指南介绍自托管部署的 LiteLLM 配置。有关基于 Web 的设置，请参阅 [LiteLLM SaaS 配置](/enterprise-solutions/configuration/remote-configuration/litellm/admin-configuration)。
</Info>

配置 Cline 以使用现有的 LiteLLM 代理，通过单个 API 端点统一访问多个 AI 模型。

## 什么是 LiteLLM？

[LiteLLM](https://github.com/BerriAI/litellm) 是一个开源代理，提供统一的 OpenAI 兼容 API，用于访问来自不同提供商的 100 多个 AI 模型。Cline 连接到你部署的 LiteLLM 实例。

<Note>
LiteLLM 是你部署和管理的单独服务。本指南介绍如何配置 Cline 以连接到现有的 LiteLLM 部署。
</Note>

## 配置格式

通过你的远程配置 JSON 使用 `providerSettings.OpenAiCompatible` 部分配置 LiteLLM：

```json
{
  "providerSettings": {
    "OpenAiCompatible": {
      "models": [
        {
          "id": "gpt-4-turbo",
          "name": "GPT-4 Turbo"
        }
      ],
      "openAiBaseUrl": "https://litellm.yourcompany.com/v1"
    }
  }
}
```

## 配置字段

| 字段 | 类型 | 描述 | 必需 |
|-------|------|-------------|----------|
| `models` | 数组 | 模型配置列表 | 是 |
| `openAiBaseUrl` | 字符串 | LiteLLM 代理端点 URL | 是 |
| `openAiApiKey` | 字符串 | 用于身份验证的 API 密钥 | 否 |

### 模型配置

`models` 数组中的每个模型需要：

```json
{
  "id": "gpt-4-turbo",
  "name": "GPT-4 Turbo",
  "info": {
    "maxTokens": 4096,
    "contextWindow": 128000,
    "supportsImages": true
  }
}
```

<Note>
模型 ID 必须与你的 LiteLLM 代理部署中配置的模型名称匹配。
</Note>

## 示例配置

### 基本配置

```json
{
  "providerSettings": {
    "OpenAiCompatible": {
      "models": [
        {
          "id": "gpt-4-turbo",
          "name": "GPT-4 Turbo"
        }
      ],
      "openAiBaseUrl": "https://litellm.company.com/v1"
    }
  }
}
```

### 带有身份验证

```json
{
  "providerSettings": {
    "OpenAiCompatible": {
      "models": [
        {
          "id": "gpt-4-turbo",
          "name": "GPT-4 Turbo"
        }
      ],
      "openAiBaseUrl": "https://litellm.company.com/v1",
      "openAiApiKey": "sk-your-litellm-key"
    }
  }
}
```

### 多个模型

```json
{
  "providerSettings": {
    "OpenAiCompatible": {
      "models": [
        {
          "id": "gpt-4-turbo",
          "name": "GPT-4 Turbo"
        },
        {
          "id": "claude-3-5-sonnet",
          "name": "Claude 3.5 Sonnet"
        },
        {
          "id": "gemini-pro",
          "name": "Gemini Pro"
        }
      ],
      "openAiBaseUrl": "https://litellm.company.com/v1",
      "openAiApiKey": "sk-your-litellm-key"
    }
  }
}
```

### 内部网络（无身份验证）

```json
{
  "providerSettings": {
    "OpenAiCompatible": {
      "models": [
        {
          "id": "gpt-4-turbo",
          "name": "GPT-4 Turbo"
        }
      ],
      "openAiBaseUrl": "http://litellm.internal:4000/v1"
    }
  }
}
```

## 先决条件

在配置 Cline 使用 LiteLLM 之前，你需要：

1. **LiteLLM 代理**已部署并可访问
2. **LiteLLM 配置**已启用所需模型
3. **API 密钥**（如果启用了身份验证）
4. **网络访问**从使用 Cline 的地方

<Tip>
有关 LiteLLM 部署和配置，请参阅 [LiteLLM 文档](https://docs.litellm.ai/docs/proxy/quick_start)。
</Tip>

## 故障排除

**连接错误**

验证 LiteLLM 代理正在运行并可访问：
```bash
curl https://litellm.yourcompany.com/health
```

**身份验证错误**

检查你的 API 密钥是否有效：
```bash
curl -H "Authorization: Bearer sk-your-key" \
  https://litellm.yourcompany.com/v1/models
```

**找不到模型**

验证模型在你的 LiteLLM 部署中配置。Cline 配置中的模型 ID 必须与 LiteLLM 配置中的模型名称匹配。

## 使用 LiteLLM 的好处

- **多提供商访问**：通过一个端点连接到多个 AI 提供商
- **负载均衡**：在提供商之间自动分发请求
- **回退支持**：失败时使用不同模型自动重试
- **成本跟踪**：监控所有模型的使用和成本
- **速率限制**：在代理级别控制使用

## 相关资源

<CardGroup cols={2}>
  <Card title="LiteLLM 文档" icon="book" href="https://docs.litellm.ai/">
    完整的 LiteLLM 文档
  </Card>
  
  <Card title="LiteLLM GitHub" icon="github" href="https://github.com/BerriAI/litellm">
    源代码和部署示例
  </Card>
  
  <Card title="代理设置" icon="server" href="https://docs.litellm.ai/docs/proxy/quick_start">
    LiteLLM 代理部署指南
  </Card>
  
  <Card title="支持的提供商" icon="list" href="https://docs.litellm.ai/docs/providers">
    支持的 AI 提供商列表
  </Card>
</CardGroup>
