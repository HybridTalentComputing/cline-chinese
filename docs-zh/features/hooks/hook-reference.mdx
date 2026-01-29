---
title: "钩子参考"
sidebarTitle: "钩子参考"
description: "所有 Cline 钩子类型的完整 API 参考、JSON 模式和字段文档"
---

此参考为所有钩子类型、其 JSON 模式、输入/输出格式和通信协议提供完整的技术文档。

## 钩子类型

Cline 提供多种钩子类型，让你可以访问 AI 工作流的不同阶段。它们根据其触发点和用例组织成类别。

<Note>
下面的钩子名称是你需要创建的确切文件名。例如，要使用 TaskStart 钩子，在你的钩子目录中创建一个名为 `TaskStart`（无文件扩展名）的文件。
</Note>

每个钩子接收基本字段以及其特定数据：`clineVersion`、`hookName`、`timestamp`、`taskId`、`workspaceRoots`、`userId`。

### 工具执行钩子

这些钩子在工具执行之前和之后拦截和验证工具操作。使用它们来执行策略、跟踪更改并从操作中学习。

#### `PreToolUse`

在 Cline 使用任何工具之前立即触发（参见 [Cline 工具参考指南](/cline-tools) 了解所有可用工具）。使用它在更改发生之前阻止无效操作、验证参数和执行项目策略。

**输入字段：**
```json
{
  "clineVersion": "string",
  "hookName": "PreToolUse",
  "timestamp": "string",
  "taskId": "string",
  "workspaceRoots": ["string"],
  "userId": "string",
  "preToolUse": {
    "toolName": "string",
    "parameters": {}
  }
}
```

**示例用法：**
```bash
#!/usr/bin/env bash
input=$(cat)

# 阻止在 TypeScript 项目中创建 .js 文件
tool_name=$(echo "$input" | jq -r '.preToolUse.toolName')
if [[ "$tool_name" == "write_to_file" ]]; then
  file_path=$(echo "$input" | jq -r '.preToolUse.parameters.path')
  if [[ "$file_path" == *.js ]] && [[ -f "tsconfig.json" ]]; then
    echo '{"cancel": true, "errorMessage": "TypeScript 项目中不允许 JavaScript 文件"}'
    exit 0
  fi
fi

echo '{"cancel": false}'
```

#### `PostToolUse`

在 Cline 使用任何工具之后立即触发（参见 [Cline 工具参考指南](/cline-tools) 了解所有可用工具）。使用它从结果中学习、跟踪性能指标并基于执行的操作构建项目知识。

**输入字段：**
```json
{
  "clineVersion": "string",
  "hookName": "PostToolUse",
  "timestamp": "string",
  "taskId": "string",
  "workspaceRoots": ["string"],
  "userId": "string",
  "postToolUse": {
    "toolName": "string",
    "parameters": {},
    "result": "string",
    "success": boolean,
    "executionTimeMs": number
  }
}
```

**示例用法：**
```bash
#!/usr/bin/env bash
input=$(cat)

# 记录慢操作以进行性能监控
execution_time=$(echo "$input" | jq -r '.postToolUse.executionTimeMs')
tool_name=$(echo "$input" | jq -r '.postToolUse.toolName')

if (( execution_time > 5000 )); then
  context="PERFORMANCE: 检测到慢操作 - $tool_name 耗时 ${execution_time}ms"
  echo "{\"cancel\": false, \"contextModification\": \"$context\"}"
else
  echo '{"cancel": false}'
fi
```

### 用户交互钩子

这些钩子监控和增强与 Cline 的用户通信。使用它们来验证输入、注入上下文和跟踪交互模式。

#### `UserPromptSubmit`

当用户在提示框中输入文本并按 Enter 键以开始新任务、继续已完成的任务或恢复已取消的任务时触发。使用它来验证输入、基于提示注入上下文和跟踪交互模式。

**输入字段：**
```json
{
  "clineVersion": "string",
  "hookName": "UserPromptSubmit",
  "timestamp": "string",
  "taskId": "string",
  "workspaceRoots": ["string"],
  "userId": "string",
  "userPromptSubmit": {
    "prompt": "string",
    "attachments": ["string"]
  }
}
```

**示例用法：**
```bash
#!/usr/bin/env bash
input=$(cat)

# 为某些关键字注入编码标准上下文
prompt=$(echo "$input" | jq -r '.userPromptSubmit.prompt')
context=""

if echo "$prompt" | grep -qi "component\|react"; then
  context="CODING_STANDARDS: 遵循 React 函数组件模式并使用正确的 TypeScript 类型"
elif echo "$prompt" | grep -qi "api\|endpoint"; then
  context="CODING_STANDARDS: 使用一致的 REST API 模式并正确处理错误"
fi

if [[ -n "$context" ]]; then
  jq -n --arg ctx "$context" '{"cancel": false, "contextModification": $ctx}'
else
  echo '{"cancel": false}'
fi
```

