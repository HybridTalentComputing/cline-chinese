---
title: "URL 引用"
sidebarTitle: "URL 引用"
---

URL 引用让你可以将 Web 内容直接带入与 Cline 的对话中。只需输入 `@` 后跟任何 URL，Cline 就可以看到该网页的内容，而无需你复制和粘贴任何东西。

当你在聊天中输入 `@` 后跟 URL（如 `@https://example.com`）时，Cline 将获取该网页的内容并将其包含在上下文中。这适用于文档页面、GitHub 问题、Stack Overflow 问题或你想引用的任何其他 Web 内容。

当我使用外部 API 或库时，我一直使用 URL 引用。与其试图解释 API 如何工作或复制文档片段，不如直接引用文档：

```
我正在尝试使用此 API 实现身份验证：@https://api.example.com/docs/auth

你能帮我编写基于这些文档获取访问令牌的代码吗？
```

这给了 Cline 完整的文档页面，因此它可以看到所有身份验证要求、端点、参数和示例。然后 Cline 可以基于官方文档提供更准确和全面的帮助。

URL 引用对于引用 GitHub 问题或讨论特别有用：

```
我正在尝试修复我们项目中的这个问题：@https://github.com/our-org/our-repo/issues/123

这是我当前的实现：@/src/components/Feature.jsx

我需要做什么更改来解决这个问题？
```

这向 Cline 显示完整的 GitHub 问题，包括描述、评论以及任何代码片段或屏幕截图。然后 Cline 可以帮助你实现直接解决报告问题的解决方案。

下次你使用外部文档或在线资源时，尝试使用 URL 引用而不是复制和粘贴内容。你会获得更准确的帮助，因为 Cline 可以看到网页的完整上下文，包括格式、代码示例和周围信息。

## 底层工作原理

当你在消息中使用 URL 引用时，幕后发生的事情如下：

1. 当你发送消息时，Cline 检测文本中的 `@http://...` 或 `@https://...` 模式
2. 扩展在后台启动无头浏览器（Puppeteer）
3. 它导航到 URL 并等待页面完全加载
4. 浏览器捕获页面内容，包括文本、格式和代码示例
5. 内容转换为保留结构的 Markdown 格式
6. 此内容以结构化格式附加到你的消息中：

    ```
    <url_content url="https://example.com/docs">
    # Example API Documentation

    ## Authentication

    To authenticate with the API, you need to...

    const token = await api.authenticate({
      username: 'user',
      password: 'pass'
    });

    [Markdown 格式的完整网页内容]
    </url_content>
    ```

7. 然后关闭浏览器以释放资源
8. 此增强消息及其嵌入的网页内容被发送到 AI

每当你使用 URL 引用时，这个过程自动发生，向 AI 提供对网页完整内容的访问，而无需你复制和粘贴任何东西。
