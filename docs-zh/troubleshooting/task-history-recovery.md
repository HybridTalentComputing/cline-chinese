---
title: "任务历史恢复指南"
sidebarTitle: "任务历史恢复"
description: "如何恢复和重建你的 Cline 任务历史"
---

有时当你更新 Cline 或某些设置更改时，你可能会失去对先前任务的访问权限。本指南将帮助你恢复和重建你的 Cline 任务历史，以便重新访问重要的对话和工作。

<Tip>
大多数情况可以通过运行内置恢复命令解决。
</Tip>

## 快速恢复

<Steps>
	<Step title="打开命令面板">
	按 `Cmd/Ctrl + Shift + P` 打开命令面板。
	</Step>
	<Step title="运行恢复命令">
	输入 **"Cline: Reconstruct Task History"**（Cline：重建任务历史）并选择它。
	</Step>
	<Step title="确认操作">
	将出现确认提示。单击 **Yes**（是）继续。
	</Step>
	<Step title="等待重建">
	Cline 将扫描你的任务文件夹并重建历史索引。
	</Step>
	<Step title="验证恢复">
	检查你的历史面板以确认任务已恢复。
	</Step>
</Steps>

## Cline 存储数据的位置

### 存储路径

<Tabs>
	<Tab title="VS Code">
		```bash
		# macOS
		~/Library/Application Support/Code/User/globalStorage/saoudrizwan.claude-dev/
		# Windows
		%APPDATA%\Code\User\globalStorage\saoudrizwan.claude-dev\
		# Linux
		~/.config/Code/User/globalStorage/saoudrizwan.claude-dev/
		```
	</Tab>
	<Tab title="JetBrains">
		```bash
		# macOS
		~/Library/Application Support/JetBrains/<IDE>/globalStorage/saoudrizwan.claude-dev/
		# Windows
		%APPDATA%\JetBrains\<IDE>\globalStorage\saoudrizwan.claude-dev\
		# Linux
		~/.config/JetBrains/<IDE>/globalStorage/saoudrizwan.claude-dev/
		```
	</Tab>
</Tabs>

对于 VS Code Insiders，将 `Code` 替换为 `Code - Insiders`。对于 JetBrains IDE，将 `<IDE>` 替换为你的特定 IDE 名称（例如，`IntelliJIdea2023.3`、`PyCharm2023.3`、`WebStorm2023.3`）。

### 目录结构

```
saoudrizwan.claude-dev/
├── state/
│   ├── taskHistory.json          # 主历史索引
│   └── taskHistory.backup.*.json # 备份
├── tasks/
│   └── <task-id>/                # 单个任务数据
│       ├── api_conversation_history.json
│       ├── ui_messages.json
│       └── task_metadata.json
└── checkpoints/
    └── <workspace-hash>/         # 每个工作区的检查点存储
        └── .git/                 # 用于快照的影子 Git 仓库
```

`taskHistory.json` 文件只是一个索引。实际的对话数据位于 `tasks/` 下的各个任务文件夹中。

## 使用恢复命令

恢复命令扫描所有任务文件夹并从头重建历史索引。

它的作用：

1. 备份你当前的 `taskHistory.json`
2. 扫描 `tasks/` 目录
3. 从每个任务文件夹读取对话数据
4. 重新计算 token 使用和成本
5. 创建新的 `taskHistory.json`

```mermaid
graph LR
    A[备份当前] --> B[扫描 tasks/]
    B --> C[读取每个任务]
    C --> D[重建索引]
    D --> E[完成]
```

<Warning>
恢复命令通过从现有任务文件夹读取数据来重建索引。如果 `tasks/` 目录或单个任务文件夹已被永久删除，则无法恢复相关数据。
</Warning>

## 手动恢复

### 从备份恢复

Cline 自动创建备份。在 `state/` 文件夹中找到它们：

<Tabs>
	<Tab title="VS Code">
		```bash
		# macOS/Linux
		cd ~/.config/Code/User/globalStorage/saoudrizwan.claude-dev/state/
		ls taskHistory.backup.*.json

		# 选择最新的一个并恢复它
		cp taskHistory.backup.1234567890.json taskHistory.json
		```
	</Tab>
	<Tab title="JetBrains">
		```bash
		# macOS
		cd ~/Library/Application\ Support/JetBrains/<IDE>/globalStorage/saoudrizwan.claude-dev/state/
		ls taskHistory.backup.*.json

		# 选择最新的一个并恢复它
		cp taskHistory.backup.1234567890.json taskHistory.json
		```
	</Tab>
</Tabs>

### 迁移到新计算机

切换到新计算机？你可以带上所有 Cline 对话。无论你使用的是 VS Code 还是 JetBrains IDE，过程都是相同的。

<Steps>
	<Step title="定位并复制你的 Cline 数据">
	在你的**旧计算机**上，使用[上述存储路径](#存储路径)找到 `saoudrizwan.claude-dev` 文件夹并复制整个文件夹。
	</Step>
	<Step title="设置你的新计算机">
	在你的**新计算机**上，安装你的 IDE（VS Code 或 JetBrains）和 Cline 扩展。
	</Step>
	<Step title="关闭你的 IDE">
	在继续之前确保你的 IDE 已完全关闭。
	</Step>
	<Step title="传输你的数据">
	将 `saoudrizwan.claude-dev` 文件夹粘贴到新计算机上的相同存储路径。
	</Step>
	<Step title="启动并验证">
	打开你的 IDE。你的任务历史现在应该出现在 Cline 中。
	</Step>
</Steps>

<Info>
数据格式在所有操作系统中都是相同的——跨平台迁移（例如，Windows → macOS）无需任何额外步骤即可工作。
</Info>

## 常见问题

以下是一些常见问题及其解决方案：

### VS Code 更新后历史为空
从命令面板运行 **"Cline: Reconstruct Task History"**（Cline：重建任务历史）。如果这不起作用，检查是否有备份文件可以恢复。

### 重新安装 VS Code 后历史丢失
VS Code 通常在卸载时保留扩展数据。只需重新安装 Cline 并运行恢复命令。

### "未找到任务"错误
当 `tasks/` 文件夹为空或缺失时会发生这种情况。常见原因：

- VS Code 数据已被完全清除
- 你查看的是错误的 VS Code 安装（标准版 vs Insiders）
- 文件夹被手动删除

检查你的 IDE 的正确存储路径并验证文件夹是否存在。

### 恢复运行但某些任务缺失
损坏的任务文件夹在恢复期间被跳过。该命令将显示恢复了多少任务 vs 跳过了多少。检查错误消息以获取有关哪些任务无法恢复的详细信息。

## 需要额外帮助？

如果你需要帮助，你可以：

1. **在 [cline/cline](https://github.com/cline/cline/issues) 上打开 GitHub 问题**
2. **在我们的 Discord 服务器上寻求帮助** - 加入我们的社区以获得更快的支持

报告问题时，请包括：

- 你的操作系统和 IDE（VS Code 或 JetBrains IDE 名称/版本）
- Cline 版本
- 数据丢失之前发生的情况
- 任何错误消息
- **任务导出数据**：包括来自受影响任务文件夹的相关 JSON 文件（例如，`api_conversation_history.json`、`ui_messages.json`、`task_metadata.json`）以帮助我们了解出了什么问题
