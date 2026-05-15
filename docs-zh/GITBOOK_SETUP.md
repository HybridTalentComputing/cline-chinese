# GitBook 设置完整指南

## 🎯 快速开始

### 方式 1：自动迁移脚本（推荐）

```bash
cd docs-zh
chmod +x migrate-to-gitbook.sh
./migrate-to-gitbook.sh
```

这个脚本会自动：
- ✅ 重命名所有 `.mdx` 文件为 `.md`
- ✅ 创建 `SUMMARY.md`（GitBook 的导航结构）
- ✅ 创建 `README.md`（首页）
- ✅ 更新 `.gitignore`

### 方式 2：手动迁移

如果你想手动控制每一步，请按照以下步骤操作。

## 📚 详细步骤

### 步骤 1：准备 GitBook 空间

1. 访问 https://app.gitbook.com
2. 点击 "Create new space"
3. 选择：
   - **Space name**: `Cline 中文文档`
   - **Space URL**: `cline-zh-docs`（或你想要的）
   - **Visibility**: Public（公开）或 Private（私有）

### 步骤 2：连接 GitHub

1. 在 GitBook 空间中，点击 **Settings** (⚙️)
2. 左侧菜单选择 **Integrations** → **GitHub**
3. 点击 **Connect GitHub account**
4. 授权 GitBook 访问你的 GitHub
5. 选择仓库：`HybridTalentComputing/cline-chinese`
6. 配置：
   - **Content root**: `docs-zh`
   - **Homepage**: `README.md`
   - **Summary**: `SUMMARY.md`
   - **Default branch**: `main`
7. 点击 **Install** 或 **Update**

### 步骤 3：配置 GitBook 设置

在 **Settings** → **General** 中：

```yaml
Space name: Cline 中文文档
Description: AI 编程助手 Cline 的完整中文文档
Language: 中文 (简体)
Theme: 选择你喜欢的主题
```

### 步骤 4：配置导航

GitBook 会自动从 `SUMMARY.md` 生成导航，但你也可以自定义：

1. 进入 **Settings** → **Navigation**
2. 选择 **Auto-generated from files**
3. 确保 **Structure file** 设置为 `SUMMARY.md`

### 步骤 5：测试和预览

1. 在 GitBook 空间中，查看 **Content** 页面
2. 检查所有章节是否正确显示
3. 点击 **Preview** 按钮预览效果

### 步骤 6：自定义样式（可选）

如果你想保留 Mintlify 的样式：

1. 在 `docs-zh/` 中创建 `.gitbook/assets/` 文件夹
2. 将 `styles.css` 移动到这个文件夹
3. 在 GitBook 的 **Settings** → **General** 中：
   - 找到 **Custom Styles** 或 **Custom CSS**
   - 添加你的样式文件

## 🔧 高级配置

### 配置搜索

GitBook 会自动索引所有内容，但你可以在 **Settings** → **Search** 中优化：
- **Search scope**: 选择要搜索的范围
- **Excluded files**: 排除不需要搜索的文件

### 配置域名（可选）

如果你想使用自定义域名：

1. 在 **Settings** → **Domains**
2. 点击 **Add domain**
3. 输入你的域名（如 `docs.cline-zh.com`）
4. 按照 GitBook 的指示配置 DNS

### 配置团队和权限

在 **Settings** → **People** 中：
- 添加协作者
- 设置角色（Owner, Writer, Editor, Reader）
- 管理访问权限

## 📝 从 Mintlify 迁移的注意事项

### 1. MDX 文件处理

GitBook 原生支持 MDX，但建议：

```bash
# 保留一些需要交互性的文件为 .mdx
# 大部分文档转换为 .md 即可
```

### 2. 图片路径

Mintlify 和 GitBook 的图片路径可能不同：

```markdown
<!-- Mintlify -->
![图片](/assets/image.png)

<!-- GitBook -->
![图片](.gitbook/assets/image.png)
```

建议使用相对路径：

```markdown
![图片](assets/image.png)
```

### 3. 组件和交互性

如果 Mintlify 文档使用了特殊的 React 组件：

```jsx
// Mintlify 特有
<Callout type="info">
  这是一条提示
</Callout>
```

在 GitBook 中转换为标准 Markdown：

```markdown
> **💡 提示**
>
> 这是一条提示
```

### 4. 代码块高亮

两者都支持，但语法略有不同：

````markdown
```javascript
// 两者都支持
````
````

## 🚀 发布和维护

### 自动部署

连接 GitHub 后，每次 `push` 到 `main` 分支，GitBook 会自动：
1. 检测文件变化
2. 重新构建文档
3. 发布更新

### 手动触发部署

1. 在 GitBook 空间中
2. 点击 **Content** → **Sync now**
3. 等待构建完成

### 版本管理

GitBook 支持多版本文档：

1. **Settings** → **Versions**
2. 点击 **Add version**
3. 选择 Git 分支或标签
4. 配置版本别名（如 `stable`, `latest`）

## 📊 监控和分析

GitBook 提供：

- **访问统计**: 查看最受欢迎的页面
- **搜索日志**: 了解用户在搜索什么
- **反馈收集**: 添加页面反馈功能

在 **Analytics** 页面查看所有数据。

## ❓ 常见问题

### Q: 迁移后链接失效怎么办？

A: GitBook 会自动处理相对链接。如果使用绝对路径：
```markdown
<!-- 错误 -->
[链接](/getting-started/installing-cline)

<!-- 正确 -->
[链接](getting-started/installing-cline.md)
```

### Q: 图片不显示？

A: 检查图片路径：
- 使用相对路径而非绝对路径
- 确保图片文件在 `assets/` 或 `.gitbook/assets/` 目录

### Q: MDX 组件不工作？

A: GitBook 支持 MDX，但需要：
1. 确保组件兼容
2. 在 `SUMMARY.md` 中文件扩展名改为 `.mdx`
3. 检查 GitBook 的 MDX 设置

### Q: 搜索不工作？

A: GitBook 需要时间索引：
1. 等待 5-10 分钟
2. 在 **Settings** → **Search** 点击 **Rebuild search index**
3. 如果还不行，联系 GitBook 支持

## 🎉 完成！

迁移完成后，你的 GitBook 文档将在：
`https://cline-zh-docs.gitbook.io`（或你配置的自定义域名）

## 📞 获取帮助

- GitBook 文档: https://docs.gitbook.com
- GitBook 社区: https://community.gitbook.com
- GitBook 支持: support@gitbook.com
