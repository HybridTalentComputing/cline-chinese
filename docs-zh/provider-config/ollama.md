---
title: "Ollama"
---

Cline 支持使用 Ollama 在本地运行模型。这种方法提供隐私、离线访问和可能降低的成本。它需要一些初始设置和一台足够强大的计算机。由于当前消费级硬件的状态，不建议将 Ollama 与 Cline 一起使用，因为对于平均硬件配置来说性能可能会很差。

**网站：** [https://ollama.com/](https://ollama.com/)

### 设置 Ollama

1.  **下载并安装 Ollama：**
    从 [Ollama 网站](https://ollama.com/)获取适用于您操作系统的 Ollama 安装程序并遵循其安装指南。确保 Ollama 正在运行。通常可以使用以下命令启动它：

    ```bash
    ollama serve
    ```

2.  **下载模型：**
    Ollama 支持各种模型。可在 [Ollama 模型库](https://ollama.com/library)中找到可用模型列表。一些推荐用于编码任务的模型包括：

    -   `codellama:7b-code`（一个不错的、较小的起点）
    -   `codellama:13b-code`（提供更好的质量，更大的尺寸）
    -   `codellama:34b-code`（提供甚至更高的质量，非常大）
    -   `qwen2.5-coder:32b`
    -   `mistralai/Mistral-7B-Instruct-v0.1`（一个可靠的通用模型）
    -   `deepseek-coder:6.7b-base`（对编码有效）
    -   `llama3:8b-instruct-q5_1`（适合通用任务）

    要下载模型，请打开终端并执行：

    ```bash
    ollama pull <model_name>
    ```

    例如：

    ```bash
    ollama pull qwen2.5-coder:32b
    ```

3.  **配置模型的上下文窗口：**
    默认情况下，Ollama 模型通常使用 2048 tokens 的上下文窗口，这对于许多 Cline 请求来说可能是不够的。建议最少 12,000 tokens 以获得不错的结果，32,000 tokens 则是理想的。要调整此设置，您需要修改模型的参数并将其保存为新版本。

    首先，加载模型（使用 `qwen2.5-coder:32b` 作为示例）：

    ```bash
    ollama run qwen2.5-coder:32b
    ```

    一旦模型在 Ollama 交互式会话中加载，设置上下文大小参数：

    ```
    /set parameter num_ctx 32768
    ```

    然后，使用新名称保存此配置的模型：

    ```
    /save your_custom_model_name
    ```

    （将 `your_custom_model_name` 替换为您选择的名称。）

4.  **配置 Cline：**
    -   打开 Cline 侧边栏（通常由 Cline 图标指示）。
    -   点击设置齿轮图标（⚙️）。
    -   选择"ollama"作为 API 提供商。
    -   输入您在上一步中保存的模型名称（例如 `your_custom_model_name`）。
    -   （可选）如果 Ollama 在不同的机器或端口上运行，请调整基础 URL。默认值是 `http://localhost:11434`。
    -   （可选）在 Cline 的高级设置中配置模型上下文大小。这有助于 Cline 与您的自定义 Ollama 模型有效地管理其上下文窗口。

### 提示和注意事项

-   **资源需求：** 在本地运行大型语言模型可能会对系统资源要求很高。确保您的计算机满足您选择的模型的要求。
-   **模型选择：** 尝试各种模型以发现哪个最适合您的特定任务和偏好。
-   **离线能力：** 下载模型后，即使没有互联网连接，您也可以使用该模型与 Cline 一起使用。
-   **Token 使用跟踪：** Cline 跟踪通过 Ollama 访问的模型的 token 使用情况，允许您监控消耗。
-   **Ollama 自己的文档：** 有关更详细的信息，请查阅官方 [Ollama 文档](https://ollama.com/docs)。
