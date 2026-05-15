---
title: "Cline 数据采集"
sidebarTitle: "Cline 数据采集"
description: "配置使用分析和事件采集"
---

Cline 包含数据采集功能，以帮助了解使用模式并改进产品。用户可以控制是否共享此数据。

## 什么是 Cline 数据采集？

数据采集捕获匿名使用事件，例如：

- 使用的功能（哪些工具、命令、工作流）
- 任务完成率
- 错误发生
- 性能指标

<Info>
所有数据采集数据都是**匿名的**，不包括代码内容、文件内容或其他敏感信息。
</Info>

## 用户控制

### 启用/禁用 Cline 数据采集

单个用户可以通过 Cline 设置控制数据采集：

1. 打开 Cline 设置
2. 找到"Cline 数据采集"切换
3. 根据偏好启用或禁用

更改立即生效。

### 收集的内容

启用数据采集后，Cline 捕获：

<AccordionGroup>
  <Accordion title="功能使用" icon="cursor-click">
    - 执行的工具（例如，read_file、execute_command）
    - 使用的斜杠命令
    - 触发的工作流
    - 更改的设置
  </Accordion>
  
  <Accordion title="任务指标" icon="tasks">
    - 任务开始/完成事件
    - 模式切换（计划/执行）
    - 检查点使用
    - 任务持续时间
  </Accordion>
  
  <Accordion title="错误事件" icon="triangle-exclamation">
    - API 失败
    - 工具执行错误
    - 系统错误
    - 错误类型和频率
  </Accordion>
</AccordionGroup>

### 不收集的内容

Cline 数据采集**从不**包括：

- 你的代码或文件内容
- 文件路径或名称
- 命令参数或参数
- 对话内容
- 个人信息
- API 密钥或凭据

## 企业配置

管理员可以通过远程配置设置默认数据采集状态：

```json
{
  "telemetryEnabled": true
}
```

<Note>
即使有企业配置，单个用户仍可在其本地设置中禁用 Cline 数据采集。
</Note>

## 高级数据采集

对于需要详细数据采集的组织，Cline 支持可选的 OpenTelemetry 集成，将数据采集数据导出到你自己的可观察性系统。

有关可用监控选项的详细信息，请参阅[企业监控](/enterprise-solutions/monitoring/overview)。

## 隐私

Cline 的数据采集设计考虑到隐私：

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
  
  <Card title="透明" icon="eye">
    开源 - 准确查看收集的内容
  </Card>
</CardGroup>

## 数据采集为何重要

匿名使用数据有助于：

- **识别错误**：发现影响用户的问题
- **优先处理功能**：专注于最常用的功能
- **改进性能**：查找并修复缓慢的操作
- **增强可靠性**：跟踪并降低错误率

## 相关

<CardGroup cols={2}>
  <Card title="OpenTelemetry" icon="chart-line" href="/enterprise-solutions/monitoring/opentelemetry">
    企业监控和可观察性
  </Card>
  
  <Card title="隐私" icon="shield" href="/more-info/telemetry">
    完整的数据采集文档
  </Card>
</CardGroup>
