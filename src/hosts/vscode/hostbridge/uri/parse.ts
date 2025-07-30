import * as vscode from "vscode"
import { StringRequest, String } from "@shared/proto/cline/common"

/**
 * Parses a URI string
 */
export async function parse(request: StringRequest): Promise<String> {
	const uri = vscode.Uri.parse(request.value || "")
	return String.create({
		value: uri.toString(),
	})
}
