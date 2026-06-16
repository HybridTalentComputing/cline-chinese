# Cline Chinese 上游同步指南

本文档记录如何将 Cline Chinese 从一个上游版本同步到新版本，以及过程中遇到的坑和解决方案。

---

## 一、同步流程概览

```
1. 备份中文文档和 README
2. 用上游新版本 tag 替换所有文件
3. 修改 package.json 身份信息
4. 创建 VS Code NLS 本地化文件
5. 设置默认语言为中文
6. 安装 i18next 框架（如尚未安装）
7. 更新翻译文件（提取新字符串 + 翻译）
8. 迁移组件（用 t() 替换硬编码字符串）
9. 修改系统提示词语言指令
10. 恢复中文文档和 README
11. 编译验证
```

---

## 二、详细步骤

### Step 1: 备份

```bash
cp -r docs-zh/ /tmp/backup/docs-zh
cp README.md /tmp/backup/README.md
```

### Step 2: 用上游新版本替换文件

```bash
# 确保已添加上游 remote
git remote add upstream https://github.com/cline/cline.git
git fetch upstream --tags

# 在工作分支上替换所有文件
git rm -rf .
GIT_LFS_SKIP_SMUDGE=1 git checkout <新版本tag> -- .
git commit -m "Sync with upstream <版本号>"
```

**坑 1**: `git checkout <tag> -- .` 会因 Git LFS 大文件失败（如 `.mp4`），需要设置 `GIT_LFS_SKIP_SMUDGE=1`。

**坑 2**: 不要在 main 分支上操作，应在专用同步分支（如 `v3.83.0-sync`）上工作。

**坑 6**: Git LFS 推送被拒绝。使用 `GIT_LFS_SKIP_SMUDGE=1` checkout 后，LFS 对象（`.mp4`、`.webm`）并未下载到本地。当推送到 origin 时，远程仓库找不到这些 LFS 对象，会拒绝推送：

```
remote: GitLab: LFS objects are missing. Ensure LFS objects are pushed before pushing branches.
error: failed to push some refs to 'https://github.com/HybridTalentComputing/cline-chinese.git'
```

**解决方案**: 在 `git push` 之前，先从上游获取并推送 LFS 对象：

```bash
# 从上游获取 LFS 对象
git lfs fetch upstream <新版本tag>

# 推送 LFS 对象到自己的仓库
git lfs push --all origin <工作分支>

# 然后再推送代码
git push origin <工作分支>
```

### Step 3: 修改 package.json

只改以下字段，其余保持上游原样：

```json
{
  "name": "cline-chinese",
  "displayName": "Cline Chinese",
  "description": "%cline.description%",
  "publisher": "HybridTalentComputing",
  "author": { "name": "HybridTalentComputing" },
  "repository": { "url": "https://github.com/HybridTalentComputing/cline-chinese" },
  "homepage": "https://github.com/HybridTalentComputing/cline-chinese"
}
```

版本号保持与上游一致。

**坑 7**: 扩展标识符冲突。package.json 中所有以 `cline.` 开头的命令 ID（如 `cline.newTask`）、视图容器 ID（如 `claude-dev-ActivityBar`）、以及源码中硬编码的发布者引用（如 `saoudrizwan.claude-dev`），必须全部改为 `cline-chinese.` 前缀。否则与原版 Cline 扩展共存时会产生严重冲突（命令互相覆盖、视图混乱、配置串扰）。

**需要修改的地方**:

1. **package.json** — 所有命令标识符:
   ```
   "cline.newTask"        → "cline-chinese.newTask"
   "cline.openInNewTab"   → "cline-chinese.openInNewTab"
   ...（所有 contributes.commands、menus、keybindings 中的引用）
   ```
   ActivityBar 和视图 ID:
   ```
   "claude-dev-ActivityBar"          → "cline-chinese-ActivityBar"
   "claude-dev.SidebarProvider"      → "cline-chinese.SidebarProvider"
   ```

2. **源码中硬编码的命令引用** — 以下文件需要全局替换 `"cline.` 为 `"cline-chinese.`:
   - `src/extension.ts`
   - `src/dev/commands/tasks.ts`
   - `src/hosts/vscode/VscodeWebviewProvider.ts`
   - `src/hosts/vscode/commit-message-generator.ts`
   - `src/hosts/vscode/review/VscodeCommentReviewController.ts`
   - `src/services/test/TestMode.ts`

