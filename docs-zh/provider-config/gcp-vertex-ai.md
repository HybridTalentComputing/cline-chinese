---
title: "GCP Vertex AI"
description: "配置 GCP Vertex AI 与 Cline 以访问领先的生成式 AI 模型，如 Claude 3.5 Sonnet v2。本指南涵盖 GCP 环境设置、身份验证和企业团队的安全集成。"
---

### 概述

**GCP Vertex AI：**
一个完全托管的服务，提供对领先的生成式 AI 模型（如 Anthropic 的 Claude 3.5 Sonnet v2）的访问——通过 Google Cloud。[了解更多关于 GCP Vertex AI](https://cloud.google.com/vertex-ai)。

本指南专为具有已建立 GCP 环境的组织（利用 IAM 角色、服务账户和资源管理最佳实践）量身定制，以确保安全和合规的使用。

---

### 步骤 1：准备您的 GCP 环境

#### 1.1 创建或使用 GCP 项目

-   **登录到 GCP 控制台：**\
    [Google Cloud 控制台](https://console.cloud.google.com/)
-   **选择或创建项目：**\
    使用现有项目或创建一个专门用于 Vertex AI 的新项目。

#### 1.2 设置 IAM 权限和服务账户

-   **分配必需角色：**

    -   为您的用户（或服务账户）授予 **Vertex AI User** 角色（`roles/aiplatform.user`）
    -   对于服务账户，还要附加 **Vertex AI Service Agent** 角色（`roles/aiplatform.serviceAgent`）以启用某些操作
    -   根据需要考虑其他预定义角色：
        -   Vertex AI Platform Express Admin
        -   Vertex AI Platform Express User
        -   Vertex AI Migration Service User

-   **跨项目资源访问：**
    -   对于不同项目中的 BigQuery 表，分配 **BigQuery Data Viewer** 角色
    -   对于不同项目中的 Cloud Storage 存储桶，分配 **Storage Object Viewer** 角色
    -   对于外部数据源，请参阅 [GCP Vertex AI 访问控制文档](https://cloud.google.com/vertex-ai/docs/general/access-control)

---

### 步骤 2：验证区域和模型访问

#### 2.1 选择并确认区域

Vertex AI 支持多个区域。选择一个满足您的延迟、合规性和容量需求的区域。示例包括：

-   **us-east5（哥伦布，俄亥俄）**
-   **us-central1（爱荷华）**
-   **europe-west1（比利时）**
-   **europe-west4（荷兰）**
-   **asia-southeast1（新加坡）**
-   **global（全球）**

全局端点可能提供更高的可用性并减少资源耗尽错误。仅支持 Gemini 模型。

#### 2.2 启用 Claude 3.5 Sonnet v2 模型

-   **打开 Vertex AI 模型花园：**\
    在云控制台中，导航到 **Vertex AI → Model Garden**
-   **启用 Claude 3.5 Sonnet v2：**\
    找到 Claude 3.5 Sonnet v2 的模型卡并点击 **启用**

---

### 步骤 3：配置 Cline VS Code 扩展

#### 3.1 安装和打开 Cline

-   **下载 VS Code：**\
    [下载 Visual Studio Code](https://code.visualstudio.com/)
-   **安装 Cline 扩展：**
    -   打开 VS Code
    -   导航到扩展市场（Ctrl+Shift+X 或 Cmd+Shift+X）
    -   搜索 **Cline** 并安装扩展

<Frame>
	<img
		src="https://storage.googleapis.com/cline_public_images/docs/assets/cline-extension-arrow.png"
		alt="VS Code 中的 Cline 扩展"
	/>
</Frame>

#### 3.2 配置 Cline 设置

-   **打开 Cline 设置：**\
    在 Cline 扩展中点击设置 ⚙️ 图标
-   **设置 API 提供商：**\
    从 API 提供商下拉菜单中选择 **GCP Vertex AI**
-   **输入您的 Google Cloud 项目 ID：**\
    提供您之前设置的项目 ID
-   **选择区域：**\
    选择支持的区域之一（例如 `us-east5`）
-   **选择模型：**\
    从可用列表中选择 **Claude 3.5 Sonnet v2**
-   **保存和测试：**\
    保存您的设置并通过发送简单提示词进行测试（例如"生成一个 Python 函数来检查数字是否为质数。"）

---

### 步骤 4：身份验证和凭据设置

#### 选项 A：使用您的 Google 账户（用户凭据）

1. **安装 Google Cloud CLI：**\
   遵循[安装指南](https://cloud.google.com/sdk/docs/install)
2. **初始化和身份验证：**

    ```bash
    gcloud init
    gcloud auth application-default login
    ```

    - 这使用您的 Google 账户设置应用程序默认凭据（ADC）

3. **重启 VS Code：**\
   确保 VS Code 已重启，以便 Cline 扩展获取新凭据

#### 选项 B：使用服务账户（JSON 密钥）

1. **创建服务账户：**

    -   在 GCP 控制台中，导航到 **IAM & Admin > Service Accounts**
    -   创建新服务账户（例如"vertex-ai-client"）

2. **分配角色：**

    -   附加 **Vertex AI User**（`roles/aiplatform.user`）
    -   附加 **Vertex AI Service Agent**（`roles/aiplatform.serviceAgent`）
    -   可选择根据需要添加其他角色

3. **生成 JSON 密钥：**

    -   在服务账户部分，管理您的服务账户的密钥并下载 JSON 密钥

4. **设置环境变量：**

    ```bash
    export GOOGLE_APPLICATION_CREDENTIALS="/path/to/your/service-account-key.json"
    ```

    - 这指示 Google Cloud 客户端库（和 Cline）使用此密钥

5. **从设置了 `GOOGLE_APPLICATION_CREDENTIALS` 变量的终端启动 VS Code**

---

### 步骤 5：安全性、监控和最佳实践

#### 5.1 强制最小权限

-   **最小权限原则：**\
    仅授予最低必要的权限。与广泛的预定义角色相比，自定义角色可以提供更细粒度的控制
-   **最佳实践：**\
    请参阅 [GCP IAM 最佳实践](https://cloud.google.com/iam/docs/best-practices)

#### 5.2 管理资源访问

-   **项目级与资源级访问：**\
    访问可以在两个级别进行管理。请注意，资源级权限（例如对于 BigQuery 或 Cloud Storage）会添加到，但不会覆盖项目级策略

#### 5.3 监控使用情况和配额

-   **模型可观测性仪表板：**

    -   在 Vertex AI 控制台中，导航到 **Model Observability** 仪表板
    -   监控请求吞吐量、延迟和错误率（包括 429 配额错误）等指标

-   **配额管理：**
    -   如果您遇到 429 错误，请检查 **IAM & Admin > Quotas** 页面
    -   如有必要，请求配额增加\
        [了解更多关于 GCP Vertex AI 配额](https://cloud.google.com/vertex-ai/docs/quotas)

#### 5.4 服务代理和跨项目注意事项

-   **服务代理：**\
    注意不同的服务代理：

    -   Vertex AI Service Agent
    -   Vertex AI RAG Data Service Agent
    -   Vertex AI Custom Code Service Agent
    -   Vertex AI Extension Service Agent

-   **跨项目访问：**\
    对于其他项目中的资源（例如 BigQuery、Cloud Storage），确保分配了适当的角色（BigQuery Data Viewer、Storage Object Viewer）

---

### 结论

通过遵循这些步骤，您的企业团队可以安全地将 GCP Vertex AI 与 Cline VS Code 扩展集成，以利用 **Claude 3.5 Sonnet v2** 的强大功能：

-   **准备您的 GCP 环境：**\
    创建或使用项目，使用最小权限配置 IAM，并确保附加了必要的角色（包括 Vertex AI Service Agent 角色）
-   **验证区域和模型访问：**\
    确认您选择的区域支持 Claude 3.5 Sonnet v2 并且该模型已启用
-   **在 VS Code 中配置 Cline：**\
    安装 Cline，输入您的项目 ID，选择适当的区域，并选择模型
-   **设置身份验证：**\
    使用用户凭据（通过 `gcloud auth application-default login`）或带有 JSON 密钥的服务账户
-   **实施安全性和监控：**\
    遵循 IAM 最佳实践，仔细管理资源访问，并使用模型可观测性仪表板监控使用情况

如需更多详细信息，请查阅 [GCP Vertex AI 文档](https://cloud.google.com/vertex-ai/docs)和您的内部安全策略。\
编码愉快！

_本指南将随着 GCP Vertex AI 和 Cline 的发展而更新。请始终参阅最新文档以获取当前实践。_
