---
title: "三个核心流程"
description: "了解使用 Cline CLI 的三种方式：交互模式、无头自动化和多实例并行化"
---

两个需要理解的概念：

**任务** - Cline 要完成的一个单个作业（"为 utils.js 添加测试"）。你描述你想要什么，Cline 计划如何做，然后执行计划。任务在实例上运行。

**实例** - 一个独立的 Cline 工作区。每个实例一次运行一个任务。创建多个实例以并行运行多个任务，在项目的不同部分上工作。

## 1. 交互模式：先计划，然后执行

从这里开始，看看 Cline 如何工作。交互模式打开一个聊天会话，你可以在执行之前查看计划。

```bash
cline
```

Cline 在你当前的目录中打开一个交互式会话。将你的任务作为消息输入。Cline 进入计划模式并提出逐步策略。

在聊天中查看或编辑计划。当你准备好时，切换到执行：

```bash
/act
```

Cline 执行批准的步骤——读取文件、编写代码、运行命令。你在整个过程中保持控制。

## 2. 无头单次：无需聊天完成任务

将其用于自动化，你只需要一个就能完成工作的单行命令。

```bash
cline instance new --default
cline task new -y "为所有 Go 文件生成单元测试"
```

使用 `-y` (YOLO) 标志，Cline 在没有交互式聊天的情况下自主计划和执行。非常适合 CI、cron 作业或脚本。

示例：

```bash
# 创建完整功能
cline task new -y "为用户身份验证创建 REST API"

# 生成文档
cline task new -y "为 src/ 中的所有函数添加 JSDoc 注释"

# 重构代码
cline task new -y "将所有 var 声明转换为 const/let"
```

使用以下命令监控你的任务：

```bash
# 查看任务状态
cline task view

# 实时跟踪任务进度
cline task view --follow
```

按 Ctrl+C 退出视图。

<Note>
在目录或干净的 Git 分支上小心运行 YOLO 模式。你以监督换取速度，所以准备好在需要时回退。
</Note>

## 3. 多实例：运行并行代理

多个实例允许你并行化对同一项目的工作，而不会发生上下文冲突。同时运行前端、后端和基础设施任务。

创建你的第一个实例：

```bash
cline instance new
```

这将返回一个实例地址，你将使用它来定位任务。将任务附加到此实例：

```bash
# 第一个实例上的前端工作
cline task new -y "构建 React 组件"
```

创建第二个实例并在一个命令中将其设置为默认：

```bash
cline instance new --default
```

现在你可以创建任务而无需指定地址——它们自动使用默认实例：

```bash
# 新默认实例上的后端工作
cline task new -y "实现 API 端点"
```

列出所有正在运行的实例：

```bash
cline instances list
```

完成后停止所有实例：

```bash
cline instances kill -a
```

<Tip>
跟踪 `cline instance new` 返回的实例地址。当编写多个代理的脚本时，存储这些 ID 并将你的任务定向到适当的实例。
</Tip>

## 为本地提供商配置上下文窗口

对于 Ollama 和 LM Studio，你可以通过 CLI 配置模型上下文窗口：

```bash
# 对于 Ollama
cline config s ollama-api-options-ctx-num=32768

# 对于 LM Studio
cline config s lm-studio-max-tokens=32768
```

对于其他提供商（Anthropic、OpenRouter 等），上下文窗口在每个模型的模型元数据中定义，不是用户可配置的——Cline 自动使用每个模型的内置上下文限制。

## 选择正确的流程

- **交互模式**：最适合探索新问题、学习 Cline 如何工作，或者你想在执行之前查看计划
- **无头单次**：非常适合自动化、CI/CD，以及你信任 Cline 在没有监督的情况下执行的任务
- **多实例**：当你需要并行化工作或为项目的不同部分维护单独的上下文时使用

<Tip>
有关深入的命令和标志，查看 [CLI 参考](/cline-cli/cli-reference)页面以获取所有可用选项的完整文档。
</Tip>

## 下一步

<Columns cols={2}>
  <Card title="CLI 参考" icon="terminal" href="/cline-cli/cli-reference">
    完整的命令文档，包括配置、实例管理和任务命令。
  </Card>
  
  <Card title="计划和执行" icon="brain" href="/features/plan-and-act">
    深入了解计划和执行模式，包括何时使用每个模式以及如何在它们之间切换。
  </Card>
  
  <Card title="YOLO 模式" icon="zap" href="/features/yolo-mode">
    了解 YOLO 模式如何工作，以及何时使用完全自动化与手动批准。
  </Card>
  
  <Card title="任务管理" icon="clipboard-check" href="/features/tasks/task-management">
    了解 Cline 如何跟踪和管理任务，包括从检查点保存和恢复状态。
  </Card>
</Columns>
