import { HeroUIProvider } from "@heroui/react"
import { type ReactNode } from "react"
import { I18nextProvider } from "react-i18next"
import "./i18n/config" // 导入 i18n 配置
import i18n from "./i18n/config"
import { CustomPostHogProvider } from "./CustomPostHogProvider"
import { ClineAuthProvider } from "./context/ClineAuthContext"
import { ExtensionStateContextProvider } from "./context/ExtensionStateContext"
import { PlatformProvider } from "./context/PlatformContext"

export function Providers({ children }: { children: ReactNode }) {
	return (
		<I18nextProvider i18n={i18n}>
			<PlatformProvider>
				<ExtensionStateContextProvider>
					<CustomPostHogProvider>
						<ClineAuthProvider>
							<HeroUIProvider>{children}</HeroUIProvider>
						</ClineAuthProvider>
					</CustomPostHogProvider>
				</ExtensionStateContextProvider>
			</PlatformProvider>
		</I18nextProvider>
	)
}
