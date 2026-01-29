---
title: "Git 引用"
sidebarTitle: "Git 引用"
---

Git 引用让你可以将仓库的历史记录和更改直接带入与 Cline 的对话中。你可以使用 `@git-changes` 引用未提交的更改或使用 `@[commit-hash]` 引用特定提交。

当你在聊天中输入 `@` 时，你可以从菜单中选择"Git 更改"或直接输入 `@git-changes`。对于特定提交，输入 `@` 后跟提交哈希（至少 7 个字符）。Cline 将立即看到 git 状态、差异、提交消息和其他相关信息。

当我试图理解代码更改或排查最近提交引入的问题时，我经常使用 git 引用。与其试图复制和粘贴差异或提交日志，不如直接询问：

```
我认为这个提交破坏了我们的身份验证流程：@a1b2c3d

你能解释更改了什么以及为什么可能导致问题吗？
```

这给了 Cline 完整的提交信息，包括提交消息、作者、日期和完整差异。然后 Cline 可以准确分析更改的内容以及它如何影响代码库的其他部分。

当你正在处理更改并希望在提交之前获得反馈时，`@git-changes` 引用非常完美：

```
这是我当前的更改：@git-changes

我正在尝试为用户配置文件实现一个新功能。我的方法有意义吗？
有什么潜在问题或你建议的改进吗？
```

这向 Cline 显示所有未提交的更改，包括新文件、修改文件和它们的差异。然后 Cline 可以审查你的更改并提供关于你实现的反馈。

当与文件引用结合时，git 引用特别强大。当我调查错误时，我经常同时引用两者：

```
我认为这个提交引入了一个错误：@a1b2c3d

这是当前的实现：@/src/components/Auth.jsx

如何在保持预期功能的同时修复这个问题？
```

下次你处理代码更改或调查问题时，尝试使用 git 引用而不是手动描述或复制更改。你会获得更准确的帮助，因为 Cline 可以准确看到更改了什么以及在什么上下文中。

## 底层工作原理

当你在消息中使用 git 引用时，幕后发生的事情如下：

### 对于 Git 更改（`@git-changes`）

1. 当你发送消息时，Cline 检测文本中的 `@git-changes` 模式
2. 扩展运行 git 命令以获取仓库的当前工作状态
3. 它捕获 `git status` 和 `git diff` 的输出来查看所有未提交的更改
4. 此信息以结构化格式附加到你的消息中：

    ```
    <git_working_state>
    On branch main
    Changes not staged for commit:
      modified: src/components/Button.jsx
      modified: src/styles/main.css

    [包含所有更改的完整差异输出]
    </git_working_state>
    ```

### 对于特定提交（`@[commit-hash]`）

1. 当你发送消息时，Cline 检测 `@` 后跟提交哈希模式
2. 扩展运行 `git show` 和相关命令以获取该提交的信息
3. 它检索提交消息、作者、日期和完整差异
4. 此信息以结构化格式附加到你的消息中：

    ```
    <git_commit hash="a1b2c3d">
    commit a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t
    Author: Developer Name <dev@example.com>
    Date: Mon May 20 14:30:45 2025 -0700

    Fix authentication bug in login form

    [显示提交中所有更改的完整差异输出]
    </git_commit>
    ```

每当你使用 git 引用时，这个过程自动发生，向 AI 提供对代码更改的完全可见性，而无需你复制和粘贴差异或提交日志。
