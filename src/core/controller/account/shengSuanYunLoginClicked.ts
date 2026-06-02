import { Empty, EmptyRequest } from "@shared/proto/cline/common"
import { HostProvider } from "@/hosts/host-provider"
import { openExternal } from "@/utils/env"
import { Controller } from ".."

export async function shengSuanYunLoginClicked(_: Controller, __: EmptyRequest): Promise<Empty> {
	const callbackUrl = await HostProvider.get().getCallbackUrl("/ssy")
	const authUrl = new URL("https://router.shengsuanyun.com/auth")
	authUrl.searchParams.set("from", "cline-chinese")
	authUrl.searchParams.set("callback_url", callbackUrl)

	await openExternal(authUrl.toString())

	return {}
}
