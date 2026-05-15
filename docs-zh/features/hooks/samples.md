---
title: "示例"
sidebarTitle: "示例"
description: "按复杂度级别组织的实用钩子示例 - 从初学者到高级模式"
---

此页面提供完整的、生产就绪的钩子示例，按技能级别组织。每个示例包括完整的工作代码、详细解释以及何时使用每种模式的指导。

## 如何使用这些示例

每个示例设计为：
- **即复制即用**：直接使用或作为起点
- **教育性**：通过递进的复杂性学习钩子概念
- **实用性**：解决真实的开发工作流挑战

根据你的经验级别选择示例，并逐步发展到更高级的模式。

---

## 初学者示例

非常适合开始使用钩子。这些示例使用简单的逻辑演示核心概念。

### 1. 项目类型检测

**钩子：** `TaskStart`

```bash
#!/usr/bin/env bash
# 项目类型检测钩子
# 
# 概述：在任务开始时自动检测项目类型，并将相关的
# 编码标准和最佳实践注入到 AI 上下文中。这有助于 Cline 理解
# 你的项目结构并从一开始应用适当的约定。
#
# 演示：基本的钩子输入/输出、文件系统检查、条件逻辑，
# 以及引导 AI 行为的上下文注入。

input=$(cat)

# 读取基本 JSON 结构并检测项目类型
context=""

# 检查不同的项目指示器
if [[ -f "package.json" ]]; then
  if grep -q "react" package.json; then
    context="PROJECT_TYPE: 检测到 React 应用程序。遵循基于组件的架构并使用函数组件。"
  elif grep -q "express" package.json; then
    context="PROJECT_TYPE: 检测到 Express.js API。遵循 RESTful 模式和适当的中间件结构。"
  else
    context="PROJECT_TYPE: 检测到 Node.js 项目。使用适当的 npm 脚本和依赖管理。"
  fi
elif [[ -f "requirements.txt" ]] || [[ -f "pyproject.toml" ]]; then
  context="PROJECT_TYPE: 检测到 Python 项目。遵循 PEP 8 标准并使用虚拟环境。"
elif [[ -f "Cargo.toml" ]]; then
  context="PROJECT_TYPE: 检测到 Rust 项目。遵循 Rust 约定并使用适当的错误处理。"
elif [[ -f "go.mod" ]]; then
  context="PROJECT_TYPE: 检测到 Go 项目。遵循 Go 约定并使用适当的包结构。"
fi

# 返回上下文以引导 Cline 的行为
if [[ -n "$context" ]]; then
  jq -n --arg ctx "$context" '{"cancel": false, "contextModification": $ctx}'
else
  echo '{"cancel": false}'
fi
```

**关键概念：**
- 使用 `input=$(cat)` 读取钩子输入
- 使用文件系统检查检测项目类型
- 返回上下文以影响 AI 行为
- 使用 `jq` 进行基本 JSON 输出

### 2. 文件扩展名验证器

**钩子：** `PreToolUse`

```bash
#!/usr/bin/env bash
# 文件扩展名验证器钩子
#
# 概述：通过阻止创建 .js 和 .jsx 文件，在 TypeScript 项目中强制执行
# TypeScript 文件扩展名。这防止开发人员在使用 TypeScript 时意外
# 创建 JavaScript 文件的常见错误。
#
# 演示：PreToolUse 阻止、参数提取、条件验证，
# 以及提供清晰的错误消息以引导用户使用正确的文件扩展名。

input=$(cat)

# 提取工具信息
tool_name=$(echo "$input" | jq -r '.preToolUse.toolName')

# 仅处理文件创建工具
if [[ "$tool_name" != "write_to_file" ]]; then
  echo '{"cancel": false}'
  exit 0
fi

# 检查这是否是 TypeScript 项目
if [[ ! -f "tsconfig.json" ]]; then
  echo '{"cancel": false}'
  exit 0
fi

# 从工具参数获取文件路径
file_path=$(echo "$input" | jq -r '.preToolUse.parameters.path // empty')

if [[ -z "$file_path" ]]; then
  echo '{"cancel": false}'
  exit 0
fi

# 在 TypeScript 项目中阻止 .js 文件
if [[ "$file_path" == *.js ]]; then
  echo '{"cancel": true, "errorMessage": "TypeScript 项目中不允许 JavaScript 文件（.js）。请改用 .ts 扩展名。"}'
  exit 0
fi

# 阻止 .jsx 文件，建议使用 .tsx
if [[ "$file_path" == *.jsx ]]; then
  echo '{"cancel": true, "errorMessage": "TypeScript 项目中不允许 JSX 文件（.jsx）。请改用 .tsx 扩展名。"}'
  exit 0
fi

# 一切正常
echo '{"cancel": false}'
```