3. **其他身份引用**:
   - `src/core/controller/ui/openWalkthrough.ts` — walkthrough 发布者改为 `HybridTalentComputing`
   - `src/hosts/vscode/hostbridge/env/getIdeRedirectUri.ts` — OAuth URI 改为 `HybridTalentComputing.cline-chinese`
   - `src/core/storage/state-migrations.ts` — `getConfiguration("cline")` 改为 `getConfiguration("cline-chinese")`

**注意**: `src/registry.ts` 中有动态前缀逻辑 `const prefix = name === "claude-dev" ? "cline" : name`，这意味着只要 package.json 的 `name` 改为 `cline-chinese`，命令注册会自动使用正确前缀。但硬编码在字符串中的 `"cline.` 引用仍需手动修改。

**验证方法**:
```bash
# 确认没有残留的旧标识符
grep -rn '"cline\.' src/ --include="*.ts" | grep -v "node_modules"
grep -rn 'saoudrizwan' src/ --include="*.ts"
grep -rn 'claude-dev' src/ package.json --include="*.ts" --include="*.json" | grep -v "node_modules"
```

### Step 4: 创建 NLS 文件

**package.nls.json**（默认中文）:
```json
{
  "cline.description": "您的 IDE 中的自主编码助手...",
  "cline.walkthrough.title": "认识 Cline，您的新编程伙伴",
  "cline.command.newTask": "新任务",
  ...
}
```

**package.json 中的对应修改**: 将所有命令标题和引导教程字符串替换为 `%key%` 占位符。

### Step 5: 设置默认语言

`src/shared/Languages.ts`:
```ts
export const DEFAULT_LANGUAGE_SETTINGS: LanguageKey = "zh-CN"
```

### Step 6: i18n 框架

**webview-ui/package.json** 添加依赖:
```json
"i18next": "^24.2.2",
"react-i18next": "^15.4.1"
```

**webview-ui/src/i18n/config.ts**: i18n 初始化，默认 `zh-CN`。

**webview-ui/src/main.tsx**: 添加 `import "./i18n/config"`。

### Step 7: 翻译文件

三个 namespace（按组件分组）：

| 文件 | 覆盖范围 | 命名空间 |
|------|----------|----------|
| `locales/*/common.json` | Welcome, Chat, 聊天子组件 | `common` |
| `locales/*/settings.json` | Settings, Providers, Account, Onboarding | `settings` |
| `locales/*/common-misc.json` | Common, MCP, Worktrees, Rules | `misc` |

**翻译键命名约定**: 使用嵌套对象，如 `chatRow.wantsToEdit`, `settings.apiKey`, `mcp.configuration.addServer`。

**坑 3**: 新版本可能新增/重命名/删除组件，翻译键需要相应更新。建议用 `diff` 对比上游版本变化。

### Step 8: 组件迁移

每个组件的迁移模式：

```tsx
// 1. 添加 import
import { useTranslation } from "react-i18next"

// 2. 在组件函数体内第一行添加 hook
export const MyComponent = memo(({ ... }: Props) => {
    const { t } = useTranslation("common")  // ← 这里！
    // ...原有逻辑
})

// 3. 替换硬编码字符串
// JSX 文本: <div>Hello</div> → <div>{t("greeting")}</div>
// JSX 属性: label="Save" → label={t("save")}  // 注意花括号！
// 模板字符串: `Step ${n}` → t("step", { n })
// 条件文本: isX ? "A" : "B" → t(isX ? "a" : "b")
```

**坑 4（最大坑）**: Agent 迁移组件时常犯的语法错误：

| 错误类型 | 错误示例 | 正确写法 |
|----------|----------|----------|
| t() 在 JSX 属性中缺少花括号 | `label=t("key")` | `label={t("key")}` |
| useTranslation 放错位置 | `memo(\nconst { t } = ...\n({ ... })` | `memo(({ ... }) => { const { t } = ... })` |
| t() 在字符串常量中误用 | `"📋 {t("key")}"` | `"📋 " + t("key")` |
| 孤立的 t 字符 | `} = hook()\nt\nconst { t }` | 删除多余的 `t` 行 |
| tconst 合并 | `tconst { t } = ...` | `const { t } = ...` |

**建议**: 迁移后立即用 `biome check` 和 `tsc --noEmit` 验证每个文件。

### Step 9: 系统提示词语言指令

`src/core/task/index.ts` 中 `preferredLanguageInstructions` 的生成逻辑：

上游默认条件是 `preferredLanguage !== DEFAULT_LANGUAGE_SETTINGS`，当默认语言改为 `zh-CN` 后，这个条件永远为 false，导致中文指令不会被添加。

**修复**: 将条件改为 `preferredLanguage !== "en"`，并添加语言名称映射：

