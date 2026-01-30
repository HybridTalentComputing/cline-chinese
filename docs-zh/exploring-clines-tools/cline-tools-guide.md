---
title: "Cline 工具参考指南"
---

## Cline 能做什么？

Cline 是你的 AI 助手，可以：

-   编辑和创建项目中的文件
-   运行终端命令
-   搜索和分析你的代码
-   帮助调试和修复问题
-   自动化重复性任务
-   与外部工具集成


## 可用工具

有关最新的实现细节，你可以查看 [Cline 仓库](https://github.com/cline/cline/blob/main/src/core/prompts/system-prompt/tools)中的完整源代码。

Cline 可以访问以下工具来完成各种任务：

1. **文件操作**

    - `write_to_file`: 创建或覆盖文件
    - `read_file`: 读取文件内容
    - `replace_in_file`: 对文件进行针对性编辑
    - `search_files`: 使用正则表达式搜索文件
    - `list_files`: 列出目录内容

2. **终端操作**

    - `execute_command`: 运行 CLI 命令
    - `list_code_definition_names`: 列出代码定义

3. **MCP 工具**

    - `use_mcp_tool`: 使用 MCP 服务器提供的工具
    - `access_mcp_resource`: 访问 MCP 服务器资源
    - 用户可以创建自定义 MCP 工具，Cline 可以访问这些工具
    - 示例：创建一个天气 API 工具，Cline 可以用它来获取天气预报

4. **交互工具**
    - `ask_followup_question`: 向用户询问更多细节
    - `attempt_completion`: 展示最终结果


每个工具都有特定的参数和使用模式。以下是一些示例：

-   创建新文件 (write_to_file):

    ```xml
    <write_to_file>
    <path>src/components/Header.tsx</path>
    <content>
    // Header 组件代码
