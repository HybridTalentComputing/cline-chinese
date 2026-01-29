---
title: "自动上下文摘要"
sidebarTitle: "自动压缩"
---

当你的对话接近模型的上下文窗口限制时，Cline 会自动对其进行摘要以释放空间并继续工作。

<Frame>
	<img
		src="https://storage.googleapis.com/cline_public_images/docs/assets/condensing.png"
		alt="Auto-compact feature condensing conversation context"
	/>
</Frame>

## 工作原理

Cline 在对话期间监控令牌使用情况。当你接近限制时，它会：

1. 创建已发生所有内容的综合摘要
2. 保留所有技术细节、代码更改和决策
3. 用摘要替换对话历史
4. 精确地从停止的地方继续

当发生这种情况时，你会在聊天视图中看到摘要工具调用，显示像任何其他 API 调用一样的总成本。

## 为什么这很重要

以前，Cline 会在达到上下文限制时截断较旧的消息。这意味着从对话早期丢失重要上下文。

现在通过摘要：
- 所有技术决策和代码模式都被保留
- 文件更改和项目上下文保持完整
- Cline 记住他所做的所有事情
- 你可以处理更大的项目而不会中断

<Tip>
上下文摘要与[焦点链](/features/focus-chain)完美协同工作。当启用焦点链时，待办事项列表在摘要之间持续存在。这意味着 Cline 可以处理跨越多个上下文窗口的长期任务，同时在每次重置时通过待办事项列表保持跟踪。
</Tip>

## 技术细节

摘要通过你配置的 API 提供商使用你已经在使用的同一模型进行。它利用提示缓存来最小化成本。

1. Cline 使用[摘要提示](https://github.com/cline/cline/blob/main/src/core/prompts/contextManagement.ts)请求对话摘要。

2. 一旦生成摘要，Cline 会用[继续提示](https://github.com/cline/cline/blob/main/src/core/prompts/contextManagement.ts#L69)替换对话历史，该提示要求 Cline 继续工作并提供摘要作为上下文。

不同的模型有不同的上下文窗口阈值用于自动摘要启动。你可以在 [context-window-utils.ts](https://github.com/cline/cline/blob/main/src/core/context/context-management/context-window-utils.ts) 中查看如何确定阈值。

## 成本考虑

摘要利用你对话中现有的提示缓存，因此它的成本与任何其他工具调用大致相同。

由于大多数输入令牌已经被缓存，你主要支付摘要生成（输出令牌）的费用，使其非常经济高效。

## 使用检查点恢复上下文

你可以使用[检查点](/features/checkpoints) 在摘要发生之前恢复你的任务状态。这意味着你永远不会真正丢失上下文——你总是可以回滚到对话的先前版本。

<Note>
  在摘要工具调用之前编辑消息与检查点类似工作，允许你将对话恢复到该点。
</Note>

## 下一代模型支持

自动压缩使用先进的基于 LLM 的摘要，我们发现这对下一代模型效果显著更好。我们目前为以下模型支持此功能：

- **Claude 4 系列**
- **Gemini 2.5 系列**
- **GPT-5**
- **Grok 4**

<Note>
使用其他模型时，Cline 会自动回退到标准的基于规则的上下文截断方法，即使在设置中启用了自动压缩。
</Note>
