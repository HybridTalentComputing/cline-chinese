---
title: "工作流"
sidebarTitle: "工作流"
description: "可以通过斜杠命令按需调用的可重用指令集"
---

工作流是包含可重用指令的 markdown 文件，你可以使用斜杠命令按需调用它们。将它们视为"在需要时可以调用的规则"，而不是始终激活的指南。

## 什么是工作流？

工作流类似于[规则](/enterprise-solutions/configuration/infrastructure-configuration/rules)，但有一个关键区别：

<CardGroup cols={2}>
  <Card title="规则" icon="book">
    **始终激活**
    
    打开时自动应用于每个任务
    
    示例：编码标准、风格指南
  </Card>
  
  <Card title="工作流" icon="diagram-project">
    **按需**
    
    仅在使用斜杠命令时调用
    
    示例：部署检查清单、审查流程
  </Card>
</CardGroup>

<Tip>
工作流只是 markdown 文件，无需复杂配置！
</Tip>

## 快速示例

这是一个简单的部署工作流：

**文件：** `.clinerules/workflows/deploy.md`

```markdown
# 部署工作流

在部署到生产环境之前，确保：

## 部署前检查清单
1. 所有测试通过（单元、集成、端到端）
2. 代码审查获得 2+ 名工程师批准
3. 预发布环境测试成功
4. 数据库迁移已审查
5. 回滚计划已记录

## 部署步骤
1. 从 main 创建部署分支
2. 运行最终测试套件
3. 部署到生产环境
4. 监控错误率 30 分钟
5. 验证关键用户流程

## 部署后
1. 更新部署日志
2. 在 #deployments 频道通知团队
3. 监控指标 24 小时
```

**使用：**
```
/deploy

我准备部署新的身份验证功能
```

调用时，Cline 会将工作流指令添加到该特定任务的上下文中。

## 创建工作流

<Tabs>
  <Tab title="手动创建">
    在 `.clinerules/workflows/` 目录中创建工作流文件：
    
    1. 在你的仓库根目录中创建 `.clinerules/workflows/`
    2. 添加包含你工作流指令的 markdown 文件
    3. 使用与你的斜杠命令匹配的描述性名称
    
    **文件结构：**
    ```
    your-repo/
    ├── .clinerules/
    │   └── workflows/
    │       ├── deploy.md
    │       ├── code-review.md
    │       └── bug-triage.md
    └── src/
    ```
  </Tab>
  
  <Tab title="斜杠命令">
    你也可以在对话期间创建工作流：
    
    1. 就一个你想规范化的流程进行对话
    2. 输入 `/newrule` 并指定它应该是一个工作流
    3. Cline 在 `.clinerules/workflows/` 中创建工作流文件
    
    <Note>
    `/newrule` 命令可以创建规则和工作流——只需清楚地说明你的意图。
    </Note>
  </Tab>
</Tabs>

## 使用工作流

### 调用工作流

只需输入 `/` 后跟工作流文件名（不带 `.md`）：

```
/deploy
/code-review  
/bug-triage
```

工作流指令仅添加到 Cline 当前任务的上下文中。

### 工作流命名

- 使用带连字符的小写字母：`deploy.md`、`code-review.md`
- 保持名称简短易记
- 名称应指示工作流的用途

<Warning>
工作流文件名将成为斜杠命令，因此请选择易于输入和记住的名称。
</Warning>

## 全局 vs 工作区工作流

<CardGroup cols={2}>
  <Card title="工作区工作流" icon="folder">
    **位置：** 你的仓库中的 `.clinerules/workflows/`
    
    **范围：** 特定于该项目
    
    **用于：** 项目特定的流程和检查清单
  </Card>
  
  <Card title="全局工作流" icon="globe">
    **位置：** `Documents/Cline/Workflows/` 目录
    
    **范围：** 你的所有项目
    
    **用于：** 适用于各处的个人工作流
  </Card>
</CardGroup>

<Info>
**优先级：** 如果本地工作流与全局工作流具有相同名称，则本地工作流优先。
</Info>

## 管理工作流

### 切换工作流

你可以启用或禁用工作流：

1. 在 Cline 界面中单击规则图标
2. 切换到"工作流"选项卡
3. 根据需要打开/关闭工作流

<Note>
禁用工作流会阻止其被调用，但保持文件完整。斜杠命令在重新启用之前不会工作。
</Note>

### 企业远程工作流

<Info>
企业部署可以配置适用于所有团队成员的**远程全局工作流**。这些通过你的基础设施配置管理。

