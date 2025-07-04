import { VSCodeButton, VSCodeLink } from "@vscode/webview-ui-toolkit/react"
import { useEffect, useState, memo } from "react"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { validateApiConfiguration } from "@/utils/validate"
import ApiOptions from "@/components/settings/ApiOptions"
import ClineLogoWhite from "@/assets/ClineLogoWhite"
import { AccountServiceClient, ModelsServiceClient, StateServiceClient } from "@/services/grpc-client"
import { EmptyRequest, BooleanRequest } from "@shared/proto/common"

const WelcomeView = memo(() => {
	const { apiConfiguration } = useExtensionState()
	const [apiErrorMessage, setApiErrorMessage] = useState<string | undefined>(undefined)
	const [showApiOptions, setShowApiOptions] = useState(false)

	const disableLetsGoButton = apiErrorMessage != null

	const handleLogin = () => {
		AccountServiceClient.accountLoginClicked(EmptyRequest.create()).catch((err) =>
			console.error("Failed to get login URL:", err),
		)
	}

	const handleSubmit = async () => {
		try {
			await StateServiceClient.setWelcomeViewCompleted(BooleanRequest.create({ value: true }))
		} catch (error) {
			console.error("Failed to update API configuration or complete welcome view:", error)
		}
	}

	useEffect(() => {
		setApiErrorMessage(validateApiConfiguration(apiConfiguration))
	}, [apiConfiguration])

	return (
		<div className="fixed inset-0 p-0 flex flex-col">
			<div className="h-full px-5 overflow-auto">
				<h2>你好，我是 Cline Chinese</h2>
				<div className="flex justify-center my-5">
					<ClineLogoWhite className="size-16" />
				</div>
				<p>
					🎉 Cline Chinese与胜算云Router达成合作啦！官方（Anthropic、GCP、AWS）Claude sonnet 4、Claude Opus
					4、谷歌GCP/GoogleAIStudio模型，全球模型都可调用，非逆向，支付宝/微信、充值折扣，可发票，可试用，点击此
					点击此处进行注册：
					<VSCodeLink
						href="https://router.shengsuanyun.com/auth?from=cline-chinese&callback_url=vscode://HybridTalentComputing.cline-chinese/ssy"
						className="inline">
						胜算云Router
					</VSCodeLink>
				</p>
				<p>
					多亏了{" "}
					<VSCodeLink href="https://www.anthropic.com/news/claude-3-7-sonnet" className="inline">
						Claude 4 Sonnet
					</VSCodeLink>
					的智能编码能力和各种工具的支持，我可以完成各种任务。我可以创建和编辑文件、探索复杂项目、使用浏览器，以及执行终端命令
					<i>（当然需要你的许可）</i>。我甚至可以使用 MCP 来创建新工具并扩展自己的能力。
				</p>

				<p className="text-[var(--vscode-descriptionForeground)]">
					注册一个账户即可免费开始使用，或者使用提供 Claude 4 Sonnet 等模型访问权限的 API 密钥。
				</p>

				<VSCodeButton appearance="primary" onClick={handleLogin} className="w-full mt-1">
					注册Cline
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
