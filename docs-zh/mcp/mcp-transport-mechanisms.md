---
title: "MCP 传输机制"
description: "了解 Cline 和 MCP 服务器之间通信的两种主要传输机制：标准输入/输出 (STDIO) 和服务器发送事件 (SSE)。每种都有独特的特征、优势和用例。"
---

模型上下文协议 (MCP) 支持 Cline 和 MCP 服务器之间通信的两种主要传输机制：标准输入/输出 (STDIO) 和服务器发送事件 (SSE)。每种都有独特的特征、优势和用例。

## STDIO 传输

STDIO 传输在你的计算机上本地运行，并通过标准输入/输出流进行通信。

### STDIO 传输如何工作

1. 客户端 (Cline) 将 MCP 服务器作为子进程启动
2. 通信通过进程流进行：客户端写入服务器的 STDIN，服务器响应到 STDOUT
3. 每条消息由换行符分隔
4. 消息格式化为 JSON-RPC 2.0

```plaintext
Client                    Server
  |                         |
  |<---- JSON message ----->| (via STDIN)
  |                         | (处理请求)
  |<---- JSON message ------| (via STDOUT)
  |                         |
```

### STDIO 特征

-   **本地性**：在 Cline 所在的同一台计算机上运行
-   **性能**：非常低的延迟和开销（不涉及网络栈）
-   **简单性**：直接进程通信，无需网络配置
-   **关系**：客户端和服务器之间的一对一关系
-   **安全性**：固有地更安全，因为没有网络暴露

### 何时使用 STDIO

STDIO 传输适用于：

-   在同一台计算机上运行的本地集成和工具
-   安全敏感的操作
-   低延迟要求
-   单客户端场景（每个服务器一个 Cline 实例）
-   命令行工具或 IDE 扩展

### STDIO 实施示例

```typescript
import { Server } from "@modelcontextprotocol/sdk/server/index.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"

const server = new Server({ name: "local-server", version: "1.0.0" })
// 注册工具...

// 使用 STDIO 传输
const transport = new StdioServerTransport(server)
transport.listen()
```

## SSE 传输

服务器发送事件 (SSE) 传输在远程服务器上运行，并通过 HTTP/HTTPS 进行通信。

### SSE 传输如何工作

1. 客户端 (Cline) 通过 HTTP GET 请求连接到服务器的 SSE 端点
2. 这建立了一个持久连接，服务器可以向客户端推送事件
3. 对于客户端到服务器的通信，客户端向单独的端点发出 HTTP POST 请求
4. 通信通过两个通道进行：
    - 事件流 (GET)：服务器到客户端的更新
    - 消息端点 (POST)：客户端到服务器的请求

```plaintext
Client                             Server
  |                                  |
  |---- HTTP GET /events ----------->| (建立 SSE 连接)
  |<---- SSE event stream -----------| (持久连接)
  |                                  |
  |---- HTTP POST /message --------->| (客户端请求)
  |<---- SSE event with response ----| (服务器响应)
  |                                  |
```

### SSE 特征

-   **远程访问**：可以托管在与 Cline 实例不同的计算机上
-   **可扩展性**：可以同时处理多个客户端连接
-   **协议**：通过标准 HTTP 工作（不需要特殊协议）
-   **持久性**：为服务器到客户端的消息保持持久连接
-   **身份验证**：可以使用标准 HTTP 身份验证机制

### 何时使用 SSE

SSE 传输更适合：

-   跨网络的远程访问
-   多客户端场景
-   公共服务
-   许多用户需要访问的集中化工具
-   与 Web 服务集成

### SSE 实施示例

```typescript
import { Server } from "@modelcontextprotocol/sdk/server/index.js"
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js"
import express from "express"

const app = express()
const server = new Server({ name: "remote-server", version: "1.0.0" })
// 注册工具...

// 使用 SSE 传输
const transport = new SSEServerTransport(server)
app.use("/mcp", transport.requestHandler())
app.listen(3000, () => {
	console.log("MCP server listening on port 3000")
})
```

## 本地与托管：部署方面

在 STDIO 和 SSE 传输之间的选择直接影响你将如何部署和管理 MCP 服务器。

### STDIO：本地部署模型

STDIO 服务器在 Cline 所在的同一台计算机上本地运行，这有几个重要影响：

-   **安装**：服务器可执行文件必须安装在每台用户计算机上
-   **分发**：你需要为不同操作系统提供安装包
-   **更新**：每个实例必须单独更新
-   **资源**：使用本地计算机的 CPU、内存和磁盘
-   **访问控制**：依赖于本地计算机的文件系统权限
-   **集成**：与本地系统资源（文件、进程）轻松集成
-   **执行**：随 Cline 启动和停止（子进程生命周期）
-   **依赖项**：任何依赖项都必须安装在用户计算机上

#### 实际示例

使用 STDIO 的本地文件搜索工具将：

-   在用户的计算机上运行
-   直接访问本地文件系统
-   在 Cline 需要时启动
-   不需要网络配置
-   需要与 Cline 一起安装或通过包管理器安装

### SSE：托管部署模型

SSE 服务器可以部署到远程服务器并通过网络访问：

-   **安装**：在服务器上安装一次，由许多用户访问
-   **分发**：单个部署为多个客户端提供服务
-   **更新**：集中化更新立即影响所有用户
-   **资源**：使用服务器资源，而不是本地计算机资源
-   **访问控制**：通过身份验证和授权系统管理
-   **集成**：与用户特定资源的集成更复杂
-   **执行**：作为独立服务运行（通常是持续运行）
-   **依赖项**：在服务器上管理，而不是在用户计算机上

#### 实际示例

使用 SSE 的数据库查询工具将：

-   在中央服务器上运行
-   使用服务器端凭证连接到数据库
-   为多个用户持续可用
-   需要适当的网络安全配置
-   使用容器或云技术部署

### 混合方法

某些场景受益于混合方法：

1. **具有网络访问的 STDIO**：充当远程服务代理的本地 STDIO 服务器
2. **具有本地命令的 SSE**：可以通过回调在客户端计算机上触发操作的远程 SSE 服务器
3. **网关模式**：用于本地操作的 STDIO 服务器，连接到 SSE 服务器以获取专用功能

## 在 STDIO 和 SSE 之间选择

| 考虑因素         | STDIO                    | SSE                                 |
| -------------------- | ------------------------ | ----------------------------------- |
| **位置**         | 仅本地计算机       | 本地或远程                     |
| **客户端**          | 单个客户端            | 多个客户端                    |
| **性能**      | 更低延迟            | 更高延迟（网络开销）   |
| **设置复杂性** | 更简单                  | 更复杂（需要 HTTP 服务器） |
| **安全性**         | 固有安全        | 需要明确的安全措施 |
| **网络访问**   | 不需要               | 需要                            |
| **可扩展性**      | 限于本地计算机 | 可以跨网络分发       |
| **部署**       | 每用户安装    | 集中化安装            |
| **更新**          | 分发更新      | 集中化更新                 |
| **资源使用**   | 使用客户端资源    | 使用服务器资源               |
| **依赖项**     | 客户端依赖项 | 服务器端依赖项            |

## 在 Cline 中配置传输

有关在 Cline 中配置 STDIO 和 SSE 传输的详细信息，包括示例，请参阅[配置 MCP 服务器](/mcp/configuring-mcp-servers)。
