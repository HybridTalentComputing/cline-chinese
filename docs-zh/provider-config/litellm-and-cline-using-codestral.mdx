---
title: "LiteLLM & Cline（使用 Codestral）"
description: "了解如何设置和使用 LiteLLM 与 Cline，使用 Codestral 模型。本指南涵盖 Docker 设置、配置和与 Cline 的集成。"
---

### 在 Cline 中使用 LiteLLM

本指南演示如何使用 Codestral 模型为 Cline 运行 LiteLLM 演示。

#### 先决条件

-   已安装 [Docker CLI 或 Docker Desktop](https://www.docker.com/get-started/)以在本地运行 LiteLLM 镜像
-   对于此示例配置：Codestral API 密钥（与 Mistral API 密钥不同）

#### 设置

1. **创建 `.env` 文件并填写相应字段**

    ```bash
    # 提示：使用以下命令生成随机字母数字密钥：
    # openssl rand -base64 32 | tr -dc 'A-Za-z0-9' | head -c 32
    LITELLM_MASTER_KEY=YOUR_LITELLM_MASTER_KEY
    CODESTRAL_API_KEY=YOUR_CODESTRAL_API_KEY
    ```

    _注意：虽然这仅限于 localhost，但将 LITELLM_MASTER_KEY 设置为安全的内容是一个好习惯_

2. **配置**

    我们需要创建一个 `config.yaml` 文件来包含我们的 LiteLLM 配置。在本例中，我们将只有一个模型'codestral-latest'并将其标记为'codestral'

    ```yaml
    model_list:
        - model_name: codestral
          litellm_params:
              model: codestral/codestral-latest
              api_key: os.environ/CODESTRAL_API_KEY
    ```

#### 运行演示

1. **启动 LiteLLM docker 容器**

    ```bash
    docker run \
        --env-file .env \
        -v $(pwd)/config.yaml:/app/config.yaml \
        -p 127.0.0.1:4000:4000 \
        ghcr.io/berriai/litellm:main-latest \
        --config /app/config.yaml --detailed_debug
    ```

2. **设置 Cline**

    一旦 LiteLLM 服务器启动并运行，您可以在 Cline 中进行设置：

    - 基础 URL 应该是 `http://0.0.0.0:4000/v1`
    - API 密钥应该是您在 `.env` 中为 LITELLM_MASTER_KEY 设置的密钥
    - 模型 ID 是 `codestral` 或您在 `config.yaml` 中命名的任何名称

#### 获取帮助

-   [LiteLLM 文档](https://docs.litellm.ai/)
-   [Mistral AI 控制台](https://console.mistral.ai/)
-   [Cline Discord 社区](https://discord.gg/cline)
