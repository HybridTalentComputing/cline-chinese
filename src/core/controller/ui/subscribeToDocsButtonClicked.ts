import * as vscode from "vscode"

/**
 * Subscribe to docsButtonClicked events
 * This allows the webview to receive notifications when the docs button is clicked
 */
export async function subscribeToDocsButtonClicked(context: vscode.ExtensionContext): Promise<void> {
	// Docs button doesn't need subscription - it just opens a URL in browser
	// This function is kept for consistency with other button handlers
}

/**
 * Send a docsButtonClicked event to all active subscribers
 */
export async function sendDocsButtonClickedEvent(): Promise<void> {
	// Note: This is a placeholder for future extensibility
	// The actual navigation is handled by opening the URL in the browser
}