有关远程工作流的详细信息，请参阅[自托管配置](/enterprise-solutions/configuration/infrastructure-configuration/overview)。
</Info>

## 示例工作流

<AccordionGroup>
  <Accordion title="代码审查工作流" icon="code-review">
```markdown
# 代码审查工作流

## 审查前检查清单
- [ ] 代码遵循项目风格指南
- [ ] 所有测试在本地通过
- [ ] 没有 console.log 或调试代码
- [ ] 注释解释"为什么"而不是"什么"
- [ ] PR 描述清晰完整

## 审查关注领域
1. **架构**：这是否适合我们的现有模式？
2. **安全**：是否有潜在漏洞？
3. **性能**：是否有明显的瓶颈？
4. **测试**：是否涵盖了边缘情况？
5. **文档**：使用新功能的方式是否清楚？

## 审查响应
- 在 24 小时内解决所有反馈
- 解决后标记对话为已解决
- 重大更改后重新请求审查
```
  </Accordion>
  
  <Accordion title="Bug 分类工作流" icon="bug">
```markdown
# Bug 分类工作流

## 信息收集
1. 在本地环境中重现 bug
2. 识别受影响的版本/环境
3. 检查是否存在类似问题
4. 收集错误日志和堆栈跟踪

## 优先级评估
**P0（关键）**：生产环境中断、数据丢失、安全漏洞
**P1（高）**：主要功能损坏、重大用户影响
**P2（中）**：次要功能损坏、有变通方法
**P3（低）**：外观问题、影响最小

## 创建工单
- 使用模板："Bug 报告"
- 添加重现步骤
- 如适用，包括截图/视频
- 用受影响的组件标记
- 分配优先级标签

## 下一步
- P0/P1：需要立即修复
- P2：安排在当前冲刺中
- P3：添加到待办事项
```
  </Accordion>
  
  <Accordion title="功能规划工作流" icon="lightbulb">
```markdown
# 功能规划工作流

## 需求收集
1. 定义我们正在解决的用户问题
2. 列出成功标准（可衡量）
3. 识别边缘情况和约束
4. 记录技术依赖关系

## 设计考虑事项
1. 这如何适应现有架构？
2. 需要什么数据模型？
3. 需要什么 API 更改？
4. 这将如何影响性能？

## 实施计划
1. 分解为更小的、可交付的部分
2. 识别哪些部分可以并行完成
3. 记录所需的任何功能标志
4. 规划向后兼容性

## 测试策略
1. 需要什么单元测试？
2. 需要什么集成测试？
3. 我们将如何测试边缘情况？
4. 需要什么手动测试？
```
  </Accordion>
</AccordionGroup>

## 最佳实践

<AccordionGroup>
  <Accordion title="保持工作流以行动为导向" icon="list-check">
    工作流应包含**可操作的步骤**，而不是一般建议：
    - ✅ "运行 `npm test` 并验证所有测试通过"
    - ❌ "确保测试完成得当"
  </Accordion>
  
  <Accordion title="使用检查清单" icon="square-check">
    尽可能将工作流格式化为检查清单：
    - 易于按步骤遵循
    - 清晰的进度跟踪
    - 减少遗漏步骤
  </Accordion>
  
  <Accordion title="包括上下文" icon="circle-info">
    在每个步骤后添加**原因**：
    ```markdown
    1. 首先检查预发布环境
       （在预发布环境中发现问题可以防止生产事故）
    ```
  </Accordion>
  
  <Accordion title="作为代码版本控制" icon="code-branch">
    工作流存在于你的仓库中：
    - 在 git 中跟踪更改
    - 在 PR 中审查更新
    - 维护流程演变的历史
  </Accordion>
</AccordionGroup>

## 工作流 vs 规则：何时使用每个

| 使用规则时 | 使用工作流时 |
|----------------|-------------------|
| 指导应应用于每个任务 | 流程偶尔被调用 |
| 很少更改的标准 | 特定场景的检查清单 |
| 始终激活的编码约定 | 按需部署流程 |
| 一般编码风格 | 特定审查程序 |

**示例：**
- **规则**："使用 TypeScript 严格模式和显式返回类型"
- **工作流**："部署到生产环境时遵循这 10 个步骤"

## 下一步

<CardGroup cols={2}>
  <Card title="规则" icon="book" href="/enterprise-solutions/configuration/infrastructure-configuration/rules">
    了解始终激活的规则
  </Card>
  
  <Card title="远程配置" icon="cloud" href="/enterprise-solutions/configuration/remote-configuration/overview">
    为你的团队部署全局工作流
  </Card>
</CardGroup>
