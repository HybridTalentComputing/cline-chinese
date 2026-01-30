#!/bin/bash

# Mintlify 到 GitBook 迁移脚本
# 使用方法: cd docs-zh && bash migrate-to-gitbook.sh

set -e

echo "🚀 开始迁移 Mintlify 文档到 GitBook..."

# 1. 重命名所有 .mdx 文件为 .md
echo "📝 步骤 1: 重命名 .mdx 文件为 .md..."
find . -name "*.mdx" -type f | while read file; do
    dir=$(dirname "$file")
    filename=$(basename "$file" .mdx)
    newfile="$dir/$filename.md"
    if [ ! -f "$newfile" ]; then
        mv "$file" "$newfile"
        echo "  ✅ 重命名: $file -> $newfile"
    else
        echo "  ⚠️  跳过（已存在）: $newfile"
    fi
done

# 2. 创建 SUMMARY.md
echo ""
echo "📑 步骤 2: 创建 SUMMARY.md..."

cat > SUMMARY.md << 'SUMMARY_EOF'
# Summary

## 文档

### Introduction
* [Welcome](introduction/welcome.md)
* [Overview](introduction/overview.md)

### Getting Started
* [Installing Cline](getting-started/installing-cline.md)
* [Selecting Your Model](getting-started/selecting-your-model.md)
* [Your First Project](getting-started/your-first-project.md)

### Best Practices
* [Understanding Context Management](prompting/understanding-context-management.md)
* [Prompt Engineering Guide](prompting/prompt-engineering-guide.md)
* [Cline Memory Bank](prompting/cline-memory-bank.md)

### CLI
* [Overview](cline-cli/overview.md)
* [Installation](cline-cli/installation.md)
* [Three Core Flows](cline-cli/three-core-flows.md)

#### CLI Samples
* [Overview](cline-cli/samples/overview.md)
* [GitHub Issue RCA](cline-cli/samples/github-issue-rca.md)
* [GitHub Integration](cline-cli/samples/github-integration.md)

### Features

#### @ 引用
* [Overview](features/at-mentions/overview.md)
* [File Mentions](features/at-mentions/file-mentions.md)
* [Terminal Mentions](features/at-mentions/terminal-mentions.md)
* [Problem Mentions](features/at-mentions/problem-mentions.md)
* [Git Mentions](features/at-mentions/git-mentions.md)
* [URL Mentions](features/at-mentions/url-mentions.md)

* [Auto Approve](features/auto-approve.md)
* [Auto Compact](features/auto-compact.md)
* [Checkpoints](features/checkpoints.md)
* [Cline Rules](features/cline-rules.md)

#### 命令和快捷键
* [Overview](features/commands-and-shortcuts/overview.md)
* [Code Commands](features/commands-and-shortcuts/code-commands.md)
* [Terminal Integration](features/commands-and-shortcuts/terminal-integration.md)
* [Git Integration](features/commands-and-shortcuts/git-integration.md)
* [Keyboard Shortcuts](features/commands-and-shortcuts/keyboard-shortcuts.md)

#### 自定义
* [Opening Cline in Sidebar](features/customization/opening-cline-in-sidebar.md)
* [Disable Terminal Pagers](features/customization/disable-terminal-pagers.md)

* [Dictation](features/dictation.md)
* [Drag and Drop](features/drag-and-drop.md)
* [Editing Messages](features/editing-messages.md)
* [Explain Changes](features/explain-changes.md)
* [Focus Chain](features/focus-chain.md)

#### Hooks
* [Index](features/hooks/index.md)
* [Hook Reference](features/hooks/hook-reference.md)
* [Samples](features/hooks/samples.md)

* [Multiroot Workspace](features/multiroot-workspace.md)
* [Plan and Act](features/plan-and-act.md)

#### 命令
* [New Task](features/slash-commands/new-task.md)
* [New Rule](features/slash-commands/new-rule.md)
* [Explain Changes](features/slash-commands/explain-changes.md)
* [Smol](features/slash-commands/smol.md)
* [Report Bug](features/slash-commands/report-bug.md)
* [Deep Planning](features/slash-commands/deep-planning.md)

#### 工作流
* [Index](features/slash-commands/workflows/index.md)
* [Quickstart](features/slash-commands/workflows/quickstart.md)
* [Best Practices](features/slash-commands/workflows/best-practices.md)

#### 任务管理
* [Understanding Tasks](features/tasks/understanding-tasks.md)
* [Task Management](features/tasks/task-management.md)

* [YOLO Mode](features/yolo-mode.md)

### 模型配置

#### 模型选择
* [Model Selection Guide](core-features/model-selection-guide.md)
* [Model Comparison](model-config/model-comparison.md)
* [Context Windows](model-config/context-windows.md)

#### 模型提供商
* [Anthropic](provider-config/anthropic.md)
* [Claude Code](provider-config/claude-code.md)
* [OpenAI](provider-config/openai.md)
* [OpenRouter](provider-config/openrouter.md)
* [Cerebras](provider-config/cerebras.md)
* [DeepSeek](provider-config/deepseek.md)
* [Groq](provider-config/groq.md)
* [xAI Grok](provider-config/xai-grok.md)
* [Mistral AI](provider-config/mistral-ai.md)
* [Doubao](provider-config/doubao.md)
* [Fireworks](provider-config/fireworks.md)
* [ZAi](provider-config/zai.md)
* [GCP Vertex AI](provider-config/gcp-vertex-ai.md)
* [Baseten](provider-config/baseten.md)