### 任务生命周期钩子

这些钩子监控和响应从开始到完成的任务状态更改。使用它们来跟踪进度、恢复状态和触发工作流。

#### `TaskStart`

在新任务开始时触发一次。使用它来检测项目类型、初始化跟踪并注入初始上下文，以塑造 Cline 处理工作的方式。

**输入字段：**
```json
{
  "clineVersion": "string",
  "hookName": "TaskStart",
  "timestamp": "string",
  "taskId": "string",
  "workspaceRoots": ["string"],
  "userId": "string",
  "taskStart": {
    "taskMetadata": {
      "taskId": "string",
      "ulid": "string",
      "initialTask": "string"
    }
  }
}
```

**示例用法：**
```bash
#!/usr/bin/env bash
input=$(cat)

# 检测项目类型并注入相关上下文
context=""

if [[ -f "package.json" ]]; then
  if grep -q "react" package.json; then
    context="PROJECT_TYPE: 检测到 React 应用程序。遵循基于组件的架构。"
  elif grep -q "express" package.json; then
    context="PROJECT_TYPE: 检测到 Express.js API。遵循 RESTful 模式。"
  else
    context="PROJECT_TYPE: 检测到 Node.js 项目。"
  fi
elif [[ -f "requirements.txt" ]] || [[ -f "pyproject.toml" ]]; then
  context="PROJECT_TYPE: 检测到 Python 项目。遵循 PEP 8 标准。"
elif [[ -f "Cargo.toml" ]]; then
  context="PROJECT_TYPE: 检测到 Rust 项目。遵循 Rust 约定。"
fi

if [[ -n "$context" ]]; then
  jq -n --arg ctx "$context" '{"cancel": false, "contextModification": $ctx}'
else
  echo '{"cancel": false}'
fi
```

#### `TaskResume`

当用户恢复已取消或中止的任务时触发。使用它来恢复状态、刷新上下文并记录恢复情况以进行分析或外部系统通知。

**输入字段：**
```json
{
  "clineVersion": "string",
  "hookName": "TaskResume",
  "timestamp": "string",
  "taskId": "string",
  "workspaceRoots": ["string"],
  "userId": "string",
  "taskResume": {
    "taskMetadata": {
      "taskId": "string",
      "ulid": "string"
    },
    "previousState": {
      "lastMessageTs": "string",
      "messageCount": "string",
      "conversationHistoryDeleted": "string"
    }
  }
}
```

#### `TaskCancel`

当用户取消任务或中止钩子执行时触发。使用它来清理资源、记录取消详细信息并通知外部系统有关中断的工作。

**输入字段：**
```json
{
  "clineVersion": "string",
  "hookName": "TaskCancel",
  "timestamp": "string",
  "taskId": "string",
  "workspaceRoots": ["string"],
  "userId": "string",
  "taskCancel": {
    "taskMetadata": {
      "taskId": "string",
      "ulid": "string"
    }
  }
}
```

#### `TaskComplete`

当 Cline 完成其工作并成功执行 `attempt_completion` 工具以完成任务输出时触发。使用它来跟踪完成指标、生成报告、记录任务结果和触发完成工作流。

**输入字段：**
```json
{
  "clineVersion": "string",
  "hookName": "TaskComplete",
  "timestamp": "string",
  "taskId": "string",
  "workspaceRoots": ["string"],
  "userId": "string",
  "taskComplete": {
    "taskMetadata": {
      "taskId": "string",
      "ulid": "string"
    }
  }
}
```

**示例用法：**
```bash
#!/usr/bin/env bash
input=$(cat)

# 提取任务元数据
task_id=$(echo "$input" | jq -r '.taskComplete.taskMetadata.taskId // "unknown"')
ulid=$(echo "$input" | jq -r '.taskComplete.taskMetadata.ulid // "unknown"')

# 记录完成情况
completion_log="$HOME/.cline_completions/$(date +%Y-%m-%d).log"
mkdir -p "$(dirname "$completion_log")"

echo "$(date -Iseconds): 任务 $task_id 已完成 (ULID: $ulid)" >> "$completion_log"

# 提供有关完成的上下文
context="TASK_COMPLETED: 任务 $task_id 成功完成。完成情况已记录。"
jq -n --arg ctx "$context" '{"cancel": false, "contextModification": $ctx}'
```

### 系统事件钩子

这些钩子监控内部 Cline 操作和系统级事件。使用它们来跟踪上下文使用、记录系统行为和分析性能模式。

## JSON 通信协议

钩子通过 stdin 接收 JSON 并通过 stdout 返回 JSON。

