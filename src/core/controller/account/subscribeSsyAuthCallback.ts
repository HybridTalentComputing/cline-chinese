import { EmptyRequest, String as ProtoString } from "@shared/proto/cline/common"
import { getRequestRegistry, type StreamingResponseHandler } from "../grpc-handler"
import { Controller } from "../index"

const activeAuthCallbackSubscriptions = new Set<StreamingResponseHandler<any>>()

export async function subscribeSsyAuthCallback(
	_controller: Controller,
	_request: EmptyRequest,
	responseStream: StreamingResponseHandler<any>,
	requestId?: string,
): Promise<void> {
	// Add this subscription to the active subscriptions
	activeAuthCallbackSubscriptions.add(responseStream)

	// Register cleanup when the connection is closed
	const cleanup = () => {
		activeAuthCallbackSubscriptions.delete(responseStream)
	}

	// Register the cleanup function with the request registry if we have a requestId
	if (requestId) {
		getRequestRegistry().registerRequest(requestId, cleanup, { type: "authCallback_subscription" }, responseStream)
	}
}

/**
 * Send an authCallback event to all active subscribers
 * @param customToken The custom token for authentication
 */
export async function sendSSYAuthCallbackEvent(customToken: string): Promise<void> {
	// Send the event to all active subscribers
	const promises = Array.from(activeAuthCallbackSubscriptions).map(async (responseStream) => {
		try {
			const event: ProtoString = {
				value: customToken,
			}
			await responseStream(
				event,
				false, // Not the last message
			)
		} catch (error) {
			console.error("Error sending authCallback event:", error)
			// Remove the subscription if there was an error
			activeAuthCallbackSubscriptions.delete(responseStream)
		}
	})

	await Promise.all(promises)
}
