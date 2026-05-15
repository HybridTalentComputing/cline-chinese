---
title: "CLI 参考"
description: "Cline CLI 的完整命令参考，包括配置、实例管理和任务命令"
---

Cline CLI 的完整命令参考。使用此命令获取所有命令、选项和配置的详细文档。

在终端中获取快速帮助：

```bash
cline --help          # 显示所有命令
cline task --help     # 显示任务特定命令
man cline            # 查看完整手册页
```

## 手册页

Cline CLI 的完整手册页：

```
CLINE(1)                         用户命令                        CLINE(1)

名称
       cline - 编排和与 Cline AI 编程代理交互

概要
       cline [提示] [选项]

       cline 命令 [子命令] [选项] [参数]

描述
       尝试：cat README.md | cline "为我总结这个："

       cline 是用于编排多个 Cline AI 编程代理的命令行
       接口。Cline 是一个自主 AI 代理，可以读取、编写
       和在你的项目中执行代码。他通过客户端-服务器架构
       运行，其中 Cline Core 作为独立服务运行，CLI 作为
       用于管理任务、实例和代理交互的可脚本化接口。

       CLI 专为交互式使用和自动化而设计，使其
       非常适合 CI/CD 管道、并行任务执行和基于终端的
       工作流。多个前端（CLI、VSCode、JetBrains）可以附加到
       同一个 Cline Core 实例，实现环境之间的无缝任务移交。

操作模式
       即时任务模式
              最简单的调用：cline "在此提示"立即生成
              一个实例、创建一个任务并进入聊天模式。这等效
              于按顺序运行 cline instance new && cline task new &&
              cline task chat。

       子命令模式
              具有显式控制的高级用法：cline <命令>
              [子命令] [选项] 提供对实例、任务、
              身份验证和配置的细粒度控制。

代理行为
       Cline 在两种主要模式下运行：

       执行模式
              Cline 主动使用工具来完成任务。他可以读取
              文件、编写代码、执行命令、使用无头浏览器，
              以及更多。这是任务执行的默认模式。

       计划模式
              Cline 在实现之前收集信息并创建详细计划。
              他探索代码库、提出澄清问题，并在
              切换到执行模式之前为用户批准提出策略。

即任务选项
       当使用即任务语法 cline "提示"时，以下选项
       可用：

       -o, --oneshot
              完全自主模式。Cline 完成任务并在
              完成后停止跟随。示例：cline -o "6 + 8 是什么？"

       -s, --setting 设置 值
              为此任务覆盖设置

       -y, --no-interactive, --yolo
              启用完全自主模式。禁用所有交互性：

              • ask_followup_question 工具被禁用

              • attempt_completion 自动发生

              • execute_command 在非阻塞模式下运行并带有超时

              • 计划模式自动切换到执行模式

       -m, --mode 模式
              起始模式。选项：act（默认）、plan

       -w, --workspace 路径
              附加工作区路径。可以多次指定以
              包含多个目录。当前工作目录
              始终作为第一个工作区包含在内。示例：cline -w
              /path/to/other/project "重构共享代码"

全局选项
       这些选项适用于所有子命令：

       -F, --output-format 格式
              输出格式。选项：rich（默认）、json、plain

       -h, --help
              显示命令的帮助信息。

       -v, --verbose
              启用详细输出以进行调试。

命令
   身份验证
       cline auth [提供商] [密钥]

       cline a [提供商] [密钥]
              为 AI 模型提供商配置身份验证。如果未提供参数则
              启动交互式向导。如果指定了提供商
              但没有密钥，则提示输入密钥或启动
              适当的 OAuth 流程。

   实例管理
       Cline Core 实例是可以在后台运行的独立代理
       进程。多个实例可以同时运行，实现并行任务执行。

       cline instance

       cline i
              显示实例管理帮助。

       cline instance new [-d|--default]

       cline i n [-d|--default]
              生成一个新的 Cline Core 实例。使用 --default 将其
              设置为后续命令的默认实例。

       cline instance list

       cline i l
              列出所有正在运行的 Cline Core 实例及其地址和
              状态。

       cline instance default 地址

       cline i d 地址
              设置默认实例以避免在任务命令中指定
              --address。

       cline instance kill 地址 [-a|--all]

       cline i k 地址 [-a|--all]
              终止 Cline Core 实例。使用 --all 杀死所有正在
              运行的实例。

   任务管理
       任务代表 Cline 执行的各个工作项。任务
       维护对话历史、检查点和设置。

       cline task [-a|--address ADDR]

       cline t [-a|--address ADDR]
              显示任务管理帮助。--address 标志指定
              要使用哪个 Cline Core 实例（例如，localhost:50052）。

       cline task new 提示 [选项]

       cline t n 提示 [选项]
              在默认或指定实例中创建新任务。
              选项：

              -s, --setting 设置 值
                     设置任务特定设置

              -y, --no-interactive, --yolo
                     启用自主模式

              -m, --mode 模式
                     起始模式（act 或 plan）

       cline task open 任务-id [选项]

       cline t o 任务-id [选项]
              从历史记录恢复先前的任务。接受与 task new
              相同的选项。

       cline task list

       cline t l
              列出历史记录中的所有任务及其 id 和片段

       cline task chat

       cline t c
              为当前任务进入交互式聊天模式。允许
              与 Cline 来回对话。

       cline task send [消息] [选项]

       cline t s [消息] [选项]
              向 Cline 发送消息。如果未提供消息，则从
              stdin 读取。选项：

              -a, --approve
                     批准 Cline 提出的操作

              -d, --deny
                     拒绝 Cline 提出的操作

              -f, --file 文件
                     将文件附加到消息

              -y, --no-interactive, --yolo
                     启用自主模式

              -m, --mode 模式
                     切换模式（act 或 plan）

       cline task view [-f|--follow] [-c|--follow-complete]

       cline t v [-f|--follow] [-c|--follow-complete]
              显示当前对话。使用 --follow 实时流式传输
              更新，或使用 --follow-complete 跟随直到任务
              完成。

       cline task restore 检查点

       cline t r 检查点
              将任务恢复到先前的检查点状态。

       cline task pause

       cline t p
              暂停任务执行。

   配置
       配置可以全局设置。使用 --setting 标志
       为任务覆盖这些全局设置

       cline config

       cline c

       cline config set 键 值

       cline c s 键 值
              设置配置变量。

       cline config get 键

       cline c g 键
              读取配置变量。

       cline config list

       cline c l
              列出所有配置变量及其值。

   上下文窗口配置
       对于本地模型提供商，你可以配置上下文窗口大小：

       Ollama
              cline config s ollama-api-options-ctx-num=32768

       LM Studio
              cline config s lm-studio-max-tokens=32768

       对于其他提供商（Anthropic、OpenRouter 等），上下文窗口
       在每个模型的模型元数据中定义，不是用户可设置的。
       Cline 自动使用每个模型的内置上下文限制。

任务设置
       任务设置持久保存在 ~/.cline/x/tasks 目录中。当
       使用 cline task open 恢复任务时，任务设置会
       自动恢复。

       常见设置包括：

       yolo   启用自主模式（true/false）

       mode   起始模式（act/plan）

       hooks_enabled
              为任务启用或禁用 hooks（true/false）

Hooks 集成
       Hooks 允许你在关键时刻将自定义逻辑注入到 Cline 的
       工作流中。它们可以在执行之前验证操作、
       监控工具使用，以及塑造 AI 决策。这允许你将 hooks
       集成到自动化工作流、CI/CD 管道和无头任务
       执行中。

       为任务启用 hooks：

              cline "提示" -s hooks_enabled=true

       全局配置 hooks：

              cline config set hooks-enabled=true
              cline config get hooks-enabled

       注意：CLI 中的 hooks 仅在 macOS 和 Linux 上受支持。

       有关完整的 hooks 文档，请参阅：
       <https://docs.cline.bot/features/hooks/index>

注释和示例
       cline task send 和 cline task new 命令支持从
       stdin 读取，实现强大的管道组合：

              cat requirements.txt | cline task send
              echo "重构此代码" | cline -y

   实例管理
       管理多个 Cline 实例：

              # 启动新实例并将其设为默认
              cline instance new --default

              # 列出所有正在运行的实例
              cline instance list

              # 杀死特定实例
              cline instance kill localhost:50052

              # 杀死所有 CLI 实例
              cline instance kill --all-cli

   任务历史记录
       使用任务历史记录：

              # 列出先前的任务
              cline task list

              # 恢复先前的任务
              cline task open 1760501486669

              # 查看对话历史记录
              cline task view

              # 使用此任务启动交互式聊天
              cline task chat

架构
       Cline 在三层架构上运行：

       表示层
       用户界面（CLI、VSCode、JetBrains）通过 gRPC 连接到
       Cline Core

       Cline Core
       自主代理服务，处理任务管理、AI 模型
       集成、状态管理、工具编排和实时
       流式传输更新

       主机提供商层
       特定于环境的集成（VSCode API、JetBrains API、
       shell API），Cline Core 使用它们与主机系统
       交互

错误
       在以下位置报告错误：<https://github.com/cline/cline/issues>

       有关实时帮助，加入 Discord 社区：
       <https://discord.gg/cline>

另请参阅
       完整文档：<https://docs.cline.bot>

作者
       Cline 由 Cline Bot Inc. 和开源社区开发。

版权
       版权 © 2025 Cline Bot Inc. 根据 Apache License 2.0 许可。
```

