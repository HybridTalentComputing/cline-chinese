import { EmptyRequest, String } from "@shared/proto/cline/common"
import vscode from "vscode"
import { openExternal } from "@/utils/env"
import { Controller } from ".."

export async function shengSuanYunLoginClicked(_controller: Controller, _: EmptyRequest): Promise<String> {
	const uriScheme = vscode.env.uriScheme
	const id = "cline-shengsuan"
	const channel = "CH_R39YE8W1"
	const author = "shengsuan-cloud"
	const authUrl = new URL(
		`https://router.shengsuanyun.com/auth?from=${channel}&callback_url=${encodeURIComponent(`${uriScheme || "vscode"}://${author}.${id}/ssy`)}`,
	)
	const authUrlString = authUrl.toString()
	await openExternal(authUrlString)
	return String.create({ value: authUrlString })
}
