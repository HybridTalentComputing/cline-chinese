import * as vscode from "vscode"
import { EmptyRequest, String } from "../../../shared/proto/common"
import { Controller } from ".."

export async function shengSuanYunLoginClicked(controller: Controller, _: EmptyRequest): Promise<String> {
	const uriScheme = vscode.env.uriScheme
	const id = "cline-shengsuan"
	const channel = "CH_R39YE8W1"
	const author = "shengsuan-cloud"
	const authUrl = vscode.Uri.parse(
		`https://router.shengsuanyun.com/auth?from=${channel}&callback_url=${encodeURIComponent(`${uriScheme || "vscode"}://${author}.${id}/ssy`)}`,
	)
	await vscode.env.openExternal(authUrl)
	return String.create({
		value: authUrl.toString(),
	})
}
