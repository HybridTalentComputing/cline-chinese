import type { Controller } from "../index"
import type { EmptyRequest } from "@shared/proto/cline/common"
import { UserCreditsData } from "@shared/proto/cline/account"

export async function shengSuanYunUserData(controller: Controller, request: EmptyRequest): Promise<UserCreditsData> {
	try {
		if (!controller.accountServiceSSY) {
			throw new Error("Account service not available")
		}
		const data = await controller.accountServiceSSY.fetchUserDataRPC()
		return data
	} catch (error) {
		console.error(`Failed to fetch user credits data: ${error}`)
		throw error
	}
}
