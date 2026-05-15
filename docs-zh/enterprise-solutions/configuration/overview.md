---
title: "配置概述"
sidebarTitle: "概述"
description: "了解推理提供商和系统设置的企业配置选项"
---

Cline 提供两种不同的方法来为你的组织配置推理提供商和系统设置。了解这些方法之间的区别将帮助你为你的需求选择正确的配置方法。

## 配置类型

<Info>
**需要帮助选择？** 参阅[部署指南](/enterprise-solutions/configuration/choosing-your-deployment)获取详细比较和决策树。
</Info>

<CardGroup cols={2}>
  <Card title="SaaS 提供商配置" icon="cloud" href="/enterprise-solutions/configuration/remote-configuration/overview">
    **简单的基于云的设置**
    
    通过 Cline [管理控制台](https://app.cline.bot/dashboard)配置推理提供商。非常适合具有最低基础设施要求的快速组织部署。
  </Card>
  
  <Card title="自托管配置" icon="server" href="/enterprise-solutions/configuration/infrastructure-configuration/overview">
    **高级企业设置**
    
    与 VPC 端点、多账户支持、合规功能以及在你自己的基础设施上的自定义工作流进行深度基础设施集成。
  </Card>
</CardGroup>

## 选择正确的配置

### 何时使用 SaaS 配置：
- **快速设置**：你需要让团队快速启动和运行
- **集中式管理**：你想要简单的、基于云的提供商管理
- **标准要求**：你的组织具有典型的安全和合规需求
- **中小型团队**：你管理数十到数百名用户

### 何时使用自托管配置：
- **企业安全**：你需要高级安全功能和合规控制
- **复杂基础设施**：你拥有需要集成的现有 AWS/GCP 基础设施
- **自定义工作流**：你需要自定义规则、工作流和自动化
- **大型组织**：你管理数百到数千名用户
- **隔离环境**：你需要本地部署或受限网络部署

## 配置比较

| 功能 | SaaS 配置 | 自托管配置 |
|---------|-------------------|---------------------------|
| **设置复杂性** | 简单 | 高级 |
| **部署时间** | 分钟 | 天到周 |
| **所需基础设施** | 无 | AWS/GCP/Azure |
| **合规功能** | 基本 | 高级 |
| **自定义规则** | 否 | 是 |
| **多账户支持** | 否 | 是 |
| **VPC 集成** | 否 | 是 |
| **成本** | 较低 | 较高 |

## 开始使用

<Steps>
<Step title="评估你的需求">
审查你组织的安全、合规和基础设施要求，以确定哪种配置方法适合你的需求。
</Step>

<Step title="选择你的路径">
选择 SaaS 配置进行简单设置，或选择自托管配置获得高级企业功能。如果你需要帮助做出决定，请使用[部署指南](/enterprise-solutions/configuration/choosing-your-deployment)。
</Step>

<Step title="遵循配置指南">
使用你选择的配置类型的详细指南完成设置过程。
</Step>

<Step title="接入团队成员">
配置完成后，团队成员可以使用特定于提供商的成员指南进行连接。
</Step>
</Steps>

---

## 可用的提供商

两种配置方法都支持相同的核心推理提供商：

<CardGroup cols={3}>
  <Card title="AWS Bedrock" icon="aws">
    具有 AWS 基础设施集成和安全功能的企业 AI 模型。
  </Card>
  
  <Card title="LiteLLM" icon="layer-group">
    通过单一界面访问 100+ AI 模型的统一代理。
  </Card>
  
  <Card title="Google Vertex AI" icon="google">
    Google Cloud 的 AI 平台，具有高级 ML 功能和全球基础设施。
  </Card>
</CardGroup>

主要区别在于如何在你组织的基础设施和安全要求内配置和管理这些提供商。
