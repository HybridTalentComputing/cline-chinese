---
title: "GitHub Actions 集成"
description: "通过在评论中提及 @cline，使用 GitHub Actions 中的 Cline CLI 自动响应 GitHub 问题。"
---

# GitHub 集成示例

使用 AI 自动化 GitHub 问题分析。在任何问题评论中提及 `@cline` 即可触发自主调查，包括读取文件、分析代码并提供可操作的见解——所有这些都在 GitHub Actions 中自动运行。

<Note>
**刚开始使用 Cline CLI？** 此示例假设您了解 Cline CLI 的基础知识并已完成[安装指南](https://docs.cline.bot/cline-cli/installation)。如果您是 Cline CLI 的新手，我们建议先从 [GitHub RCA 示例](./github-issue-rca)开始，因为它更简单，可以帮助您在设置 GitHub Actions 之前理解基础知识。
</Note>

## 工作流程

在任何问题评论中提及 `@cline` 即可触发 Cline：

<Frame>
  <img src="https://storage.googleapis.com/cline_public_images/ss0a-comment.png" alt="带有 @cline 提及的问题评论" width="600" />
</Frame>

Cline 的自动分析会以新评论的形式出现，见解来自您的实际代码库：

<Frame>
  <img src="https://storage.googleapis.com/cline_public_images/ss0b-final.png" alt="来自 Cline 的自动分析响应" width="600" />
</Frame>

整个调查过程都在 GitHub Actions 中自主运行——从文件探索到发布结果。

让我们配置您的仓库。

## 前置条件

在开始之前，您需要：

- **Cline CLI 知识** - 已完成[安装指南](https://docs.cline.bot/cline-cli/installation)并了解基本用法
- **GitHub 仓库** - 具有配置 Actions 和机密的管理员访问权限
- **GitHub Actions 熟悉度** - 基本了解工作流程和 CI/CD
- **API 提供商账户** - OpenRouter、Anthropic 或类似账户，具有 API 密钥

## 设置

### 1. 复制工作流程文件



将此示例中的工作流程文件复制到您的仓库。工作流程文件必须放置在仓库根目录的 `.github/workflows/` 目录中，以便 GitHub Actions 检测并运行它。在本例中，我们将其命名为 `cline-responder.yml`。

```bash
# 在您的仓库根目录中
mkdir -p .github/workflows
curl -o .github/workflows/cline-responder.yml https://raw.githubusercontent.com/cline/cline/main/src/samples/cli/github-integration/cline-responder.yml
```

或者，您可以直接将完整的工作流程文件复制到 `.github/workflows/cline-responder.yml`：

<Accordion title="点击查看完整的 cline-responder.yml 工作流程">
```yaml
name: Cline Issue Assistant

on:
  issue_comment:
    types: [created, edited]

permissions:
  issues: write

jobs:
  respond:
    runs-on: ubuntu-latest
    environment: cline-actions
    steps:
      - name: Check for @cline mention
        id: detect
        uses: actions/github-script@v7
        with:
          script: |
            const body = context.payload.comment?.body || "";
            const isPR = !!context.payload.issue?.pull_request;
            const hit = body.toLowerCase().includes("@cline");
            core.setOutput("hit", (!isPR && hit) ? "true" : "false");
            core.setOutput("issue_number", String(context.payload.issue?.number || ""));
            core.setOutput("issue_url", context.payload.issue?.html_url || "");
            core.setOutput("comment_body", body);

      - name: Checkout repository
        if: steps.detect.outputs.hit == 'true'
        uses: actions/checkout@v4

      # Node v20 is needed for Cline CLI on GitHub Actions Linux
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Setup Cline CLI
        if: steps.detect.outputs.hit == 'true'
        run: |
          # Install the Cline CLI
          sudo npm install -g cline

      - name: Create Cline Instance
        if: steps.detect.outputs.hit == 'true'
        env:
          OPENROUTER_API_KEY: ${{ secrets.OPENROUTER_API_KEY }}
          CLINE_DIR: ${{ runner.temp }}/cline
        run: |
          # Create instance and capture output
          INSTANCE_OUTPUT=$(cline instance new 2>&1)
          
          # Parse address from output (format: "  Address: 127.0.0.1:36733")
          CLINE_ADDRESS=$(echo "$INSTANCE_OUTPUT" | grep "Address:" | grep -oE '([0-9]{1,3}\.){3}[0-9]{1,3}:[0-9]+')
          echo "CLINE_ADDRESS=$CLINE_ADDRESS" >> $GITHUB_ENV
          
          # Configure API key
          cline config set open-router-api-key=$OPENROUTER_API_KEY --address $CLINE_ADDRESS -v

      - name: Download analyze script
        if: steps.detect.outputs.hit == 'true'
        run: |
          export GITORG="YOUR-GITHUB-ORG"
          export GITREPO="YOUR-GITHUB-REPO"

          curl -L https://raw.githubusercontent.com/${GITORG}/${GITREPO}/refs/heads/main/git-scripts/analyze-issue.sh -o analyze-issue.sh
          chmod +x analyze-issue.sh

      - name: Run analysis
        if: steps.detect.outputs.hit == 'true'
        id: analyze
        env:
          ISSUE_URL: ${{ steps.detect.outputs.issue_url }}
          COMMENT: ${{ steps.detect.outputs.comment_body }}
          CLINE_ADDRESS: ${{ env.CLINE_ADDRESS }}
        run: |
          set -euo pipefail
          
          RESULT=$(./analyze-issue.sh "${ISSUE_URL}" "Analyze this issue. The user asked: ${COMMENT}" "$CLINE_ADDRESS")
          
          {
            echo 'result<<EOF'
            printf "%s\n" "$RESULT"
            echo 'EOF'
          } >> "$GITHUB_OUTPUT"

      - name: Post response
        if: steps.detect.outputs.hit == 'true'
        uses: actions/github-script@v7
        env:
          ISSUE_NUMBER: ${{ steps.detect.outputs.issue_number }}
          RESULT: ${{ steps.analyze.outputs.result }}
        with:
          script: |
            await github.rest.issues.createComment({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: Number(process.env.ISSUE_NUMBER),
              body: process.env.RESULT || "(no output)"
            });
```
</Accordion>

<Warning>
**您必须在提交之前编辑工作流程文件！**

打开 `.github/workflows/cline-responder.yml` 并更新工作流程中的"Download analyze script"步骤，指定存储分析脚本的 GitHub 组织和仓库：

```yaml
export GITORG="YOUR-GITHUB-ORG"      # 更改此项！
export GITREPO="YOUR-GITHUB-REPO"    # 更改此项！
```

**示例：** 如果您的仓库是 `github.com/acme/myproject`，请设置：
```yaml
export GITORG="acme"
export GITREPO="myproject"
```

这告诉工作流程在步骤 3 中提交脚本后，从您的仓库下载分析脚本的位置。
</Warning>

工作流程将查找新的或更新的问题，检查 `@cline` 提及，然后
启动 Cline CLI 实例来深入调查问题，作为问题的回复提供反馈。

### 2. 配置 API 密钥

将 AI 提供商 API 密钥添加为仓库机密：

1. 转到您的 GitHub 仓库
2. 导航到 **Settings** → **Environment** 并添加新环境。

   <Frame>
     <img src="https://storage.googleapis.com/cline_public_images/ss01-environment.png" alt="导航到 Actions 机密" width="600" />
   </Frame>

   确保将其命名为"cline-actions"，以便与 `cline-responder.yml` 文件顶部的 `environment`
   值匹配。

3. 点击 **New repository secret**
4. 为 `OPENROUTER_API_KEY` 添加一个机密，值为来自
   [openrouter.com](https://openrouter.com) 的 API 密钥。

   <Frame>
     <img src="https://storage.googleapis.com/cline_public_images/ss02-api-key.png" alt="添加 API 密钥机密" width="600" />
   </Frame>

5. 验证您的机密已配置：

   <Frame>
     <img src="https://storage.googleapis.com/cline_public_images/ss03-ready.png" alt="API 密钥已配置" width="600" />
   </Frame>

现在您准备好在 GitHub Action 中为 Cline 提供所需的凭据了。

### 3. 添加分析脚本

将 `github-issue-rca` 示例中的分析脚本添加到您的仓库。**首先，您需要在仓库根目录中创建一个 `git-scripts` 目录，脚本将位于该目录中。** 选择以下选项之一：

**选项 A：直接下载（推荐）**

```bash
# 在您的仓库根目录中，创建目录并下载脚本
mkdir -p git-scripts
curl -o git-scripts/analyze-issue.sh https://raw.githubusercontent.com/cline/cline/main/src/samples/cli/github-issue-rca/analyze-issue.sh
chmod +x git-scripts/analyze-issue.sh
```

**选项 B：手动复制粘贴**

手动创建目录和文件，然后粘贴脚本内容：

```bash
# 在您的仓库根目录中
mkdir -p git-scripts
# 使用您喜欢的编辑器创建和编辑文件
nano git-scripts/analyze-issue.sh  # 或使用 vim、code 等
```

<Accordion title="点击查看完整的 analyze-issue.sh 脚本">
```bash
#!/bin/bash
# 使用 Cline CLI 分析 GitHub 问题

if [ -z "$1" ]; then
    echo "Usage: $0 <github-issue-url> [prompt] [address]"
    echo "Example: $0 https://github.com/owner/repo/issues/123"
    echo "Example: $0 https://github.com/owner/repo/issues/123 'What is the root cause of this issue?'"
    echo "Example: $0 https://github.com/owner/repo/issues/123 'What is the root cause of this issue?' 127.0.0.1:46529"
    exit 1
fi

# 收集参数
ISSUE_URL="$1"
PROMPT="${2:-What is the root cause of this issue?}"
if [ -n "$3" ]; then
    ADDRESS="--address $3"
fi

# 向 Cline 请求分析，仅显示摘要
cline -y "$PROMPT: $ISSUE_URL" --mode act $ADDRESS -F json | \
    sed -n '/^{/,$p' | \
    jq -r 'select(.say == "completion_result") | .text' | \
    sed 's/\\n/\n/g'
```

粘贴脚本内容后，使其可执行：
```bash
chmod +x git-scripts/analyze-issue.sh
```
</Accordion>

此分析脚本调用 Cline 对 GitHub 问题执行提示词，
总结输出以填充对问题的回复。

### 4. 提交和推送

```bash
git add .github/workflows/cline-responder.yml
git add git-scripts/analyze-issue.sh
git commit -m "Add Cline issue assistant workflow"
git push
```

## 使用方法

设置完成后，只需在任何问题评论中提及 `@cline`：

```
@cline what's causing this error?

@cline analyze the root cause

@cline what are the security implications?
```

GitHub Actions 将：
1. 检测 `@cline` 提及
2. 启动 Cline CLI 实例
3. 下载分析脚本
4. 使用 act 模式和 yolo（完全自主）分析问题
5. 将 Cline 的分析作为新评论发布

**注意**：工作流程仅在问题评论上触发，而不在拉取请求
评论上触发。

## 工作原理

工作流程（`cline-responder.yml`）：

1. **触发**于问题评论（创建或编辑）
2. **检测** `@cline` 提及（不区分大小写）
3. **安装**使用 npm 全局安装 Cline CLI
4. **创建**使用 `cline instance new` 创建 Cline 实例
5. **配置**使用 `cline config set open-router-api-key=...
   --address ...` 配置身份验证
6. **下载**从 `github-issue-rca` 示例下载可重用的
   `analyze-issue.sh` 脚本
7. **运行**使用实例地址运行分析
8. **发布**将分析结果作为评论发布

## 相关示例

- **[github-issue-rca](./github-issue-rca)**：为此集成提供支持的可重用脚本
