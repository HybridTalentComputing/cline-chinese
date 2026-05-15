---
title: "问题引用"
sidebarTitle: "问题引用"
---

问题引用让 Cline 即时访问工作区中的所有错误和警告。只需输入 `@problems`，Cline 就可以看到 VSCode 检测到的每个诊断问题。

当你在聊天中输入 `@` 时，从菜单中选择"问题"或直接输入 `@problems`。Cline 将立即看到工作区中的所有错误和警告，包含文件位置和错误消息。

当我在构建错误或 TypeScript 问题上卡住时，我经常使用问题引用。与其试图描述错误或逐个复制它们，不如直接询问：

```
我遇到了这些 TypeScript 错误，我不确定如何修复它们：@problems

你能帮我理解哪里有问题以及如何修复吗？
```

这给了 Cline 错误的完整列表及其确切位置和消息。然后 Cline 可以分析多个错误的模式并建议全面的解决方案。

当与文件引用结合时，问题引用特别强大。当我处理复杂的类型错误时，我会同时引用两者：

```
我遇到了这些类型错误：@problems

这是我的组件：@/src/components/DataTable.tsx
还有类型文件：@/src/types/api.ts

我该如何修复这些问题？
```

这种方法给了 Cline 它需要的一切 - 确切错误、组件代码和类型定义 - 所有这些都不需要我手动复制任何东西。

下次你在错误上卡住时，尝试使用 `@problems` 而不是复制错误消息。你会获得更准确的帮助，因为 Cline 可以看到完整的错误上下文和位置。

## 底层工作原理

当你在消息中使用问题引用时，幕后发生的事情如下：

1. 当你发送消息时，Cline 检测文本中的 `@problems` 模式
2. 扩展调用 VSCode 内置的 `vscode.languages.getDiagnostics()` API 来获取所有错误和警告
3. 它将这些诊断格式化为结构化文本表示，包含文件路径、行号和错误消息
4. 格式化的问题列表以结构化格式附加到你的消息中：
    ```
    <workspace_diagnostics>
    /path/to/file.js:10:5 - error TS2322: Type 'string' is not assignable to type 'number'.
    /path/to/file.js:15:3 - warning: This variable is never used.
    </workspace_diagnostics>
    ```
5. 此增强消息及其嵌入的诊断被发送到 AI
6. AI 现在"看到"工作区中的所有错误和警告，包含它们的位置和消息

每当你使用问题引用时，这个过程自动发生，向 AI 提供工作区中所有问题的全面视图，而无需你手动复制它们。
