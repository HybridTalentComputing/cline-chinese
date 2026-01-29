---
title: "SAP AI Core"
description: "了解如何配置和使用 SAP AI Core 中生成式 AI 中心的 LLM 模型与 Cline。"
---

SAP AI Core 和生成式 AI 中心帮助您以高性价比的方式将 LLM 和 AI 集成到新的业务流程中。

**网站：** [SAP 帮助门户](https://help.sap.com/docs/sap-ai-core/sap-ai-core-service-guide/what-is-sap-ai-core)


<Info>
SAP AI Core 和生成式 AI 中心是 SAP BTP 的产品。您需要一个有效的 SAP BTP 合同和一个现有的子账户，其中包含具有 `extended` 服务计划的 SAP AI Core 实例（有关 SAP AI Core 服务计划及其功能的更多详细信息，请参阅[服务计划文档](https://help.sap.com/docs/sap-ai-core/sap-ai-core-service-guide/service-plans)）才能执行这些步骤。
</Info>

### 获取服务绑定

1.  **访问：** 通过 [BTP 云驾驶舱](https://cockpit.btp.cloud.sap/cockpit)转到您的子账户
2.  **创建服务绑定：** 转到"实例和订阅"，选择您的 SAP AI Core 服务实例并点击服务绑定 > 创建。
3.  **复制**服务绑定：复制服务绑定值。

### 支持的模型

SAP AI Core 支持大量且不断增长的模型。
请参阅 [生成式 AI 中心支持的模型页面](https://me.sap.com/notes/3437766)获取完整和最新的列表。

### 在 Cline 中配置

1.  **打开 Cline 设置：** 在 Cline 面板中点击设置图标（⚙️）。
2.  **选择提供商：** 从"API 提供商"下拉菜单中选择"SAP AI Core"。
3.  **输入客户端 ID：** 将服务绑定中的 `.clientid` 字段添加到"AI Core 客户端 ID"字段中。
4.  **输入客户端密钥：** 将服务绑定中的 `.clientsecret` 字段添加到"AI Core 客户端密钥"字段中。
5.  **输入基础 URL：** 将服务绑定中的 `.serviceurls.AI_API_URL` 字段添加到"AI Core 基础 URL"字段中。
6.  **输入身份验证 URL：** 将服务绑定中的 `.url` 字段添加到"AI Core 身份验证 URL"字段中。
7.  **输入资源组：** 添加您具有模型部署的资源组。请参阅[为生成式 AI 模型创建部署](https://help.sap.com/docs/sap-ai-core/sap-ai-core-service-guide/create-deployment-for-generative-ai-model-in-sap-ai-core)。
8.  **配置编排模式：** 如果您具有 `extended` 服务计划，"编排模式"复选框将自动出现。
9.  **选择模型：** 从"模型"下拉菜单中选择您想要的模型。

### 编排模式 vs 原生 API

**编排模式：**
-   **简化的使用：** 提供对所有可用模型的访问，而无需使用[统一 API](https://help.sap.com/docs/sap-ai-core/sap-ai-core-service-guide/harmonized-api)进行单独部署

**原生 API 模式：**
-   **手动部署：** 需要在您的 SAP AI Core 服务实例中进行手动模型部署和管理

### 提示和注意事项

-   **服务计划要求：** 您必须具有 SAP AI Core `extended` 服务计划才能在 Cline 中使用 LLM。其他服务计划不提供对生成式 AI 中心的访问。

-   **编排模式（推荐）：** 保持编排模式启用以获得最简单的设置。它提供对所有可用模型的自动访问，而无需手动部署。

-   **原生 API 模式：** 仅在您有特定要求需要直接访问 AI Core API 或需要编排模式不支持的功能时才禁用编排模式。

-   **使用原生 API 模式时：**
    -   **模型选择：** 模型下拉菜单在两个单独的列表中显示模型：
        -   **已部署的模型：** 这些模型已在您指定的资源组中部署，可立即使用。
        -   **未部署的模型：** 这些模型在您指定的资源组中没有活动部署。在您为它们在 SAP AI Core 中创建部署之前，您将无法使用这些模型。
    -   **创建部署：** 要使用尚未部署的模型，您需要在 SAP AI Core 服务实例中创建部署。请参阅[为生成式 AI 模型创建部署](https://help.sap.com/docs/sap-ai-core/sap-ai-core-service-guide/create-deployment-for-generative-ai-model-in-sap-ai-core)获取说明。

#### 为 OpenAI 模型配置推理努力

当通过 SAP AI Core 使用 OpenAI 推理模型（例如 o1、o3、o3-mini、o4-mini）时，您可以控制推理努力以平衡性能和成本：

1.  **打开 Cline 设置：** 在 Cline 面板中点击设置图标（⚙️）。
2.  **导航到功能：** 转到设置中的"功能"部分。
3.  **查找 OpenAI 推理努力：** 找到"OpenAI 推理努力"设置。
4.  **选择努力级别：** 在以下选项之间选择：
   - **低：** 更快的响应和更低的 token 使用，适合简单任务
   - **中：** 平衡的性能和 token 使用，适用于大多数任务
   - **高：** 更彻底的分析和更高的 token 使用，更适合复杂的推理任务

<Note>
此设置仅在使用通过 SAP AI Core 部署的 OpenAI 推理模型（o1、o3、o3-mini、o4-mini、gpt-5 等）时适用。其他模型将忽略此设置。
</Note>
