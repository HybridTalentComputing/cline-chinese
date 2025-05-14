import { type ReactNode } from "react"

import { ExtensionStateContextProvider } from "./context/ExtensionStateContext"
import { FirebaseAuthProvider } from "./context/FirebaseAuthContext"
import { HeroUIProvider } from "@heroui/react"
import { CustomPostHogProvider } from "./CustomPostHogProvider"
import { SsyAuthProvider } from "./context/SsyAuthContext"

export function Providers({ children }: { children: ReactNode }) {
	return (
		<ExtensionStateContextProvider>
			<CustomPostHogProvider>
				<FirebaseAuthProvider>
					<SsyAuthProvider>
						<HeroUIProvider>{children}</HeroUIProvider>
					</SsyAuthProvider>
				</FirebaseAuthProvider>
			</CustomPostHogProvider>
		</ExtensionStateContextProvider>
	)
}
