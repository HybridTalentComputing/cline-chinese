---
title: "自定义提供商配置"
sidebarTitle: "自定义提供商"
description: "为你的 Cline 部署配置自定义 OpenAI 兼容提供商"
---

<Info>
**配置路径：自托管**

本指南介绍自托管部署的自定义提供商配置。
</Info>

配置 Cline 以使用任何 OpenAI 兼容的 API 提供商，包括 Azure OpenAI、自托管推理服务器和其他第三方服务。

## 什么是自定义提供商？

自定义提供商包括任何实现 OpenAI API 格式的 API：

- **Azure OpenAI 服务**：Microsoft 托管的 OpenAI 模型
- **vLLM**：自托管推理服务器
- **Ollama**：本地模型运行器
- **文本生成推理 (TGI)**：Hugging Face 的推理服务器
- **LocalAI**：本地 OpenAI API 替代品
- **其他 OpenAI 兼容 API**：任何自定义实现

## 配置格式

通过你的远程配置 JSON 使用 `providerSettings.OpenAiCompatible` 部分配置自定义提供商：

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
      "openAiBaseUrl": "https://your-api.company.com/v1"
    }
  }
}
```

## 配置字段

| 字段 | 类型 | 描述 | 必需 |
|-------|------|-------------|----------|
| `models` | 数组 | 模型配置列表 | 是 |
| `openAiBaseUrl` | 字符串 | API 端点基础 URL | 是 |
| `openAiApiKey` | 字符串 | 用于身份验证的 API 密钥 | 否 |
| `openAiModelId` | 字符串 | 默认模型标识符 | 否 |

### Azure OpenAI 特定字段

对于 Azure OpenAI，可以使用其他字段：

| 字段 | 类型 | 描述 |
|-------|------|-------------|
| `azureApiVersion` | 字符串 | Azure API 版本（例如，`2024-02-15-preview`）|

## 示例配置

### Azure OpenAI

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
      "openAiBaseUrl": "https://your-resource.openai.azure.com/openai/deployments/gpt-4-turbo",
      "openAiApiKey": "your-azure-api-key",
      "azureApiVersion": "2024-02-15-preview"
    }
  }
}
```

### 自托管 vLLM

```json
{
  "providerSettings": {
    "OpenAiCompatible": {
      "models": [
        {
          "id": "meta-llama/Llama-2-70b-chat-hf",
          "name": "Llama 2 70B"
        }
      ],
      "openAiBaseUrl": "http://vllm.company.com:8000/v1"
    }
  }
}
```

### 本地 Ollama

```json
{
  "providerSettings": {
    "OpenAiCompatible": {
      "models": [
        {
          "id": "codellama",
          "name": "Code Llama"
        }
      ],
      "openAiBaseUrl": "http://localhost:11434/v1"
    }
  }
}
```

### 文本生成推理 (TGI)

```json
{
  "providerSettings": {
    "OpenAiCompatible": {
      "models": [
        {
          "id": "mistralai/Mistral-7B-Instruct-v0.2",
          "name": "Mistral 7B Instruct"
        }
      ],
      "openAiBaseUrl": "http://tgi.company.com:8080/v1",
      "openAiApiKey": "your-tgi-api-key"
    }
  }
}
```

### LocalAI

```json
{
  "providerSettings": {
    "OpenAiCompatible": {
      "models": [
        {
          "id": "gpt-3.5-turbo",
          "name": "Local GPT-3.5"
        }
      ],
      "openAiBaseUrl": "http://localhost:8080/v1"
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
          "id": "custom-model",
          "name": "Custom Model"
        }
      ],
      "openAiBaseUrl": "http://internal.api:8000/v1"
    }
  }
}
```

## 模型配置

每个模型需要基本信息：

```json
{
  "id": "model-identifier",
  "name": "Display Name",
  "info": {
    "maxTokens": 4096,
    "contextWindow": 128000,
    "supportsImages": true,
    "supportsPromptCache": false
  }
}
```

## 先决条件

在配置自定义提供商之前，你需要：

1. **API 端点**：你的 OpenAI 兼容 API 的 URL
2. **API 密钥**（如果需要）：身份验证凭证
3. **模型 ID**：可用模型的名称
4. **网络访问**：从使用 Cline 的地方连接

## 故障排除

**连接错误**

验证端点可访问：
```bash
curl https://your-api.company.com/v1/models
```

**身份验证错误**

使用你的 API 密钥测试身份验证：
```bash
curl -H "Authorization: Bearer your-api-key" \
  https://your-api.company.com/v1/models
```

**找不到模型**

确保配置中的模型 ID 与 API 期望的匹配。检查可用模型：
```bash
curl -H "Authorization: Bearer your-api-key" \
  https://your-api.company.com/v1/models
```

**超时问题**

如果响应缓慢：
- 检查网络延迟
- 验证服务器具有足够的资源
- 考虑使用更快的模型

## 提供商文档

有关这些服务的设置和部署，请参阅其官方文档：

<CardGroup cols={2}>
  <Card title="Azure OpenAI" icon="microsoft" href="https://learn.microsoft.com/en-us/azure/ai-services/openai/">
    Microsoft 托管的 OpenAI 服务
  </Card>
  
  <Card title="vLLM" icon="server" href="https://docs.vllm.ai/">
    高性能推理引擎
  </Card>
  
  <Card title="Ollama" icon="download" href="https://ollama.ai/">
    在本地运行模型
  </Card>
  
  <Card title="文本生成推理" icon="code" href="https://huggingface.co/docs/text-generation-inference/">
    Hugging Face 推理服务器
  </Card>
</CardGroup>
