interface RetryOptions {
	maxRetries?: number
	baseDelay?: number
	maxDelay?: number
	retryAllErrors?: boolean
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
	maxRetries: 3,
	baseDelay: 1_000,
	maxDelay: 10_000,
	retryAllErrors: false,
}

export class RetriableError extends Error {
	status: number = 429
	retryAfter?: number

	constructor(message: string, retryAfter?: number, options?: ErrorOptions) {
		super(message, options)
		this.name = "RetriableError"

		this.retryAfter = retryAfter
	}
}

export function withRetry(options: RetryOptions = {}) {
	const { maxRetries, baseDelay, maxDelay, retryAllErrors } = { ...DEFAULT_OPTIONS, ...options }

	return (_target: any, _propertyKey: string, descriptor: PropertyDescriptor) => {
		const originalMethod = descriptor.value

		descriptor.value = async function* (...args: any[]) {
			let lastError: any

			// maxRetries + 1 to include the initial attempt
			for (let attempt = 0; attempt <= maxRetries; attempt++) {
				try {
					yield* originalMethod.apply(this, args)
					return
				} catch (error: any) {
					lastError = error
					const isRateLimit = error?.status === 429 || error instanceof RetriableError
					const isLastAttempt = attempt === maxRetries

					// If it's the last attempt, or if we shouldn't retry this error type, throw
					if (isLastAttempt || (!isRateLimit && !retryAllErrors)) {
						throw error
					}

					// Get retry delay from header or calculate exponential backoff
					// Check various rate limit headers
					const retryAfter =
						error.headers?.["retry-after"] ||
						error.headers?.["x-ratelimit-reset"] ||
						error.headers?.["ratelimit-reset"] ||
						error.retryAfter

					let delay: number
					if (retryAfter) {
						// Handle both delta-seconds and Unix timestamp formats
						const retryValue = parseInt(retryAfter, 10)
						if (retryValue > Date.now() / 1000) {
							// Unix timestamp
							delay = retryValue * 1000 - Date.now()
						} else {
							// Delta seconds
							delay = retryValue * 1000
						}
						// Ensure delay is within bounds
						delay = Math.max(0, Math.min(maxDelay, delay))
					} else {
						// Use exponential backoff if no header
						delay = Math.min(maxDelay, baseDelay * 2 ** attempt)
					}

					console.log(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms delay for error:`, error.message)

					const handlerInstance = this as any
					if (handlerInstance.options?.onRetryAttempt) {
						try {
							await handlerInstance.options.onRetryAttempt(attempt + 1, maxRetries, delay, error)
						} catch (e) {
							console.error("Error in onRetryAttempt callback:", e)
						}
					}

					await new Promise((resolve) => setTimeout(resolve, delay))
				}
			}

			// This should never be reached, but just in case
			throw lastError
		}

		return descriptor
	}
}
