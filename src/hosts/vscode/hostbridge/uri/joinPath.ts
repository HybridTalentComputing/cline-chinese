import * as vscode from "vscode"
import { StringRequest, String } from "@shared/proto/cline/common"

/**
 * Joins paths to create a new URI
 */
export async function joinPath(request: StringRequest): Promise<String> {
	// Parse the request to get base URI and path segments
	// For simplicity, assuming the request contains a JSON string with base and paths
	try {
		const { base, paths } = JSON.parse(request.value || "{}")
		const baseUri = vscode.Uri.parse(base)
		const joinedUri = vscode.Uri.joinPath(baseUri, ...paths)
		return String.create({
			value: joinedUri.toString(),
		})
	} catch (error) {
		throw new Error(`Invalid joinPath request: ${error}`)
	}
}
