import { EmptyRequest, String } from "@shared/proto/cline/common"
import { HostProvider } from "@/hosts/host-provider"
import { openExternal } from "@/utils/env"
import { Controller } from ".."

export async function shengSuanYunLoginClicked(controller: Controller, _: EmptyRequest): Promise<String> {
	const callbackHost = await HostProvider.get().getCallbackUrl()
	const callbackUrl = `${callbackHost}/ssy`
	const id = "cline-chinese"
	const authUrl = new URL(`https://router.shengsuanyun.com/auth?from=${id}&callback_url=${callbackUrl}`)
	const authUrlString = authUrl.toString()
	await openExternal(authUrlString)
	return String.create({ value: authUrlString })
}
