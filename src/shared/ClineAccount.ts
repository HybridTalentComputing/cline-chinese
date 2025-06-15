export interface BalanceResponse {
	currentBalance: number
}

export interface UsageTransaction {
	spentAt: string
	credits?: string
	modelProvider: string
	model: string
	promptTokens?: string
	completionTokens?: string
	totalTokens?: number
}

export interface PaymentTransaction {
	paidAt: string
	amountCents: string
	credits?: string
}
