---
title: "键盘快捷键"
sidebarTitle: "键盘快捷键"
---

在不把手离开键盘的情况下访问 Cline 的 AI 帮助，以加快你的工作流。

<Tip>
**你需要的一个快捷键：** `Ctrl+'` (Windows/Linux) 或 `Cmd+'` (macOS)

这个上下文感知的快捷键处理你最常见的需求：
- **选定文本时：** 将代码添加到 Cline 聊天
- **未选定时：** 聚焦聊天输入

掌握这一个快捷键，你就完成了 90%。
</Tip>

## 默认快捷键

Cline 默认只有最少的快捷键，因此它们不会与你现有的 VSCode 设置冲突：

| 快捷键 | Windows/Linux | macOS | 功能 |
| -------- | ------------- | ----- | ------------ |
| **添加到聊天 / 聚焦输入** | `Ctrl+'` | `Cmd+'` | 上下文感知：添加选定代码或聚焦聊天 |

就是这样！其他所有内容都可供你自定义。

## 快速工作流示例

以下是键盘快捷键如何融入真实的编码工作流：

### 调试和修复工作流

1. **在代码中找到错误** → VSCode 高亮显示它
2. **选择有问题的代码** → `Shift+箭头` 或 `Ctrl+L` / `Cmd+L`
3. **发送给 Cline** → `Ctrl+'` / `Cmd+'`
4. **寻求帮助** → 输入你的问题，按 `Enter`

### 代码审查工作流

1. **审查函数** → 使用 `Ctrl+L` / `Cmd+L` 选择它
2. **获取 AI 审查** → `Ctrl+'` / `Cmd+'` 然后询问"审查这个"
3. **迭代** → 应用建议并重复

### 终端集成工作流

1. **打开终端** → 按 `` Ctrl+` `` / `` Cmd+` ``
2. **运行你的命令** → 在终端中执行
3. **捕获输出** → 按 `Alt+T`（分配快捷键后）
4. **获取帮助** → 让 Cline 解释错误或输出

<Info>
**专业提示：** 为 `cline.addTerminalOutputToChat` 命令分配 `Alt+T` 以快速捕获终端输出。没有快捷键，你仍然可以在终端中右键单击并选择"添加到 Cline" - 但对于频繁的调试工作流，键盘方法要快得多。
</Info>

## 自定义快捷键

想要为更多 Cline 命令分配快捷键？方法如下：

**步骤 1：** 打开 VSCode 的键盘快捷键编辑器
- 按 `Ctrl+K Ctrl+S` (Windows/Linux) 或 `Cmd+K Cmd+S` (macOS)
- 或：**文件 → 首选项 → 键盘快捷键**

**步骤 2：** 搜索"Cline"

**步骤 3：** 单击任何命令旁边的 ✏️ 图标

**步骤 4：** 按下你想要的组合键，然后按 `Enter`

<Warning>
**避免冲突：** 检查你的快捷键不会覆盖重要的 VSCode 命令。快捷键编辑器会警告你冲突。
</Warning>

## 可用命令参考

<Accordion title="任务管理命令">

这些命令帮助你导航和管理 Cline 任务：

| 命令 ID | 描述 | 建议的快捷键 |
| ---------- | ----------- | ------------------ |
| `cline.plusButtonClicked` | 开始新任务 | `Ctrl+Shift+N` / `Cmd+Shift+N` |
| `cline.historyButtonClicked` | 打开任务历史 | `Ctrl+Shift+H` / `Cmd+Shift+H` |
| `claude-dev.SidebarProvider.focus` | 打开 Cline 侧边栏 | `Ctrl+Shift+L` / `Cmd+Shift+L` |

**注意：** `claude-dev` 前缀是由于历史原因 - 它与 Cline 一起工作。

</Accordion>

<Accordion title="代码交互命令">

直接与你的代码一起工作：

| 命令 ID | 描述 | 建议的快捷键 |
| ---------- | ----------- | ------------------ |
| `cline.addToChat` | 将选定代码添加到聊天 | `Ctrl+'` / `Cmd+'` ⭐ (默认) |
| `cline.focusChatInput` | 聚焦聊天输入 | `Ctrl+'` / `Cmd+'` ⭐ (默认) |
| `cline.explainCode` | 解释选定代码 | `Ctrl+Shift+E` / `Cmd+Shift+E` |
| `cline.improveCode` | 建议代码改进 | `Ctrl+Shift+I` / `Cmd+Shift+I` |

