import { isZhCN } from "../i18n/getLocaleText"
import { SystemPromptSection } from "../templates/placeholders"
import { TemplateEngine } from "../templates/TemplateEngine"
import type { PromptVariant, SystemPromptContext } from "../types"

const AUTO_FORMATTING_SECTION = `# Auto-formatting Considerations

- After using either write_to_file or replace_in_file, the user's editor may automatically format the file
- This auto-formatting may modify the file contents, for example:
  - Breaking single lines into multiple lines
  - Adjusting indentation to match project style (e.g. 2 spaces vs 4 spaces vs tabs)
  - Converting single quotes to double quotes (or vice versa based on project preferences)
  - Organizing imports (e.g. sorting, grouping by type)
  - Adding/removing trailing commas in objects and arrays
  - Enforcing consistent brace style (e.g. same-line vs new-line)
  - Standardizing semicolon usage (adding or removing based on style)
- The write_to_file and replace_in_file tool responses will include the final state of the file after any auto-formatting
- Use this final state as your reference point for any subsequent edits. This is ESPECIALLY important when crafting SEARCH blocks for replace_in_file which require the content to match what's in the file exactly.`

const AUTO_FORMATTING_SECTION_ZH_CN = `# 自动格式化注意事项

- 使用 write_to_file 或 replace_in_file 后，用户的编辑器可能会自动格式化文件
- 这种自动格式化可能会修改文件内容，例如：
  - 将单行拆分为多行
  - 调整缩进以匹配项目风格（例如 2 个空格 vs 4 个空格 vs 制表符）
  - 将单引号转换为双引号（或根据项目偏好反之亦然）
  - 组织导入（例如排序、按类型分组）
  - 在对象和数组中添加/删除尾随逗号
  - 强制执行一致的大括号风格（例如同行 vs 新行）
  - 标准化分号使用（根据风格添加或删除）
- write_to_file 和 replace_in_file 工具的响应将包含任何自动格式化后文件的最终状态
- 使用此最终状态作为后续编辑的参考点。这对于为 replace_in_file 编写 SEARCH 块尤其重要，因为 SEARCH 块需要与文件中的内容完全匹配。`

const EDITING_FILES_TEMPLATE_TEXT = `EDITING FILES

You have access to two tools for working with files: **write_to_file** and **replace_in_file**. Understanding their roles and selecting the right one for the job will help ensure efficient and accurate modifications.

# write_to_file

## Purpose

- Create a new file, or overwrite the entire contents of an existing file.

## When to Use

- Initial file creation, such as when scaffolding a new project.
- Overwriting large boilerplate files where you want to replace the entire content at once.
- When the complexity or number of changes would make replace_in_file unwieldy or error-prone.
- When you need to completely restructure a file's content or change its fundamental organization.

## Important Considerations

- Using write_to_file requires providing the file's complete final content.
- If you only need to make small changes to an existing file, consider using replace_in_file instead to avoid unnecessarily rewriting the entire file.
- While write_to_file should not be your default choice, don't hesitate to use it when the situation truly calls for it.

# replace_in_file

## Purpose

- Make targeted edits to specific parts of an existing file without overwriting the entire file.

## When to Use

- Small, localized changes like updating a few lines, function implementations, changing variable names, modifying a section of text, etc.
- Targeted improvements where only specific portions of the file's content needs to be altered.
- Especially useful for long files where much of the file will remain unchanged.

## Advantages

- More efficient for minor edits, since you don't need to supply the entire file content.
- Reduces the chance of errors that can occur when overwriting large files.

# Choosing the Appropriate Tool

- **Default to replace_in_file** for most changes. It's the safer, more precise option that minimizes potential issues.
- **Use write_to_file** when:
  - Creating new files
  - The changes are so extensive that using replace_in_file would be more complex or risky
  - You need to completely reorganize or restructure a file
  - The file is relatively small and the changes affect most of its content
  - You're generating boilerplate or template files

{{AUTO_FORMATTING_SECTION}}

# Workflow Tips

1. Before editing, assess the scope of your changes and decide which tool to use.
2. For targeted edits, apply replace_in_file with carefully crafted SEARCH/REPLACE blocks. If you need multiple changes, you can stack multiple SEARCH/REPLACE blocks within a single replace_in_file call.
3. IMPORTANT: When you determine that you need to make several changes to the same file, prefer to use a single replace_in_file call with multiple SEARCH/REPLACE blocks. DO NOT prefer to make multiple successive replace_in_file calls for the same file. For example, if you were to add a component to a file, you would use a single replace_in_file call with a SEARCH/REPLACE block to add the import statement and another SEARCH/REPLACE block to add the component usage, rather than making one replace_in_file call for the import statement and then another separate replace_in_file call for the component usage.
4. For major overhauls or initial file creation, rely on write_to_file.
5. Once the file has been edited with either write_to_file or replace_in_file, the system will provide you with the final state of the modified file. Use this updated content as the reference point for any subsequent SEARCH/REPLACE operations, since it reflects any auto-formatting or user-applied changes.
By thoughtfully selecting between write_to_file and replace_in_file, you can make your file editing process smoother, safer, and more efficient.`

