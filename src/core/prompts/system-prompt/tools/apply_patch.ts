import { ModelFamily } from "@/shared/prompts"
import { ClineDefaultTool } from "@/shared/tools"
import { isGPT5ModelFamily, isGptOssModelFamily } from "@/utils/model-utils"
import { isZhCN } from "../i18n/getLocaleText"
import type { ClineToolSpec } from "../spec"
import type { SystemPromptContext } from "../types"
import { TASK_PROGRESS_PARAMETER } from "../types"

// {
//     "name": "apply_patch",
//     "description": APPLY_PATCH_TOOL_DESC,
//     "parameters": {
//         "type": "object",
//         "properties": {
//             "input": {
//                 "type": "string",
//                 "description": " The apply_patch command that you wish to execute.",
//             }
//         },
//         "required": ["input"],
//     },
// }

const APPLY_PATCH_TOOL_DESC_EN = `This is a custom utility that makes it more convenient to add, remove, move, or edit code in a single file. \`apply_patch\` effectively allows you to execute a diff/patch against a file, but the format of the diff specification is unique to this task, so pay careful attention to these instructions. To use the \`apply_patch\` command, you should pass a message of the following structure as "input":

%%bash
apply_patch <<"EOF"
*** Begin Patch
[YOUR_PATCH]
*** End Patch
EOF

Where [YOUR_PATCH] is the actual content of your patch, specified in the following V4A diff format.

*** [ACTION] File: [path/to/file] -> ACTION can be one of Add, Update, or Delete.

In a Add File section, every line of the new file (including blank/empty lines) MUST start with a \`+\` prefix. Do not include any unprefixed lines inside an Add section
In a Update/Delete section, repeat the following for each snippet of code that needs to be changed:
[context_before] -> See below for further instructions on context.
- [old_code] -> Precede the old code with a minus sign.
+ [new_code] -> Precede the new, replacement code with a plus sign.
[context_after] -> See below for further instructions on context.

For instructions on [context_before] and [context_after]:
- By default, show 3 lines of code immediately above and 3 lines immediately below each change. If a change is within 3 lines of a previous change, do NOT duplicate the first change’s [context_after] lines in the second change’s [context_before] lines.
- If 3 lines of context is insufficient to uniquely identify the snippet of code within the file, use the @@ operator to indicate the class or function to which the snippet belongs. For instance, we might have:
@@ class BaseClass
[3 lines of pre-context]
- [old_code]
+ [new_code]
[3 lines of post-context]

- If a code block is repeated so many times in a class or function such that even a single @@ statement and 3 lines of context cannot uniquely identify the snippet of code, you can use multiple \`@@\` statements to jump to the right context. For instance:

@@ class BaseClass
@@ 	def method():
[3 lines of pre-context]
- [old_code]
+ [new_code]
[3 lines of post-context]

Note, then, that we do not use line numbers in this diff format, as the context is enough to uniquely identify code. An example of a message that you might pass as "input" to this function, in order to apply a patch, is shown below.

%%bash
apply_patch <<"EOF"
*** Begin Patch
*** Update File: pygorithm/searching/binary_search.py
@@ class BaseClass
@@     def search():
-          pass
+          raise NotImplementedError()

@@ class Subclass
@@     def search():
-          pass
+          raise NotImplementedError()

*** End Patch
EOF`

const APPLY_PATCH_TOOL_DESC_ZH_CN = `这是一个自定义实用工具，使添加、删除、移动或编辑单个文件中的代码更加方便。\`apply_patch\` 实际上允许您对文件执行 diff/patch 操作，但 diff 规范的格式对于此任务是独特的，因此请仔细注意这些说明。要使用\`apply_patch\`命令，您应该传递以下结构作为 "input" 的消息：

%%bash
apply_patch <<"EOF"
*** Begin Patch
[YOUR_PATCH]
*** End Patch
EOF

其中 [YOUR_PATCH] 是您的补丁的实际内容，按照以下 V4A diff 格式指定。

*** [ACTION] File: [path/to/file] -> ACTION 可以是 Add、Update 或 Delete 之一。

在 Add File 部分中，新文件的每一行（包括空白行）都必须以\`+\`前缀开头。不要在 Add 部分中包含任何无前缀的行。
在 Update/Delete 部分中，对于需要更改的每个代码片段，重复以下内容：
[context_before] -> 有关上下文的进一步说明，请参见下文。
- [old_code] -> 在旧代码前面加一个减号。
+ [new_code] -> 在新的替换代码前面加一个加号。
[context_after] -> 有关上下文的进一步说明，请参见下文。

有关 [context_before] 和 [context_after] 的说明：
- 默认情况下，在每个更改的上方和下方立即显示 3 行代码。如果某个更改距离前一个更改在 3 行以内，则不要在第二个更改的 [context_before] 行中复制第一个更改的 [context_after] 行。
- 如果 3 行上下文不足以唯一标识文件中的代码片段，请使用 @@ 运算符指示该片段所属的类或函数。例如，我们可能有：
@@ class BaseClass
[3 lines of pre-context]
- [old_code]
+ [new_code]
[3 lines of post-context]

- 如果代码块在类或函数中重复了这么多次，以至于单个 @@ 语句和 3 行上下文都不能唯一标识代码片段，您可以使用多个\`@@\`语句跳转到正确的上下文。例如：

@@ class BaseClass
@@ 	def method():
[3 lines of pre-context]
- [old_code]
+ [new_code]
[3 lines of post-context]

请注意，我们在此 diff 格式中不使用行号，因为上下文足以唯一标识代码。下面显示了一个消息示例，您可以将该消息作为 "input" 传递给此函数以应用补丁。

%%bash
apply_patch <<"EOF"
*** Begin Patch
*** Update File: pygorithm/searching/binary_search.py
@@ class BaseClass
@@     def search():
-          pass
+          raise NotImplementedError()

@@ class Subclass
@@     def search():
-          pass
+          raise NotImplementedError()

*** End Patch
EOF`

const INSTRUCTION_INPUT_EN = "The apply_patch command that you wish to execute."
const INSTRUCTION_INPUT_ZH_CN = "您希望执行的 apply_patch 命令。"

const NATIVE_GPT_5: ClineToolSpec = {
	variant: ModelFamily.NATIVE_GPT_5,
	id: ClineDefaultTool.APPLY_PATCH,
	name: "apply_patch",
	description: (context: SystemPromptContext) =>
		isZhCN(context.locale) ? APPLY_PATCH_TOOL_DESC_ZH_CN : APPLY_PATCH_TOOL_DESC_EN,
	contextRequirements: (context) =>
		isGPT5ModelFamily(context.providerInfo.model.id) || isGptOssModelFamily(context.providerInfo.model.id),
	parameters: [
		{
			name: "input",
			required: true,
			instruction: (context: SystemPromptContext) =>
				isZhCN(context.locale) ? INSTRUCTION_INPUT_ZH_CN : INSTRUCTION_INPUT_EN,
		},
		TASK_PROGRESS_PARAMETER,
	],
}

const GPT_5: ClineToolSpec = {
	...NATIVE_GPT_5,
	variant: ModelFamily.GPT_5,
}
export const apply_patch_variants = [NATIVE_GPT_5, GPT_5]
