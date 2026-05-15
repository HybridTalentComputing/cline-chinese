---
title: "企业数据采集"
sidebarTitle: "概述"
description: "Cline 部署的可选数据采集和可观察性"
---

Cline 包含可选的数据采集功能，用于希望跟踪使用情况并与可观察性基础设施集成的组织。

## 数据采集选项

<CardGroup cols={2}>
  <Card title="Cline 数据采集" icon="chart-simple" href="/enterprise-solutions/monitoring/telemetry">
    内置的匿名使用跟踪，有助于改进 Cline（可选择加入）
  </Card>
  
  <Card title="OpenTelemetry" icon="chart-line" href="/enterprise-solutions/monitoring/opentelemetry">
    将指标和日志导出到你自己的可观察性后端（高级）
  </Card>
</CardGroup>

## Cline 数据采集

Cline 包含用于匿名使用跟踪的可选择加入的数据采集：

- 功能使用模式
- 任务完成率  
- 错误发生
- 性能指标

用户可以在 Cline 设置中启用或禁用数据采集。所有数据都是匿名的，不包括代码内容、文件路径或敏感信息。

有关配置详细信息，请参阅 [Cline 数据采集](/enterprise-solutions/monitoring/telemetry)。

## OpenTelemetry 集成

对于高级数据采集需求，Cline 支持 OpenTelemetry 的 OTLP（OpenTelemetry 协议），用于将指标和日志导出到你自己的基础设施。

这允许你：
- 将数据采集导出到你现有的可观察性平台
- 与 Datadog、New Relic 或 Grafana Cloud 等工具集成
- 对数据采集数据保持完全控制
- 在整个组织中聚合指标

<Note>
OpenTelemetry 集成是**可选的**，需要额外配置。大多数用户不需要此功能。
</Note>

有关设置说明，请参阅 [OpenTelemetry](/enterprise-solutions/monitoring/opentelemetry)。

## 用例

### 何时使用 Cline 数据采集
- 你希望通过匿名使用数据帮助改进 Cline
- 无需额外设置
- 适合大多数用户

### 何时使用 OpenTelemetry
- 你需要在自己的系统中进行细粒度指标
- 你正在与现有的可观察性基础设施集成
- 你需要详细的日志和指标进行调试
- 你需要自定义仪表板或警报

## 开始使用

<Steps>
<Step title="选择你的方法">
决定基本数据采集还是 OpenTelemetry 集成适合你的需求
</Step>

<Step title="启用数据采集">
对于基本数据采集，在 Cline 设置中启用它。对于 OpenTelemetry，请参阅配置指南。
</Step>

<Step title="验证数据收集">
确认数据采集正在按预期收集
</Step>
</Steps>

## 隐私与安全

所有 Cline 数据采集功能都考虑到隐私而设计：

<CardGroup cols={2}>
  <Card title="匿名" icon="user-secret">
    不收集个人信息
  </Card>
  
  <Card title="可选" icon="toggle-on">
    用户可以随时禁用
  </Card>
  
  <Card title="本地优先" icon="laptop">
    代码从不离开你的机器
  </Card>
  
  <Card title="透明" icon="code">
    开源 - 查看收集的内容
  </Card>
</CardGroup>

## 下一步

<CardGroup cols={2}>
  <Card title="配置数据采集" icon="gear" href="/enterprise-solutions/monitoring/telemetry">
    设置基本数据采集设置
  </Card>
  
  <Card title="OpenTelemetry 设置" icon="chart-line" href="/enterprise-solutions/monitoring/opentelemetry">
    使用 OpenTelemetry 进行高级数据采集
  </Card>
</CardGroup>