```ts
const languageInstructionMap: Record<string, string> = {
    "zh-CN": "Simplified Chinese (简体中文)",
    "zh-TW": "Traditional Chinese (繁體中文)",
    // ...其他语言
}
const preferredLanguageInstructions =
    preferredLanguage && preferredLanguage !== "en"
        ? `# Preferred Language\n\nSpeak in ${languageInstructionMap[preferredLanguage] || preferredLanguage}.`
        : ""
```

同时移除不再使用的 `DEFAULT_LANGUAGE_SETTINGS` import（否则 lint 报错）。

### Step 10: 恢复中文文档

```bash
cp -r /tmp/backup/docs-zh/ docs-zh/
cp /tmp/backup/README.md README.md
```

### Step 11: 编译验证

```bash
npm install --legacy-peer-deps
npm run compile
```

验证清单：
- [ ] `npm run compile` 零错误
- [ ] `grep -ri "shengsuan" src/ webview-ui/` 零结果（如需移除）
- [ ] package.json 版本号正确
- [ ] package.json 身份信息正确

---

## 三、使用并行 Agent 的策略

由于工作量巨大（200+ 组件），建议使用 3 个并行 agent 分组处理：

**第一轮：翻译文件创建**
- Agent 1: Welcome + Chat 组件翻译
- Agent 2: Settings + Account + Onboarding 翻译
- Agent 3: Common + MCP + Other 翻译

**第二轮：组件迁移**
- Agent 1: Welcome + Chat 组件迁移
- Agent 2: Settings + Account + Onboarding 迁移
- Agent 3: Common + MCP + Other 迁移

**第三轮：修复编译错误**
- 单个 agent 处理所有 parse/lint 错误
- 特别关注 ChatRow.tsx（最大最复杂的文件，建议单独处理）

**坑 5**: Agent 可能遇到 API 速率限制（429），导致中途失败。解决方案：
- 检查已完成的部分，只重新启动处理未完成的部分
- 大文件（如 ChatRow.tsx）单独用 agent 处理

---

## 四、关键文件清单

### 每次同步必须修改的文件

```
package.json                                    # 身份信息
src/shared/Languages.ts                        # 默认语言
src/core/task/index.ts                         # 语言指令逻辑
webview-ui/src/i18n/config.ts                  # i18n 配置
webview-ui/src/main.tsx                        # i18n import
webview-ui/src/locales/en/*.json               # 英文翻译
webview-ui/src/locales/zh-CN/*.json            # 中文翻译
package.nls.json                               # VS Code 命令中文
```

### 每次同步需要恢复的文件

```
docs-zh/                                       # 中文文档目录
README.md                                      # 中文 README
```

---

## 五、常见问题

### Q: 上游新增了组件，翻译键不够用怎么办？

A: 读取新组件文件，提取硬编码字符串，在对应 namespace 的 JSON 文件中添加新键。

### Q: 上游重命名了组件文件怎么办？

A: 文件重命名不影响翻译（翻译键是按功能组织的，不绑定文件名）。但如果组件内容变化很大，可能需要重新迁移。

### Q: 编译报 `chalk` 找不到？

A: 运行 `npm install --legacy-peer-deps`。上游可能添加了新的构建依赖。

### Q: 怎么确认哪些组件还没迁移？

```bash
# 列出没有 useTranslation 的组件
grep -rL "useTranslation" webview-ui/src/components/ --include="*.tsx" | grep -v test | grep -v story
```

注意：shadcn/ui 原始组件（`webview-ui/src/components/ui/`）和纯包装组件不需要迁移。

---

## 六、版本更新检查清单

- [ ] 备份 `docs-zh/` 和 `README.md`
- [ ] 确认上游 tag 存在: `git tag -l | grep <版本>`
- [ ] 替换文件并提交
- [ ] 修改 package.json 身份（6 个字段）
- [ ] 修改所有扩展标识符避免冲突（`cline.` → `cline-chinese.`，详见坑 7）
- [ ] 修改源码中硬编码的命令引用（6+ 个文件）
- [ ] 修改 OAuth URI、walkthrough 发布者、configuration scope
- [ ] 推送前先处理 LFS 对象: `git lfs fetch upstream <tag> && git lfs push --all origin <branch>`（详见坑 6）
- [ ] 更新 NLS 文件（检查上游新增的 VS Code 命令）
- [ ] 确认默认语言设置
- [ ] 对比上游组件变化：新增/删除/重命名
- [ ] 更新翻译文件（新增字符串）
- [ ] 迁移新增组件
- [ ] 检查系统提示词结构变化
- [ ] 恢复中文文档
- [ ] 编译验证: `npm run compile`
- [ ] 运行时验证：加载扩展检查中文 UI
