import { type ReactNode } from "react"

import { ExtensionStateContextProvider } from "./context/ExtensionStateContext"
import { FirebaseAuthProvider } from "./context/FirebaseAuthContext"
import { HeroUIProvider } from "@heroui/react"
import { CustomPostHogProvider } from "./CustomPostHogProvider"
import { ShengSuanYunAuthProvider } from "./context/ShengSuanYunAuthContext"

export function Providers({ children }: { children: ReactNode }) {
	return (
		<ExtensionStateContextProvider>
			<CustomPostHogProvider>
				<FirebaseAuthProvider>
					<ShengSuanYunAuthProvider>
						<HeroUIProvider>{children}</HeroUIProvider>
					</ShengSuanYunAuthProvider>
				</FirebaseAuthProvider>
			</CustomPostHogProvider>
		</ExtensionStateContextProvider>
	)
}
