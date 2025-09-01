import { String, StringRequest } from "@shared/proto/cline/common"
import * as vscode from "vscode"

/**
 * Creates a file URI from a path
 */
export async function file(request: StringRequest): Promise<String> {
	const uri = vscode.Uri.file(request.value || "")
	return String.create({
		value: uri.toString(),
	})
}
