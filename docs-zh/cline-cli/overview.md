---
title: "概述"
description: "安装 CLI、运行你的第一个任务，并学习自动化代码审查和将 AI 代理集成到你的开发工作流中"
---

<Warning>
**预览版本 - 仅限 macOS 和 Linux**

Cline CLI 目前处于预览阶段，仅适用于 macOS 和 Linux 用户。Windows 支持即将推出。
</Warning>

## 什么是 Cline CLI？

Cline CLI 直接在你的终端中运行 AI 编程代理。通过管道传输 git 差异以在 CI/CD 中进行自动化代码审查，同时运行多个实例以进行并行开发，或将 Cline 集成到你现有的 shell 工作流中。

CLI 在你的系统中跟踪实例，并输出专为人类和脚本设计的格式——JSON、纯文本或丰富的终端输出。

<Tip>
准备好开始了吗？查看[安装指南](/cline-cli/installation)以安装 Cline CLI 并运行你的第一个任务。
</Tip>

## 支持的模型提供商

Cline CLI 支持多个 AI 模型提供商，为你选择最适合你需求的模型提供灵活性：

- **Anthropic**
- **OpenAI**
- **OpenAI 兼容**
- **OpenRouter**
- **X AI (Grok)**
- **AWS Bedrock**
- **Google Gemini**
- **Ollama**
- **Cerebras**

在安装过程中，你将使用 `cline auth` 命令验证和配置你偏好的提供商。

## 你可以用它构建什么

**自动化代码维护**
- 安排每日运行以识别和修复代码库中的 linting 问题
- 创建扫描安全漏洞并自动修补它们的任务
- 构建更新已弃用依赖项并运行测试的脚本

**多实例开发**
- 同时为前端和后端运行独立的 Cline 实例
- 为不同的功能分支生成实例，每个实例都有隔离的状态
- 为多个 PR 创建并行审查流程

**自定义工作流**
- 构建 shell 脚本，将 Cline 与 git hooks 结合用于提交前分析
- 创建自定义命令，将复杂的数据结构通过管道传输到 Cline 进行处理
- 与你现有的工具链 (jq、grep、awk) 集成以进行复杂的自动化

**CI/CD 集成**
- 将 Cline 添加到 GitHub Actions，以便在每个 PR 上自动进行代码审查
- 创建 GitLab 管道，从架构更改生成迁移脚本
- 构建使用 Cline 分析测试失败并建议修复的 Jenkins 作业

## Hooks 集成

[Hooks](/features/hooks/index)允许你将自定义逻辑注入到 Cline 的工作流中以验证操作和执行策略。你可以在从命令行运行任务时启用 hooks：

```bash
# 为任务启用 hooks
cline "这个仓库是做什么的？" -s hooks_enabled=true

# 通过 CLI 全局配置 hooks
cline config set hooks-enabled=true
```

这允许你将 hooks 集成到自动化工作流、CI/CD 管道和无头任务执行中，以便在所有环境中一致执行。

## 了解更多

<Columns cols={2}>
  <Card title="安装" icon="download" href="/cline-cli/installation">
    安装 Cline CLI 并使用你的帐户验证以开始。
  </Card>
  
  <Card title="三个核心流程" icon="route" href="/cline-cli/three-core-flows">
    掌握使用 Cline CLI 的三种方式：交互模式、无头自动化和多实例并行化。
  </Card>
</Columns>
