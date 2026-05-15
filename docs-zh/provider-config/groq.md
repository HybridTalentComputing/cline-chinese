---
title: "Groq"
description: "了解如何配置和使用 Groq 的闪电般快速推理与 Cline。在 Groq 专用 LPU 架构上访问来自 OpenAI、Meta、DeepSeek 等提供商的模型。"
---

Groq 通过其自定义 LPU™（语言处理单元）架构提供超快速的 AI 推理，该架构专为推理而构建，而非从训练硬件改编而来。Groq 托管来自各种提供商（包括 OpenAI、Meta、DeepSeek、Moonshot AI 和其他）的开源模型。

**网站：** [https://groq.com/](https://groq.com/)

### 获取 API 密钥

1.  **注册/登录：** 访问 [Groq](https://groq.com/) 并创建账户或登录。
2.  **导航到控制台：** 访问 [Groq 控制台](https://console.groq.com/)以访问您的仪表板。
3.  **创建密钥：** 导航到 API 密钥部分并创建新的 API 密钥。为您的密钥指定描述性名称（例如"Cline"）。
4.  **复制密钥：** 立即复制 API 密钥。您将无法再次查看它。安全存储它。

### 支持的模型

Cline 支持以下 Groq 模型：

-   `llama-3.3-70b-versatile` (Meta) - 平衡性能，131K 上下文
-   `llama-3.1-8b-instant` (Meta) - 快速推理，131K 上下文  
-   `openai/gpt-oss-120b` (OpenAI) - 精选旗舰模型，131K 上下文
-   `openai/gpt-oss-20b` (OpenAI) - 精选紧凑模型，131K 上下文
-   `moonshotai/kimi-k2-instruct` (Moonshot AI) - 1 万亿参数模型，支持提示词缓存
-   `deepseek-r1-distill-llama-70b` (DeepSeek/Meta) - 推理优化模型
-   `qwen/qwen3-32b` (Alibaba Cloud) - 增强用于问答任务
-   `meta-llama/llama-4-maverick-17b-128e-instruct` (Meta) - 最新 Llama 4 变体
-   `meta-llama/llama-4-scout-17b-16e-instruct` (Meta) - 最新 Llama 4 变体

### 在 Cline 中配置

1.  **打开 Cline 设置：** 在 Cline 面板中点击设置图标（⚙️）。
2.  **选择提供商：** 从"API 提供商"下拉菜单中选择"Groq"。
3.  **输入 API 密钥：** 将您的 Groq API 密钥粘贴到"Groq API 密钥"字段中。
4.  **选择模型：** 从"模型"下拉菜单中选择您想要的模型。

### Groq 的速度革命

Groq 的 LPU 架构相比基于传统 GPU 的推理提供几个关键优势：

#### LPU 架构
与从训练工作负载改编的 GPU 不同，Groq 的 LPU 专为推理而构建。这消除了在传统系统中产生延迟的架构瓶颈。

#### 无与伦比的速度
- **亚毫秒级延迟**在流量、区域和工作负载之间保持一致
- **静态调度**与预计算执行图消除运行时协调延迟
- **张量并行性**针对低延迟单响应而非高吞吐量批处理进行了优化

#### 无折衷质量
- **TruePoint 数值**仅在不影响准确性的区域减少精度
- **100 位中间累加**确保无损计算
- **战略性精度控制**在实现比 BF16 快 2-4 倍的加速的同时保持质量

#### 内存架构
- **SRAM 作为主存储**（而非缓存），芯片上具有数百兆字节
- **消除困扰传统加速器的 DRAM/HBM 延迟**
- **通过在多个芯片间分层实现真正的张量并行性**

在他们的 [LPU 架构博客文章](https://groq.com/blog/inside-the-lpu-deconstructing-groq-speed)中了解更多关于 Groq 技术的信息。

### 特殊功能

#### 提示词缓存
Kimi K2 模型支持提示词缓存，这可以显著降低重复提示词的成本和延迟。

#### 视觉支持
选定模型支持图像输入和视觉能力。查看 Groq 控制台中的模型详细信息以了解具体能力。

#### 推理模型
某些模型（如 DeepSeek 变体）提供增强的推理能力，具有逐步思维过程。

### 提示和注意事项

-   **模型选择：** 根据您的特定用例和性能要求选择模型。
-   **速度优势：** Groq 擅长单请求延迟而非高吞吐量批处理。
-   **OSS 模型提供商：** Groq 在其快速基础设施上托管来自多个提供商（OpenAI、Meta、DeepSeek 等）的开源模型。
-   **上下文窗口：** 大多数模型提供大上下文窗口（高达 131K tokens）以包含大量代码和上下文。
-   **定价：** Groq 提供具有速度优势的竞争性定价。检查 [Groq 定价](https://groq.com/pricing)页面以获取当前费率。
-   **速率限制：** Groq 具有慷慨的速率限制，但根据您的使用层级查看其文档以了解当前限制。
