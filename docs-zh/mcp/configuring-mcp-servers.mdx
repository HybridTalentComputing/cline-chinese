---
title: "配置 MCP 服务器"
---

## 全局 MCP 服务器包含模式

使用 MCP 服务器将增加你的 token 使用量。Cline 提供了根据需要限制或禁用 MCP 服务器功能的能力。

1. 单击 Cline 扩展顶部导航栏中的"MCP 服务器"图标。
2. 选择"配置"选项卡，然后单击该窗格底部的"高级 MCP 设置"链接。
3. Cline 将打开一个新的设置窗口。找到 `Cline>Mcp:Mode` 并从下拉菜单中进行选择。

<Frame>
	<img
		src="https://storage.googleapis.com/cline_public_images/docs/assets/MCP-settings-edit%20(1).png"
		alt="MCP 设置编辑"
		/>
</Frame>

## 管理单个 MCP 服务器

每个 MCP 服务器都有自己的配置面板，你可以在其中修改设置、管理工具并控制其操作。要访问这些设置：

1. 单击 Cline 扩展顶部导航栏中的"MCP 服务器"图标。
2. 在列表中找到你想要管理的 MCP 服务器，并通过单击其名称来打开它。

<Frame>
	<img
		src="https://storage.googleapis.com/cline_public_images/docs/assets/MCP-settings-individual.png"
		alt="MCP 设置单个"
		/>
</Frame>

### 删除服务器

1. 单击你想要删除的 MCP 服务器旁边的垃圾桶图标，或 MCP 服务器配置框底部的红色删除服务器按钮。

**注意：**没有删除确认对话框

### 重启服务器

1. 单击你想要重启的 MCP 服务器旁边的重启按钮，或 MCP 服务器配置框底部的灰色重启服务器按钮。

### 启用或禁用服务器

1. 单击 MCP 服务器旁边的切换开关以单独启用/禁用服务器。

### 网络超时

要设置在工具调用到 MCP 服务器后等待响应的最大时间：

1. 单击单个 MCP 服务器配置框底部的 `Network Timeout` 下拉菜单并更改时间。默认为 1 分钟，但可以设置为 30 秒到 1 小时之间。

## 编辑 MCP 设置文件

所有已安装 MCP 服务器的设置都位于 `cline_mcp_settings.json` 文件中：

1. 单击 Cline 窗格顶部导航栏中的 MCP 服务器图标。
2. 选择"配置"选项卡。
3. 单击窗格底部的"配置 MCP 服务器"按钮。

该文件使用 JSON 格式，包含命名服务器配置的 `mcpServers` 对象：

```json
{
	"mcpServers": {
		"server1": {
			"command": "python",
			"args": ["/path/to/server.py"],
			"env": {
				"API_KEY": "your_api_key"
			},
			"alwaysAllow": ["tool1", "tool2"],
			"disabled": false
		}
	}
}
```

_Cline 中的 MCP 服务器配置示例（STDIO 传输）_

---

## 了解传输类型

MCP 支持两种服务器通信的传输类型：

### STDIO 传输

用于在你的计算机上运行的本地服务器：

-   通过标准输入/输出流进行通信
-   更低的延迟（无网络开销）
-   更好的安全性（无网络暴露）
-   更简单的设置（不需要 HTTP 服务器）
-   在你的计算机上作为子进程运行

有关 STDIO 传输如何工作的更深入信息，请参阅 [MCP 传输机制](/mcp/mcp-transport-mechanisms)。

STDIO 配置示例：

```json
{
	"mcpServers": {
		"local-server": {
			"command": "node",
			"args": ["/path/to/server.js"],
			"env": {
				"API_KEY": "your_api_key"
			},
			"alwaysAllow": ["tool1", "tool2"],
			"disabled": false
		}
	}
}
```

### SSE 传输

用于通过 HTTP/HTTPS 访问的远程服务器：

-   通过服务器发送事件协议进行通信
-   可以托管在不同的计算机上
-   支持多个客户端连接
-   需要网络访问
-   允许集中化部署和管理

有关 SSE 传输如何工作的更深入信息，请参阅 [MCP 传输机制](/mcp/mcp-transport-mechanisms)。

SSE 配置示例：

```json
{
	"mcpServers": {
		"remote-server": {
			"url": "https://your-server-url.com/mcp",
			"headers": {
				"Authorization": "Bearer your-token"
			},
			"alwaysAllow": ["tool3"],
			"disabled": false
		}
	}
}
```

---

## 在工作流中使用 MCP 工具

配置 MCP 服务器后，Cline 将自动检测可用的工具和资源。要使用它们：

1. 在 Cline 的对话窗口中输入你的请求
2. Cline 将识别何时 MCP 工具可以帮助你的任务
3. 在提示时批准工具使用（或使用自动批准）

示例："分析我的 API 的性能"可能会使用测试 API 端点的 MCP 工具。

## MCP 服务器的故障排除

常见问题和解决方案：

-   **服务器无响应：**检查服务器进程是否正在运行并验证网络连接
-   **权限错误：**确保在 `mcp_settings.json` 文件中正确配置了 API 密钥和凭证
-   **工具不可用：**确认服务器正确实现了工具，并且它在设置中未禁用
-   **性能缓慢：**尝试调整特定 MCP 服务器的网络超时值