## JSON 输出 (-F json)

当你使用 `-F json`（或 `--output-format json`）运行命令时，Cline 将每个客户端消息打印为 JSON。

### ClineMessage 架构

| 字段 | 类型 | 必需 | 注释 |
|-------|------|----------|-------|
| `type` | `"ask"` 或 `"say"` | 是 | 顶级消息类别。 |
| `text` | `string` | 是 | 人类可读的消息内容。 |
| `ts` | `number` | 是 | Unix 纪元时间戳（毫秒）。 |
| `reasoning` | `string` | 否 | 为空时省略。 |
| `say` | `string` | 否 | 为空时省略。当 `type` 为 `"say"` 时存在。 |
| `ask` | `string` | 否 | 为空时省略。当 `type` 为 `"ask"` 时存在。 |
| `partial` | `boolean` | 否 | 为 false 时省略。`true` 表示流式传输更新。 |
| `images` | `string[]` | 否 | 为空时省略。随消息包含时的图像 URI。 |
| `files` | `string[]` | 否 | 为空时省略。附加到消息时的文件路径。 |
| `lastCheckpointHash` | `string` | 否 | 为空时省略。可用时的 Git 检查点哈希。 |
| `isCheckpointCheckedOut` | `boolean` | 否 | 为 false 时省略。如果 Cline 检出了检查点则为 `true`。 |
| `isOperationOutsideWorkspace` | `boolean` | 否 | 为 false 时省略。如果操作在工作区之外发生则为 `true`。 |

