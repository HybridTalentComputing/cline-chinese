---
title: "构建您的第一个项目"
description: "在不到一分钟的时间内使用 Cline 构建您的第一个项目。"
---

准备好看到 Cline 的实际操作了吗？这个动手教程将带您在不到一分钟内构建一个网站。您将体验 Cline 如何理解您的需求、创建文件并根据您的反馈进行迭代——所有这些都是通过自然对话完成的。

到本指南结束时，您将构建一个可工作的网站，并学习与 Cline 合作的基础知识。

## 前置条件

- **已安装 Cline** 在您的编辑器中（[安装指南](/getting-started/installing-cline)）
- **已选择 AI 模型**（[模型设置](/getting-started/selecting-your-model)）
- **在编辑器中打开任何文件夹**（或创建一个新的空文件夹）

## 步骤 1：打开 Cline

点击编辑器侧边栏（左侧）中的 Cline 图标。聊天面板将打开。

<Info>
**快速提示：** 您也可以使用 `Cmd+Shift+P`（Mac）或 `Ctrl+Shift+P`（Windows/Linux）并搜索"Cline: Open In New Tab"
</Info>

## 步骤 2：给 Cline 一个任务

将此提示复制并粘贴到 Cline 的聊天中：

```
在单个 HTML 文件中创建一个简单的网站。它应该有：
- 一条欢迎消息，显示"Hello from Cline!"
- 彩色渐变背景
- 一个按钮，点击时会循环切换不同的颜色主题
- 现代、简洁的设计
- 所有 CSS 和 JavaScript 应该包含在同一个 HTML 文件中
```

<Frame>
  <img src="https://storage.googleapis.com/cline_public_images/chat-prompt.png" alt="Cline Chat Prompt"/>
</Frame>

按 Enter 键并观看 Cline 工作！

## 步骤 3：接下来会发生什么

Cline 将：

1. **创建单个文件：**
   - `index.html` - 一个包含嵌入 CSS 和 JavaScript 的完整网页

2. **请求批准**（除非您已启用自动批准）
   - 点击"批准"让 Cline 创建文件
   - 您可以先审查它计划做什么

3. **在几秒钟内完成任务**

## 步骤 4：查看您的网站

Cline 完成后：

1. **在编辑器的文件资源管理器中找到 `index.html`**
2. **右键点击它**并选择：
   - "Reveal in Finder/Explorer"然后双击在浏览器中打开
3. **点击按钮**查看颜色主题的变化！

## 尝试进行更改

在同一个聊天中，尝试询问：

```
添加一个计数器，显示按钮被点击了多少次
```

或

```
让欢迎消息在页面加载时淡入
```

Cline 会理解您之前对话的上下文，并相应地更新文件。

<Tip>
**您现在知道如何：**
- 用清晰的提示给 Cline 一个任务
- 审查和批准 Cline 的操作
- 在几秒钟内构建一个完整的项目
- 迭代和改进现有的工作
</Tip>

## 下一步

既然您已经体验了 Cline 的能力，探索更多内容：

<CardGroup cols={2}>
<Card title="@ 提及" href="/features/at-mentions/overview" icon="at">
在提示中引用特定的文件、文件夹和 URL
</Card>

<Card title="计划与执行模式" href="/features/plan-and-act" icon="diagram-project">
掌握规划与执行，以应对复杂任务
</Card>

<Card title="Cline 规则" href="/features/cline-rules" icon="list-check">
设置项目特定的指南以获得一致的结果
</Card>

<Card title="提示工程指南" href="/prompting/prompt-engineering-guide" icon="wand-magic-sparkles">
学习编写能获得最佳结果的提示
</Card>
</CardGroup>

## 需要帮助？

- **卡住了？** 尝试在聊天中使用 `/new` 重新开始
- **发现了错误？** 使用 `/reportbug` 帮助我们改进
- **有问题？** 加入我们的 [Discord 社区](https://discord.gg/cline)
