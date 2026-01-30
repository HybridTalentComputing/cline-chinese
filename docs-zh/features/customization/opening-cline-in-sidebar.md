---
title: "在右侧边栏打开 Cline"
description: "了解如何在 VS Code 和 Cursor 中打开右侧边栏的 Cline"
---

默认情况下，当你首次安装 Cline 时，它会出现在 VS Code 的左侧边栏中，与文件资源管理器和其他扩展一起。然而，为了获得更好的编码体验，我们建议将 Cline 移动到右侧边栏。这允许你在左侧边栏中保持项目文件可见，同时在右侧与 Cline 聊天，在 Cline 处理你的项目时给你代码库的完全可见性。

## VS Code

要在右侧边栏中打开 Cline：

<Steps>
  <Step title="对齐扩展视图">
    确保你的扩展视图垂直对齐到左侧
  </Step>
  <Step title="打开右侧视图">
    单击 VS Code 中打开右侧面板的按钮（通常用于打开 GitHub Copilot 聊天）。可选择使用 `Option + CMD/Ctrl + B` 快捷键。
  </Step>
  <Step title="拖动 Cline 图标">
    将 Cline 图标拖动到该右侧视图顶部的导航面板中
  </Step>
</Steps>

<Frame>
	<img
		src="https://storage.googleapis.com/cline_public_images/vscode_right_view.gif"
		alt="VS Code Right Sidebar Setup"
	/>
</Frame>

## Cursor

要在右侧边栏中打开 Cline：

<Steps>
  <Step title="对齐扩展">
    Cursor 默认使用水平活动栏来优化 AI 聊天界面的空间（[详见此处](https://cursor.com/docs/configuration/migrations/vscode#activity-bar-orientation)）。要切换到垂直模式：
    
    1. 打开命令面板（`CMD/Ctrl + Shift + P`）
    2. 搜索"Preferences: Open Settings (UI)"
    3. 搜索 `workbench.activityBar.orientation`
    4. 将值设置为 `vertical`
    5. 重启 Cursor 以使更改生效
  </Step>
  <Step title="打开 AI 面板">
    单击 Cursor 立方体图标按钮（AI 面板）以打开 Cursor 的代理（右侧视图面板）
  </Step>
  <Step title="将 Cline 拖动到 AI 面板侧边栏">
    将 Cline 图标直接拖动到 AI 面板侧边栏中。
  </Step>
</Steps>

<Frame>
	<img
		src="https://storage.googleapis.com/cline_public_images/Cursor-sidebar.gif"
		alt="Cursor Right Sidebar Setup"
	/>
</Frame>

设置完成后，Cline 将在右侧加载，你可以正常使用它。
