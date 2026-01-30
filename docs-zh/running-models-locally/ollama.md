---
title: "Ollama"
description: "使用 Cline 设置 Ollama 进行本地 AI 模型执行的快速指南。"
---

### 先决条件

-   Windows、macOS 或 Linux 计算机
-   在 VS Code 中安装了 Cline

### 设置步骤

#### 1. 安装 Ollama

-   访问 [ollama.com](https://ollama.com)
-   为你的操作系统下载并安装

<Frame>
	<img
		src="https://storage.googleapis.com/cline_public_images/docs/assets/image%20(2)%20(1)%20(1).png"
		alt="Ollama 下载页面"
	/>
</Frame>

#### 2. 选择和下载模型

-   在 [ollama.com/search](https://ollama.com/search) 浏览模型
-   选择模型并复制命令：

    ```bash
    ollama run [model-name]
    ```

<Frame>
	<img
		src="https://storage.googleapis.com/cline_public_images/docs/assets/ollama-model-grab%20(2).gif"
		alt="在 Ollama 中选择模型"
	/>
</Frame>

-   打开你的终端并运行命令：

    -   示例：

        ```bash
        ollama run llama2
        ```

<Frame>
	<img
		src="https://storage.googleapis.com/cline_public_images/docs/assets/starting-ollama-terminal%20(2).gif"
		alt="在终端中运行 Ollama"
	/>
</Frame>

你的模型现在可以在 Cline 中使用了。

#### 3. 配置 Cline

<Frame>
	<img
		src="https://storage.googleapis.com/cline_public_images/docs/assets/ollama-setup.gif"
		alt="完整的 Ollama 设置过程"
	/>
</Frame>

打开 VS Code 并配置 Cline：

1. 单击 Cline 设置图标
2. 选择"Ollama"作为你的 API 提供商
3. 基本 URL：`http://localhost:11434/`（默认，通常无需更改）
4. 从下拉菜单中选择你的模型

### 推荐模型

为了与 Cline 获得最佳体验，请使用 **Qwen3 Coder 30B**。该模型为本地开发提供强大的编码能力和可靠的工具使用。

要下载它：
```bash
ollama run qwen3-coder-30b
```

其他有能力的模型包括：
- `mistral-small` - 性能和速度的良好平衡
- `devstral-small` - 针对编码任务优化

### 重要提示

-   在使用 Cline 之前启动 Ollama
-   在后台保持 Ollama 运行
-   第一次模型下载可能需要几分钟

### 启用紧凑提示

为了与本地模型获得更好的性能，请在 Cline 设置中启用紧凑提示。这在保持核心功能的同时将提示大小减少 90%。

导航到 Cline 设置 → 功能 → 使用紧凑提示并将其切换为开启。

### 故障排除

如果 Cline 无法连接到 Ollama：

1. 验证 Ollama 正在运行
2. 检查基本 URL 是否正确
3. 确保模型已下载

需要更多信息？阅读 [Ollama 文档](https://github.com/ollama/ollama/blob/main/docs/api.md)。
