# 🚀 MCP 快速入门指南

## ❓ 什么是 MCP 服务器？

可以把 MCP 服务器想象成赋予 Cline 额外功能的特殊助手！它们能让 Cline 实现诸如抓取网页或操作文件等功能。

## ⚠️ 重要提示：系统需求

停下！在继续之前，请务必验证以下要求：

### 必需软件

-   ✅ 最新版本的 Node.js（v18 或更高）

    -   检查方法：运行 `node --version`
    -   安装来源：<https://nodejs.org/>

-   ✅ 最新版本的 Python（v3.8 或更高）

    -   检查方法：运行 `python --version`
    -   安装来源：<https://python.org/>

-   ✅ UV 包管理器
    -   在安装 Python 后，运行：`pip install uv`
    -   验证版本：`uv --version`

❗ 如果以上命令执行失败或显示旧版本，请在继续之前完成安装或更新！

⚠️ 如遇到其他错误，请查阅下方的“故障排除”部分。

## 🎯 快速步骤（仅在满足需求后进行！）

### 1. 🛠️ �安裝您的第一個 MCP 伺服器

1. 在 Cline 扩展中，点击 `MCP 服务器` 标签
1. 点击 `编辑 MCP 设置` 按钮

 <img src="https://github.com/user-attachments/assets/abf908b1-be98-4894-8dc7-ef3d27943a47" alt="MCP 伺服器面板" width="400" />

1. MCP 设置文件应该会显示在 VS Code 的一个标签中
1. 将文件内容替换为以下代码：

对于 Windows：

```json
{
	"mcpServers": {
		"mcp-installer": {
			"command": "cmd.exe",
			"args": ["/c", "npx", "-y", "@anaisbetts/mcp-installer"]
		}
	}
}
```

对于 Mac 和 Linux：

```json
{
	"mcpServers": {
		"mcp-installer": {
			"command": "npx",
			"args": ["@anaisbetts/mcp-installer"]
		}
	}
}
```

保存文件后：

1. Cline 会自动检测到更改
2. MCP 安装器将被下載并安装
3. Cline 会启动该安装器
4. 您可以在 Cline 的 MCP 设置界面看到服务器状态：

<img src="https://github.com/user-attachments/assets/2abbb3de-e902-4ec2-a5e5-9418ed34684e" alt="MCP 伺服器面板（带安装器）" width="400" />

## 🤔 接下来做什么？

现在您已经拥有 MCP 安装器，可以指示 Cline 从此处添加更多服务器：

1. NPM 仓库： <https://www.npmjs.com/search?q=%40modelcontextprotocol>
2. Python 包索引： <https://pypi.org/search/?q=mcp+server-&o=>

例如，您可以请求 Cline 安装在 Python 包索引上找到的 `mcp-server-fetch` 包：

```bash
"安装名为 `mcp-server-fetch` 的 MCP 伺服器
- 确保 MCP 设置已更新
- 使用 uvx 或 Python 运行该服务器”
```

您将看到 Cline：

1. 安装 `mcp-server-fetch` Python 包
1. 更新 MCP 设置 JSON 文件
1. 启动 servers

现在的 MCP 设置文件应该如下所示：

对于 Windows 机器：

```json
{
	"mcpServers": {
		"mcp-installer": {
			"command": "cmd.exe",
			"args": ["/c", "npx", "-y", "@anaisbetts/mcp-installer"]
		},
		"mcp-server-fetch": {
			"command": "uvx",
			"args": ["mcp-server-fetch"]
		}
	}
}
```

您隨時可以通​過访问 Cline 的 MCP 伺服器标签查看伺服器状态，如上圖所示。

这样就完成了！🎉 您已成功赋予 Cline 一些 Powerful 新功能！

## 📝 故障排除

### 1. 使用 `asdf` 时遇到“_unknown command: npx”错误

有一些不太好的消息。您仍然可以设法解决问题，但可能需要进行一些额外的手动操作，除非 MCP 服务器打包有所改进。一种选择是卸载 `asdf`，但我们假设您不想这样做。

相反，您需要按照上述步骤“编辑 MCP 设置”，然后根据[这篇博文](https://dev.to/cojiroooo/mcp-using-node-on-asdf-382n)所述，为每个服务器配置添加一个“env”条目。

```json
"env": {
        "PATH": "/Users/<user_name>/.asdf/shims:/usr/bin:/bin",
        "ASDF_DIR": "<path_to_asdf_bin_dir>",
        "ASDF_DATA_DIR": "/Users/<user_name>/.asdf",
        "ASDF_NODEJS_VERSION": "<your_node_version>"
      }
```

`path_to_asdf_bin_dir` 通常可以在您的 Shell 配置（如 `.zshrc`）中找到。如果您使用 Homebrew，可以运行 `echo ${HOMEBREW_PREFIX}` 来找到目录开头，然后添加 `/opt/asdf/libexec`。

现在有一个好消息。尽管不完美，但 Cline 可以相当可靠地为您后续的服务器安装完成此操作。您可以将以下内容添加到您的 Cline 设置（右上角工具栏按钮）中的“自定义说明”部分：

> 在安装 MCP 服务器并编辑 cline_mcp_settings.json 文件时，如果服务器要求使用 `npx` 作为命令，则必须从“mcp-installer”条目复制“env”条目并将其添加到新条目中。这对于确保服务器在使用时正常工作至关重要。

### 2. 在運行 MCP 安裝器時仍然遇到錯誤

如果您在運行 MCP 安裝器時遇到錯誤，可以嘗試以下步驟：

-   檢查 MCP 設置文件中有無錯誤
-   閱讀 MCP 伺服器的文檔，確保 MCP 設置文件使用了正確的命令和參數。👈
-   使用終端，直接運行命令及其參數。這將使您看到 Cline 確實看到的錯誤。