const EDITING_FILES_TEMPLATE_TEXT_ZH_CN = `EDITING FILES

你可以使用两个工具来处理文件：**write_to_file** 和 **replace_in_file**。理解它们的作用并为工作选择合适的工具将有助于确保高效和准确的修改。

# write_to_file

## 目的

- 创建新文件，或覆盖现有文件的全部内容。

## 何时使用

- 初始文件创建，例如搭建新项目时。
- 覆盖大型样板文件，你想一次性替换全部内容。
- 当更改的复杂性或数量使得 replace_in_file 变得笨拙或容易出错时。
- 当你需要完全重构文件内容或更改其基本组织结构时。

## 重要注意事项

- 使用 write_to_file 需要提供文件的完整最终内容。
- 如果你只需要对现有文件进行小的更改，考虑改用 replace_in_file，以避免不必要地重写整个文件。
- 虽然 write_to_file 不应该是你的默认选择，但当情况确实需要时，不要犹豫使用它。

# replace_in_file

## 目的

- 对现有文件的特定部分进行针对性编辑，而不覆盖整个文件。

## 何时使用

- 小的、局部的更改，如更新几行代码、函数实现、更改变量名、修改一段文本等。
- 针对性改进，只需更改文件内容的特定部分。
- 对于长文件尤其有用，其中大部分文件内容将保持不变。

## 优势

- 对于小型编辑更高效，因为你不需要提供整个文件内容。
- 减少覆盖大型文件时可能出现的错误。

# 选择合适的工具

- **大多数更改默认使用 replace_in_file**。它是更安全、更精确的选项，可最大程度地减少潜在问题。
- **在以下情况下使用 write_to_file**：
  - 创建新文件
  - 更改如此广泛，使用 replace_in_file 会更复杂或更有风险
  - 你需要完全重新组织或重构文件
  - 文件相对较小，更改影响了大部分内容
  - 你正在生成样板文件或模板文件

{{AUTO_FORMATTING_SECTION}}

# 工作流技巧

1. 编辑之前，评估更改的范围并决定使用哪个工具。
2. 对于针对性编辑，使用精心编写的 SEARCH/REPLACE 块应用 replace_in_file。如果需要多处更改，你可以在单个 replace_in_file 调用中堆叠多个 SEARCH/REPLACE 块。
3. 重要：当你确定需要对同一文件进行多处更改时，优先使用包含多个 SEARCH/REPLACE 块的单个 replace_in_file 调用。不要对同一文件进行多次连续的 replace_in_file 调用。例如，如果你要向文件添加组件，你将使用包含一个 SEARCH/REPLACE 块来添加导入语句和另一个 SEARCH/REPLACE 块来添加组件使用的单个 replace_in_file 调用，而不是先进行一个 replace_in_file 调用添加导入语句，然后再进行另一个单独的 replace_in_file 调用添加组件使用。
4. 对于大规模重构或初始文件创建，使用 write_to_file。
5. 使用 write_to_file 或 replace_in_file 编辑文件后，系统将为你提供修改文件的最终状态。使用此更新内容作为后续 SEARCH/REPLACE 操作的参考点，因为它反映了任何自动格式化或用户应用的更改。
通过在 write_to_file 和 replace_in_file 之间做出明智的选择，你可以使文件编辑过程更顺畅、更安全、更高效。`

export async function getEditingFilesSection(variant: PromptVariant, context: SystemPromptContext): Promise<string> {
	const isZh = isZhCN(context.locale)
	const template =
		variant.componentOverrides?.[SystemPromptSection.EDITING_FILES]?.template ||
		(isZh ? EDITING_FILES_TEMPLATE_TEXT_ZH_CN : EDITING_FILES_TEMPLATE_TEXT)

	// Skip auto-formatting section for CLI since there's no IDE to auto-format files
	const autoFormattingSection = context.isCliEnvironment ? "" : isZh ? AUTO_FORMATTING_SECTION_ZH_CN : AUTO_FORMATTING_SECTION

	return new TemplateEngine().resolve(template, context, {
		AUTO_FORMATTING_SECTION: autoFormattingSection,
	})
}
