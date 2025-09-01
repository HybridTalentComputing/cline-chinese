import { UserCreditsData } from "@shared/proto/cline/account"
import type { EmptyRequest } from "@shared/proto/cline/common"
import type { Controller } from "../index"

export async function shengSuanYunUserData(controller: Controller, _request: EmptyRequest): Promise<UserCreditsData> {
	try {
		if (!controller.accountServiceSSY) {
			throw new Error("Account service not available")
		}
		return await controller.accountServiceSSY.fetchUserDataRPC()
	} catch (error) {
		console.error(`Failed to fetch user credits data: ${error}`)
		throw error
	}
}
