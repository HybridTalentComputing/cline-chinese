---
title: "工作流最佳实践"
sidebarTitle: "最佳实践"
description: "创建有效和可靠的 Cline 工作流的提示和策略。"
---

创建有效的工作流需要在清晰的指令、模块化设计和智能工具使用之间取得平衡。遵循这些最佳实践以充分利用 Cline 的自动化能力。

## 使用 Cline 构建工作流

我们强烈建议使用 Cline 帮助你构建你的工作流。由于 Cline 理解你的项目的上下文和结构，它可以是设计适合你特定需求的自动化的宝贵合作伙伴。

### 构建你自己的工作流

创建工作流比你想象的要简单。实际上有一个用于构建工作流的工作流！

首先，**将** [create-new-workflow.md](https://github.com/cline/prompts/blob/main/workflows/create-new-workflow.md) **文件保存到你的工作区**（例如，在 `.clinerules/workflows/` 中）。

然后，输入 `/create-new-workflow.md`，Cline 将引导你完成它：

1.  它询问目的和简洁的名称。
2.  你描述目标和预期输出。
3.  你列出主要步骤（Cline 可以帮助确定细节）。
4.  它生成结构正确的工作流文件。

<Tip>
  **自动化你的历史**：最好的工作流来自你已经完成的任务。完成需要重复的内容后，告诉 Cline："为我刚完成的过程创建一个工作流。"它分析对话、识别步骤并生成工作流文件。你的累积上下文变成可重用的自动化。
</Tip>

工作流位于 `.clinerules/workflows/` 中用于项目特定的工作流，或 `~/Documents/Cline/Workflows/` 中用于你在项目中使用的全局工作流。当名称匹配时，项目工作流优先。

## 工作流设计

<Tip>
  **从简单开始**：从小型的单任务工作流开始。随着你变得舒适，你可以组合它们或创建更复杂的序列。
</Tip>

### 模块化
不要创建一个巨大的工作流文件，而是将复杂的任务分解为更小的、可重用的工作流。这使它们更容易维护和调试。

### 使用清晰的注释
就像代码一样，为你的工作流步骤添加注释至关重要。解释*为什么*发生步骤，而不仅仅是*什么*正在发生。这有助于你（未来的维护者）和 Cline 理解意图。

### 版本控制
将你的工作流视为代码库的一部分。将它们存储在 Git 仓库中（在 `.clinerules/workflows/` 中），以便它们被版本化、审查并与你的团队共享。

## 为 Cline 的提示工程

### 具体使用工具
不要只说"查找文件"。要明确 Cline 应该使用哪个工具。

*   **差**："查找用户控制器。"
*   **好**："使用 `search_files` 在 `src/controllers` 目录中查找 `UserController`。"

## 高级技巧

### 可用工具

Cline 有一组强大的工具，你可以在工作流中使用。以下是最常见的工具：

#### execute_command
在你的系统上执行 CLI 命令。使用它来运行测试、构建、git 命令或任何其他终端操作。

```xml
<execute_command>
  <command>npm run test</command>
  <requires_approval>false</requires_approval>
</execute_command>
```

#### read_file
读取文件的内容。对于分析代码或配置至关重要。

```xml
<read_file>
  <path>src/config.json</path>
</read_file>
```

#### write_to_file
创建或覆盖文件。使用它来生成样板、配置文件或文档。

```xml
<write_to_file>
  <path>src/components/Button.tsx</path>
  <content>
    // 文件内容放在这里...
