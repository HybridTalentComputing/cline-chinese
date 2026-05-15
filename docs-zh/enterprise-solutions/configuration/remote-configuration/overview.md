---
title: "SaaS 提供商配置"
sidebarTitle: "概述"
description: "通过 Cline 托管的管理控制台为集中式组织管理配置推理提供商"
---


SaaS 提供商配置允许管理员通过 Cline 托管的管理控制台为其整个组织集中配置推理提供商。这种方法确保所有团队成员都能获得一致的提供商访问、安全策略和成本管理，而无需个别开发者设置或基础设施部署。

## 远程配置如何工作

远程配置通过 Cline 在 [app.cline.bot](https://app.cline.bot) 的托管服务运行，管理员可以在其中：

<CardGroup cols={2}>
  <Card title="集中化设置" icon="gear">
    通过基于 Web 的管理控制台为整个组织一次性配置提供商。
  </Card>
  
  <Card title="自动执行" icon="shield-check">
    团队成员登录到其组织时自动接收已配置的提供商设置。
  </Card>
  
  <Card title="简化的用户接入" icon="user-plus">
    新团队成员无需复杂的个别配置即可立即访问推理提供商。
  </Card>
  
  <Card title="一致的体验" icon="users">
    确保所有团队成员在组织范围内使用相同的模型、区域和设置。
  </Card>
</CardGroup>

## 支持的提供商

Cline 支持以下推理提供商的远程配置：

| 提供商 | 使用场景 | 配置 | 成员设置 |
|----------|----------|---------------|--------------|
| **Cline** | 使用 Cline 原生提供商并集中管理 API 密钥的组织 | API 提供商选择、模型访问 | 无需个人 API 密钥 - 完全由组织管理 |
| **Amazon Bedrock** | 使用 AWS 基础设施的组织 | 区域选择、VPC 端点、跨区域推理、提示缓存 | 在 VS Code 中配置 AWS 凭证 |
| **LiteLLM** | 需要通过统一代理访问多模型的组织 | 代理端点、身份验证、模型路由 | 在 VS Code 中配置 API 密钥或端点（或使用主密钥集中管理） |
| **Google Vertex AI** | 使用 Google Cloud 平台的组织 | 项目 ID、区域选择、模型访问 | 在 VS Code 中配置服务账户或凭据 |


## 配置流程

典型的远程配置流程遵循以下步骤：

<Steps>
<Step title="管理员设置">
访问 Cline 管理控制台并配置整个组织范围的所需推理提供商。
</Step>

<Step title="自动分发">
提供商配置自动分发给所有登录到 Cline 的组织成员。
</Step>

<Step title="成员凭据设置">
团队成员添加其个人凭据（API 密钥、AWS 配置文件等）以连接到已配置的提供商。
</Step>

<Step title="立即访问">
配置凭据后，成员可以立即开始通过 Cline 使用推理提供商。
</Step>
</Steps>

## 远程配置的好处

### **对于管理员**
- **集中控制**：从一个位置管理所有提供商设置
- **安全合规**：确保整个组织的一致安全策略
- **轻松更新**：立即在组织范围内更改提供商设置

### **对于团队成员**  
- **简化设置**：无需研究提供商配置选项
- **一致的体验**：所有人都可以使用相同的模型和功能
- **快速接入**：使用预配置的提供商立即开始
- **专注于开发**：花费时间编码而不是配置推理提供商

## 入门指南

要开始提供商远程配置：

1. **选择你的提供商**：选择最适合你组织需求和现有基础设施的推理提供商
2. **管理员配置**：遵循特定于提供商的管理员配置指南
3. **成员接入**：让团队成员完成特定于提供商的成员配置
4. **开始开发**：通过集中管理的推理提供商访问开始使用 Cline

选择下面的提供商以开始配置流程：

<CardGroup cols={3}>
  <Card title="Amazon Bedrock" icon="aws" href="/enterprise-solutions/configuration/remote-configuration/aws-bedrock/admin-configuration">
    基于 AWS 的 AI 模型，具有企业安全和合规功能。
  </Card>
  
  <Card title="LiteLLM" icon="layer-group" href="/enterprise-solutions/configuration/remote-configuration/litellm/admin-configuration">
    通过单个界面访问 100+ AI 模型的统一代理。
  </Card>
  
  <Card title="Google Vertex AI" icon="google" href="/enterprise-solutions/configuration/remote-configuration/google-vertex/admin-configuration">
    Google Cloud 的 AI 平台，具有高级 ML 功能和全球基础设施。
  </Card>
</CardGroup>
