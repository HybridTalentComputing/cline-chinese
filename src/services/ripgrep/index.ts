import * as vscode from "vscode"
import * as childProcess from "child_process"
import * as path from "path"
import * as fs from "fs"
import * as readline from "readline"

/*
此文件提供使用 ripgrep 对文件执行正则表达式搜索的功能。
灵感来源：https://github.com/DiscreteTom/vscode-ripgrep-utils

主要组件：
1. getBinPath：在 VSCode 安装目录中定位 ripgrep 二进制文件。
2. execRipgrep：执行 ripgrep 命令并返回输出。
3. regexSearchFiles：执行正则表达式搜索文件的主要函数。
   - 参数：
     * cwd：当前工作目录（用于相对路径计算）
     * directoryPath：要搜索的目录
     * regex：要搜索的正则表达式（Rust 正则表达式语法）
     * filePattern：可选的文件匹配模式（默认：'*'）
   - 返回：包含搜索结果的格式化字符串，带有上下文

搜索结果包括：
- 相对文件路径
- 每个匹配前后 2 行的上下文
- 使用管道字符格式化的匹配项，便于阅读

使用示例：
const results = await regexSearchFiles('/path/to/cwd', '/path/to/search', 'TODO:', '*.ts');

rel/path/to/app.ts
│----
│function processData(data: any) {
│  // 一些处理逻辑
│  // TODO: 实现错误处理
│  return processedData;
│}
│----

rel/path/to/helper.ts
│----
│  let result = 0;
│  for (let i = 0; i < input; i++) {
│    // TODO: 优化此函数的性能
│    result += Math.pow(i, 2);
│  }
│----
*/

const isWindows = /^win/.test(process.platform)
const binName = isWindows ? "rg.exe" : "rg"

interface SearchResult {
	file: string
	line: number
	column: number
	match: string
	beforeContext: string[]
	afterContext: string[]
}

const MAX_RESULTS = 300

async function getBinPath(vscodeAppRoot: string): Promise<string | undefined> {
	const checkPath = async (pkgFolder: string) => {
		const fullPath = path.join(vscodeAppRoot, pkgFolder, binName)
		return (await pathExists(fullPath)) ? fullPath : undefined
	}

	return (
		(await checkPath("node_modules/@vscode/ripgrep/bin/")) ||
		(await checkPath("node_modules/vscode-ripgrep/bin")) ||
		(await checkPath("node_modules.asar.unpacked/vscode-ripgrep/bin/")) ||
		(await checkPath("node_modules.asar.unpacked/@vscode/ripgrep/bin/"))
	)
}

async function pathExists(path: string): Promise<boolean> {
	return new Promise((resolve) => {
		fs.access(path, (err) => {
			resolve(err === null)
		})
	})
}

async function execRipgrep(bin: string, args: string[]): Promise<string> {
	return new Promise((resolve, reject) => {
		const rgProcess = childProcess.spawn(bin, args)
		// cross-platform alternative to head, which is ripgrep author's recommendation for limiting output.
		const rl = readline.createInterface({
			input: rgProcess.stdout,
			crlfDelay: Infinity, // treat \r\n as a single line break even if it's split across chunks. This ensures consistent behavior across different operating systems.
		})

		let output = ""
		let lineCount = 0
		const maxLines = MAX_RESULTS * 5 // limiting ripgrep output with max lines since there's no other way to limit results. it's okay that we're outputting as json, since we're parsing it line by line and ignore anything that's not part of a match. This assumes each result is at most 5 lines.

		rl.on("line", (line) => {
			if (lineCount < maxLines) {
				output += line + "\n"
				lineCount++
			} else {
				rl.close()
				rgProcess.kill()
			}
		})

		let errorOutput = ""
		rgProcess.stderr.on("data", (data) => {
			errorOutput += data.toString()
		})
		rl.on("close", () => {
			if (errorOutput) {
				reject(new Error(`ripgrep process error: ${errorOutput}`))
			} else {
				resolve(output)
			}
		})
		rgProcess.on("error", (error) => {
			reject(new Error(`ripgrep process error: ${error.message}`))
		})
	})
}

export async function regexSearchFiles(cwd: string, directoryPath: string, regex: string, filePattern?: string): Promise<string> {
	const vscodeAppRoot = vscode.env.appRoot
	const rgPath = await getBinPath(vscodeAppRoot)

	if (!rgPath) {
		throw new Error("无法找到 ripgrep 二进制文件")
	}

	const args = ["--json", "-e", regex, "--glob", filePattern || "*", "--context", "1", directoryPath]

	let output: string
	try {
		output = await execRipgrep(rgPath, args)
	} catch {
		return "未找到结果"
	}
	const results: SearchResult[] = []
	let currentResult: Partial<SearchResult> | null = null

	output.split("\n").forEach((line) => {
		if (line) {
			try {
				const parsed = JSON.parse(line)
				if (parsed.type === "match") {
					if (currentResult) {
						results.push(currentResult as SearchResult)
					}
					currentResult = {
						file: parsed.data.path.text,
						line: parsed.data.line_number,
						column: parsed.data.submatches[0].start,
						match: parsed.data.lines.text,
						beforeContext: [],
						afterContext: [],
					}
				} else if (parsed.type === "context" && currentResult) {
					if (parsed.data.line_number < currentResult.line!) {
						currentResult.beforeContext!.push(parsed.data.lines.text)
					} else {
						currentResult.afterContext!.push(parsed.data.lines.text)
					}
				}
			} catch (error) {
				console.error("Error parsing ripgrep output:", error)
			}
		}
	})

	if (currentResult) {
		results.push(currentResult as SearchResult)
	}

	return formatResults(results, cwd)
}

function formatResults(results: SearchResult[], cwd: string): string {
	const groupedResults: { [key: string]: SearchResult[] } = {}

	let output = ""
	if (results.length >= MAX_RESULTS) {
		output += `Showing first ${MAX_RESULTS} of ${MAX_RESULTS}+ results. Use a more specific search if necessary.\n\n`
	} else {
		output += `Found ${results.length === 1 ? "1 result" : `${results.length.toLocaleString()} results`}.\n\n`
	}

	// Group results by file name
	results.slice(0, MAX_RESULTS).forEach((result) => {
		const relativeFilePath = path.relative(cwd, result.file)
		if (!groupedResults[relativeFilePath]) {
			groupedResults[relativeFilePath] = []
		}
		groupedResults[relativeFilePath].push(result)
	})

	for (const [filePath, fileResults] of Object.entries(groupedResults)) {
		output += `${filePath.toPosix()}\n│----\n`

		fileResults.forEach((result, index) => {
			const allLines = [...result.beforeContext, result.match, ...result.afterContext]
			allLines.forEach((line) => {
				output += `│${line?.trimEnd() ?? ""}\n`
			})

			if (index < fileResults.length - 1) {
				output += "│----\n"
			}
		})

		output += "│----\n\n"
	}

	return output.trim()
}