### 输入格式

所有钩子通过 stdin 接收具有此基本结构的 JSON 对象：

```json
{
  "clineVersion": "string",
  "hookName": "string", 
  "timestamp": "string",
  "taskId": "string",
  "workspaceRoots": ["string"],
  "userId": "string",
  "[hookSpecificField]": {
    // 钩子特定的数据结构
  }
}
```

### 输出格式

你的钩子脚本必须输出 JSON 响应作为最终的 stdout 内容：

```json
{
  "cancel": false,
  "contextModification": "WORKSPACE_RULES: 使用 TypeScript",
  "errorMessage": "如果阻止则显示错误详细信息"
}
```

**字段描述：**

- **`cancel`**（必需）：控制是否继续执行的布尔值
  - `true`：阻止当前操作
  - `false`：允许操作继续

- **`contextModification`**（可选）：注入到对话中的字符串
  - 影响未来的 AI 决策，而不是当前的决策
  - 使用清晰的前缀如 `WORKSPACE_RULES:`、`PERFORMANCE:`、`SECURITY:` 进行分类
  - 最大长度：50KB

- **`errorMessage`**（可选）：当 `cancel` 为 `true` 时向用户显示的字符串
  - 仅在阻止操作时显示
  - 应解释为何操作被阻止

### 执行期间记录

你的钩子脚本可以在执行期间向 stdout 输出记录或诊断信息，只要 JSON 响应是最后写入的内容：

```bash
#!/usr/bin/env bash
echo "正在处理钩子..."  # 这可以
echo "工具: $tool_name"    # 这也可以

# JSON 必须是最后一个：
echo '{"cancel": false}'
```

Cline 将仅从 stdout 解析最终的 JSON 对象。

### 错误处理

钩子执行错误不会阻止任务执行 - 只有返回 `"cancel": true` 可以中止任务。所有其他错误被视为钩子失败，而不是中止任务的原因。

**钩子状态显示：**

- **已完成**（灰色）：钩子执行成功，无论它返回 `"cancel": false` 还是没有 JSON 输出
- **失败**（红色）：钩子以非零状态退出、输出无效 JSON 或超时。UI 显示错误详细信息（例如，退出代码号）
- **已中止**（红色）：钩子返回 `"cancel": true`，停止任务。用户必须手动恢复任务以继续

**重要：** 即使钩子失败（非零退出、无效 JSON、超时），Cline 也会继续执行任务。只有 `"cancel": true` 停止执行。

### 上下文修改时机

上下文注入影响未来的决策，而不是当前的决策。当钩子运行时：

1. AI 已经决定要做什么
2. 钩子可以阻止或允许它
3. 任何上下文都被添加到对话中
4. 下一个 AI 请求看到该上下文

这意味着：
- **PreToolUse 钩子**：用于阻止不良操作 + 为下一个决策注入上下文
- **PostToolUse 钩子**：用于从已完成的操作中学习

### 有用的提示：JSON 中的字符串转义

当你的钩子需要在 JSON 输出中包含包含未转义引号字符（`"`）的字符串时，使用 jq 的 `--arg` 标志进行适当的转义：

```bash
#!/usr/bin/env bash

# 当 $output 包含未转义的引号字符（"）时...
output='{"foo":"bar"}'

# 使用 jq --arg 标志进行自动字符串转义
jq -n --arg ctx "$output" '{cancel: false, contextModification: $ctx}'

# 这将产生：
# {
#     "cancel": false,
#     "contextModification": "{\"foo\":\"bar\"}"
# }
```

`--arg` 标志自动转义特殊字符，防止当你的上下文修改包含复杂字符串或嵌套 JSON 结构时出现 JSON 解析错误。

## 钩子执行环境

### 执行上下文

钩子是以与 VS Code 相同权限运行的可执行脚本。它们具有对以下内容的无限制访问：
- 整个文件系统（用户可以访问的任何文件）
- 所有环境变量
- 系统命令和工具
- 网络资源

钩子可以执行用户可以在终端中执行的任何操作，包括读取和写入工作区之外的文件、发出网络请求和执行系统命令。

### 安全考虑

<Warning>
钩子以与 VS Code 相同的权限运行。它们可以访问所有工作区文件和环境变量。在启用之前审查来自不受信任来源的钩子。
</Warning>

### 性能指南

钩子有 30 秒超时。只要你的钩子在此时间内完成，它就可以执行任何所需的操作，包括网络调用或繁重的计算。

### 钩子发现

Cline 按此顺序搜索钩子：
1. 项目特定：工作区根目录中的 `.clinerules/hooks/`
2. 用户全局：`~/Documents/Cline/Hooks/`

项目特定钩子覆盖具有相同名称的全局钩子。
