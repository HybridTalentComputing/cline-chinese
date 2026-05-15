---
title: "多根工作区"
sidebarTitle: "多根工作区"
---

Cline 与 VSCode 的多根工作区一起工作，让你在一个窗口中管理多个项目文件夹或仓库。无论你是在使用 monorepo 还是单独的 Git 仓库，Cline 都可以在所有项目中读取文件、编写代码和运行命令。

<Frame>
  <video
    src="https://storage.googleapis.com/cline_public_images/multiworkspace.mp4"
    autoPlay
    muted
    loop
    playsInline
    controls
  />
</Frame>

<Warning>
多根工作区有两个限制：
- **Cline 规则**仅在主工作区文件夹中工作
- **检查点**被禁用（当你返回到单个文件夹时恢复）

有关详细信息，请参阅[当前限制](#当前限制)。
</Warning>

## 理解多根工作区

在深入研究之前，了解两种组织相关项目的常见模式会有所帮助。

### 为什么使用多根工作区？

Cline 可以完成跨越多个项目或仓库的任务：

- **重构**：更新 API 契约并修复所有仓库中的消费者
- **功能开发**：实现涉及前端、后端和共享代码的功能
- **依赖更新**：跨相关项目协调版本升级
- **文档**：生成引用来自多个仓库的代码的文档

**示例提示：**
```
更新 contracts repo 中的用户类型，然后更新前端和后端以使用新字段。确保 API 验证新的必需字段。
```

## 设置多根工作区

### Monorepo vs 多个仓库

**Monorepo**：包含多个项目或包的一个 Git 仓库。所有代码共享相同的版本历史。

```
my-company/                    # 单个 Git 仓库
├── .git/
├── packages/
│   ├── web/                   # React 前端
│   ├── api/                   # Node.js 后端
│   └── shared/                # 通用工具
└── package.json
```

**多个仓库**：单独的 Git 仓库，每个都有自己的历史记录，在一个 VSCode 工作区中一起打开。

```
~/projects/
├── fullstack.code-workspace   # 工作区配置文件
├── frontend/                  # git@github.com:acme/frontend.git
│   └── .git/
├── backend/                   # git@github.com:acme/backend.git
│   └── .git/
└── contracts/                 # git@github.com:acme/api-contracts.git
    └── .git/
```

Cline 支持这两种模式，以及一些文件夹是 Git 仓库而其他不是的混合设置。关键区别：使用多个仓库时，每个文件夹都有自己的 `.git` 目录，Cline 独立跟踪它们。

### 将文件夹添加到你的工作区

你可以通过几种方式将文件夹添加到工作区：

- **文件菜单**：在 VSCode 中使用 `File > Add Folder to Workspace`
- **拖放**：将文件夹直接拖到 VSCode 的文件资源管理器中
- **工作区文件**：创建 `.code-workspace` 文件（推荐给团队）
- **命令面板**：运行 `Workspaces: Add Folder to Workspace`

有关详细说明，请参阅 [Microsoft 的多根工作区指南](https://code.visualstudio.com/docs/editor/multi-root-workspaces)。

## 使用多个仓库

当你在单个工作区中打开单独的 Git 仓库时，Cline 将每个视为具有自己版本控制的独立项目。

### Cline 每个仓库跟踪的内容

对于每个工作区文件夹，Cline 检测：

| 属性 | 描述 |
|----------|-------------|
| **路径** | 文件夹的绝对路径 |
| **名称** | 从文件夹名称或工作区文件派生 |
| **VCS 类型** | Git、Mercurial 或无 |
| **提交哈希** | 当前 HEAD 提交（对于 Git/Mercurial 仓库） |

这意味着 Cline 理解你的前端和后端可能位于不同的提交、在不同的分支上，甚至使用不同的版本控制系统。

<Note>
虽然 Cline 检测所有工作区文件夹的 VCS 信息，但某些功能仅使用 **主工作区**（第一个文件夹）：[Cline 规则](/features/cline-rules)、[工作流](/features/slash-commands/workflows/index) 和 [Git 相关功能](/features/at-mentions/git-mentions)，如 `@git` 提及。
</Note>

## 跨工作区引用文件

### 自然语言引用

Cline 理解对你的工作区的自然引用：

```
"读取 frontend 文件夹中的 package.json"
```

```
"比较 backend 中的用户模型与 contracts 中的 TypeScript 类型"
```

```
"在所有工作区中搜索 TODO 注释"
```

### 工作区提示语法

对于显式引用，使用 `@workspace:path` 语法：

| 语法 | 描述 |
|--------|-------------|
| `@frontend:src/App.tsx` | "frontend" 工作区中的文件 |
| `@backend:server.ts` | "backend" 工作区中的文件 |
| `@contracts:types/` | "contracts" 工作区中的文件夹 |

当以下情况时，此语法特别有用：
- 多个工作区具有同名文件
- 你想要明确表示你指的是哪个项目
- Cline 需要解决歧义

### 工作区名称如何工作

工作区名称来自：
1. 你的 `.code-workspace` 文件中的 `name` 字段（如果指定）
2. 文件夹名称（默认）

如果两个文件夹具有相同的名称，则追加数字或使用工作区文件为它们提供唯一名称。

## 常见配置

### Monorepo 开发

```
~/projects/my-app/
├── my-app.code-workspace      # 工作区配置文件
├── web/          (React 前端)
├── api/          (Node.js 后端)  
├── mobile/       (React Native)
└── shared/       (通用工具)
```

所有文件夹共享一个 Git 历史。跨包的更改是原子的。

**示例提示：** *"更新 web 和 mobile 应用中的 API 端点以匹配新的后端路由"*

### 具有单独仓库的微服务

```
~/projects/services/
├── services.code-workspace    # 工作区配置文件
├── user-service/       (git: github.com/acme/user-service)
├── payment-service/    (git: github.com/acme/payment-service)
├── gateway/            (git: github.com/acme/api-gateway)
└── proto/              (git: github.com/acme/service-protos)
```

每个服务都有自己的仓库。Cline 可以跨所有服务更新 proto 定义并重新生成客户端。

**示例提示：** *"向 proto 中的 UserProfile 消息添加一个新字段，然后更新 user-service 和 gateway 来处理它"*

### 具有共享契约的全栈

```
~/projects/fullstack/
├── fullstack.code-workspace   # 工作区配置文件
├── client/         (git: github.com/acme/web-client)
├── server/         (git: github.com/acme/api-server)
└── types/          (git: github.com/acme/shared-types)
```

types 仓库定义客户端和服务器使用的接口。当你更新类型时，Cline 可以修复两个消费者。

### 混合设置

```
~/projects/project/
├── project.code-workspace     # 工作区配置文件
├── main-app/       (git: github.com/acme/main-app)
├── vendor/         (无 VCS - 外部依赖项)
└── scripts/        (无 VCS - 本地自动化)
```

仓库和普通文件夹的混合。Cline 适应每个文件夹的配置。

## 当前限制

多根工作区模式中的两个功能有限制：

### Cline 规则

[Cline 规则](/features/cline-rules)（`.clinerules/` 目录）仅在 **主工作区**（工作区中的第一个文件夹）中工作。其他工作区文件夹中的规则将被忽略。

**变通方法**：在主工作区中放置共享规则，或使用全局规则（`~/Documents/Cline/Rules/`），它们适用于任何地方。

### 检查点

[检查点](/features/checkpoints) 在多根工作区模式下被禁用。当发生这种情况时，Cline 会显示警告。

**原因**：检查点使用影子 Git 仓库来跟踪更改。对于多个仓库，跨独立的 Git 历史协调检查点增加了尚未支持的复杂性。

**变通方法**：使用你的正常 Git 工作流。频繁提交，或为实验性工作创建分支。

当你返回到单文件夹工作区时，这两个限制都会恢复。

## 最佳实践

### 组织你的工作区

1. **组合相关项目**，这些项目通常需要协调更改
2. **使用工作区文件**，以便跨团队重现设置
3. **清楚地命名文件夹**，使工作区提示直观
4. **考虑主工作区**用于 Cline 规则放置

### 有效提示

- **在重要时具体**：*"更新 backend 工作区中的用户模型"*
- **引用关系**：*"前端使用 contracts 工作区中的类型"*
- **描述跨工作区更改**：*"这需要同时更新 web 和 mobile"*
- **为大型代码库限定搜索范围**：*"仅在 frontend 工作区中搜索 'TODO'"*

### 使用大型工作区

- 尽可能将大型任务分解为特定于工作区的操作
- 使用[计划模式](/features/plan-and-act)让 Cline 首先理解结构
- 添加 `.clineignore` 文件以减少噪音、加快扫描速度，并让 Cline 专注于源代码：

```text
# Dependencies
**/node_modules/

# Build outputs
**/dist/
**/build/

# VCS metadata
**/.git/
```

有关更多模式和注意事项，请参阅 [.clineignore 文件指南](/prompting/prompt-engineering-guide#clineignore-file-guide)。
