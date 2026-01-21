import { EmptyRequest } from "@shared/proto/cline/common"
import { useCallback, useState } from "react"
import { AccountServiceClient } from "@/services/grpc-client"

export const useSignIn = () => {
	const [isLoading, setIsLoading] = useState(false)
	const handleSignIn = useCallback(() => {
		try {
			setIsLoading(true)
			AccountServiceClient.shengSuanYunLoginClicked(EmptyRequest.create())
				.catch((err) => console.error("Failed to get login URL:", err))
				.finally(() => {
					setIsLoading(false)
				})
		} catch (error) {
			console.error("Error signing in:", error)
		}
	}, [])
	return { isLoginLoading: isLoading, handleSignIn }
}