**关键概念：**
- 提取工具名称和参数
- 基于项目状态的条件逻辑
- 使用 `"cancel": true` 阻止操作
- 提供有用的错误消息

### 3. 基本性能监控器

**钩子：** `PostToolUse`

```bash
#!/usr/bin/env bash
# 基本性能监控器钩子
#
# 概述：监控工具执行时间并记录超过 3 秒
# 阈值的操作。这有助于识别性能瓶颈，并向用户
# 提供有关可能减慢 Cline 操作的系统资源问题的反馈。
#
# 演示：PostToolUse 钩子用法、bash 中的算术运算、简单文件
# 记录以及基于性能指标的条件上下文注入。

input=$(cat)

# 提取性能信息
tool_name=$(echo "$input" | jq -r '.postToolUse.toolName')
execution_time=$(echo "$input" | jq -r '.postToolUse.executionTimeMs // 0')
success=$(echo "$input" | jq -r '.postToolUse.success')

# 记录慢操作（阈值：3 秒）
if (( execution_time > 3000 )); then
  # 创建简单的日志目录
  mkdir -p "$HOME/.cline_logs"
  
  # 记录慢操作
  echo "$(date -Iseconds): SLOW OPERATION - $tool_name 耗时 ${execution_time}ms" >> "$HOME/.cline_logs/performance.log"
  
  # 向用户提供反馈
  context="PERFORMANCE: 操作 $tool_name 耗时 ${execution_time}ms。如果这种情况经常发生，请考虑检查系统资源。"
  jq -n --arg ctx "$context" '{"cancel": false, "contextModification": $ctx}'
else
  echo '{"cancel": false}'
fi
```

**关键概念：**
- 工具执行后处理结果
- bash 中的基本算术运算
- 简单的文件记录
- 条件上下文注入

## 中级示例

这些示例演示更高级的概念，包括外部工具集成、模式匹配和结构化记录。

### 4. 使用 Linting 进行代码质量检查

**钩子：** `PreToolUse`

```bash
#!/usr/bin/env bash
# 代码质量 Linting 钩子
#
# 概述：集成 ESLint 和 Flake8 以在写入文件之前强制执行代码质量标准。
# 如果检测到 linting 错误，则阻止文件创建，确保所有代码符合质量标准。
# 支持 TypeScript、JavaScript 和 Python 文件。
#
# 演示：外部工具集成、临时文件处理、正则表达式
# 模式匹配以及具有可操作反馈的综合错误报告。

input=$(cat)

tool_name=$(echo "$input" | jq -r '.preToolUse.toolName')

# 仅对文件写入操作进行 lint
if [[ "$tool_name" != "write_to_file" ]]; then
  echo '{"cancel": false}'
  exit 0
fi

file_path=$(echo "$input" | jq -r '.preToolUse.parameters.path // empty')

# 跳过非代码文件
if [[ ! "$file_path" =~ \.(ts|tsx|js|jsx|py|rs)$ ]]; then
  echo '{"cancel": false}'
  exit 0
fi

# 从工具参数获取文件内容  
content=$(echo "$input" | jq -r '.preToolUse.parameters.content // empty')

if [[ -z "$content" ]]; then
  echo '{"cancel": false}'
  exit 0
fi

# 创建临时文件用于 linting
temp_file=$(mktemp)
echo "$content" > "$temp_file"

# 根据文件扩展名运行适当的 linter
lint_errors=""
if [[ "$file_path" =~ \.(ts|tsx)$ ]] && command -v eslint > /dev/null; then
  lint_output=$(eslint "$temp_file" --format=json 2>/dev/null || true)
  if [[ "$lint_output" != "[]" ]] && [[ -n "$lint_output" ]]; then
    error_count=$(echo "$lint_output" | jq '.[0].errorCount // 0')
    if (( error_count > 0 )); then
      messages=$(echo "$lint_output" | jq -r '.[0].messages[] | "\(.line):\(.column) \(.message)"')
      lint_errors="ESLint errors found:\n$messages"
    fi
  fi
elif [[ "$file_path" =~ \.py$ ]] && command -v flake8 > /dev/null; then
  lint_output=$(flake8 "$temp_file" 2>/dev/null || true)
  if [[ -n "$lint_output" ]]; then
    lint_errors="Flake8 errors found:\n$lint_output"
  fi
fi

# 清理
rm -f "$temp_file"

# 如果发现 linting 错误则阻止
if [[ -n "$lint_errors" ]]; then
  error_message="Code quality check failed. Please fix these issues:\n\n$lint_errors"
  jq -n --arg msg "$error_message" '{"cancel": true, "errorMessage": $msg}'
else
  echo '{"cancel": false}'
fi
```

