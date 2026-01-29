---
title: "远程浏览器支持"
description: "远程浏览器支持允许 Cline 利用远程 Chrome 实例，利用与某些 Web 开发测试用例相关的身份验证令牌和会话 Cookie。"
---

Cline 中的远程浏览器功能允许 AI 助手通过受控的浏览器实例直接与 Web 内容交互。这启用了几个强大的功能：

-   查看和与网站交互
-   测试本地运行的 Web 应用程序
-   监控控制台日志和错误
-   执行浏览器操作，如点击、输入和滚动

## Cline 中的远程浏览器

### 什么是远程浏览器？

远程浏览器允许 Cline 直接查看和与网站交互。此功能使 Cline 能够：

-   访问网站并查看其内容
-   测试你本地运行的 Web 应用程序
-   填写表单并点击元素
-   捕获它看到的截图
-   滚动页面以查看更多内容

### 如何使用远程浏览器

#### 基本命令

你可以用简单的指令要求 Cline 使用浏览器：

-   **打开网站**："Use the browser to check the website at [https://example.com](https://example.com/)"
-   **点击元素**："Click the login button"
-   **输入文本**："Type 'Hello world' in the search box"
-   **滚动页面**："Scroll down to see more content"
-   **关闭浏览器**："Close the browser now"

#### 示例工作流

**测试 Web 应用程序：**

```javascript
Can you start my React app with "npm start" and then check if it's working properly at http://localhost:3000?
```

**分析网站：**

```javascript
Can you visit https://example.com and tell me what you think about its design and layout?
```

**填写表单：**

```javascript
Please go to https://example.com/contact, fill out the contact form with some test data, and submit it.
```

### 重要事项

#### 一次只能使用一个浏览器

Cline 一次只能使用一个浏览器。如果你想访问不同的网站，可以：

-   要求 Cline 在同一浏览器会话中导航到新 URL
-   要求 Cline 关闭当前浏览器并打开新的

#### 在使用其他工具之前必须关闭浏览器

如果你希望 Cline 在使用浏览器后编辑文件或运行命令，必须先要求它关闭浏览器：

```javascript
Close the browser and then update the CSS file to fix the alignment issue we saw.
```

#### Cline 看到什么

浏览器具有固定的视口大小（默认为 900x600 像素），类似于小型笔记本电脑屏幕。Cline 会在每次操作后分享截图，以便你看到它看到的确切内容。

#### 控制台日志

Cline 会捕获浏览器控制台日志，这对调试 Web 应用程序很有帮助。这些日志会包含在每次截图中。

### 常见用例

-   **Web 开发**：测试你的网站和 Web 应用程序
-   **UI/UX 审查**：获取关于网站设计和可用性的反馈
-   **内容研究**：让 Cline 浏览网站以收集信息
-   **表单测试**：验证表单是否正常工作
-   **响应式设计测试**：检查网站在不同屏幕尺寸下的外观

### 故障排除

-   **如果网站无法加载**：尝试提供带有 http:// 或 https:// 前缀的直接 URL
-   **如果点击不起作用**：尝试更精确地描述元素位置
-   **如果浏览器似乎卡住**：要求 Cline 关闭浏览器并重试

### 在 WSL 中使用远程浏览器和 VS Code

在 WSL 中运行 VS Code 时，你需要配置 Windows 以允许 WSL 连接到 Chrome。按照以下步骤操作：

#### 以管理员身份打开 PowerShell 并运行：

```powershell
# 允许 WSL 连接到 Chrome 的调试端口
New-NetFirewallRule -DisplayName "WSL Chrome Debug" -Direction Inbound -LocalPort 9222 -Protocol TCP -Action Allow
```

#### 在 VS Code 中配置 Cline：

1. 打开 VS Code 设置
2. 搜索 "Cline: Chrome Executable Path"
3. 将值设置为你的 Chrome 可执行文件的路径（例如，`C:\Program Files\Google\Chrome\Application\chrome.exe`）

Cline 现在应该能够从 WSL 内部使用远程浏览器功能。
