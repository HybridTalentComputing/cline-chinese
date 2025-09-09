import { AuthStateChangedRequest } from "@shared/proto/cline/account"
import { EmptyRequest } from "@shared/proto/cline/common"
import axios, { AxiosRequestConfig } from "axios"
import React, { createContext, useCallback, useContext, useEffect, useState } from "react"
import { AccountServiceClient } from "@/services/grpc-client"
import { useExtensionState } from "./ExtensionStateContext"

interface ShengSuanYunAuthContextType {
	userSSY: any | null
	isInitSSY: boolean
	signInWithTokenSSY: (token: string) => Promise<void>
	handleSignOutSSY: () => Promise<void>
}

const ShengSuanYunAuthContext = createContext<ShengSuanYunAuthContextType | undefined>(undefined)
export const ShengSuanYunAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [userSSY, setUser] = useState<any | null>(null)
	const [isInitSSY, setIsInitialized] = useState(false)
	const { apiConfiguration, setUserInfo } = useExtensionState()

	useEffect(() => {
		if (apiConfiguration?.shengSuanYunToken) {
			signInWithTokenSSY(apiConfiguration?.shengSuanYunToken)
		}
	}, [apiConfiguration?.shengSuanYunToken])

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
			if (!res.data || !res.data.data || res.data.code !== 0) {
				throw new Error(`Invalid response from ${uri} API`)
			}
			const user: any = {
				displayName: res.data.data.Nickname || res.data.data.Username || undefined,
				email: res.data.data.Email ?? undefined,
				photoURL: res.data.data.HeadImg ?? undefined,
				uid: res.data.data.ID || undefined,
			}
			setUser(user)
			setIsInitialized(true)
			AccountServiceClient.authStateChanged(AuthStateChangedRequest.create({ user }))
				.then((res) => {
					setUserInfo(res.user)
				})
				.catch((error) => {
					console.error("Error updating auth state via gRPC:", error)
				})
		} catch (error) {
			console.error("Error signing in with custom token:", error)
			// throw error
		}
	}

	useEffect(() => {
		const cleanup = AccountServiceClient.subscribeSSYAuthCallback(EmptyRequest.create({}), {
			onResponse: (event) => {
				if (event.value) {
					signInWithTokenSSY(event.value)
				}
			},
			onError: (error) => {
				console.error("Error in signInWithTokenSSY subscription:", error)
			},
			onComplete: () => {},
		})
		return cleanup
	}, [signInWithTokenSSY])

	const handleSignOutSSY = useCallback(async () => {
		try {
			AccountServiceClient.shengSuanYunLogoutClicked(EmptyRequest.create()).catch((err) =>
				console.error("shengSuanYunLogoutClicked Failed to logout:", err),
			)
			console.log("Successfully signed out of ssy")
		} catch (error) {
			console.error("Error signing out of ssy:", error)
			throw error
		}
	}, [])

	return (
		<ShengSuanYunAuthContext.Provider value={{ userSSY, isInitSSY, signInWithTokenSSY, handleSignOutSSY }}>
			{children}
		</ShengSuanYunAuthContext.Provider>
	)
}

export const handleSignInSSY = async () => {
	try {
		AccountServiceClient.shengSuanYunLoginClicked(EmptyRequest.create()).catch((err) =>
			console.error("Failed to get login URL:", err),
		)
	} catch (error) {
		console.error("Error signing in:", error)
		throw error
	}
}
export const useShengSuanYunAuth = () => {
	const context = useContext(ShengSuanYunAuthContext)
	if (context === undefined) {
		throw new Error("useShengSuanYunAuth must be used within a ShengSuanYunAuthProvider")
	}
	return context
}