**关键概念：**
- 临时文件创建和清理
- 外部工具集成（eslint、flake8）
- 使用正则表达式的复杂模式匹配
- 结构化错误报告

### 5. 安全扫描器

**钩子：** `PreToolUse`

```bash
#!/usr/bin/env bash
# 安全扫描器钩子
#
# 概述：在写入文件之前扫描文件内容中的硬编码密钥（API 密钥、令牌、密码）。
# 阻止创建包含密钥的文件，除了在 .env.example 文件或文档等安全位置中，
# 防止凭据泄露。
#
# 演示：使用正则表达式数组的模式匹配、文件路径异常处理，
# 以安全为重点的验证，以及错误消息中的清晰用户指导。

input=$(cat)

tool_name=$(echo "$input" | jq -r '.preToolUse.toolName')

# 仅检查文件操作
if [[ "$tool_name" != "write_to_file" ]]; then
  echo '{"cancel": false}'
  exit 0
fi

content=$(echo "$input" | jq -r '.preToolUse.parameters.content // empty')
file_path=$(echo "$input" | jq -r '.preToolUse.parameters.path // empty')

# 如果没有内容则跳过
if [[ -z "$content" ]]; then
  echo '{"cancel": false}'
  exit 0
fi

# 定义密钥模式（为可读性简化）
secrets_found=""

# 检查 API 密钥
if echo "$content" | grep -qi "api[_-]*key.*[=:].*['\"][a-z0-9_-]{10,}['\"]"; then
  secrets_found+="- 检测到 API 密钥模式\n"
fi

# 检查令牌
if echo "$content" | grep -qi "token.*[=:].*['\"][a-z0-9_-]{10,}['\"]"; then
  secrets_found+="- 检测到令牌模式\n"
fi

# 检查密码
if echo "$content" | grep -qi "password.*[=:].*['\"][^'\"]{8,}['\"]"; then
  secrets_found+="- 检测到密码模式\n"
fi

# 允许在安全文件中使用密钥
safe_patterns=("\.env\.example$" "\.env\.template$" "/docs/" "\.md$")
is_safe_file=false
for safe_pattern in "${safe_patterns[@]}"; do
  if [[ "$file_path" =~ $safe_pattern ]]; then
    is_safe_file=true
    break
  fi
done

if [[ -n "$secrets_found" ]] && [[ "$is_safe_file" == false ]]; then
  error_message="🔒 安全警报：在 $file_path 中检测到潜在密钥

$secrets_found
请改用环境变量或密钥管理服务。"

  jq -n --arg msg "$error_message" '{"cancel": true, "errorMessage": $msg}'
else
  echo '{"cancel": false}'
fi
```

**关键概念：**
- 模式数组和迭代
- 文件路径异常处理  
- 以安全为重点的验证
- 错误消息中的清晰用户指导

### 6. Git 工作流助手

**钩子：** `PostToolUse`