##### AWS Bedrock
* [API Key](provider-config/aws-bedrock/api-key.md)
* [IAM Credentials](provider-config/aws-bedrock/iam-credentials.md)
* [CLI Profile](provider-config/aws-bedrock/cli-profile.md)

#### 本地模型
* [Overview](running-models-locally/overview.md)
* [Ollama](running-models-locally/ollama.md)
* [LM Studio](running-models-locally/lm-studio.md)

#### 高级配置
* [OpenAI Compatible](provider-config/openai-compatible.md)
* [LiteLLM](provider-config/litellm-and-cline-using-codestral.md)
* [VS Code Language Model API](provider-config/vscode-language-model-api.md)
* [SAP AI Core](provider-config/sap-aicore.md)
* [Vercel AI Gateway](provider-config/vercel-ai-gateway.md)
* [Requesty](provider-config/requesty.md)

### MCP 集成
* [Overview](mcp/mcp-overview.md)
* [Adding MCP Servers from GitHub](mcp/adding-mcp-servers-from-github.md)
* [Configuring MCP Servers](mcp/configuring-mcp-servers.md)
* [Connecting to a Remote Server](mcp/connecting-to-a-remote-server.md)
* [MCP Marketplace](mcp/mcp-marketplace.md)
* [MCP Server Development Protocol](mcp/mcp-server-development-protocol.md)
* [MCP Transport Mechanisms](mcp/mcp-transport-mechanisms.md)

### Cline 工具参考
* [Cline Tools Guide](exploring-clines-tools/cline-tools-guide.md)
* [New Task Tool](exploring-clines-tools/new-task-tool.md)
* [Remote Browser Support](exploring-clines-tools/remote-browser-support.md)

### Reference
* [Networking and Proxies](troubleshooting/networking-and-proxies.md)
* [Terminal Quick Fixes](troubleshooting/terminal-quick-fixes.md)
* [Terminal Integration Guide](troubleshooting/terminal-integration-guide.md)
* [Task History Recovery](troubleshooting/task-history-recovery.md)
* [Telemetry](more-info/telemetry.md)

## 企业版

### 企业解决方案
* [Overview](enterprise-solutions/overview.md)
* [Onboarding](enterprise-solutions/onboarding.md)
* [Managing Members](enterprise-solutions/team-management/managing-members.md)

#### SaaS 提供商配置
* [Overview](enterprise-solutions/configuration/remote-configuration/overview.md)

##### AWS Bedrock
* [Admin Configuration](enterprise-solutions/configuration/remote-configuration/aws-bedrock/admin-configuration.md)
* [Member Configuration](enterprise-solutions/configuration/remote-configuration/aws-bedrock/member-configuration.md)

##### LiteLLM
* [Admin Configuration](enterprise-solutions/configuration/remote-configuration/litellm/admin-configuration.md)
* [Member Configuration](enterprise-solutions/configuration/remote-configuration/litellm/member-configuration.md)

##### Google Vertex AI
* [Admin Configuration](enterprise-solutions/configuration/remote-configuration/google-vertex/admin-configuration.md)
* [Member Configuration](enterprise-solutions/configuration/remote-configuration/google-vertex/member-configuration.md)

#### 控制Cline的其它功能
* [YOLO Mode](enterprise-solutions/configuration/infrastructure-configuration/control-other-cline-features/yolo-mode.md)

#### 数据采集
* [Overview](enterprise-solutions/monitoring/overview.md)
* [Telemetry](enterprise-solutions/monitoring/telemetry.md)
* [OpenTelemetry](enterprise-solutions/monitoring/opentelemetry.md)
SUMMARY_EOF

echo "  ✅ SUMMARY.md 创建成功"

# 3. 创建 README.md（首页）
echo ""
echo "🏠 步骤 3: 创建 README.md..."

if [ ! -f "README.md" ]; then
    cp introduction/welcome.md README.md 2>/dev/null || echo "# Cline Documentation" > README.md
    echo "  ✅ README.md 创建成功"
else
    echo "  ⚠️  README.md 已存在，跳过"
fi

# 4. 创建 .gitignore
echo ""
echo "📁 步骤 4: 更新 .gitignore..."

cat >> .gitignore << 'GITIGNORE_EOF'
# Mintlify files (不需要在 GitBook 中)
mint.json
.mint/

# GitBook specific
.gitbook/
_book/
SUMMARY.md.bak
GITIGNORE_EOF

echo "  ✅ .gitignore 更新成功"

# 5. 处理图片和资源
echo ""
echo "🖼️  步骤 5: 检查资源文件..."
if [ -d "assets" ]; then
    echo "  ✅ assets 文件夹已存在"
else
    echo "  ⚠️  assets 文件夹不存在"
fi

echo ""
echo "✨ 迁移完成！"
echo ""
echo "📋 下一步："
echo "1. 审查 SUMMARY.md 确保结构正确"
echo "2. 在 GitBook (https://app.gitbook.com) 创建新空间"
echo "3. 连接 GitHub 仓库到 GitBook"
echo "4. 设置 docs-zh 为内容根目录"
echo "5. 发布！"
echo ""
echo "🔗 有用的链接："
echo "- GitBook 文档: https://docs.gitbook.com"
echo "- GitBook GitHub 集成: https://docs.gitbook.com/integrations/github"
