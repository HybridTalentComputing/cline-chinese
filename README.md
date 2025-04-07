# Cline-Chinese (Cline中文汉化版) 🌏

> 🎉 截止到2025.04.01，Cline Chinese在VS Code插件市场的下载量突破35k啦！且仍在以一天1k的速度增加，感谢大家的支持！

<p align="center">

[![MCP市场](https://img.shields.io/badge/MCP%E5%B8%82%E5%9C%BA-访问-blue)](https://www.mcp-home.com/) [![Cline Chinese文档](https://img.shields.io/badge/Cline%20Chinese-文档-blue)](https://hybridtalentcomputing.gitbook.io/cline-chinese-doc/) [![Discord](https://img.shields.io/badge/Discord-加入讨论-7289DA)](https://discord.gg/fhj9hqy89t) [![Version](https://img.shields.io/visual-studio-marketplace/v/HybridTalentComputing.cline-chinese)](https://marketplace.visualstudio.com/items?itemName=HybridTalentComputing.cline-chinese) [![Downloads](https://img.shields.io/visual-studio-marketplace/d/HybridTalentComputing.cline-chinese)](https://marketplace.visualstudio.com/items?itemName=HybridTalentComputing.cline-chinese) [![Rating](https://img.shields.io/visual-studio-marketplace/r/HybridTalentComputing.cline-chinese)](https://marketplace.visualstudio.com/items?itemName=HybridTalentComputing.cline-chinese)

</p>

## 项目地址
https://github.com/HybridTalentComputing/cline-chinese
欢迎大家star，fork，提出issue，贡献代码，一起完善这个项目。

## MCP市场（MCP信息以中文形式呈现）
https://www.mcp-home.com/
欢迎大家注册，收藏、上传自己喜欢的MCP Server/Client.

## 文档地址(包括使用方法，MCP知识，常见问题解答等)
https://hybridtalentcomputing.gitbook.io/cline-chinese-doc/

## 功能展示

<video width="100%" controls src="https://github.com/user-attachments/assets/a6db47a9-08d7-4d20-afa0-110d23b71a81"></video>
> 演示视频使用 DeepSeek-R1-Distill-Qwen-14B 模型，展示了 Cline 中文汉化版的主要功能和使用效果，视频没有加速，推理速度快到飞起。

> 日常开发时，我使用的是某基某动的白嫖额度的模型API，如果您尚未注册，欢迎通过我的邀请链接：https://cloud.siliconflow.cn/i/BKtAlqbk ，或者注册的时候填写邀请码：BKtAlqbk，注册后双方均可获得2000万tokens的免费额度。我是Leo, 某基某动注册一下，帮助我白嫖token,我向你salute啊.

## 安装使用
Cline-Chinese已发布到VSCode插件市场，欢迎感兴趣的小伙伴们下载体验。

## 简介

这个项目是基于 [Cline](https://github.com/cline/cline) 的汉化版本。旨在优化由于英文 prompt 导致 Cline 在中文输入下+国产大模型（如：deepseek）表现不佳的问题, 并提供更符合中文用户习惯的UI界面和功能。目前已测试[DeepSeek-R1/DeepSeek-V3](https://github.com/deepseek-ai/DeepSeek-R1)工作良好。

日常使用cline等编程助手时发现使用某些模型推理速度较慢（如deepseek-R1, Claude-3.5-Sonnet），这个项目优先尝试在中文输入下，对轻量化LLM进行实验（如Deepseek-R1-Distill-Qwen-7B/14B），优化中文prompt, 以提升推理速度，大大减少等待的时间。

> **🚀 重要提示：经过测试，3.4.10版本下，DeepSeek-R1-Distill-Qwen-14B 模型工作良好，推理速度极快，强烈推荐尝试！**

## 背景

本人是一名AI从业者+爱好者，在使用Cline时，发现Cline的UI界面和提示词均为英文，使用中文输入时，有时会出现奇奇怪怪的输出，影响体验。因此，决定自己动手，汉化Cline。
另外，秉着学习的态度，未来将着手修改Cline的核心代码，增加新的功能，以提升体验。

## 版本说明

### 2025.04.01（ver.3.8.4）

    1. Cline Chinese特色功能：新增Dify Provider，感谢@lofyer，代码来自：https://github.com/lofyer/cline-dify/tree/main
    2. 合入cline 3.8新增特性和问题修复：
        关键特性：
        1. 添加到 Cline：在任何文件或终端中右键单击选定的文本，以快速将上下文添加到您当前的任务中！此外，当您看到灯泡图标时，选择“使用Cline 修复”让 Cline 修复您代码中的错误。
        2. 更快的推理：Cline/OpenRouter用户可以按吞吐量、价格和延迟对使用的底层提供商进行排序。按吞吐量排序将输出更快的生成结果（成本更高）。
        3. 增强的 MCP 支持：支持 GIF 的动态图像加载，以及一个新的删除按钮来清理失败的服务器。
        4. 近期新增模型支持，如gemini 2.5 pro, Deepseek-V3-0324，claude 3.7 sonnet-thinking.

## 欢迎关注我的自媒体账号

欢迎关注我的自媒体账号，获取更多AI开发和技术分享：

- 知乎：[Leo聊AI](https://www.zhihu.com/people/HTCMAX)
- B站：[Leo的AI世界](https://space.bilibili.com/23409884?spm_id_from=333.1007.0.0)
- 头条号：Leo的AI世界
- 小红书：Leo的AI世界
- 公众号：Leo的AI世界

## 加入社群

感兴趣的可以扫码加入微信社群，一起交流学习AI（如果二维码失效，请查看github项目中的首页中，相同位置的群二维码, 或者加入Discord频道）：

<div align="center">
  <img src="https://github.com/user-attachments/assets/9d795d1c-94f5-4a81-93ac-1bfea55168ce" alt="微信群二维码" width="250" />
</div>

GitHub 项目地址：https://github.com/HybridTalentComputing/cline-chinese

Discord 频道：https://discord.gg/fhj9hqy89t

## 赞赏支持

如果您觉得这个项目对您有帮助，欢迎赞赏支持，您的支持是我持续开发的动力 ☕

<div align="center" style="display: flex; justify-content: center; gap: 20px;">

  <img src="https://github.com/user-attachments/assets/f01e4514-e8ec-48de-883a-9f6fbd05c2a0" alt="支付宝赞赏" width="250" />
  <img src="https://github.com/user-attachments/assets/f4ee93ba-2960-46be-96a7-faaff3a0c38c" alt="微信赞赏" width="250" />

</div>

## 免责声明

1. **使用风险**：本项目是一个开源的VSCode插件，用户在使用过程中可能会遇到的任何问题或风险，开发者不承担任何责任。

2. **数据安全**：本插件不会收集或存储任何用户数据。但在使用过程中，用户应注意保护自己的敏感信息和代码安全。

3. **知识产权**：
   - 本项目是基于Cline的汉化版本，原版权归属于Cline团队。
   - 汉化部分的内容采用与原版Cline相同的Apache-2.0许可证。
   - 用户在使用过程中应遵守相关的开源协议。

4. **免责声明**：
   - 本项目不提供任何明示或暗示的保证，包括但不限于适销性和特定用途适用性的保证。
   - 开发者不对任何直接或间接损失负责，包括但不限于利润损失、数据丢失等。
   - 用户使用本插件即表示同意承担使用过程中的所有风险。

5. **更新和维护**：
   - 开发者将努力维护本项目，但不保证及时更新或修复所有问题。
   - 本项目可能随时变更或终止，会及时同步到本项目中。
---

> 注：本项目是个人维护的汉化版本，与原版 Cline 团队无关。如果您喜欢这个项目，也请给原版 [Cline](https://github.com/cline/cline) 一个 star ⭐️


