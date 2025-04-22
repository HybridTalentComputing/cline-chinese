import React, { createContext, useCallback, useContext, useEffect, useState } from "react"
import { useExtensionState } from "./ExtensionStateContext"
import axios, { AxiosRequestConfig } from "axios"
import { vscode } from "@/utils/vscode"

interface SsyAuthContextType {
	userSSY: any | null
	isInitSSY: boolean
	signInWithTokenSSY: (token: string) => Promise<void>
	handleSignOutSSY: () => Promise<void>
}

const SsyAuthContext = createContext<SsyAuthContextType | undefined>(undefined)
export const SsyAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [userSSY, setUser] = useState<any | null>(null)
	const [isInitSSY, setIsInitialized] = useState(false)
	const { apiConfiguration } = useExtensionState()
	useEffect(() => {
		if (apiConfiguration?.shengsuanyunToken) signInWithTokenSSY(apiConfiguration?.shengsuanyunToken)
	}, [apiConfiguration?.shengsuanyunToken])

	const signInWithTokenSSY = async (token: string) => {
		try {
			const reqConfig: AxiosRequestConfig = {
				headers: {
					"x-token": token,
					"Content-Type": "application/json",
				},
			}
			const uri = "https://api.shengsuanyun.com/user/info"
			const res = await axios.get(uri, reqConfig)
			if (!res.data || !res.data.data) {
				throw new Error(`Invalid response from ${uri} API`)
			}
			const usi = {
				Email: res.data.data.Email,
				Nickname: res.data.data.Nickname,
				HeadImg: res.data.data.HeadImg,
				Username: res.data.data.Username,
				Wallet: res.data.data.Wallet,
				Phone: res.data.data.Phone,
			}
			setUser(usi)
			setIsInitialized(true)
			console.log("onAuthStateChanged user", usi)
			vscode.postMessage({
				type: "authStateChanged",
				userSSY: usi,
			})
		} catch (error) {
			console.error("Error signing in with custom token:", error)
			throw error
		}
	}

	// Listen for auth callback from extension
	useEffect(() => {
		const handleMessage = (event: MessageEvent) => {
			const message = event.data
			if (message.type === "authCallback" && message.customToken) {
				signInWithTokenSSY(message.customToken)
			}
		}

		window.addEventListener("message", handleMessage)
		return () => window.removeEventListener("message", handleMessage)
	}, [signInWithTokenSSY])

	const handleSignOutSSY = useCallback(async () => {
		try {
			console.log("Successfully signed out of ssy")
		} catch (error) {
			console.error("Error signing out of ssy:", error)
			throw error
		}
	}, [])

	return (
		<SsyAuthContext.Provider value={{ userSSY, isInitSSY, signInWithTokenSSY, handleSignOutSSY }}>
			{children}
		</SsyAuthContext.Provider>
	)
}

export const useSsyAuth = () => {
	const context = useContext(SsyAuthContext)
	if (context === undefined) {
		throw new Error("useSsyAuth must be used within a SsyAuthProvider")
	}
	return context
}
