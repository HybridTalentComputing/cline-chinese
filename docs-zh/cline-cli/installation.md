---
title: "安装"
description: "安装 Cline CLI 并使用你的帐户验证"
---

## 先决条件

Cline CLI 需要 Node.js 版本 20 或更高版本。我们建议使用 Node.js 22 以获得最佳体验。

要检查你的 Node.js 版本：

```bash
node --version
```

## 安装

```bash
npm install -g cline
```

安装后，使用你的 Cline 帐户验证：

```bash
cline auth
```

这将启动验证向导，为你登录和配置你偏好的 AI 模型提供商。

## 快速开始

在几秒钟内开始使用 Cline：

```bash
cline
```

就是这样！在任何目录中运行 `cline` 都会启动一个交互式会话，你可以在其中与 AI 代理聊天。输入你的任务、查看计划，并在准备好执行时输入 `/act`。

为了更快地执行而无需交互：

```bash
cline "为 utils.js 添加单元测试"
```

这使用单个命令运行 Cline，非常适合快速任务或自动化。

<Tip>
Cline CLI 的新手？从交互模式 (`cline`) 开始，看看它是如何工作的。一旦熟悉，探索[三个核心流程](/cline-cli/three-core-flows)以了解高级使用模式。
</Tip>
