import { VSCodeButton, VSCodeLink } from "@vscode/webview-ui-toolkit/react"
import { useEffect, useState, memo } from "react"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { validateApiConfiguration } from "@/utils/validate"
import { vscode } from "@/utils/vscode"
import ApiOptions from "@/components/settings/ApiOptions"
import ClineLogoWhite from "@/assets/ClineLogoWhite"
import { AccountServiceClient } from "@/services/grpc-client"

const WelcomeView = memo(() => {
	const { apiConfiguration } = useExtensionState()
	const [apiErrorMessage, setApiErrorMessage] = useState<string | undefined>(undefined)
	const [showApiOptions, setShowApiOptions] = useState(false)

	const disableLetsGoButton = apiErrorMessage != null

	const handleLogin = () => {
		vscode.postMessage({ type: "accountLoginClickedSSY" })
	}

	const handleSubmit = () => {
		vscode.postMessage({ type: "apiConfiguration", apiConfiguration })
	}

	useEffect(() => {
		setApiErrorMessage(validateApiConfiguration(apiConfiguration))
	}, [apiConfiguration])

	return (
		<div className="fixed inset-0 p-0 flex flex-col">
			<div className="h-full px-5 overflow-auto">
				<h2>Hi, 我是 Cline-中文版</h2>
				<div className="flex justify-center my-5">
					<ClineLogoWhite className="size-16" />
				</div>
				<p>
					感谢{" "}
					<VSCodeLink href="https://www.anthropic.com/claude/sonnet" className="inline">
						Claude 4 Sonnet's
					</VSCodeLink>
					我可以执行各种任务。代理编码能力和访问工具，让我创建和编辑文件、探索复杂项目、使用浏览器和执行终端命令
					<i>（当然，在您的许可下）。</i>我甚至可以使用 MCP 来创建新工具并扩展我自己的能力。
				</p>

				<p className="text-[var(--vscode-descriptionForeground)]">注册 & 加群，赠送 Claude 4 Sonnet. 免费使用额度。</p>

				<VSCodeButton appearance="primary" onClick={handleLogin} className="w-full mt-1">
					注册胜算云
				</VSCodeButton>

				{!showApiOptions && (
					<VSCodeButton
						appearance="secondary"
						onClick={() => setShowApiOptions(!showApiOptions)}
						className="mt-2.5 w-full">
						使用你自己的 API key
					</VSCodeButton>
				)}

				<div className="mt-4.5">
					{showApiOptions && (
						<div>
							<ApiOptions showModelOptions={false} />
							<VSCodeButton onClick={handleSubmit} disabled={disableLetsGoButton} className="mt-0.75">
								开始!
							</VSCodeButton>
						</div>
					)}
				</div>
			</div>
		</div>
	)
})

export default WelcomeView
