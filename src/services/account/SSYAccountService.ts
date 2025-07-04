import axios, { AxiosRequestConfig } from "axios"
import { UserCreditsData } from "@shared/proto/account"

export class SSYAccountService {
	private readonly baseUrl = "https://api.shengsuanyun.com"
	private getSSYApiKey: () => Promise<string | undefined>

	constructor(getSSYApiKey: () => Promise<string | undefined>) {
		this.getSSYApiKey = getSSYApiKey
	}
	private async authenticatedRequest<T>(endpoint: string, config: AxiosRequestConfig = {}): Promise<T> {
		const ssyApiKey = await this.getSSYApiKey()
		if (!ssyApiKey) {
			throw new Error("未找到胜算云 API key ")
		}
		const reqConfig: AxiosRequestConfig = {
			...config,
			headers: {
				"x-token": ssyApiKey,
				"Content-Type": "application/json",
				...config.headers,
			},
		}
		const response: any = await axios.get(`${this.baseUrl}${endpoint}`, reqConfig)
		if (!response.data || !response.data.data) {
			throw new Error(`Invalid response from ${endpoint} API`)
		}
		return response.data.data
	}

	async fetchUserDataRPC(): Promise<UserCreditsData> {
		try {
			const dqs = this.dateQueryString()
			let [rate, usage, payment, user] = await Promise.all([
				this.authenticatedRequest<any>("/base/rate"),
				this.authenticatedRequest<any>(`/modelrouter/userlog?page=1&pageSize=1000&${dqs}`),
				this.authenticatedRequest<any>("/modelrouter/listrecharge?page=1&pageSize=10000"),
				this.authenticatedRequest<any>("/user/info"),
			])

			if (!usage || !Array.isArray(usage?.logs) || !rate) {
				usage = []
			} else {
				usage = usage.logs.map((it: any) => ({
					spentAt: it.request_time,
					modelProvider: "",
					model: `${it.model?.company}/${it.model?.name}`,
					credits: (rate * it.total_amount) / 10000000,
					totalTokens: it.total_amount,
					promptTokens: it.input_tokens,
					completionTokens: it.output_tokens,
				}))
			}

			if (!payment || !Array.isArray(payment.records) || !rate) {
				payment = []
			} else {
				payment = payment.records.map((it: any) => ({
					paidAt: it.create_at,
					amountCents: ((rate * it.price) / 10000).toString(),
				}))
			}

			let balance = { currentBalance: 0 }
			if (user && user.Wallet && user.Wallet.Assets && rate) {
				balance = { currentBalance: (rate * user.Wallet.Assets) / 10000 }
			}

			return UserCreditsData.create({
				balance: balance,
				usageTransactions: usage,
				paymentTransactions: payment,
			})
		} catch (error) {
			console.error("Failed fetchUserDataRPC:", error)
			throw error
		}
	}

	dateQueryString(): string {
		const endDate = new Date()
		const startDate = new Date(endDate)
		startDate.setDate(endDate.getDate() - 3)
		const formatDate = (date: Date): string => {
			const year = date.getFullYear()
			const month = String(date.getMonth() + 1).padStart(2, "0") // 月份补零
			const day = String(date.getDate()).padStart(2, "0") // 日期补零
			return `${year}-${month}-${day}`
		}
		return `startDate=${formatDate(startDate)}&endDate=${formatDate(endDate)}`
	}

	dateLocal(ds: string): string {
		const dateObj = new Date(ds)
		return dateObj.toLocaleDateString("zh-CN", {
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
		})
	}
}
