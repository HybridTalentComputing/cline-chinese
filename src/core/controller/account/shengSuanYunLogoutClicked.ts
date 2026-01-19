import { Empty, EmptyRequest } from "@shared/proto/cline/common"
import type { Controller } from "../index"

export async function shengSuanYunLogoutClicked(controller: Controller, _request: EmptyRequest): Promise<Empty> {
	await controller.handleSignOut()
	return Empty.create({})
}