```bash
#!/usr/bin/env bash
# Git 工作流助手钩子
#
# 概述：根据文件类型和当前分支分析文件修改并提供智能的 git 工作流建议。
# 鼓励最佳实践，例如组件的功能分支和测试文件的测试分支，
# 并提供可操作的 git 命令。
#
# 演示：Git 集成、分支分析、文件路径模式匹配，
# 以及引导用户采用更好 git 实践的上下文建议。

input=$(cat)

tool_name=$(echo "$input" | jq -r '.postToolUse.toolName')
success=$(echo "$input" | jq -r '.postToolUse.success')

# 仅处理成功的文件修改
if [[ "$success" != "true" ]] || [[ "$tool_name" != "write_to_file" && "$tool_name" != "replace_in_file" ]]; then
  echo '{"cancel": false}'
  exit 0
fi

# 检查我们是否在 git 仓库中
if ! git rev-parse --git-dir > /dev/null 2>&1; then
  echo '{"cancel": false}'
  exit 0
fi

file_path=$(echo "$input" | jq -r '.postToolUse.parameters.path // empty')
current_branch=$(git branch --show-current 2>/dev/null || echo "main")

# 分析文件类型并建议适当的分支命名
context=""
if [[ "$file_path" == *"component"* ]] && [[ "$current_branch" == "main" || "$current_branch" == "master" ]]; then
  component_name=$(basename "$file_path" .tsx .ts .jsx .js)
  context="GIT_WORKFLOW: 考虑创建功能分支：git checkout -b feature/add-${component_name,,}-component"
elif [[ "$file_path" == *"test"* ]] || [[ "$file_path" == *"spec"* ]]; then
  if [[ "$current_branch" == "main" || "$current_branch" == "master" ]]; then
    context="GIT_WORKFLOW: 考虑创建测试分支：git checkout -b test/add-tests-$(basename "$(dirname "$file_path")")"
  fi
fi

# 添加暂存指导
if [[ -n "$context" ]]; then
  context="$context 完成更改后，使用 'git add $file_path' 进行暂存以提交。"
else
  context="GIT_WORKFLOW: 文件已修改：$file_path。准备好提交时使用 'git add $file_path'。"
fi

jq -n --arg ctx "$context" '{"cancel": false, "contextModification": $ctx}'
```

**关键概念：**
- Git 仓库检测
- 分支分析和建议
- 文件路径分析以获取上下文
- 可操作的用户指导

## 高级示例

这些示例展示复杂的模式，包括外部集成、异步处理和复杂的状态管理。

### 7. 综合任务生命周期管理器

**钩子：** `TaskComplete`

```bash
#!/usr/bin/env bash
# 综合任务生命周期管理器钩子
#
# 概述：通过生成包含工作区信息和 git 状态的详细 markdown 报告来跟踪任务完成，
# 并可选择向外部系统发送 webhook 通知。非常适合需要审计跟踪的企业环境。
#
# 演示：复杂数据提取、结构化报告生成、markdown
# heredocs、异步 webhook 通知和健壮的错误处理。

input=$(cat)

# 使用适当的 API 字段路径提取任务元数据
task_id=$(echo "$input" | jq -r '.taskId')
ulid=$(echo "$input" | jq -r '.taskComplete.taskMetadata.ulid // "unknown"')
completion_time=$(echo "$input" | jq -r '.timestamp')

# 创建完成报告目录并进行错误处理
reports_dir="$HOME/.cline_reports"
if [[ ! -d "$(dirname "$reports_dir")" ]]; then
  echo '{"cancel": false, "errorMessage": "无法访问主目录"}' 
  exit 0
fi
mkdir -p "$reports_dir" || exit 0

# 生成安全、唯一的报告文件名
safe_task_id=$(echo "$task_id" | tr -cd '[:alnum:]_-' | head -c 50)
report_file="$reports_dir/completion_$(date +%Y%m%d_%H%M%S)_${safe_task_id}.md"

# 收集全面的工作区信息
git_branch=$(git branch --show-current 2>/dev/null || echo "No git repository")
git_status_count=$(git status --porcelain 2>/dev/null | wc -l || echo "0")
project_name=$(basename "$PWD")

# 生成详细的完成报告
cat > "$report_file" << EOF
# Cline 任务完成报告

**任务 ID：** $task_id  
**ULID：** $ulid  
**完成时间：** $(date -Iseconds)  
**完成时间：** $completion_time

## 工作区信息
- **项目：** $project_name
- **Git 分支：** $git_branch
- **修改的文件：** $git_status_count

## 完成状态
✅ 任务成功完成

## 后续步骤
- 审查在此任务期间所做的更改
- 如果适当，考虑提交更改  
- 运行测试以验证功能
EOF

# 如果配置了，发送 webhook 通知
webhook_url="${COMPLETION_WEBHOOK_URL:-}"
if [[ -n "$webhook_url" ]]; then
  payload=$(jq -n \
    --arg task_id "$task_id" \
    --arg ulid "$ulid" \
    --arg workspace "$project_name" \
    --arg timestamp "$completion_time" \
    '{
      event: "task_completed",
      task_id: $task_id,
      ulid: $ulid,
      workspace: $workspace,
      timestamp: $timestamp
    }')
  
  # 在后台发送通知并设置超时
  (curl -X POST \
    -H "Content-Type: application/json" \
    -d "$payload" \
    "$webhook_url" \
    --max-time 5 \
    --silent > /dev/null 2>&1) &
fi

context="TASK_COMPLETED: ✅ 任务 $task_id 成功完成。报告已保存到：$(basename "$report_file")"
jq -n --arg ctx "$context" '{"cancel": false, "contextModification": $ctx}'
```

