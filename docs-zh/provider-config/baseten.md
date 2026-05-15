---
title: "Baseten"
description: "了解如何配置和使用 Baseten 的模型 API 与 Cline。访问具有企业级性能、可靠性和有竞争力定价的前沿开源模型。"
---

Baseten 提供按需前沿模型 API，专为生产应用程序而设计，而不仅仅用于实验。构建在 Baseten 推理栈之上，这些 API 为来自 OpenAI、DeepSeek、Moonshot AI 和阿里云的开源模型提供优化的推理。

**网站：** [https://www.baseten.co/products/model-apis/](https://www.baseten.co/products/model-apis/)

### 获取 API 密钥

1.  **注册/登录：** 访问 [Baseten](https://www.baseten.co/) 并创建账户或登录。
2.  **导航到 API 密钥：** 访问您的仪表板并转到 API 密钥部分。
3.  **创建密钥：** 生成新的 API 密钥。为其指定一个描述性名称（例如"Cline"）。
4.  **复制密钥：** 立即复制 API 密钥并安全存储。

### 在 Cline 中配置

1.  **打开 Cline 设置：** 在 Cline 面板中点击设置图标（⚙️）。
2.  **选择提供商：** 从"API 提供商"下拉菜单中选择"Baseten"。
3.  **输入 API 密钥：** 将您的 Baseten API 密钥粘贴到"Baseten API 密钥"字段中。
4.  **选择模型：** 从"模型"下拉菜单中选择您想要的模型。

**重要提示：对于 Kimi K2 Thinking：** 要使用 `moonshotai/Kimi-K2-Thinking` 模型，您必须在 Cline 设置中启用**原生工具调用（实验性）**。此设置允许 Cline 通过其原生工具处理器调用工具，这是此推理模型正常运行所必需的。

### 支持的模型

Cline 支持 Baseten 模型 API 下的所有当前模型，包括：
有关最新定价，请访问：https://www.baseten.co/products/model-apis/

-   `moonshotai/Kimi-K2-Thinking` (Moonshot AI) - 增强的推理能力，具有逐步思维过程（262K 上下文）- \$0.60/\$2.50 每 1M tokens
-   `zai-org/GLM-4.6` (Z AI) - 由 Z AI 提供的前沿开源模型，具有先进的智能体、推理和编码能力（200k 上下文）\$0.60/\$2.20 每 1M tokens
-   `moonshotai/Kimi-K2-Instruct-0905` (Moonshot AI) - 九月更新，具有增强能力（262K 上下文）- \$0.60/\$2.50 每 1M tokens
-   `openai/gpt-oss-120b` (OpenAI) - 具有强大推理能力的 120B MoE（128K 上下文）- \$0.10/\$0.50 每 1M tokens
-   `Qwen/Qwen3-Coder-480B-A35B-Instruct`- 高级编码和推理（262K 上下文）- \$0.38/\$1.53 每 1M tokens
-   `Qwen/Qwen3-235B-A22B-Instruct-2507` - 数学和推理专家（262K 上下文）- \$0.22/\$0.80 每 1M tokens
-   `deepseek-ai/DeepSeek-R1` - DeepSeek 的第一代推理模型（163K 上下文）- \$2.55/\$5.95 每 1M tokens
-   `deepseek-ai/DeepSeek-R1-0528` - DeepSeek 推理模型的最新修订版（163K 上下文）- \$2.55/\$5.95 每 1M tokens
-   `deepseek-ai/DeepSeek-V3.1` - 混合推理，具有高级工具调用（163K 上下文）- \$0.50/\$1.50 每 1M tokens
-   `deepseek-ai/DeepSeek-V3-0324` - 快速通用，具有增强推理能力（163K 上下文）- \$0.77/\$0.77 每 1M tokens
-   `deepseek-ai/DeepSeek-V3.2` - 快速通用，具有增强推理能力（163K 上下文）- \$0.77/\$0.77 每 1M tokens

### 生产优先架构

Baseten 的模型 API 专为生产环境构建，具有几个关键优势：

#### 企业级可靠性
- 通过主动-主动冗余实现**四个九的正常运行时间**（99.99%）
- **云无关、多集群自动扩展**以保持一致的可用性
- **SOC 2 Type II 认证**和 **HIPAA 合规**以满足安全要求

#### 优化性能
- **预优化模型**随 Baseten 推理栈一起提供
- **最新一代 GPU**配备多云基础设施
- **超快推理**自底向上针对生产工作负载进行优化

#### 成本效率
- 比封闭替代方案**便宜 5-10 倍**
- **优化的多云基础设施**以实现高效资源利用
- **透明定价**，无隐藏成本或速率限制意外

#### 开发者体验
- **OpenAI 兼容 API** - 通过交换单个 URL 迁移
- **封闭模型的直接替代**，具有全面的可观测性和分析
- **从模型 API 到专用部署的无缝扩展**

### 特殊功能

#### 函数调用和工具使用
所有 Baseten 模型都支持结构化输出、函数调用和工具使用，作为 Baseten 推理栈的一部分，使它们成为智能体应用程序和编码工作流的理想选择。

### 提示和注意事项

-   **动态模型更新：** Cline 自动从 Baseten 获取最新模型列表，确保实时访问新发布的模型。
-   **多云容量管理（MCM）：** Baseten 的多云基础设施确保全球高可用性和低延迟。
-   **支持：** Baseten 为生产部署提供专门支持，并可以在您扩展时与您合作使用专用资源。

### 定价信息

当前定价非常有竞争力和透明。有关最新的定价，请访问 [Baseten 模型 API 页面](https://www.baseten.co/products/model-apis/)。价格通常在每百万 tokens \$0.10-\$6.00 之间，使 Baseten 比许多封闭模型替代方案更具成本效益，同时提供访问最先进开源模型的能力。
