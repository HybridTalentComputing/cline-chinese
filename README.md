# Cline-Chinese (Cline中文汉化版) 🌏

> 🎉 截止到2026.5.1，Cline Chinese在VS Code插件市场的下载量突破224k啦！感谢大家的支持！




<p align="center">

[![MCP市场](https://img.shields.io/badge/MCP%E5%B8%82%E5%9C%BA-访问-blue)](https://www.mcp-home.com/) [![Cline Chinese文档](https://img.shields.io/badge/Cline%20Chinese-文档-blue)](https://hybridtalentcomputing.gitbook.io/cline-chinese-doc/) [![Discord](https://img.shields.io/badge/Discord-加入讨论-7289DA)](https://discord.gg/fhj9hqy89t) [![Version](https://img.shields.io/visual-studio-marketplace/v/HybridTalentComputing.cline-chinese)](https://marketplace.visualstudio.com/items?itemName=HybridTalentComputing.cline-chinese) [![Downloads](https://img.shields.io/visual-studio-marketplace/d/HybridTalentComputing.cline-chinese)](https://marketplace.visualstudio.com/items?itemName=HybridTalentComputing.cline-chinese) [![Rating](https://img.shields.io/visual-studio-marketplace/r/HybridTalentComputing.cline-chinese)](https://marketplace.visualstudio.com/items?itemName=HybridTalentComputing.cline-chinese)

</p>

## 项目地址
https://github.com/HybridTalentComputing/cline-chinese
欢迎大家star，fork，提出issue，贡献代码，一起完善这个项目。

## 文档（感谢[@flyfreee](https://github.com/flyfreee)的翻译工作）
https://hybridtalentcomputing.gitbook.io/cline-chinese-doc/

## Supremum（更适合Vibe Coding的AI终端）
https://github.com/HybridTalentComputing/Supremum
如果您也在使用Claude Code/Codex 等CLI工具, 不妨看看我这个新项目。



## 赞助商
<img width="100%" alt="胜算云" src="https://github.com/user-attachments/assets/19091f07-c171-4cf6-b7af-4e11f549364a" />


> 胜算云是AI自动生产超级工厂，长三角国家技术创新中心重大扶持项目，打造工业级 AI 任务执行矩阵。依托完整的全球API算力供应链与弹性算力容器，实现云端快速并发执行 AI 任务，持久化工作流编排，矩阵式执行，共享知识库，高效低成本获得可靠计算结果。点击此处查看[网关实时稳定性监控](https://watch.shengsuanyun.com/status/shengsuanyun), 点击此处进入模型网关超市获取API算力：[胜算云](https://www.shengsuanyun.com/?from=cline-chinese)，注册新用户可获10元模力及首充10%赠送。


## 功能展示

<video width="100%" controls src="https://github.com/user-attachments/assets/a6db47a9-08d7-4d20-afa0-110d23b71a81"></video>

### 一起薅羊毛：
> 🚀 推荐智谱 GLM Coding 超值订阅，邀你一起薅羊毛！Claude Code、Cline 等 10+ 大编程工具无缝支持，“码力”全开，越拼越爽！立即开拼，享限时惊喜价！
      链接：(https://www.bigmodel.cn/claude-code?ic=FKYWQWPUMQ)

## 安装使用
Cline-Chinese已发布到VSCode插件市场，欢迎感兴趣的小伙伴们下载体验。

## 简介

这个项目是基于 [Cline](https://github.com/cline/cline) 的汉化版本。旨在优化由于英文 prompt 导致 Cline 在中文输入下+国产大模型（如：deepseek）表现不佳的问题, 并提供更符合中文用户习惯的UI界面和功能。目前已测试[DeepSeek-R1/DeepSeek-V3](https://github.com/deepseek-ai/DeepSeek-R1)工作良好。

日常使用cline等编程助手时发现使用某些模型推理速度较慢（如deepseek-R1, Claude-3.5-Sonnet），这个项目优先尝试在中文输入下，对轻量化LLM进行实验（如Deepseek-R1-Distill-Qwen-7B/14B），优化中文prompt, 以提升推理速度，大大减少等待的时间。



## 背景

本人是一名AI从业者+爱好者，在使用Cline时，发现Cline的UI界面和提示词均为英文，使用中文输入时，有时会出现奇奇怪怪的输出，影响体验。因此，决定自己动手，汉化Cline。
另外，秉着学习的态度，未来将着手修改Cline的核心代码，增加新的功能，以提升体验。

## 特色功能
1. 支持Dify Provider (已受cline官方支持，欢迎体验)

## 版本更新说明
## 2026.02.08 （ver.3.46.9）
修复defaultChatParticipant报错问题

## 2026.01.31 （ver.3.46.7）
1.修复https代理失效的问题
2.修复胜算云登录及模型无法使用问题
3.修复“claude code xxx” 报错问题

### 2026.01.28（ver.3.46.6）
修复openai compatible生成效果异常的问题

### 2026.01.23（ver.3.46.5）
1. 同步近期cline更新。

### 2025.08.25（ver.3.25.2）
1. 同步近期cline更新。(上下文压缩，添加claude code provider)

### 2025.06.17（ver.3.17.11）
   1. 同步近期cline更新。
   2. 接入胜算云.

### 2025.05.19（ver.3.16.1）
   1. 同步近期cline更新。


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

- 微信公众号：Leo的AI世界

## 加入社群

感兴趣的可以扫码加入微信社群，一起交流学习AI（如果二维码失效，请查看github项目中的首页中，相同位置的群二维码, 或者加入Discord频道）：

<div align="center">
  <img src="https://github.com/user-attachments/assets/d80d30e2-71b7-44e4-83e3-1166da0044bf" alt="微信群二维码" width="250" />
</div>

GitHub 项目地址：https://github.com/HybridTalentComputing/cline-chinese

Discord 频道：https://discord.gg/fhj9hqy89t


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

6. **合规使用**：
   - 用户在使用本插件时，必须遵守当地法律法规。
   - **严禁将本插件用于任何违法违规行为**（包括但不限于网络攻击、非法侵入、数据窃取、传播非法信息等）。
   - 开发者对用户利用本插件进行的任何违法行为及其产生的后果不承担任何法律责任。
---

> 注：本项目是个人维护的汉化版本，与原版 Cline 团队无关。如果您喜欢这个项目，也请给原版 [Cline](https://github.com/cline/cline) 一个 star ⭐️


