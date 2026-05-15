---
title: "LM Studio"
description: "使用 Cline 设置 LM Studio 进行本地 AI 模型执行的快速指南。"
---

## 使用 Cline 设置 LM Studio

使用 LM Studio 与 Cline 在本地运行 AI 模型。

### 先决条件

-   支持 AVX2 的 Windows、macOS 或 Linux 计算机
-   在 VS Code 中安装了 Cline

### 设置步骤

#### 1. 安装 LM Studio

-   访问 [lmstudio.ai](https://lmstudio.ai)
-   为你的操作系统下载并安装

<Frame>
	<img src="https://storage.googleapis.com/cline_public_images/docs/assets/image%20(7).png" alt="LM Studio 下载页面" />
</Frame>

#### 2. 启动 LM Studio

-   打开已安装的应用程序
-   你将在左侧看到四个选项卡：**聊天**、**开发者**（你将在此启动服务器）、**我的模型**（你下载的模型存储在此）、**发现**（添加新模型）

<Frame>
	<img
		src="https://storage.googleapis.com/cline_public_images/docs/assets/image%20(10).png"
		alt="LM Studio 界面概述"
	/>
</Frame>

#### 3. 下载模型

-   浏览"发现"页面
-   选择并下载你偏好的模型
-   等待下载完成

<Frame>
	<img
		src="https://storage.googleapis.com/cline_public_images/docs/assets/lm-studio-download-model.gif"
		alt="在 LM Studio 中下载模型"
	/>
</Frame>

#### 4. 启动服务器

-   导航到**开发者**选项卡
-   切换服务器开关到"运行中"
-   注意：服务器将在 `http://localhost:1234` 运行

<Frame>
	<img
		src="https://storage.googleapis.com/cline_public_images/docs/assets/lm-studio-starting-server.gif"
		alt="启动 LM Studio 服务器"
	/>
</Frame>

#### 5. 配置 Cline

1. 打开 VS Code
2. 单击 Cline 设置图标
3. 选择"LM Studio"作为 API 提供商
4. 从可用选项中选择你的模型

<Frame>
	<img
		src="https://storage.googleapis.com/cline_public_images/docs/assets/lm-studio-select-model-cline.gif"
		alt="使用 LM Studio 配置 Cline"
	/>
</Frame>

### 推荐模型和设置

为了与 Cline 获得最佳体验，请使用 **Qwen3 Coder 30B A3B Instruct**。该模型提供强大的编码性能和可靠的工具使用。

#### 关键设置

在开发者选项卡中加载模型后，配置这些设置：

1. **上下文长度**：设置为 262,144（模型的最大值）
2. **KV 缓存量化**：保持未选中（对于一致性能至关重要）
3. **Flash Attention**：如果可用则启用（提高性能）

#### 量化指南

根据你的 RAM 选择量化：

- **32GB RAM**：使用 4-bit 量化（~17GB 下载）
- **64GB RAM**：使用 8-bit 量化（~32GB 下载）以获得更好的质量
- **128GB+ RAM**：考虑全精度或更大的模型

#### 模型格式

- **Mac (Apple Silicon)**：使用 MLX 格式以获得优化性能
- **Windows/Linux**：使用 GGUF 格式

### 启用紧凑提示

为了与本地模型获得最佳性能，请在 Cline 设置中启用紧凑提示。这在保持核心功能的同时将提示大小减少 90%。

导航到 Cline 设置 → 功能 → 使用紧凑提示并将其切换为开启。

### 重要提示

-   在使用 Cline 之前启动 LM Studio
-   在后台保持 LM Studio 运行
-   第一次模型下载可能需要几分钟，具体取决于大小
-   模型在下载后本地存储

### 故障排除

1. 如果 Cline 无法连接到 LM Studio：
2. 验证 LM Studio 服务器正在运行（检查开发者选项卡）
3. 确保模型已加载
4. 检查你的系统是否满足硬件要求
