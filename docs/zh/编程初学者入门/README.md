# Cline 入门指南 | 新手开发者

欢迎来到 Cline！这份指南将帮助您完成设置，开始使用 Cline 创建您的第一个项目。

## 您需要准备的事项

开始之前，请确保您准备好以下内容：

- **VS Code**：一款免费且强大的代码编辑器。
    - [下载 VS Code](https://code.visualstudio.com/)
- **开发工具**：编码所需的基本软件（如 Homebrew、Node.js、Git 等）。
    - 请参考我们的 [安装必备开发工具](installing-dev-essentials.md) 指南，借助 Cline 的帮助完成工具安装（在完成当前设置后）
    - Cline 将引导您完成所需所有工具的安装
- **Cline 项目文件夹**：用于存放所有 Cline 项目的专用文件夹。
    - 在 macOS 上：在您的 Documents 文件夹中创建一个名为 "Cline" 的文件夹
        - 路径：`/Users/[your-username]/Documents/Cline`
    - 在 Windows 上：在您的 Documents 文件夹中创建一个名为 "Cline" 的文件夹
        - 路径：`C:\Users\[your-username]\Documents\Cline`
    - 在此 Cline 文件夹内，为每个项目创建一个单独的文件夹
        - 示例：`Documents/Cline/workout-app` 用于健身追踪应用
        - 示例：`Documents/Cline/portfolio-website` 用于个人作品集
- **VS Code 中的 Cline 扩展**：已安装在 VS Code 中的 Cline 扩展。

- 这里有一段 [教程](https://www.youtube.com/watch?v=N4td-fKhsOQ)，帮助您完成准备工作。

## 分步设置

按照以下步骤设置 Cline：

1. **启动 VS Code**：打开 VS Code 应用程序。如果 VS Code 显示 "正在运行扩展...", 请点击 "允许"。

2. **打开您的 Cline 文件夹**：在 VS Code 中，打开您在 Documents 文件夹中创建的 Cline 文件夹。

3. **导航到扩展**：点击 VS Code 侧边栏中的扩展图标。

4. **搜索 'Cline'**：在扩展搜索栏中输入 "Cline"。

5. **安装扩展**：点击 Cline 扩展旁边的 "安装" 按钮。

6. **打开 Cline**：安装完成后，您可以通过多种方式打开 Cline：
    - 点击 VS Code 侧边栏中的 Cline 图标。
    - 使用命令面板（`CMD/CTRL + Shift + P`）并输入 "Cline: 在新标签页中打开"，以标签页形式在编辑器中打开 Cline。这推荐用于更好的视图效果。
    - **故障排除**：如果看不到 Cline 图标，请尝试重启 VS Code。
    - **您将看到**：Cline 聊天窗口将出现在您的 VS Code 编辑器中。

![gettingStartedVsCodeCline](https://github.com/user-attachments/assets/622b4bb7-859b-4c2e-b87b-c12e3eabefb8)

## 设置 OpenRouter API 密钥

现在您已经安装了 Cline，接下来需要设置 OpenRouter API 密钥以使用 Cline 的全部功能。

1. **获取您的 OpenRouter API 密钥：**
    - [获取您的 OpenRouter API 密钥](https://openrouter.ai/)
2. **输入您的 OpenRouter API 密钥：**
    - 导航至 Cline 扩展中的设置按钮
    - 输入您的 OpenRouter API 密钥
    - 选择您偏好的 API 模型
        - **推荐用于编码的模型：**
            - `anthropic/claude-3.5-sonnet`：最常用于编码任务
            - `google/gemini-2.0-flash-exp:free`：编码任务的免费选项
            - `deepseek/deepseek-chat`：超值，几乎与 3.5 sonnet 同样优秀
        - [OpenRouter 模型排行榜](https://openrouter.ai/rankings/programming)

## 您与 Cline 的首次互动

现在您已经准备就绪，可以开始使用 Cline 构建项目了。让我们创建第一个项目文件夹并打造一些东西！将以下提示复制粘贴到 Cline 聊天窗口中：

```
嘿 Cline！您能幫助我在我的 Cline 目錄中建立一個名為 "hello-world" 的新項目文件夾，並製作一個顯示大號藍色 "Hello World" 文本的簡單網頁嗎？
```

**您将看到**：Cline 将帮助您创建项目文件夹并设置您的第一个网页。

## 使用 Cline 的小技巧

- **提问**：如果您对某些内容不确定，请随时向 Cline 提问！
- **使用截图**：Cline 能够理解图像，因此您可以自由地使用截图向它展示您的工作内容。
- **复制粘贴错误**：如果遇到错误，请将其复制粘贴到 Cline 的聊天窗口中。这将帮助它理解问题并提供解决方案。
- **使用简单语言**：Cline 设计为能够理解非技术性的日常语言。请随意用您自己的话描述您的想法，Cline 将将其转化为代码。

## 常见问题解答

- **什么是终端？**：终端是一个基于文本的计算机交互界面。它允许您运行命令执行各种任务，例如安装包、运行脚本和管理文件。Cline 使用终端来执行命令并与其开发环境交互。
- **代码库如何工作？**：（本节将根据新手开发者的常见问题扩展）
