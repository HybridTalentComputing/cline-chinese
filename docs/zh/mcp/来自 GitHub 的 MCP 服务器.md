# 使用Cline从GitHub仓库构建MCP服务器

本指南逐步介绍了如何使用Cline从GitHub仓库构建现有的MCP服务器。

## **查找MCP服务器**

可以在多个地方在线查找MCP服务器:

- **Cline可以自动将其列表中的MCP服务器添加进去，之后你可以进行编辑。**Cline可以直接从GitHub克隆仓库，并为你构建服务器。
- **GitHub:** 在GitHub上查找MCP服务器的两个最常见的地方包括:
  - [官方MCP服务器仓库](https://github.com/modelcontextprotocol/servers)
  - [Awesome-MCP服务器仓库](https://github.com/punkpeye/awesome-mcp-servers)
- **在线目录:** 有几个网站列出了MCP服务器，包括:

  - [mcpservers.org](https://mcpservers.org/)
  - [mcp.so](https://mcp.so/)
  - [glama.ai/mcp/servers](https://glama.ai/mcp/servers)

  这些目录允许用户根据下载量、日期、星标和使用场景等不同标准对服务器进行排序。每个条目都提供了功能、工具和配置说明等信息。

- **PulseMCP:** 这个网站有一篇博客文章，讨论了AI如何使用MCP服务器使网站过时。PulseMCP还包括一个关于MCP服务器的常见问题解答部分:[https://www.pulsemcp.com/](https://www.pulsemcp.com/)

## **使用Cline进行构建**

1. **启动过程:** 向Cline提供以下信息:
    - **GitHub仓库URL:** 服务器仓库的URL。
    - **README.md内容:** 这是可选的，但对Cline理解服务器的用途和配置很有帮助。你可以从GitHub仓库复制README.md文件。
2. **与Cline的示例交互:**

    ```
    用户: "Cline，我想添加用于控制Brave浏览器的MCP服务器。这是GitHub链接: https://github.com/modelcontextprotocol/servers/tree/main/src/brave。你可以添加它吗?"

    Cline: "好的。正在将仓库克隆到MCP目录。因为它有一个'package.json'文件，所以需要构建。我应该运行'npm run build'吗?"

    用户: "是的，构建它。"

    Cline: "构建完成。此服务器需要一个浏览器路径。你的Brave浏览器可执行文件在哪里?"

    用户: "它在'/Applications/Brave Browser.app/Contents/MacOS/Brave Browser'。"

    Cline: "好的。我已经将该路径更新到服务器配置，并将其添加到'cline_mcp_settings.json'。还有其他需要的吗?"

    用户: "不需要了。让我们测试一下。"

    Cline: "太好了！启动MCP Inspector来测试服务器连接。之后，我们可以尝试从Cline控制浏览器。"
    ```

3. **Cline的操作:** 根据你的指示，Cline将执行以下操作:
    - **仓库克隆:** Cline会将仓库克隆到你的本地机器，通常是在配置中指定的目录。
    - **调整配置:** 你可以指导Cline修改服务器的配置。例如:
        - **用户:** "此服务器需要一个API密钥。你能找到应该添加的位置吗?"
        - Cline可能会根据你的指示自动更新`cline_mcp_settings.json`文件或其他相关文件。
    - **构建服务器:** Cline将为服务器运行适当的构建命令，通常是`npm run build`。
    - **添加服务器到设置:** Cline会将服务器的配置添加到`cline_mcp_settings.json`文件中。

## **测试和故障排除**

1. **测试服务器:** 一旦Cline完成构建过程，测试服务器以确保它按预期工作。如果遇到任何问题，Cline可以帮助你。
2. **MCP Inspector:** 你可以使用MCP Inspector来测试服务器的连接和功能。

## **最佳实践**

- **理解基础知识:** 虽然Cline简化了流程，但了解服务器代码、MCP协议和如何配置服务器的基本知识还是有益的。这允许更有效的故障排除和定制。
- **明确指示:** 在整个过程中向Cline提供清晰具体的指示。
- **测试:** 在安装和配置完成后，彻底测试服务器，确保其正常工作。
- **版本控制:** 使用版本控制系统（如Git）跟踪对服务器代码的更改。
- **保持更新:** 让你的MCP服务器保持最新状态，以获得最新的功能和安全补丁。