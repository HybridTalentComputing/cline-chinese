// AUTO-GENERATED FILE - DO NOT MODIFY DIRECTLY
// Generated by proto/build-proto.js

// Import all method implementations
import { registerMethod } from "./index"
import { getLatestState } from "./getLatestState"
import { resetState } from "./resetState"
import { subscribeToState } from "./subscribeToState"
import { toggleFavoriteModel } from "./toggleFavoriteModel"
import { togglePlanActMode } from "./togglePlanActMode"
import { updateAutoApprovalSettings } from "./updateAutoApprovalSettings"
import { updateSettings } from "./updateSettings"
import { updateTerminalConnectionTimeout } from "./updateTerminalConnectionTimeout"

// Streaming methods for this service
export const streamingMethods = [
  "subscribeToState"
]

// Register all state service methods
export function registerAllMethods(): void {
	// Register each method with the registry
	registerMethod("getLatestState", getLatestState)
	registerMethod("resetState", resetState)
	registerMethod("subscribeToState", subscribeToState, { isStreaming: true })
	registerMethod("toggleFavoriteModel", toggleFavoriteModel)
	registerMethod("togglePlanActMode", togglePlanActMode)
	registerMethod("updateAutoApprovalSettings", updateAutoApprovalSettings)
	registerMethod("updateSettings", updateSettings)
	registerMethod("updateTerminalConnectionTimeout", updateTerminalConnectionTimeout)
}