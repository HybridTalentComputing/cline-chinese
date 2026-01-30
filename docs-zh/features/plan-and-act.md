---
title: "计划和执行"
sidebarTitle: "计划和执行"
---

计划和执行模式代表 Cline 对结构化 AI 开发的方法，强调实施之前的深思熟虑规划。这种双模式系统帮助开发者创建更可维护、准确的代码，同时减少迭代时间。

<Frame>
	<iframe
		style={{ width: "100%", aspectRatio: "16/9" }}
		src="https://www.youtube.com/embed/b7o6URFPp64"
		title="YouTube video player"
		frameBorder="0"
		allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
		allowFullScreen></iframe>
</Frame>

#### 计划模式：先思考

计划模式是你和 Cline 弄清楚你要构建什么以及如何构建它的地方。在此模式下，Cline：

-   可以读取你的整个代码库以理解上下文
-   不会对你的文件进行任何更改
-   专注于理解要求和创建策略
-   帮助你在编写任何代码之前识别潜在问题

<Tip>
在计划模式中尝试[语音输入](/features/dictation) - 不是输入复杂的要求，而是自然说话并分享你的完整思维过程。这对于快速来回规划讨论非常完美。
</Tip>

#### 执行模式：构建它

一旦你有了计划，你切换到执行模式。现在 Cline：

-   拥有所有构建能力可供使用
-   可以对你的代码库进行更改
-   仍然记住规划会话中的所有内容
-   执行你一起制定出的策略

<Frame>
	<img src="https://storage.googleapis.com/cline_public_images/docs/assets/image%20(5).png" alt="Act mode capabilities" />
</Frame>

### 工作流指南

当我正在开发新功能或修复复杂错误时，这对我很有效：

1. 我在计划模式中开始，告诉 Cline 我想要构建什么
2. Cline 帮助我探索代码库，查看相关文件
3. 我们一起确定最佳方法，考虑边缘情况和潜在问题
4. 当我对我们的计划有信心时，我切换到执行模式
5. Cline 根据我们的规划实施解决方案

#### 1. 从计划模式开始

在计划模式中开始每个重要的开发任务：

在此模式下：

<Frame>
	<img src="https://storage.googleapis.com/cline_public_images/docs/assets/image%20(5)%20(1).png" alt="Plan mode workflow" />
</Frame>

-   分享你的要求
-   让 Cline 分析相关文件
-   进行对话以澄清目标
-   开发实施策略

<Frame>
	<img
		src="https://storage.googleapis.com/cline_public_images/docs/assets/image%20(2)%20(1)%20(1)%20(1).png"
		alt="Planning phase"
	/>
</Frame>

#### 2. 切换到执行模式

一旦你有了清晰的计划，切换到执行模式：

<Frame>
	<img src="https://storage.googleapis.com/cline_public_images/docs/assets/switching-to-act.gif" alt="Switching to Act mode" />
</Frame>

执行模式允许 Cline：

-   按照商定的计划执行
-   对你的代码库进行更改
-   维护规划阶段的上下文

#### 3. 根据需要迭代

复杂项目通常需要多个计划-执行周期：

-   遇到意外复杂性时返回计划模式
-   使用执行模式实施解决方案
-   在确保质量的同时保持开发动量

### 最佳实践

#### 规划阶段

1. 对要求全面
2. 预先分享相关上下文
3. 如果 Cline 没有读取它们，则指向相关文件
4. 在实施之前验证方法

#### 实施阶段

1. 遵循既定计划
2. 监控相对于目标的进度
3. 跟踪更改及其影响
4. 记录重要决策

<Frame>
	<img
		src="https://storage.googleapis.com/cline_public_images/docs/assets/image%20(3)%20(1).png"
		alt="Implementation best practices"
	/>
</Frame>

### 高级用户提示

#### 增强规划

-   使用计划模式在实施之前探索边缘情况
-   遇到意外复杂性时切回计划
-   利用[文件读取](/features/at-mentions/file-mentions)提前验证假设
-   让 Cline 编写计划的 Markdown 文件以供将来参考

### 常见模式

#### 何时使用每种模式

我发现计划模式在以下情况最有效：

-   开始新事物，其中方法不明显
-   调试棘手的问题，我不确定错误是什么
-   做出将影响代码库多个部分的架构决策
-   试图理解复杂的工作流或功能

执行模式非常适合：

-   实施我们已经计划好的解决方案
-   进行方法清晰的常规更改
-   遵循代码库中的既定模式
-   运行测试并进行微小调整

<Frame>
	<img src="https://storage.googleapis.com/cline_public_images/docs/assets/image%20(6).png" alt="Mode usage patterns" />
</Frame>

### 贡献

分享你的经验和改进：

-   加入我们的 [Discord 社区](https://discord.gg/cline)
-   参与讨论
-   提交功能请求
-   报告问题

---

记住：规划投入的时间在实施质量和维护效率上会有回报。
