---
title: "工作流快速入门"
sidebarTitle: "快速入门"
description: "创建你的第一个 Cline 工作流的分步指南。"
---

在本教程中，你将创建一个强大的工作流，用于自动化审查 GitHub 拉取请求的过程。此示例演示了如何将 CLI 工具、文件分析和用户交互组合成一个无缝的过程。

### 先决条件

*   你已安装 Cline。
*   你已安装并验证了 [GitHub CLI (`gh`)](https://cli.github.com/)。
*   你已打开一个 Git 仓库，其中有一个要测试的拉取请求。

## 创建拉取请求审查工作流

此工作流将自动化获取 PR 详细信息、分析代码更改问题以及起草审查注释的过程。

<Steps>
  <Step title="创建工作流文件">
    首先，为你的项目特定工作流创建目录结构。

    1.  在项目根目录中，创建一个名为 `.clinerules` 的新文件夹。
    2.  在 `.clinerules` 中，创建另一个名为 `workflows` 的文件夹。
    3.  最后，在 `workflows` 文件夹内创建一个名为 `pr-review.md` 的新文件。
  </Step>

  <Step title="编写工作流内容">
    打开 `pr-review.md` 文件并添加以下内容。此工作流将收集 PR 详细信息、分析更改并帮助你提交审查。

    ````markdown pr-review.md
    # 拉取请求审查者

    此工作流帮助我通过分析更改和起草审查来审查拉取请求。

    ## 1. 收集 PR 信息
    首先，我需要了解此 PR 的内容。我将获取标题、描述和更改文件列表。

    ```bash
    gh pr view PR_NUMBER --json title,body,files
    ```

    ## 2. 检查修改的文件
    现在我将检查差异以了解具体的代码更改。

    ```bash
    gh pr diff PR_NUMBER
    ```

    ## 3. 分析更改
    我将分析代码更改是否存在：
    *   **错误**：逻辑错误或边缘情况。
    *   **性能**：低效的循环或操作。
    *   **安全性**：漏洞或不安全的做法。

    ## 4. 确认评估
    基于我的分析，我将展示我的发现并询问你希望如何继续。

    ```xml
    <ask_followup_question>
      <question>我已经审查了 PR #PR_NUMBER。这是我的评估：

    [在此处插入分析]

    你希望我批准此 PR、请求更改还是只是留下评论？</question>
      <options>["批准", "请求更改", "评论", "不做任何事"]</options>
    </ask_followup_question>
    ```

    ## 5. 执行审查
    最后，我将根据你的决定执行审查命令。

    ```bash
    # 如果批准：
    gh pr review PR_NUMBER --approve --body "对我来说看起来不错！[分析摘要]"

    # 如果请求更改：
    gh pr review PR_NUMBER --request-changes --body "请解决以下问题：[问题列表]"

    # 如果评论：
    gh pr review PR_NUMBER --comment --body "[评论]"
    ```
    ````

    <Note>
      当你运行此工作流时，你将把 `PR_NUMBER` 替换为你要审查的拉取请求的实际编号（例如，`/pr-review.md 123`）。
    </Note>
  </Step>

  <Step title="运行工作流">
    现在你已准备好运行你的新工作流。

    1.  打开 Cline 聊天面板。
    2.  输入 `/pr-review.md` 后跟 PR 编号（例如，`/pr-review.md 42`）并按 Enter。
    3.  Cline 将获取 PR 详细信息、分析代码，并在提交审查之前向你展示其发现。

    <Tip>
      当 Cline 执行命令（如 `gh pr view`）时，它可能会向你显示输出并暂停。你需要单击**运行时继续**按钮以允许 Cline 分析内容并继续工作流。
    </Tip>
  </Step>
</Steps>

### 其他常见用例

这只是一个示例。你可以为各种任务创建工作流，例如：

*   **创建组件**：自动化新文件的样板（如 React 组件或 API 端点）。
*   **运行测试**：创建一个运行你的测试套件并汇总结果的工作流。
*   **部署应用程序**：使用 `docker` 和 `kubectl` 等工具自动化你的部署管道。
*   **重构代码**：逐步引导 Cline 完成复杂的重构过程。

探索 Cline 的能力和你自己的开发流程，以找到可以转换为高效工作流的重复性任务。
