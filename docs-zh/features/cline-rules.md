Cline Rules 允许你为 Cline 提供系统级指导。将它们视为为项目提供上下文和偏好设置的持久化方式，或作为每次对话的全局设置。

## 创建规则

你可以通过点击规则选项卡中的 `+` 按钮来创建规则。这将在你的 IDE 中打开一个新文件，你可以使用它来编写你的规则。

<Frame>
	<img src="https://storage.googleapis.com/cline_public_images/docs/assets/cline-rules.png" alt="Create a Rule" />
</Frame>

一旦你保存文件：

-   你的规则将存储在你项目的 `.clinerules/` 目录中（如果它是工作区规则）
-   或在全局规则目录中（如果它是全局规则）：

### 全局规则目录位置

全局规则目录的位置取决于你的操作系统：

| 操作系统 | 默认位置 | 备注 |
|------------------|------------------|-------|
| **Windows** | `Documents\Cline\Rules` | 使用系统文档文件夹 |
| **macOS** | `~/Documents/Cline/Rules` | 使用用户文档文件夹 |
| **Linux/WSL** | `~/Documents/Cline/Rules` | 在某些系统上可能回退到 `~/Cline/Rules` |

> **Linux/WSL 用户注意**：如果你在 `~/Documents/Cline/Rules` 中找不到全局规则，请检查 `~/Cline/Rules`，因为位置可能因系统配置和文档目录是否存在而异。

你也可以通过在聊天中使用 [`/newrule` 斜杠命令](/features/slash-commands/new-rule)让 Cline 为你创建规则。

```markdown 示例 Cline 规则结构 [可展开]
# 项目指南

## 文档要求

-   在修改功能时更新 /docs 中的相关文档
-   保持 README.md 与新功能同步
-   在 CHANGELOG.md 中维护变更日志条目

## 架构决策记录

在 /docs/adr 中为以下内容创建 ADR：

-   主要依赖项更改
-   架构模式更改
-   新集成模式
-   数据库架构更改
    遵循 /docs/adr/template.md 中的模板

## 代码风格和模式

-   使用 OpenAPI Generator 生成 API 客户端
-   使用 TypeScript axios 模板
-   将生成的代码放在 /src/generated
-   优先考虑组合而非继承
-   对数据访问使用存储库模式
-   遵循 /src/utils/errors.ts 中的错误处理模式

## 测试标准

-   业务逻辑需要单元测试
-   API 端点需要集成测试
-   关键用户流程需要 E2E 测试
```

### 主要好处

1. **版本控制**：`.clinerules` 文件成为项目源代码的一部分
2. **团队一致性**：确保所有团队成员的行为一致
3. **项目特定**：为每个项目的需求定制的规则和标准
4. **制度化知识**：在代码中维护项目标准和实践

将 `.clinerules` 文件放在项目的根目录中：

```
your-project/
├── .clinerules
├── src/
├── docs/
└── ...
```

另一方面，Cline 的系统提示不是用户可编辑的（[你可以在这里找到它](https://github.com/cline/cline/blob/main/src/core/prompts/system.ts)）。有关提示工程最佳实践的更广泛视角，请查看[此资源](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview)。

### AGENTS.md 标准支持

Cline 还支持 `AGENTS.md` 标准，作为 Cline Rules 的后备方案，通过自动检测工作区根目录中的 `AGENTS.md` 文件。这允许你在不同的 AI 编码工具中使用相同的规则文件。

```
your-project/
├── AGENTS.md
├── src/
└── ...
```

### 编写有效 Cline 规则的技巧

-   清晰简洁：使用简单的语言，避免歧义。
-   关注期望的结果：描述你想要的结果，而不是具体步骤。
-   测试和迭代：实验以找到最适合你工作流的方法。

### .clinerules/ 文件夹系统

```
your-project/
├── .clinerules/              # 包含活动规则的文件夹
│   ├── 01-coding.md          # 核心编码标准
│   ├── 02-documentation.md   # 文档要求
│   └── current-sprint.md     # 当前工作特定的规则
├── src/
└── ...
```

Cline 会自动处理 `.clinerules/` 目录内的**所有 Markdown 文件**，将它们组合成统一的规则集。数字前缀（可选）有助于按逻辑顺序组织文件。

#### 使用规则库

对于具有多个上下文或团队的项目，维护一个规则库目录：

```
your-project/
├── .clinerules/              # 活动规则 - 自动应用
│   ├── 01-coding.md
│   └── client-a.md
│
├── clinerules-bank/          # 可用但非活动规则的存储库
│   ├── clients/              # 客户特定的规则集
│   │   ├── client-a.md
│   │   └── client-b.md
│   ├── frameworks/           # 框架特定的规则
│   │   ├── react.md
│   │   └── vue.md
│   └── project-types/        # 项目类型标准
│       ├── api-service.md
│       └── frontend-app.md
└── ...
```

#### 文件夹方法的好处

1. **上下文激活**：仅从库中复制相关规则到活动文件夹
2. **更轻松的维护**：更新单个规则文件而不影响其他文件
3. **团队灵活性**：不同的团队成员可以激活特定于其当前任务的规则
4. **减少噪音**：保持活动规则集专注且相关

#### 使用示例

在客户项目之间切换：

```bash
# 切换到客户 B 项目
rm .clinerules/client-a.md
cp clinerules-bank/clients/client-b.md .clinerules/
```

适应不同的技术栈：

```bash
# 前端 React 项目
cp clinerules-bank/frameworks/react.md .clinerules/
```

#### 实现技巧

-   保持单个规则文件专注于特定关注点
-   使用描述性文件名，清楚地指示规则的目的
-   考虑在跟踪 `clinerules-bank/` 的同时 git 忽略活动的 `.clinerules/` 文件夹
-   创建团队脚本以快速激活常见的规则组合

文件夹系统将你的 Cline 规则从静态文档转变为动态知识系统，适应团队不断变化的上下文和需求。

### 使用可切换弹出窗口管理规则

为了让管理单个 `.clinerules` 文件和文件夹系统甚至更容易，Cline v3.13 引入了可以直接从聊天界面访问的专用弹出窗口 UI。

方便地位于聊天输入字段下方，此弹出窗口允许你：

-   **即时查看活动规则**：查看哪些全局规则（来自你的用户设置）和工作区规则（`.clinerules` 文件或文件夹内容）当前是活动的。
-   **快速切换规则**：单击即可启用或禁用工作区 `.clinerules/` 文件夹内的特定规则文件。这对于仅在需要时激活特定上下文的规则（如 `react-rules.md` 或 `memory-bank.md`）非常完美。
-   **轻松添加/管理规则**：如果工作区 `.clinerules` 文件或文件夹不存在，则快速创建，或将新规则文件添加到现有文件夹。

此 UI 显著简化了上下文切换和 managing 不同的指令集，而无需在对话期间手动编辑文件或配置。

<Frame>
	<img src="https://storage.googleapis.com/cline_public_images/docs/assets/image%20(1).png" alt="Cline Logo" />
</Frame>
