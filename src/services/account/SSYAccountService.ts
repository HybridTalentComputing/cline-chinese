import type { PaymentTransaction, UsageTransaction } from "../../shared/ClineAccount"
import { ExtensionMessage } from "../../shared/ExtensionMessage"
import axios, { AxiosRequestConfig } from "axios"

export class SSYAccountService {
	private readonly baseUrl = "https://api.shengsuanyun.com"
	private postMessageToWebview: (message: ExtensionMessage) => Promise<void>
	private getSSYApiKey: () => Promise<string | undefined>

	constructor(
		postMessageToWebview: (message: ExtensionMessage) => Promise<void>,
		getSSYApiKey: () => Promise<string | undefined>,
	) {
		this.postMessageToWebview = postMessageToWebview
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

	async fetchRate(): Promise<number | undefined> {
		try {
			const rate = await this.authenticatedRequest<any>("/base/rate")
			if (!rate) {
				return undefined
			}
			await this.postMessageToWebview({
				type: "fetchUSDRate",
				fetchUSDRate: rate,
			})
			return rate
		} catch (error) {
			console.error("Failed to fetch USD rate:", error)
			return undefined
		}
	}
	async fetchUsageTransactions(): Promise<UsageTransaction[] | undefined> {
		try {
			const dqs = this.dateQueryString()
			const res: any = await this.authenticatedRequest(`/modelrouter/userlog?page=1&pageSize=1000&${dqs}`)
			if (!res || !Array.isArray(res.logs)) {
				return undefined
			}
			const utl = res.logs.map((it: any) => ({
				spentAt: it.request_time,
				modelProvider: "",
				model: `${it.model?.company}/${it.model?.name}`,
				credits: it.total_amount / 10000000,
				totalTokens: it.total_amount,
				promptTokens: it.input_tokens,
				completionTokens: it.output_tokens,
			}))

			await this.postMessageToWebview({
				type: "userCreditsUsage",
				userCreditsUsage: utl,
			})
			return utl
		} catch (error) {
			console.error("Failed to fetch usage transactions:", error)
			return undefined
		}
	}
	async fetchPaymentTransactions(): Promise<PaymentTransaction[] | undefined> {
		try {
			const res = await this.authenticatedRequest<any>("/modelrouter/listrecharge?page=1&pageSize=10000")
			if (!res || !Array.isArray(res.records)) {
				return undefined
			}
			const cpl = res.records.map((it: any) => ({
				paidAt: it.create_at,
				amountCents: (it.price / 10000).toString(),
			}))
			await this.postMessageToWebview({
				type: "userCreditsPayments",
				userCreditsPayments: cpl,
			})
			return cpl
		} catch (error) {
			console.error("Failed to fetch payment transactions:", error)
			return undefined
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
