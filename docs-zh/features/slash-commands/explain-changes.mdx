---
title: "解释更改命令"
sidebarTitle: "/explain-changes"
---
<Note>
此命令仅在 **VS Code** 中可用。带有内联注释的差异视图需要 VS Code 的原生差异功能。
</Note>

`/explain-changes` 是一个为任何 git diff 生成 AI 驱动解释的斜杠命令。与[解释更改按钮](/features/explain-changes)不同，后者解释已完成任务的更改，此命令允许你解释任何两个 git 引用之间的更改 — 提交、分支、标签、PR、暂存更改或你的工作目录。


	<video
		src="https://storage.googleapis.com/cline_public_images/slash-code-explain.mp4"
		autoPlay
		loop
		muted
		playsInline
		/>

## 要求

<Note>
`/explain-changes` 命令需要一个 **git 仓库**。确保你在一个已用 git 初始化的目录中工作。
</Note>

对于 PR 解释，你需要安装并验证 [GitHub CLI (gh)](https://cli.github.com/)。对于 GitLab 合并请求解释，你需要安装并验证 [GitLab CLI (glab)](https://gitlab.com/gitlab-org/cli)。

与解释更改按钮不同，此命令**不**需要启用检查点，因为它直接使用 git 引用。


## 使用命令

在聊天输入中输入 `/explain-changes`。Cline 将：

1. 分析你的 git 历史以了解存在哪些更改
2. 通过读取相关文件收集上下文
3. 确定适当的 git 引用进行比较
4. 生成带有流式内联解释的差异视图


## 工作原理

当你使用 `/explain-changes` 时，Cline：

1. **收集上下文**：运行 git 命令以了解你的仓库状态
2. **识别更改**：确定引用之间更改了哪些文件
3. **读取相关文件**：为更好的解释构建上下文
4. **调用 generate_explanation**：创建差异视图并流式传输解释
5. **显示结果**：打开带有内联注释的多文件差异

## 使用场景

### 解释最后一次提交

最常见的用例 — 了解最近一次提交中更改了什么：

```
/explain-changes
```

Cline 将检查 HEAD 并将其与 HEAD~1 进行比较，解释该提交中的所有更改。

**何时使用：**
- 从团队成员拉取更改后
- 在推送之前审查你自己的工作
- 了解合并提交带来了什么

### 解释未提交的更改

在提交之前了解你的进行中更改：

```
/explain-changes for my uncommitted work
```

Cline 将 HEAD 与你的工作目录进行比较，解释所有修改的文件。

**何时使用：**
- 在暂存更改之前以确保它们完整
- 在长时间的编码会话之后以记住你更改了什么
- 在创建提交之前验证更改

### 解释暂存的更改

确切了解你要提交的内容：

```
/explain-changes for my staged changes
```

Cline 仅检查你用 `git add` 暂存的更改。

**何时使用：**
- 提交前的最终审查
- 当你暂存了一部分更改并想验证时
- 以确保你没有意外暂存意外的文件

### 解释特定提交

了解历史记录中的任何提交：

```
/explain-changes for commit abc123
```

或按提交消息：

```
/explain-changes for commit that added authentication
```

Cline 将找到提交并解释它更改了什么。

**何时使用：**
- 调查何时引入了错误
- 了解历史决策
- 学习功能是如何实现的

### 解释一系列提交

一次了解多个提交：

```
/explain-changes for last 3 commits
```

或特定范围：

```
/explain-changes from v1.0.0 to v1.1.0
```

Cline 比较端点并解释它们之间的所有更改。

**何时使用：**
- 了解发布中更改了什么
- 审查一系列相关提交
- 在离开项目后跟上进度

### 解释拉取请求

为任何 PR 获取 AI 解释：

```
/explain-changes for PR #42
```

Cline 使用 GitHub CLI 获取 PR 详细信息并解释更改。

**何时使用：**
- 审查其他人的 PR
- 在批准之前了解 PR
- 从开源项目的 PR 中学习
- 准备给予 PR 反馈

### 解释分支差异

比较任何两个分支：

```
/explain-changes between main and feature-branch
```

或查看功能分支上更改了什么：

```
/explain-changes for everything on my-feature that's not in main
```

**何时使用：**
- 在合并功能分支之前
- 了解分支之间的分歧
- 规划合并或变基策略
- 审查同事一直在做什么

### 解释对特定文件的更改

专注于特定文件或目录：

```
/explain-changes for src/auth in the last 5 commits
```

Cline 过滤差异以仅显示相关更改。

**何时使用：**
- 了解对特定模块的更改
- 跟踪对关键文件的修改
- 学习特定功能如何演变

### 解释标签以来的更改

了解自发布以来更改了什么：

```
/explain-changes since v2.0.0
```

Cline 将标签与 HEAD 进行比较并解释所有后续更改。

**何时使用：**
- 准备发布说明
- 了解自部署以来有什么新内容
- 识别更改日志的更改

### 解释合并提交

了解合并带来了什么：

```
/explain-changes for merge from feature-x
```

Cline 解释被合并的所有更改。

**何时使用：**
- 合并大型功能分支后
- 了解合并冲突解决方案更改了什么
- 审查其他人合并到 main 的内容

### 解释暂存的更改

审查你的 stash 中有什么：

```
/explain-changes for my stashed changes
```

Cline 检查 stash@{0} 并解释其内容。

**何时使用：**
- 在应用 stash 之前
- 决定是保留还是删除 stash
- 记住几天前你 stash 了什么

## 交互式注释

就像[解释更改](/features/explain-changes)按钮一样，生成的注释是完全交互式的：

### 回复注释

直接在任何注释线程中提出后续问题：

- "为什么要重构这个函数？"
- "这个新参数的目的是什么？"
- "这会导致任何破坏性更改吗？"
- "此更改向后兼容吗？"

AI 响应具有上下文意识的解释，既理解代码也理解更广泛的更改。

### 移动到主聊天

单击任何注释线程的标题区域，将该对话移入 Cline 的主聊天。这在以下情况下很有用：

- 你希望 Cline 进行额外的更改
- 讨论揭示了一些需要进一步调查的内容
- 你希望继续使用完整的 Cline 功能工作
- 审查评论激发了改进的想法

### generate_explanation 工具

在底层，`/explain-changes` 使用带有以下参数的 `generate_explanation` 工具：

| 参数 | 描述 | 示例 |
|-----------|-------------|---------|
| `title` | 差异视图的描述性标题 | "提交 abc123 中的更改" |
| `from_ref` | "之前"状态的 Git 引用 | `HEAD~1`、`main`、`origin/main` |
| `to_ref` | "之后"状态的 Git 引用（可选） | `HEAD`、`develop` |

如果省略 `to_ref`，工具将相对于工作目录进行比较。

## 更好解释的提示

1. **具体说明**：不要只使用 `/explain-changes`，告诉 Cline 你想要解释什么。"解释 PR #42 中的身份验证更改"比只说"解释 PR #42"提供更好的上下文。

2. **询问意图**：AI 不仅解释更改了什么，还可以解释为什么。提出后续问题，如"这在解决什么问题？"

3. **与其他命令链接**：在调查问题后使用 `/explain-changes` 以了解潜在修复，然后继续使用 Cline 实现改进。

4. **用于学习**：当接入新代码库时，对重要的 PR 或提交使用 `/explain-changes` 以了解功能是如何构建的。

## 相关功能

- [解释更改](/features/explain-changes) - 用于任务完成的基于按钮的版本
- [检查点](/features/checkpoints) - 启用解释更改按钮
- [@git 提及](/features/at-mentions/git-mentions) - 在你的提示中引用 git diff