<Note>
大多数字段是可选的，在为空时省略。如果你解析此输出，将缺失的字段视为"不存在"，而不是空字符串。
</Note>

### 示例

```json
{
  "type": "say",
  "text": "Cline 即将运行一个命令。",
  "ts": 1760501486669,
  "say": "command",
  "partial": false
}
```

### Shell 补全

为各种 shell 生成自动补全脚本：

#### Bash

```bash
# 生成 bash 补全
cline completion bash > /etc/bash_completion.d/cline

# 或用于用户级安装
cline completion bash > ~/.local/share/bash-completion/completions/cline
```

#### Zsh

```bash
# 生成 zsh 补全
cline completion zsh > "${fpath[1]}/_cline"

# 或添加到你的 .zshrc
echo 'source <(cline completion zsh)' >> ~/.zshrc
```

#### Fish

```bash
# 生成 fish 补全
cline completion fish > ~/.config/fish/completions/cline.fish
```

#### PowerShell

```powershell
# 生成 PowerShell 补全
cline completion powershell > cline.ps1

# 添加到你的 PowerShell 配置文件
Add-Content $PROFILE "cline completion powershell | Out-String | Invoke-Expression"
```

### 版本命令

```bash
# 显示版本信息
cline version
```

### 环境变量

#### CLINE_DIR

覆盖默认 Cline 目录位置：

```bash
# 覆盖默认 Cline 目录
export CLINE_DIR=/custom/path

# 默认：~/.cline
```

此目录用于：
- 实例注册表数据库
- 配置文件
- 任务历史记录
- 检查点