**关键概念：**
- 复杂数据提取和验证
- 结构化报告生成
- 异步 webhook 通知
- 错误处理和资源管理

### 8. 智能用户输入增强器  

**钩子：** `UserPromptSubmit`

```bash
#!/usr/bin/env bash
# 智能用户输入增强器钩子
#
# 概述：分析用户提示以检测潜在的有害命令，记录用户
# 活动以进行分析，并根据提示关键字智能地注入项目和 git 上下文。
# 在增强 AI 响应相关上下文的同时提供安全保护。
#
# 演示：UserPromptSubmit 钩子用法、多模式安全验证、从提示中
# 智能上下文检测、结构化 JSON 记录以及动态建议生成。

input=$(cat)

user_prompt=$(echo "$input" | jq -r '.userPromptSubmit.prompt')
task_id=$(echo "$input" | jq -r '.taskId')
user_id=$(echo "$input" | jq -r '.userId')

# 记录用户活动以进行分析
activity_log="$HOME/.cline_user_activity/$(date +%Y-%m-%d).log"
mkdir -p "$(dirname "$activity_log")"

activity_entry=$(jq -n \
  --arg timestamp "$(date -Iseconds)" \
  --arg task_id "$task_id" \
  --arg user_id "$user_id" \
  --arg prompt_length "${#user_prompt}" \
  '{
    timestamp: $timestamp,
    task_id: $task_id,
    user_id: $user_id,
    prompt_length: ($prompt_length | tonumber),
    workspace: env.PWD
  }')

echo "$activity_entry" >> "$activity_log"

context_modifications=""
cancel_request=false

# 安全验证
harmful_patterns=("rm -rf" "delete.*all" "format.*drive" "sudo.*passwd")
for pattern in "${harmful_patterns[@]}"; do
  if echo "$user_prompt" | grep -qi "$pattern"; then
    cancel_request=true
    error_message="🚨 安全警报：检测到潜在的有害命令。请审查你的请求。"
    break
  fi
done

# 智能上下文增强
if [[ "$cancel_request" == false ]]; then
  # 检测项目上下文
  if echo "$user_prompt" | grep -qi "file\|directory\|folder"; then
    if [[ -f "package.json" ]]; then
      project_name=$(jq -r '.name // "unknown"' package.json 2>/dev/null)
      context_modifications+="PROJECT_CONTEXT: 正在 Node.js 项目 '$project_name' 中工作。 "
    elif [[ -f "requirements.txt" ]]; then
      context_modifications+="PROJECT_CONTEXT: 正在 Python 项目中工作。 "
    fi
  fi
  
  # Git 上下文增强
  if echo "$user_prompt" | grep -qi "git\|commit\|branch" && git rev-parse --git-dir > /dev/null 2>&1; then
    current_branch=$(git branch --show-current 2>/dev/null)
    uncommitted=$(git status --porcelain | wc -l)
    context_modifications+="GIT_CONTEXT: 在分支 '$current_branch' 上，有 $uncommitted 个未提交的更改。 "
  fi
  
  # 工具建议
  if echo "$user_prompt" | grep -qi "search.*code\|find.*function"; then
    context_modifications+="SUGGESTION: 考虑使用 search_files 工具进行代码探索。 "
  fi
fi

# 返回响应
if [[ "$cancel_request" == true ]]; then
  jq -n --arg msg "$error_message" '{"cancel": true, "errorMessage": $msg}'
else
  if [[ -n "$context_modifications" ]]; then
    jq -n --arg ctx "$context_modifications" '{"cancel": false, "contextModification": $ctx}'
  else
    echo '{"cancel": false}'
  fi
fi
```

**关键概念：**
- 用户交互分析和记录
- 多模式安全验证
- 智能上下文检测
- 动态建议生成

### 9. 多服务集成中心

**钩子：** `PostToolUse`

