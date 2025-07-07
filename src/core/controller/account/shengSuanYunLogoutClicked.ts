import { Empty } from "../../../shared/proto/common"
import type { EmptyRequest } from "../../../shared/proto/common"
import type { Controller } from "../index"

export async function shengSuanYunLogoutClicked(controller: Controller, _request: EmptyRequest): Promise<Empty> {
	await controller.handleSignOutSSY()
	return Empty.create({})
}
