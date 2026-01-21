export interface UserResponse {
	id: string
	email: string
	displayName: string
	photoUrl: string
}

export interface BalanceResponse {
	balance: number
	userId: string
}

export interface Usage {
	provider: string
	Model: string
	ModelType: string
	completionTokens: number
	costUsd: number
	createdAt: string
	creditsUsed: number
	generationId: string
	id: string
	promptTokens: number
	totalTokens: number
	userId: string
	model?: string
	modelProvider?: string
	spentAt?: string
	credits?: string
}

export interface Payment {
	paidAt: string
	creatorId: string
	amountCents: number
	credits: number
}
