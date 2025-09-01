import { String, StringRequest } from "@shared/proto/cline/common"
import * as vscode from "vscode"

/**
 * Parses a URI string
 */
export async function parse(request: StringRequest): Promise<String> {
	const uri = vscode.Uri.parse(request.value || "")
	return String.create({
		value: uri.toString(),
	})
}
