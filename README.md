# Cline-Chinese (Cline中文汉化版) 🌏

> 🎉 截止到2026.6.16，Cline Chinese在VS Code插件市场的下载量突破252k啦！感谢大家的支持！




<p align="center">

[![Cline Chinese文档](https://img.shields.io/badge/Cline%20Chinese-文档-blue)](https://hybridtalentcomputing.gitbook.io/cline-chinese-doc/) [![Discord](https://img.shields.io/badge/Discord-加入讨论-7289DA)](https://discord.gg/fhj9hqy89t) 

</p>

## 项目地址
https://github.com/HybridTalentComputing/cline-chinese
欢迎大家star，fork，提出issue，贡献代码，一起完善这个项目。

## 文档（感谢[@flyfreee](https://github.com/flyfreee)的翻译工作）
https://hybridtalentcomputing.gitbook.io/cline-chinese-doc/




## 赞助商


> 胜算云是AI自动生产超级工厂，长三角国家技术创新中心重大扶持项目，打造工业级 AI 任务执行矩阵。依托完整的全球API算力供应链与弹性算力容器，实现云端快速并发执行 AI 任务，持久化工作流编排，矩阵式执行，共享知识库，高效低成本获得可靠计算结果。点击此处查看[网关实时稳定性监控](https://watch.shengsuanyun.com/status/shengsuanyun), 点击此处进入模型网关超市获取API算力：[胜算云](https://www.shengsuanyun.com)，注册新用户可获10元模力及首充10%赠送。


## 功能展示

<video width="100%" controls src="https://github.com/user-attachments/assets/a6db47a9-08d7-4d20-afa0-110d23b71a81"></video>


## 安装使用
Cline-Chinese已发布到VSCode插件市场，欢迎感兴趣的小伙伴们下载体验。

## 简介

这个项目是基于 [Cline](https://github.com/cline/cline) 的汉化版本。旨在优化由于英文 prompt 导致 Cline 在中文输入下+国产大模型（如：deepseek）表现不佳的问题, 并提供更符合中文用户习惯的UI界面和功能。目前已测试[DeepSeek-V4-Pro/DeepSeek-V4-Flash](https://github.com/deepseek-ai/)工作良好。

日常使用cline等编程助手时发现使用某些模型推理速度较慢（如deepseek-R1, Claude-3.5-Sonnet），这个项目优先尝试在中文输入下，对轻量化LLM进行实验（如Deepseek-R1-Distill-Qwen-7B/14B），优化中文prompt, 以提升推理速度，大大减少等待的时间。



## 背景

本人是一名AI从业者+爱好者，在使用Cline时，发现Cline的UI界面和提示词均为英文，使用中文输入时，有时会出现奇奇怪怪的输出，影响体验。因此，决定自己动手，汉化Cline。
另外，秉着学习的态度，未来将着手修改Cline的核心代码，增加新的功能，以提升体验。


## 版本更新说明
## 2026.06.16 （ver .3.86.3）
基于 v3.86.1，修复以下问题：
1. 修复 VSCode 1.122+ 下 @ 添加上下文（文件/文件夹）显示"未找到结果"的问题（ripgrep 二进制路径迁移）
2. 修复终端执行大量输出命令后卡在"等待中"无法完成的问题（shell integration 完成检测超时兜底）
3. 修复 Linux 中文系统下钩子文件存错目录的问题（~/Documents → ~/文档，遵循 XDG 本地化）
4. 修复取消任务后发送消息无响应、需要重载窗口的问题（cancel 后消息路由死区兜底）

## 2026.06.02 （ver .3.86.1）
同步官方 v3.86.1 版本

## 欢迎关注我的自媒体账号

欢迎关注我的自媒体账号，获取更多AI开发和技术分享：

- 微信公众号：Leo的AI世界

## 加入社群

感兴趣的可以扫码加入微信社群，一起交流学习AI（如果二维码失效，请查看github项目中的首页中，相同位置的群二维码, 或者加入Discord频道）：

<div align="center">
  <img src="https://github.com/user-attachments/assets/c4667478-ee9e-4fb8-8874-f9a7e99582ef" alt="微信群二维码" width="250" />
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


