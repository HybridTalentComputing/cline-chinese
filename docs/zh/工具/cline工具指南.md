# Cline 工具参考指南

## Cline 功能概述

Cline 是你的 AI 助手，它能够实现以下功能：

- 创建和编辑项目文件
- 执行终端命令
- 搜索和分析代码
- 帮助调试和修复问题
- 自动化重复性任务
- 集成外部工具

## 快速上手指南

1. **发起任务**

    - 在聊天界面中输入你的需求
    - 示例："创建一个名为 Header 的 React 组件"

2. **添加上下文**

    - 使用 @ 提及功能添加相关文件、文件夹或 URL
    - 示例："@file:src/components/App.tsx"

3. **审核变更**
    - Cline 会在执行变更前显示差异
    - 你可以选择编辑或拒绝变更

## 核心功能模块

1. **文件管理**

    - 创建新文件
    - 修改现有代码
    - 跨文件搜索和替换

2. **终端操作**

    - 执行 npm 命令
    - 启动开发服务
    - 安装依赖库

3. **代码分析**

    - 查找和修复错误
    - 代码重构
    - 添加文档注释

4. **浏览器集成**
    - 测试网页内容
    - 捕获页面快照
    - 查看控制台日志

## 支持的工具

要获取更多实现细节，可以在 [Cline 仓库](https://github.com/cline/cline/blob/main/src/core/Cline.ts) 查看完整源代码。

Cline 可以通过以下工具完成任务：

1. **文件操作**

    - `write_to_file`：创建或覆盖文件
    - `read_file`：读取文件内容
    - `replace_in_file`：对文件进行定向编辑
    - `search_files`：使用正则表达式搜索文件
    - `list_files`：列出目录内容

2. **终端操作**

    - `execute_command`：运行 CLI 命令
    - `list_code_definition_names`：列出代码定义

3. **MCP 工具**

    - `use_mcp_tool`：使用来自 MCP 服务器的工具
    - `access_mcp_resource`：访问 MCP 服务器资源
    - 用户可以创建自定义 MCP 工具供 Cline 使用
    - 示例：创建一个天气 API 工具，让 Cline 用来获取天气预报

4. **交互工具`
    - `ask_followup_question`：向用户请求澄清
    - `attempt_completion`：呈现最终结果

每个工具都有特定的参数和使用场景。以下是一些使用示例：

- 创建新文件 (write_to_file)：

    ```xml
    <write_to_file>
    <path>src/components/Header.tsx</path>
    <content>
    // Header 组件代码
    </content>
    </write_to_file>
    ```

- 搜索模式 (search_files)：

    ```xml
    <search_files>
    <path>src</path>
    <regex>function\s+\w+\(</regex>
    <file_pattern>*.ts</file_pattern>
    </search_files>
    ```

- 运行命令 (execute_command)：
    ```xml
    <execute_command>
    <command>npm install axios</command>
    <requires_approval>false</requires_approval>
    </execute_command>
    ```

## 常见任务示例

1. **创建新组件**

    - "创建一个名为 Footer 的 React 组件"

2. **修复问题**

    - "修复 src/utils/format.ts 中的错误"

3. **重构代码**

    - "将 Button 组件重构为使用 TypeScript"

4. **执行命令**
    - "运行 npm install 来添加 axios"

## 获取支持

-   [加入 Discord 社区](https://discord.gg/cline)
-   查阅官方文档
-   提供反馈以改进 Cline