⭐ 这些共享相同的快捷键 - 它是上下文感知的！

</Accordion>

<Accordion title="终端集成命令">

将 Cline 与你的终端连接：

| 命令 ID | 描述 | 建议的快捷键 |
| ---------- | ----------- | ------------------ |
| `cline.addTerminalOutputToChat` | 将终端输出添加到 Cline | `Alt+T` |

**提示：** 在运行命令后使用它以获取解释输出或修复错误的帮助。

</Accordion>

<Accordion title="设置和配置命令（高级）">

这些命令打开 Cline 的配置面板。大多数用户通过侧边栏按钮访问它们，但键盘快捷键对于以下情况可能很有用：

- **频繁的 MCP 服务器开发者**，他们不断调整服务器配置
- **演示/演示场景**，你需要快速、仅键盘导航
- **无障碍工作流**，最小化鼠标使用

| 命令 ID | 描述 | 建议的快捷键 |
| ---------- | ----------- | ------------------ |
| `cline.settingsButtonClicked` | 打开 Cline 设置 | `Ctrl+Alt+,` / `Cmd+Opt+,` |
| `cline.mcpButtonClicked` | 打开 MCP 服务器配置 | `Ctrl+Alt+M` / `Cmd+Opt+M` |
| `cline.accountButtonClicked` | 打开账户设置 | `Ctrl+Alt+A` / `Cmd+Opt+A` |
| `cline.openWalkthrough` | 打开演练指南 | (不推荐) |

**我们的看法：** 除非你不断调整设置或构建 MCP 服务器，否则侧边栏按钮更方便。但如果你发现自己频繁打开这些面板，快捷键可以节省时间。

</Accordion>

## 关于"使用 Cline 修复"？

<Warning>
**你不能为"使用 Cline 修复"分配键盘快捷键**

此命令仅出现在 VSCode 在你的代码中检测到错误时的**灯泡菜单**（💡）中。它需要错误上下文才能工作，因此它不作为独立命令可用。

**解决方法：**
- 单击错误旁边出现的 💡 灯泡图标
- 或选择带有错误的代码并使用 `Ctrl+'` / `Cmd+'` 让 Cline 修复它们
- 或右键单击并选择"添加到 Cline"
</Warning>

在我们的[代码命令文档](/features/commands-and-shortcuts/code-commands)中了解有关代码操作的更多信息。

## 最佳实践

<Tip>
**从简单开始**

不要在第一天尝试记住 20 个快捷键。从以下开始：
1. `Ctrl+'` / `Cmd+'`（必不可少的一个）
2. 根据你的实际使用模式添加 1-2 个更多
3. 随着时间建立肌肉记忆
</Tip>

**明智地选择快捷键：**
- **符合人体工学：** 使用舒适的组合键
- **创建模式：** 将相关命令分组（例如，所有 Cline 快捷键使用 `Ctrl+Shift+...`）
- **避免冲突：** 不要覆盖 VSCode 基本命令如 `Ctrl+C` 或 `Ctrl+S`
- **使用修饰键：** 组合 `Ctrl`/`Cmd` + `Shift` + `Alt` 以减少冲突

**建立习惯：**
- 连续一周使用快捷键以建立肌肉记忆
- 保留自定义快捷键的笔记，直到它们成为自动的
- 每月查看一次，看看你的工作流是否已更改

## 发现命令

不确定有哪些命令可用？使用 VSCode 的命令面板：

1. 按 `Ctrl+Shift+P` / `Cmd+Shift+P`
2. 输入"Cline"进行过滤
3. 浏览所有可用命令
4. 为你的收藏分配快捷键

<Frame>
	<img
		src="https://storage.googleapis.com/cline_public_images/docs/assets/editor-integration.png"
		alt="Editor Integration Overview"
	/>
</Frame>

---

<Info>
**记住：** 目标不是记住每一个可能的快捷键。首先掌握 `Ctrl+'` / `Cmd+'`，然后逐渐为你经常使用的命令添加快捷键。质量胜于数量！
</Info>
