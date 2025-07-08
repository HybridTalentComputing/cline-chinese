import * as vscode from "vscode"
import { EmptyRequest, String } from "../../../shared/proto/common"
import { Controller } from ".."

export async function shengSuanYunLoginClicked(controller: Controller, _: EmptyRequest): Promise<String> {
	const uriScheme = vscode.env.uriScheme
	const id = "cline-chinese"
	const authUrl = vscode.Uri.parse(
		`https://router.shengsuanyun.com/auth?from=${id}&callback_url=${encodeURIComponent(`${uriScheme || "vscode"}://HybridTalentComputing.${id}/ssy`)}`,
	)
	await vscode.env.openExternal(authUrl)
	return String.create({
		value: authUrl.toString(),
	})
}
