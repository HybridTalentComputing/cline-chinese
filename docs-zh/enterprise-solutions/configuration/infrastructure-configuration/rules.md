---
title: "规则"
sidebarTitle: "规则"
description: "在企业部署中指导 Cline 行为的自定义指令文件"
---

规则是自定义指令文件，为 Cline 提供有关你的编码偏好、标准和最佳实践的指南。这些指令在处理任务时被添加到 Cline 的上下文中。

## 什么是规则？

规则是存储在 `.clinerules/` 目录中的简单 markdown 文件，包含你团队的约定、偏好和指南。它们帮助 Cline 理解你的：

- 编码风格和约定
- 首选的库和框架
- 架构模式
- 测试策略
- 文档标准
- 通信偏好

<Tip>
规则只是 `.md` 文件——无需复杂配置！
</Tip>

## 快速示例

这是一个指导 TypeScript 开发的简单规则文件：

```markdown
# TypeScript 约定

## 代码风格
- 使用 2 空格缩进
- 优先使用 `const` 而不是 `let`
- 始终为函数使用显式返回类型
- 使用命名导出而不是默认导出

## 测试
- 为所有工具函数编写单元测试
- 使用 Vitest 作为测试框架
- 目标是 80%+ 的代码覆盖率

## 依赖项
- 优先使用原生 TypeScript 功能而不是外部库
- 使用 Zod 进行运行时类型验证
- 使用 date-fns 进行日期操作
```

## 创建规则

<Tabs>
  <Tab title="使用 /newrule 命令">
    创建规则的最简单方法是使用 `/newrule` 命令：
    
    1. 在与 Cline 的对话期间，输入 `/newrule`
    2. Cline 将分析你的对话和偏好
    3. 它会在 `.clinerules/` 中创建适当命名的 `.md` 文件
    
    **示例：**
    ```
    /newrule
    
    根据我们的对话，为 React 组件结构创建一个规则
    ```
  </Tab>
  
  <Tab title="手动创建">
    你也可以手动创建规则文件：
    
    1. 在你的仓库根目录中创建 `.clinerules/` 目录
    2. 添加包含你的指南的 markdown 文件
    3. 使用描述性名称，如 `react-patterns.md` 或 `api-conventions.md`
    
    **文件结构：**
    ```
    your-repo/
    ├── .clinerules/
    │   ├── typescript-style.md
    │   ├── testing-standards.md
    │   └── code-review-checklist.md
    └── src/
    ```
  </Tab>
</Tabs>

## 全局 vs 工作区规则

<CardGroup cols={2}>
  <Card title="工作区规则" icon="folder">
    **位置：** 你的仓库中的 `.clinerules/`
    
    **范围：** 特定于该项目
    
    **用于：** 项目特定的约定和模式
  </Card>
  
  <Card title="全局规则" icon="globe">
    **位置：** `Documents/Cline/` 目录
    
    **范围：** 你的所有项目
    
    **用于：** 适用于各处的个人偏好
  </Card>
</CardGroup>

## 管理规则

### 切换规则

你可以启用或禁用单个规则文件：

1. 在 Cline 界面中单击规则图标
2. 根据需要打开/关闭规则
3. 更改立即应用于新任务

<Note>
禁用规则会将其从 Cline 的上下文中移除，但保持文件完整。你可以随时重新启用它。
</Note>

### 企业远程规则

<Info>
企业部署可以配置适用于所有团队成员的**远程全局规则**。这些通过你的基础设施配置管理，单个开发人员无法切换。

有关远程规则的详细信息，请参阅[自托管配置](/enterprise-solutions/configuration/infrastructure-configuration/overview)。
</Info>

## 兼容格式

Cline 还尊重来自其他 AI 编程工具的规则：

| 文件/目录 | 工具 | 位置 |
|----------------|------|----------|
| `.cursorrules` | Cursor | 工作区根目录（单个文件）|
| `.cursor/rules/` | Cursor | 工作区目录（`.mdc` 文件）|
| `.windsurfrules` | Windsurf | 工作区根目录（单个文件）|
| `AGENTS.md` | 各种 | 工作区根目录 + 递归搜索 |

<Note>
**AGENTS.md 行为**：仅当你的工作区根目录中存在顶级 `AGENTS.md` 时，Cline 才会递归搜索嵌套的 `AGENTS.md` 文件。如果找到，所有 `AGENTS.md` 文件都与其相对路径作为标题组合。
</Note>

这些文件的工作方式与 `.clinerules/` 文件相同，可以独立地打开/关闭。

## 最佳实践

<AccordionGroup>
  <Accordion title="保持规则聚焦" icon="bullseye">
    每个规则文件应专注于一个主题：
    - ✅ `typescript-conventions.md`
    - ✅ `react-component-structure.md`
    - ❌ `everything-about-our-codebase.md`
  </Accordion>
  
  <Accordion title="具体，而非通用" icon="crosshairs">
    基于实际团队偏好制定规则，而不是假设：
    - ✅ "我们使用 React Query 进行服务器状态管理"
    - ❌ "使用状态管理的最佳实践"
  </Accordion>
  
  <Accordion title="随着项目发展更新规则" icon="rotate">
    定期审查和更新规则：
    - 采用新技术时
    - 重大架构更改后
    - 当团队约定演变时
  </Accordion>
  
  <Accordion title="不要过度" icon="gauge-simple-high">
    太多规则可能会淹没 Cline 的上下文：
    - 从 3-5 个基本规则开始
    - 仅在真正需要时添加更多
    - 及时删除过时的规则
  </Accordion>
</AccordionGroup>

## 示例规则文件

<AccordionGroup>
  <Accordion title="API 设计标准" icon="code">
```markdown
# API 设计标准

## REST 约定
- 对端点使用复数名词（`/users`，而不是 `/user`）
- 按语义使用 HTTP 方法（GET、POST、PUT、DELETE）
- 返回适当的状态码

## 响应格式
\`\`\`typescript
{
  data: T,
  error?: string,
  metadata?: {
    page: number,
    total: number
  }
}
\`\`\`

## 错误处理
- 始终在 `error` 字段中返回错误消息
- 对客户端错误使用 4xx，对服务器错误使用 5xx
- 在错误响应中包含请求 ID
```
  </Accordion>
  
  <Accordion title="测试要求" icon="vial">
```markdown
# 测试要求

## 测试组织
- 将测试放在源文件旁边（`Button.test.tsx`）
- 使用 `describe` 块对相关测试进行分组
- 编写描述性测试名称

## 覆盖率要求
- 为所有工具函数进行单元测试
- 为 API 端点进行集成测试
- 为关键用户流程进行端到端测试
- 新代码的最小 80% 覆盖率

## 模拟策略
- 模拟外部 API 调用
- 对复杂数据使用测试夹具
- 优先使用依赖注入以提高可测试性
```
  </Accordion>
</AccordionGroup>

## 下一步

<CardGroup cols={2}>
  <Card title="工作流" icon="diagram-project" href="/enterprise-solutions/configuration/infrastructure-configuration/workflows">
    结合规则与自动化工作流
  </Card>
  
  <Card title="远程配置" icon="cloud" href="/enterprise-solutions/configuration/remote-configuration/overview">
    为你的团队部署全局规则
  </Card>
</CardGroup>
