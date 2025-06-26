import type { BalanceResponse, PaymentTransaction, UsageTransaction } from "../../shared/ClineAccount"
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
			throw new Error("未找到胜算云Router API key ")
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

	async fetchBalance(): Promise<BalanceResponse | undefined> {
		try {
			const data = await Promise.all([
				this.authenticatedRequest<any>("/base/rate"),
				this.authenticatedRequest<any>("/user/info"),
			])
			if (!Array.isArray(data)) {
				return undefined
			}
			const balance: BalanceResponse = { currentBalance: (data[0] * data[1].Wallet?.Assets) / 10000 }
			await this.postMessageToWebview({
				type: "userCreditsBalance",
				userCreditsBalance: balance,
			})
			return balance
		} catch (error) {
			console.error("Failed to fetch USD rate:", error)
			return undefined
		}
	}
	async fetchUsageTransactions(): Promise<UsageTransaction[] | undefined> {
		try {
			const dqs = this.dateQueryString()
			const data = await Promise.all([
				this.authenticatedRequest<any>("/base/rate"),
				this.authenticatedRequest<any>(`/modelrouter/userlog?page=1&pageSize=1000&${dqs}`),
			])
			if (!Array.isArray(data) || data.length !== 2) {
				return undefined
			}
			const r = data[0]
			const res = data[1]
			const utl: UsageTransaction[] = res.logs.map((it: any) => ({
				spentAt: it.request_time,
				creatorId: "",
				modelProvider: "",
				model: `${it.model?.company}/${it.model?.name}`,
				credits: ((r * it.total_amount) / 10000000).toFixed(7),
				totalTokens: it.total_amount,
				promptTokens: it.input_tokens.toString(),
				completionTokens: it.output_tokens.toString(),
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
			const data = await Promise.all([
				this.authenticatedRequest<any>("/base/rate"),
				this.authenticatedRequest<any>("/modelrouter/listrecharge?page=1&pageSize=10000"),
			])
			if (!Array.isArray(data) || data.length !== 2) {
				return undefined
			}
			const r = data[0]
			const res = data[1]
			if (!Array.isArray(res.records)) {
				return undefined
			}
			const cpl: PaymentTransaction[] = res.records.map((it: any) => ({
				creatorId: "",
				credits: -10000,
				paidAt: it.create_at,
				amountCents: ((r * it.price) / 10000).toFixed(2),
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
