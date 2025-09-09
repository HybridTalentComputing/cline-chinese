import { HeroUIProvider } from "@heroui/react"
import { type ReactNode } from "react"
import { CustomPostHogProvider } from "./CustomPostHogProvider"
// import { ClineAuthProvider } from "./context/ClineAuthContext"
import { ExtensionStateContextProvider } from "./context/ExtensionStateContext"
import { ShengSuanYunAuthProvider } from "./context/ShengSuanYunAuthContext"

export function Providers({ children }: { children: ReactNode }) {
	return (
		<ExtensionStateContextProvider>
			<CustomPostHogProvider>
				{/* <ClineAuthProvider> */}
				<ShengSuanYunAuthProvider>
					<HeroUIProvider>{children}</HeroUIProvider>
				</ShengSuanYunAuthProvider>
				{/* </ClineAuthProvider> */}
			</CustomPostHogProvider>
		</ExtensionStateContextProvider>
	)
}
