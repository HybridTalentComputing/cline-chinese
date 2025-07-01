import type { Controller } from "../index"
import type { EmptyRequest } from "@shared/proto/common"
import { UserCreditsData } from "@shared/proto/account"

export async function shengSuanYunUserData(controller: Controller, request: EmptyRequest): Promise<UserCreditsData> {
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
