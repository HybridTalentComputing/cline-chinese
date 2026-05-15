---
title: "钩子概述"
sidebarTitle: "概述"
description: "将自定义逻辑注入到 Cline 的工作流中，以验证操作、监控工具使用和塑造 AI 决策"
---

钩子让你在关键时刻将自定义逻辑注入到 Cline 的工作流中。将它们视为自动检查点，你可以在执行前验证操作，在发生时监控工具使用，并塑造 Cline 如何做出决策。

当开发过程中发生特定事件时，钩子自动运行。它们接收有关每个操作的详细信息，可以在操作导致问题之前阻止有问题的操作，并且可以注入指导未来 AI 决策的上下文。

真正的力量来自结合这些能力。你可以：

- 在操作导致问题之前停止它们（例如在 TypeScript 项目中创建 `.js` 文件）
- 从正在发生的事情中学习并随时间建立项目知识
- 监控性能并在问题出现时捕获它们
- 跟踪所有内容以进行分析或合规性
- 在适当的时刻触发外部工具或服务

## 入门

<Frame>
	<img src="https://storage.googleapis.com/cline_public_images/hooks.gif" alt="钩子在行动中" />
</Frame>

<Note>
钩子在所有平台上工作：Windows、macOS 和 Linux。本文档中的 bash 示例在所有平台上与标准 shell 一起工作（包括 Windows 上的 Git Bash 或 WSL）。
</Note>

在 Cline 中设置钩子是用户友好的，具有内置的钩子管理界面。以下是如何入门：

<Steps>
<Step title="访问钩子界面">
导航到钩子管理界面：

<Frame>
  <img src="/assets/hooks/hooks-interface-with-dropdown.png" alt="钩子管理界面，显示全局钩子和项目特定钩子以及下拉菜单" />
</Frame>

1. 打开 Cline（确保在设置中启用了钩子）
2. 在顶部查找**钩子**选项卡（与规则和工作流一起）
3. 单击**钩子**以打开钩子管理面板

界面向你显示所有可用的钩子类型和按工作区组织的现有钩子。
</Step>

<Step title="了解钩子位置">
钩子在界面中按位置自动组织：

**全局钩子** - 应用于所有工作区：
- 存储在 `~/Documents/Cline/Hooks/`
- 非常适合个人编码标准和通用规则

**项目特定钩子** - 仅应用于当前项目：
- 存储在你的仓库中的 `.clinerules/hooks/`
- 非常适合项目特定验证和团队工作流
- 可以提交到版本控制以供团队共享

多根工作区从打开工作区中的所有仓库运行钩子，使得在同一个工作区内的不同仓库中管理和运行钩子变得容易。
</Step>

<Step title="创建你的第一个钩子">
使用直观的界面创建钩子：

<Frame>
  <img src="/assets/hooks/hooks-empty-state.png" alt="空的钩子界面，显示全局钩子和项目特定钩子的'新建钩子...'下拉菜单，在创建任何钩子之前" />
</Frame>

1. **选择你的位置**：在全局钩子和项目特定钩子之间做出决定
2. **选择钩子类型**：在你选择的位置中单击**"新建钩子..."**下拉菜单
3. **选择钩子类型**：下拉菜单显示此位置中尚未创建的所有可用钩子类型。每个钩子目录仅允许每种钩子类型一个，因此下拉菜单自动过滤以仅显示剩余的可用类型。

<Frame>
  <img src="/assets/hooks/new-hook-dropdown.png" alt="使用下拉菜单创建新钩子，显示选中 UserPromptSubmit 及其描述" />
</Frame>

4. **审查和编辑钩子**：单击铅笔图标以审查钩子的代码并添加你的自定义逻辑
5. **启用钩子**：一旦你理解并批准钩子的行为，切换开关以激活它

<Frame>
  <img src="/assets/hooks/hook-controls.png" alt="钩子管理控件，显示每个钩子的切换、编辑和删除按钮" />
</Frame>

<Warning>
在启用钩子之前始终审查钩子的代码。钩子在你工作流期间自动执行，因此在激活前理解它们的作用很重要。
</Warning>
</Step>

<Step title="测试你的钩子">
为了开发和改进你的钩子，你需要在测试期间多次触发它。每种钩子类型由 Cline 工作流中的不同事件触发。例如：

- **TaskStart** 钩子在开始新任务时触发
- **PreToolUse** 钩子在 Cline 执行文件编辑等工具之前触发
- **PostToolUse** 钩子在工具执行完成后触发
- **UserPromptSubmit** 钩子在向 Cline 提交消息时触发

有关每种钩子类型何时触发以及如何有效测试它们的完整详细信息，请参阅[钩子参考](/features/hooks/hook-reference)文档。这包括触发每个钩子的特定条件以及在开发期间如何调用它们的示例。
</Step>
</Steps>

<Tip>
从一个只记录信息的简单钩子开始，然后再构建复杂的验证逻辑。这有助于你理解数据结构和时机。
</Tip>

## 你可以构建什么

一旦你了解了基础知识，钩子就会开辟创造性的可能性：

<CardGroup cols={2}>
  <Card title="智能代码审查" icon="code-branch">
    在文件保存之前运行 linter 或自定义验证器。阻止未通过检查的提交。随时间跟踪代码质量指标。
  </Card>
  
  <Card title="安全执行" icon="shield-halved">
    防止违反安全策略的操作。检测敏感数据可能何时暴露。审计所有文件访问以确保合规性。
  </Card>
  
  <Card title="开发分析" icon="chart-line">
    测量不同操作需要多长时间。识别 AI 工作方式中的模式。从钩子数据生成生产力报告。
  </Card>
  
  <Card title="集成中心" icon="plug">
    当出现某些关键字时连接到问题跟踪器。更新项目管理工具。在适当时刻与外部 API 同步。
  </Card>
</CardGroup>

关键是将钩子与外部工具结合。钩子可以是 Cline 工作流和开发生态系统其余部分之间的粘合剂。

## 探索文档

<CardGroup cols={2}>
  <Card title="钩子参考" icon="book" href="/features/hooks/hook-reference">
    所有钩子类型的完整 API 参考、JSON 模式和字段文档。
  </Card>
  
  <Card title="示例" icon="code" href="/features/hooks/samples">
    常见用例的实用示例和完整工作脚本。
  </Card>
</CardGroup>

## CLI 支持

钩子在 [Cline CLI](/cline-cli/overview) 中也可用。当从命令行运行任务时，你可以启用或禁用钩子：

```bash
# 为任务启用钩子
cline "这个仓库是做什么的？" -s hooks_enabled=true

# 通过 CLI 全局配置钩子
cline config set hooks-enabled=true
cline config get hooks-enabled
```

这允许你将钩子集成到自动化工作流、CI/CD 管道和无头任务执行中。

<Note>
CLI 中的钩子仅在 macOS 和 Linux 上受支持。尚不支持 Windows。
</Note>

## 相关功能

钩子补充其他 Cline 功能：

- [Cline 规则](/features/cline-rules) 定义钩子可以执行的高级指导
- [检查点](/features/checkpoints) 让你在钩子未捕获问题时回滚更改
- [自动批准](/features/auto-approve) 与钩子配合良好，作为自动化操作的安全网
- [Cline CLI](/cline-cli/overview) 在基于终端和自动化工作流中启用钩子
