---
title: "OpenTelemetry 集成"
sidebarTitle: "OpenTelemetry"
description: "使用 OpenTelemetry 协议 (OTLP) 将 Cline 数据采集导出到你的可观察性平台"
---

Cline 包含可选的 OpenTelemetry 支持，用于使用 OpenTelemetry 协议 (OTLP) 将指标和日志导出到你自己的可观察性基础设施。

<Note>
OpenTelemetry 集成是**可选的**，适用于具有现有可观察性基础设施的高级用户。大多数用户不需要此功能。
</Note>

## 什么是 OpenTelemetry？

[OpenTelemetry](https://opentelemetry.io/) 是行业标准可观察性框架，提供了收集和导出数据采集数据（指标、日志和跟踪）的统一方式。

Cline 的 OpenTelemetry 支持允许你：
- 将数据采集导出到你自己的系统
- 与 Datadog、New Relic、Grafana Cloud 等可观察性平台集成
- 对数据采集数据保持完全控制
- 使用你组织的现有监控基础设施

## 支持的功能

Cline 支持 OpenTelemetry 的 **OTLP (OpenTelemetry 协议)** 导出，包括：

<CardGroup cols={2}>
  <Card title="指标导出" icon="chart-bar">
    导出关于 Cline 使用、性能和错误的指标
  </Card>
  
  <Card title="日志导出" icon="file-lines">
    导出结构化日志以进行调试和分析
  </Card>
</CardGroup>

### 导出格式

Cline 支持三种 OTLP 导出协议：

- **gRPC**（默认，推荐）
- **HTTP/protobuf**
- **HTTP/JSON**

### 导出目标

你可以导出到：
- **控制台**（用于测试）
- **OTLP 端点**（你自己的收集器或可观察性平台）

## 配置

OpenTelemetry 使用环境变量在启动 Cline 之前进行配置。

### 基本设置

启用 OpenTelemetry 并配置 OTLP 端点：

```bash
# 启用 OpenTelemetry
export OTEL_TELEMETRY_ENABLED=1

# 配置指标和日志导出
export OTEL_METRICS_EXPORTER=otlp
export OTEL_LOGS_EXPORTER=otlp

# 设置你的 OTLP 端点
export OTEL_EXPORTER_OTLP_ENDPOINT=https://your-collector:4317

# 可选：设置协议（默认为 grpc）
export OTEL_EXPORTER_OTLP_PROTOCOL=grpc
```

### 环境变量

| 变量 | 描述 | 默认值 |
|----------|-------------|---------|
| `OTEL_TELEMETRY_ENABLED` | 启用 OpenTelemetry（`1` 或 `true`） | 禁用 |
| `OTEL_METRICS_EXPORTER` | 指标导出器类型（`console`、`otlp` 或两者） | 无 |
| `OTEL_LOGS_EXPORTER` | 日志导出器类型（`console`、`otlp` 或两者） | 无 |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | OTLP 端点 URL | 无 |
| `OTEL_EXPORTER_OTLP_PROTOCOL` | 协议（`grpc`、`http/protobuf`、`http/json`） | `grpc` |
| `OTEL_EXPORTER_OTLP_INSECURE` | 允许不安全连接 | `false` |
| `OTEL_EXPORTER_OTLP_HEADERS` | 自定义头（逗号分隔的 `key=value` 对） | 无 |

### 高级配置

**指标和日志的单独端点：**
```bash
export OTEL_EXPORTER_OTLP_METRICS_ENDPOINT=https://metrics-collector:4317
export OTEL_EXPORTER_OTLP_LOGS_ENDPOINT=https://logs-collector:4317
```

**用于身份验证的自定义头：**
```bash
export OTEL_EXPORTER_OTLP_HEADERS="api-key=your-key,x-custom-header=value"
```

**多个导出器（控制台 + OTLP）：**
```bash
export OTEL_METRICS_EXPORTER=console,otlp
export OTEL_LOGS_EXPORTER=console,otlp
```

**导出间隔：**
```bash
# 指标导出间隔（毫秒，默认：60000）
export OTEL_METRIC_EXPORT_INTERVAL=30000

# 日志批大小和超时
export OTEL_LOG_BATCH_SIZE=512
export OTEL_LOG_BATCH_TIMEOUT=5000
export OTEL_LOG_MAX_QUEUE_SIZE=2048
```

## 集成示例

### Datadog

使用他们的 OTLP 端点导出到 Datadog：

```bash
export OTEL_TELEMETRY_ENABLED=1
export OTEL_METRICS_EXPORTER=otlp
export OTEL_LOGS_EXPORTER=otlp
export OTEL_EXPORTER_OTLP_ENDPOINT=https://api.datadoghq.com
export OTEL_EXPORTER_OTLP_HEADERS="dd-api-key=YOUR_DD_API_KEY"
```

### New Relic

导出到 New Relic：

```bash
export OTEL_TELEMETRY_ENABLED=1
export OTEL_METRICS_EXPORTER=otlp
export OTEL_LOGS_EXPORTER=otlp
export OTEL_EXPORTER_OTLP_ENDPOINT=https://otlp.nr-data.net:4317
export OTEL_EXPORTER_OTLP_HEADERS="api-key=YOUR_NEW_RELIC_LICENSE_KEY"
```

### Grafana Cloud

导出到 Grafana Cloud：

```bash
export OTEL_TELEMETRY_ENABLED=1
export OTEL_METRICS_EXPORTER=otlp
export OTEL_LOGS_EXPORTER=otlp
export OTEL_EXPORTER_OTLP_ENDPOINT=https://otlp-gateway-prod-us-central-0.grafana.net/otlp
export OTEL_EXPORTER_OTLP_HEADERS="Authorization=Basic YOUR_BASE64_CREDENTIALS"
```


## 测试配置

在发送到真实端点之前，使用控制台输出测试你的配置：

```bash
# 启用控制台输出以查看将导出的数据
export OTEL_TELEMETRY_ENABLED=1
export OTEL_METRICS_EXPORTER=console
export OTEL_LOGS_EXPORTER=console
```

然后启动 Cline 并检查控制台输出中的指标和日志。

## 故障排除

### 没有数据被导出

1. **验证 OpenTelemetry 已启用：**
   ```bash
   echo $OTEL_TELEMETRY_ENABLED
   ```
   应该输出 `1` 或 `true`

2. **检查导出器已配置：**
   ```bash
   echo $OTEL_METRICS_EXPORTER
   echo $OTEL_LOGS_EXPORTER
   ```

3. **首先使用控制台导出器测试：**
   ```bash
   export OTEL_METRICS_EXPORTER=console
   export OTEL_LOGS_EXPORTER=console
   ```

### 连接错误

1. **验证端点可访问：**
   ```bash
   curl -v https://your-otlp-endpoint:4317
   ```

2. **检查是否需要不安全模式：**
   ```bash
   export OTEL_EXPORTER_OTLP_INSECURE=true
   ```

3. **验证身份验证头：**
   仔细检查你的 API 密钥和身份验证头是否正确

### 调试模式

启用调试日志以查看详细的 OpenTelemetry 信息：

```bash
export TEL_DEBUG_DIAGNOSTICS=true
```

这将输出详细信息：
- 使用的配置
- 正在创建的导出器
- 连接尝试
- 导出成功/失败

## 导出什么内容

启用 OpenTelemetry 后，Cline 导出：

### 指标
- 功能使用计数
- 任务执行指标 
- 错误率和类型
- 性能测量

### 日志
- 系统事件
- 带上下文的错误日志
- 操作信息

<Warning>
导出的数据已经是匿名的，不包括代码内容、文件路径或敏感信息。但是，你有责任在导出到系统后保护数据的安全。
</Warning>

## 限制

Cline 中当前的 OpenTelemetry 支持：
- ✅ OTLP 指标导出（控制台、gRPC、HTTP）
- ✅ OTLP 日志导出（控制台、gRPC、HTTP）
- ✅ 通过环境变量的基本配置
- ❌ 分布式跟踪（尚未实现）
- ❌ 自定义检测 API（尚未公开）
- ❌ 采样配置（使用默认值）

## 最佳实践

1. **首先测试**：始终在生产环境发送之前使用控制台导出器测试
2. **安全凭据**：永远不要硬编码 API 密钥；使用安全的环境变量管理
3. **监控成本**：注意可观察性平台的数据摄取成本
4. **从简单开始**：首先仅使用指标，需要时再添加日志
5. **使用压缩**：OTLP 支持压缩；检查你的端点是否需要它

## 下一步

<CardGroup cols={2}>
  <Card title="Cline 数据采集" icon="chart-simple" href="/enterprise-solutions/monitoring/telemetry">
    配置简单的内置数据采集
  </Card>
  
  <Card title="OpenTelemetry 文档" icon="book" href="https://opentelemetry.io/docs/">
    了解有关 OpenTelemetry 的更多信息
  </Card>
</CardGroup>
