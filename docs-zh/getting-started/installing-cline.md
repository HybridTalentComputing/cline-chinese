---
title: "安装 Cline"
description: "按照这些简单的安装步骤，在您喜欢的 IDE 中快速启动并运行 Cline"
---

<Note>
**准备开始了吗？** 安装只需不到 2 分钟！在下面选择您的编辑器并按照简单步骤操作。
</Note>

## 开始之前

<CardGroup cols={1}>
  <Card title="创建您的账户" icon="user-plus" href="https://app.cline.bot/login">
    注册一个 **免费的 Cline 账户**即可获得：
    - 访问多个 AI 模型，包括隐身模型
    - 无缝设置，无需管理 API 密钥
    - 通过合作伙伴提供商偶尔获得免费推理
  </Card>
  
  <Card title="拥有兼容的编辑器" icon="code">
    Cline 支持：
    - **VS Code** / **Cursor**
    - **JetBrains IDEs**（IntelliJ、PyCharm、WebStorm 等）
    - **VSCodium** / **Windsurf**
    
    在继续之前先安装一个。
  </Card>
</CardGroup>

## 安装说明
<Tabs>
  <Tab title="VS Code/Cursor" icon="code">
    <Frame>
      <img
      	src="https://storage.googleapis.com/cline_public_images/vscode.png"
      	alt="VS Code logo"
      	style={{ width: "100px", height: "auto", display: "block" }}
      />
    </Frame>
    <Steps>
      <Step title="打开扩展">
        启动 VS Code 并打开扩展视图：
        - 按 `Ctrl/Cmd + Shift + X`，或
        - 点击活动栏中的扩展图标
      </Step>

      <Step title="搜索 Cline">
        在扩展市场搜索栏中输入 **"Cline"**
        	<Frame>
            <img src="https://storage.googleapis.com/cline_public_images/extension-installation.png" alt="VS Code marketplace showing Cline extension" 
            />
          </Frame>
      </Step>

      <Step title="安装">
        点击 Cline 扩展上的 **安装**按钮
        
        <Frame caption="VS Code marketplace with Cline extension ready to install">
        	<img
        		src="https://storage.googleapis.com/cline_public_images/docs/assets/image%20(20).png"
        		alt="VS Code marketplace showing Cline extension"
        	/>
        </Frame>
      </Step>

      <Step title="访问 Cline">
        安装完成后：
        - 点击活动栏中的 **Cline 图标**，或
        - 打开命令面板（`Ctrl/Cmd + Shift + P`）→ 输入 **"Cline: Open In New Tab"**

        <Frame caption="在 VSCode 中打开 Cline">
        	<img
        		src="https://storage.googleapis.com/cline_public_images/after-installation.png"
        		alt="在 VSCode 中打开 Cline"
        	/>
        </Frame>
        
        <Warning>
        如果 VS Code 显示"Running extensions might..."对话框，请点击 **允许**。如果看不到 Cline 图标，请重启 VS Code。
        </Warning>
      </Step>
    </Steps>

    <Check>
    **安装完成！** 您现在应该在编辑器中看到 Cline 界面。是时候登录了！
    </Check>

    <Accordion title="故障排除">

    **扩展安装问题**

    如果您在市场中找不到 Cline：
    - 确保您在 **市场**选项卡中搜索（不是已安装）
    - 尝试搜索"Cline AI"或仅搜索"Cline"
    - 检查您的 VS Code 版本是否兼容

    如果安装失败：
    - 重启 VS Code 并重试
    - 检查您的网络连接
    - 尝试从 VSIX 文件安装作为替代方案

    **扩展未显示**

    如果安装后看不到 Cline 工具窗口：
    - 完全重启 VS Code（文件 → 退出并重新打开）
    - 检查 **视图** → **命令面板** → "Cline: Open In New Tab"
    - 在 **扩展** 视图中验证插件已启用
    - 在活动栏中查找 Cline 图标（通常在左侧）

    **常见问题**

    扩展似乎已安装但不起作用：
    - 确保安装后已重启 VS Code
    - 检查开发人员控制台中是否有任何错误消息
    - 尝试禁用并重新启用扩展

    性能或兼容性问题：
    - 确保您使用的是受支持的 VS Code 版本
    - 检查可能改善兼容性的 VS Code 更新
    - 如有必要，考虑关闭其他占用资源的扩展

    需要帮助？加入我们的 [Discord 社区](https://discord.gg/cline)。

    </Accordion>
  </Tab>
  
  <Tab title="JetBrains IDEs" icon="brain">
    <img
    	src="https://storage.googleapis.com/cline_public_images/docs/assets/jetbrains-logo.svg"
    	alt="JetBrains logo"
    	style={{ width: "200px", height: "auto", margin: "0 auto 20px auto", display: "block" }}
    />

    <Note>
    JetBrains 版 Cline 的工作方式与 VS Code 几乎相同，拥有所有核心功能：差异编辑、工具、多个 API 提供商、MCP 服务器、Cline 规则/工作流等。
    </Note>

    ### 选择您的安装方式

    <Tabs>
      <Tab title="从 IDE（推荐）">
        <Steps>
          <Step title="打开设置">
            在您的 JetBrains IDE 中，转到 **设置**：
            - Windows/Linux：`Ctrl+Alt+S`
            - macOS：`Cmd+,`
          </Step>

          <Step title="导航到插件">
            转到 **插件** → **市场** 选项卡
          </Step>

          <Step title="安装 Cline">
            搜索 **"Cline"** 并点击 **安装**
            
            <Frame>
            	<img
            		src="https://storage.googleapis.com/cline_public_images/jetbrains-installation.png"
            		alt="JetBrains marketplace showing Cline plugin search results"
            	/>
            </Frame>
          </Step>

          <Step title="重启 IDE">
            重启您的 IDE 以完成安装
            <Frame>
            	<img
            		src="https://storage.googleapis.com/cline_public_images/jetbrains-post-installation.png"
            		alt="JetBrains marketplace showing Cline plugin search results"
            	/>
            </Frame>
          </Step>
        </Steps>
      </Tab>

      <Tab title="浏览器安装">
        <Steps>
          <Step title="访问市场">
            转到 [JetBrains Marketplace](https://plugins.jetbrains.com/plugin/28247-cline)
          </Step>

          <Step title="点击安装到 IDE">
            点击 **安装到 IDE** 按钮
          </Step>

          <Step title="在 IDE 中确认">
            您的 IDE 将打开并提示您确认安装
          </Step>

          <Step title="重启 IDE">
            重启以完成安装
          </Step>
        </Steps>
      </Tab>

      <Tab title="手动安装">
        <Steps>
          <Step title="下载插件">
            从 [市场页面](https://plugins.jetbrains.com/plugin/28247-cline) 下载
          </Step>

          <Step title="打开设置">
            转到 **设置** → **插件**
          </Step>

          <Step title="从磁盘安装">
            点击齿轮图标 → **从磁盘安装插件**
          </Step>

          <Step title="选择文件并重启">
            选择下载的 `.zip` 文件并重启您的 IDE
          </Step>
        </Steps>
      </Tab>
    </Tabs>

    <Check>
    **安装完成！** 在 **视图** → **工具窗口** → **Cline** 中找到 Cline（通常在右侧）。
    </Check>

    ### 在 JetBrains 中的功能

    <AccordionGroup>
      <Accordion title="✅ 所有核心功能" defaultOpen>
        - 差异编辑和文件修改
        - 多个 API 提供商（Anthropic、OpenAI、本地模型）
        - MCP 服务器和自定义工具
        - Cline 规则和工作流
        - 文件、文件夹和问题的 @ 提及
        - 拖放支持
      </Accordion>

      <Accordion title="📋 终端集成差异">
        **JetBrains 显示终端输出的方式与 VS Code 不同：**
        - VS Code：输出直接流式传输到聊天
        - JetBrains：输出显示在可折叠的"命令输出"部分中
        
        命令在两者中都能成功执行——只需在 JetBrains 中展开部分即可查看结果。
      </Accordion>
    </AccordionGroup>

    <Accordion title="故障排除">

    **插件安装问题**

    如果您在市场中找不到 Cline：
    - 确保您在 **市场**选项卡中搜索（不是已安装）
    - 尝试搜索"Cline AI"或仅搜索"Cline"
    - 检查您的 IDE 版本是否兼容（建议 2023.1 或更高版本）

    如果安装失败：
    - 重启您的 IDE 并重试
    - 检查您的网络连接
    - 尝试从磁盘安装作为替代方案

    **插件未显示**

    如果安装后看不到 Cline 工具窗口：
    - 完全重启您的 IDE（文件 → 退出并重新打开）
    - 检查 **视图** → **工具窗口** → **Cline**
    - 在 **设置** → **插件** → **已安装** 选项卡中验证插件已启用
    - 在 IDE 的工具窗口栏中查找 Cline 图标（通常在右侧）

    **常见问题**

    插件似乎已安装但不起作用：
    - 确保安装后已重启您的 IDE
    - 检查 IDE 的事件日志中是否有任何错误消息
    - 尝试在设置中禁用并重新启用插件

    性能或兼容性问题：
    - 确保您使用的是受支持的 JetBrains IDE 版本
    - 检查可能改善兼容性的 IDE 更新
    - 如有必要，考虑为您的 IDE 分配更多内存

    需要帮助？加入我们的 [Discord 社区](https://discord.gg/cline)。

    </Accordion>
  </Tab>
  
  <Tab title="VSCodium/Windsurf" icon="terminal">
    <Note>
    这些编辑器使用 **Open VSX Registry** 而不是 VS Code Marketplace，但安装过程几乎相同。
    </Note>

    <Steps>
      <Step title="打开扩展">
        启动您的编辑器（VSCodium、Windsurf 等）并打开扩展视图：
        - 按 `Ctrl/Cmd + Shift + X`
      </Step>

      <Step title="搜索 Cline">
        在市场搜索栏中输入 **"Cline"**
      </Step>

      <Step title="按作者安装">
        选择 **saoudrizwan** 的 **"Cline"** 并点击 **安装**
      </Step>

      <Step title="如需要则重新加载">
        如果提示完成安装，请重新加载您的编辑器
      </Step>
    </Steps>

    <Check>
    **安装完成！** 在活动栏中查找 Cline 图标或使用命令面板。
    </Check>

    <Accordion title="故障排除">

    **插件安装问题**

    如果您在市场中找不到 Cline：
    - 确保您在 **市场**选项卡中搜索（不是已安装）
    - 尝试搜索"Cline AI"或仅搜索"Cline"
    - 检查您的编辑器版本是否兼容

    如果安装失败：
    - 重启您的编辑器并重试
    - 检查您的网络连接
    - 尝试从磁盘安装作为替代方案

    **插件未显示**

    如果安装后看不到 Cline 工具窗口：
    - 完全重启您的编辑器（文件 → 退出并重新打开）
    - 检查 **视图** → **命令面板** → "Cline: Open In New Tab"
    - 在 **扩展** 视图中验证插件已启用
    - 在活动栏中查找 Cline 图标（通常在左侧）

    **常见问题**

    插件似乎已安装但不起作用：
    - 确保安装后已重启您的编辑器
    - 检查开发人员控制台中是否有任何错误消息
    - 尝试禁用并重新启用扩展

    性能或兼容性问题：
    - 确保您使用的是受支持的编辑器版本
    - 检查可能改善兼容性的编辑器更新
    - 如有必要，考虑关闭其他占用资源的扩展

    需要帮助？加入我们的 [Discord 社区](https://discord.gg/cline)。

    </Accordion>
  </Tab>
</Tabs>

## 下一步：登录并开始构建

<Steps>
  <Step title="打开 Cline">
    在您的编辑器中找到并打开 Cline：
    - **VS Code/Cursor/VSCodium/Windsurf：** 点击活动栏中的 Cline 图标
    - **JetBrains：** 转到 **视图** → **工具窗口** → **Cline**
  </Step>

  <Step title="登录">
    点击 Cline 界面中的 **注册**按钮
    
    <Info>
    您将被重定向到 [app.cline.bot](https://app.cline.bot) 进行身份验证。登录后，您将自动返回到您的编辑器。
    </Info>
    <Info>
    您将被重定向到 Cline 身份验证页面以使用您的账户登录。
    </Info>
  </Step>

  <Step title="一切就绪！">
    <Check>
    **恭喜！** 您已准备好开始使用 Cline！ 
    
    Cline 现在已准备好帮助您构建项目。 
    </Check>
  </Step>
</Steps>

## 成功技巧

<CardGroup cols={2}>
  <Card title="提问" icon="circle-question">
    不知道某些事情？在计划模式中提问！Cline 可以解释概念、调试错误并引导您完成任务。
  </Card>
  
  <Card title="使用截图" icon="image">
    某些模型可以理解您正在处理的屏幕截图或遇到的错误。
  </Card>
  
  <Card title="分享错误消息" icon="triangle-exclamation">
    使用 @problems 分享错误消息以获取快速解决方案和调试帮助。
  </Card>
  
  <Card title="自然表达" icon="comments">
    使用您自己的话语——无需技术术语。Cline 会将您的想法转化为代码。
  </Card>
</CardGroup>

## 需要帮助？

<CardGroup cols={2}>
  <Card title="加入我们的 Discord" icon="discord" href="https://discord.gg/cline">
    与我们的团队和社区联系以获取支持、技巧和讨论。
  </Card>
  
  <Card title="阅读文档" icon="book-open" href="/getting-started/selecting-your-model">
    探索模型选择指南和高级功能，以充分利用 Cline。
  </Card>
</CardGroup>
