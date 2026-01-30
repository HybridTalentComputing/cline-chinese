---
title: "@ 引用概述"
sidebarTitle: "概述"
---

@ 引用是 Cline 最强大的功能之一，让你无缝地将外部上下文带入你的对话。而不是复制和粘贴代码、错误消息或文档，你可以简单地用 @ 符号引用它们。

<Frame>
	<img src="https://storage.googleapis.com/cline_public_images/docs/assets/at-mentions.png" alt="@ Mentions Overview" />
</Frame>

当你在聊天输入中输入 `@` 时，Cline 显示可用引用类型的菜单。这些引用让你可以在对话中直接引用文件、文件夹、问题、终端输出、git 更改，甚至 Web 内容。

## 可用的 @ 引用

Cline 支持几种类型的 @ 引用，每种旨在为你的对话带来不同类型的上下文：

<Columns cols={2}>
  <Card title="文件引用" icon="file" href="/features/at-mentions/file-mentions">
    使用 `@/path/to/file` 引用工作区中的任何文件。Cline 看到完整的文件内容，包括导入、相关
    函数和周围上下文。
  </Card>

{" "}

<Card title="文件夹引用" icon="folder" href="/features/at-mentions/folder-mentions">
	使用 `@/path/to/folder/` 引用整个目录。Cline 看到文件夹结构和所有文件内容，非常适合
	理解多个文件之间的复杂交互。
</Card>

{" "}

<Card title="问题引用" icon="triangle-exclamation" href="/features/at-mentions/problem-mentions">
	使用 `@problems` 向 Cline 显示工作区中的所有错误和警告。Cline 看到包含文件位置
	和错误消息的完整列表。
</Card>

{" "}

<Card title="终端引用" icon="terminal" href="/features/at-mentions/terminal-mentions">
	使用 `@terminal` 分享你的最近终端输出。Cline 看到保持格式的完整输出，非常适合
	调试构建错误或测试失败。
</Card>

{" "}

<Card title="Git 引用" icon="code-branch" href="/features/at-mentions/git-mentions">
	使用 `@git-changes` 引用未提交的更改或使用 `@[commit-hash]` 引用特定提交。Cline 看到完整的差异、
	提交消息和其他相关信息。
</Card>

  <Card title="URL 引用" icon="globe" href="/features/at-mentions/url-mentions">
    使用 `@https://example.com` 引用 Web 内容。Cline 获取并看到完整的网页内容，非常适合
    引用文档或 GitHub 问题。
  </Card>
</Columns>

## @ 引用的重要性

@ 引用通过以下方式改变你与 Cline 的交互方式：

1. **消除复制粘贴**：不再需要复制和粘贴代码、错误消息或终端输出。只需直接引用它们。

2. **保留上下文**：Cline 看到完整的上下文，包括可能相关的导入、相关函数和周围代码。

3. **维护格式**：终端输出、错误消息和 Web 内容保持其格式，使其更易于理解。

4. **启用复杂工作流**：组合多个 @ 引用向 Cline 提供问题的完整画面：

    ```
    我遇到了这些错误：@problems

    这是我的组件：@/src/components/Form.jsx
    还有 API 端点：@/src/api/users.js

    提交时发生错误：@terminal

    我认为这个提交可能导致了它：@a1b2c3d
    ```

## 开始使用

要使用 @ 引用：

1. 在聊天输入中输入 `@`
2. 从菜单中选择引用类型或继续输入
3. 对于文件和文件夹，浏览你的工作区结构
4. 像往常一样发送你的消息

Cline 将自动处理引用并将引用的内容包含在发送给 AI 的上下文中。

尝试在与 Cline 的下一个对话中使用 @ 引用 - 你会惊讶于当你可以无缝引入外部上下文时，你的交互变得更加高效和有效。

## 底层工作原理

当你在消息中使用 @ 引用时，在幕后发生了一个复杂的过程：

1. **检测**：当你发送消息时，Cline 使用正则表达式扫描文本中的 @ 引用模式
2. **处理**：对于每个检测到的引用，Cline：
    - 确定引用类型（文件、文件夹、问题、终端、git、URL）
    - 获取相关内容（文件内容、终端输出等）
    - 适当地格式化内容
3. **增强**：原始消息用结构化数据增强：

    ```
    你的原始消息包含 @/path/to/file

    <file_content path="/path/to/file">
    [完整文件内容]
    </file_content>
    ```

4. **上下文包含**：此增强消息及其所有嵌入内容被发送到 AI 模型
5. **无缝响应**：AI 现在"看到"所有引用的内容，就像你手动复制和粘贴它一样

每当使用 @ 引用时，整个过程自动且无缝地发生，向 AI 提供完整的上下文，而无需你手动复制任何内容。

每种类型的 @ 引用都有自己的特定实现细节，你可以在它们各自的文档页面中找到。
