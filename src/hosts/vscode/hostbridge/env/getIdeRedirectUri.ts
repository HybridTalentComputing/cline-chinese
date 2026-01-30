import { EmptyRequest, String } from "@shared/proto/cline/common"
import * as vscode from "vscode"

export async function getIdeRedirectUri(_: EmptyRequest): Promise<String> {
	const uriScheme = vscode.env.uriScheme || "vscode"
	// Use the actual extension ID for cline-chinese
	// This works across all VS Code-based editors (Cursor, Windsurf, Trae, etc.)
	const extensionId = "HybridTalentComputing.cline-chinese"
	const url = `${uriScheme}://${extensionId}`
	return { value: url }
}
