import osModule from "node:os"
import { getShell } from "@utils/shell"
import osName from "os-name"
import { getWorkspacePaths } from "@/hosts/vscode/hostbridge/workspace/getWorkspacePaths"
import { SystemPromptSection } from "../templates/placeholders"
import { TemplateEngine } from "../templates/TemplateEngine"
import type { PromptVariant, SystemPromptContext } from "../types"
import { getPromptTranslation } from "../../i18n"

export async function getSystemEnv(context: SystemPromptContext, isTesting = false) {
	const currentWorkDir = context.cwd || process.cwd()
	const workspaces = (await getWorkspacePaths({}))?.paths || [currentWorkDir]
	return isTesting
		? {
				os: "macOS",
				ide: "TestIde",
				shell: "/bin/zsh",
				homeDir: "/Users/tester",
				workingDir: "/Users/tester/dev/project",
				// Multi-root workspace example: ["/Users/tester/dev/project", "/Users/tester/dev/foo", "/Users/tester/bar"],
				workspaces: ["/Users/tester/dev/project"],
			}
		: {
				os: osName(),
				ide: context.ide,
				shell: getShell(),
				homeDir: osModule.homedir(),
				workingDir: currentWorkDir,
				workspaces: workspaces,
			}
}

export async function getSystemInfo(variant: PromptVariant, context: SystemPromptContext): Promise<string> {
	const t = getPromptTranslation(context)
	const testMode = !!process?.env?.CI || !!process?.env?.IS_TEST || context.isTesting || false
	const info = await getSystemEnv(context, testMode)

	// Check if multi-root is enabled and we have workspace roots
	const isMultiRoot = context.isMultiRootEnabled && context.workspaceRoots && context.workspaceRoots.length > 1

	let WORKSPACE_TITLE: string
	let workingDirInfo: string

	if (isMultiRoot && context.workspaceRoots) {
		// Multi-root workspace with feature flag enabled
		WORKSPACE_TITLE = t.systemInfo.workspaceRoots
		const rootsInfo = context.workspaceRoots
			.map((root) => {
				const vcsInfo = root.vcs ? ` (${root.vcs})` : ""
				return `\n  - ${root.name}: ${root.path}${vcsInfo}`
			})
			.join("")
		workingDirInfo = rootsInfo + `\n\n${t.systemInfo.primaryWorkingDirectory}: ${context.cwd}`
	} else {
		// Single workspace
		WORKSPACE_TITLE = t.systemInfo.currentWorkingDirectory
		workingDirInfo = info.workingDir
	}

	const template = variant.componentOverrides?.[SystemPromptSection.SYSTEM_INFO]?.template || t.systemInfo.template

	return new TemplateEngine().resolve(template, context, {
		os: info.os,
		ide: info.ide,
		shell: info.shell,
		homeDir: info.homeDir,
		WORKSPACE_TITLE,
		workingDir: workingDirInfo,
	})
}
