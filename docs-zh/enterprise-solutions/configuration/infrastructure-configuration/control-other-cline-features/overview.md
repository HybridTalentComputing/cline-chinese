---
title: "概述"
sidebarTitle: "概述"
description: "为企业部署配置 Cline 设置"
---

本部分涵盖在企业部署中控制 Cline 行为的配置选项。

## 可用设置

<Card title="YOLO 模式" icon="rocket" href="/enterprise-solutions/configuration/infrastructure-configuration/control-other-cline-features/yolo-mode">
  控制对具有完全自动批准的自主操作模式的企业访问
</Card>

## 配置方法

这些设置可以通过以下方式配置：


### 单个用户
- 用户可以在其本地 Cline 界面中切换设置
- 企业策略可以限制某些设置
- 更改立即应用于新任务

## 企业控制

管理员可以通过远程配置强制执行策略：

```json
{
  "yoloModeAllowed": false}
```

当 `yoloModeAllowed` 设置为 `false` 时，用户无法在其本地 Cline 界面中启用 YOLO 模式。