```bash
#!/usr/bin/env bash
# 多服务集成中心钩子
#
# 概述：按类型（依赖项、CI/CD、前端、后端、测试）检测文件修改，
# 并向 Slack 和 CI/CD 系统等多个外部服务发送异步 webhook 通知。
# 实现 Cline 操作与企业工作流的无缝集成。
#
# 演示：使用关联数组的高级模式匹配、多服务 webhook
# 编排、异步后台处理和企业通知模式。

input=$(cat)

tool_name=$(echo "$input" | jq -r '.postToolUse.toolName')
success=$(echo "$input" | jq -r '.postToolUse.success')
file_path=$(echo "$input" | jq -r '.postToolUse.parameters.path // empty')

# 仅处理成功的文件操作
if [[ "$success" != "true" ]] || [[ "$tool_name" != "write_to_file" && "$tool_name" != "replace_in_file" ]]; then
  echo '{"cancel": false}'
  exit 0
fi

# 定义工作流触发器
declare -A triggers=(
  ["package\\.json|yarn\\.lock"]="dependencies"
  ["\\.github/workflows/"]="ci_cd"
  ["src/.*component"]="frontend"
  ["api/.*\\.(ts|js)"]="backend"
  [".*\\.(test|spec)\\."]="testing"
)

# 确定触发的工作流
triggered_workflows=""
for pattern in "${!triggers[@]}"; do
  if [[ "$file_path" =~ $pattern ]]; then
    workflow_type="${triggers[$pattern]}"
    triggered_workflows+="$workflow_type "
  fi
done

context="WORKFLOW: 文件已修改：$file_path"

if [[ -n "$triggered_workflows" ]]; then
  # Slack 通知（异步）
  slack_webhook="${SLACK_WEBHOOK_URL:-}"
  if [[ -n "$slack_webhook" ]]; then
    slack_payload=$(jq -n \
      --arg file "$file_path" \
      --arg workflows "$triggered_workflows" \
      --arg workspace "$(basename "$PWD")" \
      '{
        text: ("🔧 Cline modified `" + $file + "` in " + $workspace),
        color: "good",
        fields: [{
          title: "Triggered Workflows",
          value: $workflows,
          short: true
        }]
      }')
    
    (curl -X POST -H "Content-Type: application/json" -d "$slack_payload" "$slack_webhook" --max-time 5 --silent > /dev/null 2>&1) &
  fi

  # CI/CD webhook（异步）  
  ci_webhook="${CI_WEBHOOK_URL:-}"
  if [[ -n "$ci_webhook" ]]; then
    ci_payload=$(jq -n \
      --arg file "$file_path" \
      --arg workflows "$triggered_workflows" \
      '{
        event: "file_modified",
        file_path: $file,
        workflows: ($workflows | split(" "))
      }')
    
    (curl -X POST -H "Content-Type: application/json" -d "$ci_payload" "$ci_webhook" --max-time 5 --silent > /dev/null 2>&1) &
  fi

  context+=" 触发的工作流：$triggered_workflows。已向配置的服务发送通知。"
fi

jq -n --arg ctx "$context" '{"cancel": false, "contextModification": $ctx}'
```

**关键概念：**
- 多服务集成模式
- 异步 webhook 编排  
- 复杂的工作流检测
- 企业通知系统

## 使用提示

### 运行多个钩子

你可以通过为每种钩子类型创建单独文件来一起使用多个钩子：

```bash
# 创建钩子目录
mkdir -p .clinerules/hooks

# 创建多个钩子
touch .clinerules/hooks/PreToolUse
touch .clinerules/hooks/PostToolUse
touch .clinerules/hooks/TaskStart

# 使它们可执行
chmod +x .clinerules/hooks/*
```

### 环境配置

为外部集成设置环境变量：

```bash
# 添加到你的 .bashrc 或 .zshrc
export SLACK_WEBHOOK_URL="https://hooks.slack.com/services/..."
export JIRA_URL="https://yourcompany.atlassian.net"
export JIRA_USER="your-email@company.com"
export JIRA_TOKEN="your-api-token"
export CI_WEBHOOK_URL="https://your-ci-system.com/hooks/cline"
```

### 测试你的钩子

通过模拟其输入来手动测试钩子：

```bash
# 测试 PreToolUse 钩子
echo '{
  "clineVersion": "1.0.0",
  "hookName": "PreToolUse",
  "timestamp": "2024-01-01T12:00:00Z",
  "taskId": "test",
  "workspaceRoots": ["/path/to/workspace"],
  "userId": "test-user",
  "preToolUse": {
    "toolName": "write_to_file",
    "parameters": {
      "path": "test.js",
      "content": "console.log(\"test\");"
    }
  }
}' | .clinerules/hooks/PreToolUse
```

这些示例为在你的开发工作流中实现钩子提供了坚实的基础。根据你的特定需求、工具和集成进行自定义。
