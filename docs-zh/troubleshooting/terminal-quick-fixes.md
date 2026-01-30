---
title: "终端快速修复"
sidebarTitle: "终端快速修复"
description: "常见终端问题的快速解决方案"
---

**以下是常见修复列表，从最适用的开始：**

-   **切换到 bash**（解决大多数实例）

    1. 在 Cline 中，左键单击聊天窗口右上角的 **设置**按钮
    2. 进入 **设置**窗口后，左键单击左列中的 **"终端设置"**选项卡
    3. 导航到 **"默认终端配置文件"**并从下拉菜单中选择 **"bash"**

-   **增加超时**

    1. 在 Cline 中，左键单击聊天窗口右上角的 **设置**按钮
    2. 进入 **设置**窗口后，左键单击左列中的 **"终端设置"**选项卡
    3. 导航到"Shell integration timeout (seconds)"并在文本字段中输入 **"10"**

-   **禁用终端重用**

    1. 在 Cline 中，左键单击聊天窗口右上角的 **设置**按钮
    2. 进入 **设置**窗口后，左键单击左列中的 **"终端设置"**选项卡
    3. 查找 **"启用激进的终端重用"**，并**取消选中**此选项

## 特定于平台的修复

### macOS + Oh-My-Zsh

```bash
# 为 VSCode 创建最小配置
echo 'export TERM=xterm-256color' > ~/.zshrc-vscode
echo 'export PAGER=cat' >> ~/.zshrc-vscode
```

### Windows PowerShell

```powershell
# 以管理员身份运行
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### WSL

-   从 WSL 打开文件夹：`code .`
-   在 Cline 设置中选择 **"WSL Bash"**，在 **"终端设置"**下
-   将 **"Shell integration timeout (seconds)"**增加到 **15**

## 完整指南

有关详细故障排除，请参阅[完整终端故障排除指南](/troubleshooting/terminal-integration-guide)。
