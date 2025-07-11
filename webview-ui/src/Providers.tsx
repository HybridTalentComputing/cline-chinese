import { type ReactNode } from "react"

import { ExtensionStateContextProvider } from "./context/ExtensionStateContext"
import { ClineAuthProvider } from "./context/ClineAuthContext"
import { HeroUIProvider } from "@heroui/react"
import { CustomPostHogProvider } from "./CustomPostHogProvider"
import { ShengSuanYunAuthProvider } from "./context/ShengSuanYunAuthContext"

export function Providers({ children }: { children: ReactNode }) {
	return (
		<ExtensionStateContextProvider>
			<CustomPostHogProvider>
				<ClineAuthProvider>
					<ShengSuanYunAuthProvider>
						<HeroUIProvider>{children}</HeroUIProvider>
					</ShengSuanYunAuthProvider>
				</ClineAuthProvider>
			</CustomPostHogProvider>
		</ExtensionStateContextProvider>
	)
}
