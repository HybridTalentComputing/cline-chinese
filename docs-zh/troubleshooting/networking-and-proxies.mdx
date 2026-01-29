---
title: "网络和代理"
sidebarTitle: "网络和代理"
description: "配置 Cline 在防火墙和代理后面工作"
---

如果你在公司代理或防火墙后面工作，你需要为 Cline 配置代理
设置以连接到 AI 提供商。配置因你使用的 Cline 版本而异。

## VSCode 扩展

VSCode 扩展自动使用 VSCode 的内置代理设置。请参阅
[Visual Studio Code 中的网络连接，代理服务器支持](https://code.visualstudio.com/docs/setup/network#_proxy-server-support)
了解如何在 VSCode 中设置代理的说明。Cline 本身不需要额外的配置。

## CLI

Cline CLI 使用标准 HTTP 代理环境变量。在运行 `cline` 命令之前配置这些变量。

### 基本配置

**Windows（命令提示符）**
```cmd
set https_proxy=http://proxy.company.com:8080
set http_proxy=http://proxy.company.com:8080
cline start
```

**Windows（PowerShell）**
```powershell
$env:https_proxy="http://proxy.company.com:8080"
$env:http_proxy="http://proxy.company.com:8080"
cline start
```

**macOS/Linux**
```bash
export https_proxy=http://proxy.company.com:8080
export http_proxy=http://proxy.company.com:8080
cline start
```

### 带身份验证的代理

如果你的代理需要身份验证，请在 URL 中包含凭据：

```bash
export https_proxy=http://username:password@proxy.company.com:8080
export http_proxy=http://username:password@proxy.company.com:8080
```

<Warning>
在环境变量中存储凭据可能存在安全风险。
</Warning>

### 绕过 localhost 的代理

为了防止 localhost 流量通过代理，设置 `no_proxy` 环境变量：

**Windows**
```cmd
set no_proxy=localhost,127.0.0.1,.local
```

**macOS/Linux**
```bash
export no_proxy=localhost,127.0.0.1,.local
```

### 自定义证书颁发机构

如果你的代理使用自定义 CA 证书：

**Windows**
```cmd
set NODE_EXTRA_CA_CERTS=C:\path\to\ca-certificate.crt
cline start
```

**macOS/Linux**
```bash
export NODE_EXTRA_CA_CERTS=/path/to/ca-certificate.pem
cline start
```

### 永久配置

为了避免每次都设置这些变量，请将它们添加到你的 shell 配置文件或系统环境变量中。

**macOS/Linux**（添加到 `~/.bashrc`、`~/.zshrc` 或 `~/.profile`）：
```bash
# 代理配置
export https_proxy=http://proxy.company.com:8080
export http_proxy=http://proxy.company.com:8080
export no_proxy=localhost,127.0.0.1,.local
export NODE_EXTRA_CA_CERTS=/path/to/ca-certificate.pem
```

**Windows**（系统环境变量）：
1. 在 Windows 设置中搜索"环境变量"
2. 在"用户变量"或"系统变量"下添加变量
3. 重启你的终端或 IDE

### 已知限制

Cline CLI 仅支持 HTTP 代理。它不支持 SOCKS 代理、
代理自动配置 (PAC) 脚本，或需要基本用户名和密码之外
的身份验证的 HTTP 代理。

## JetBrains IDE

JetBrains 插件使用 IDE 的 HTTP 代理设置。

### 配置 JetBrains 代理

1. 打开设置/首选项：
   - **Windows/Linux**：File > Settings
   - **macOS**：IntelliJ IDEA > Preferences
   - 或按 `Ctrl+Alt+S`（Windows/Linux）或 `Cmd+,`（macOS）

2. 导航到：
   ```
   Appearance & Behavior > System Settings > HTTP Proxy
   ```

3. 选择"Manual proxy configuration"

4. 配置你的代理：
   - **Host name**：`proxy.company.com`
   - **Port number**：`8080`
   - **No proxy for**：`localhost,127.0.0.1`
   - 如果需要，选中"Proxy authentication"
   - 输入你的用户名和密码

5. 单击"Check connection"以验证设置

6. 单击"OK"以应用

7. 重启 IDE

### 测试连接

配置代理后，测试 Cline 可以连接到你的 AI 提供商：

1. 打开 Cline 面板
2. 尝试发送简单消息
3. 如果连接失败，检查 IDE 的事件日志以获取错误消息

### 自定义证书颁发机构

如果你的代理使用自定义 CA：

1. 将证书添加到系统的信任存储中，或
2. 将其导入到 JetBrains IDE：
   - Settings > Tools > Server Certificates
   - 单击"+"以添加你的证书

### 已知限制

JetBrains 中的 Cline 仅支持 HTTP 代理。它不支持 SOCKS
代理、代理自动配置 (PAC) 脚本，或需要基本用户名和密码
之外的身份验证的 HTTP 代理。

Cline 不会动态获取更改的代理设置。更改代理设置后，
重启 IDE 以使 Cline 使用新设置。

## 故障排除

### 连接超时

如果你遇到连接超时：

1. 验证你的代理地址和端口是否正确
2. 检查代理是否需要身份验证
3. 确保 AI 提供商的 API 端点未被你的防火墙阻止

### SSL/TLS 证书错误

如果你看到与证书相关的错误：

1. 检查 `NODE_EXTRA_CA_CERTS` 是否指向正确的证书文件
2. 确保证书文件为 PEM 格式
3. 使用 curl 验证证书是否有效，例如，`curl -x proxy.corp.example:8080 --cacert /path/to/ca-cert.pem -o - -vv https://api.cline.bot/`
4. 考虑在 VSCode 中禁用 `http.proxyStrictSSL`（不建议用于生产环境）

### 测试代理配置

如果你遇到 Cline 网络问题，首先使用 curl 验证你的代理
配置是否有效：

```bash
# Linux/macOS
export https_proxy=http://proxy.company.com:8080
curl -vv https://api.anthropic.com

# Windows PowerShell
$env:https_proxy="http://proxy.company.com:8080"
curl.exe -vv https://api.anthropic.com
```

如有必要，使用 `--cacert $NODE_EXTRA_CA_CERTS` 指定证书。

接下来，检查 ~/.cline/cline-core-service.log（CLI、JetBrains）以获取日志消息，
确认你的代理配置和任何与网络相关的错误。

## 常见代理模式

### 带身份验证的 HTTPS 代理

```bash
export https_proxy=http://username:password@proxy.company.com:8080
export NODE_EXTRA_CA_CERTS=/path/to/ca-cert.pem
```

### 不带身份验证的代理

```bash
export https_proxy=http://proxy.company.com:8080
export http_proxy=http://proxy.company.com:8080
```

### 带绕过规则的代理

```bash
export https_proxy=http://proxy.company.com:8080
export no_proxy=localhost,127.0.0.1,.company.local,192.168.0.0/16
