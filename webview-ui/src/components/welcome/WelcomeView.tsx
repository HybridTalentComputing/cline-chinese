import { VSCodeButton, VSCodeLink } from "@vscode/webview-ui-toolkit/react"
import { useEffect, useState, memo } from "react"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { validateApiConfiguration } from "@/utils/validate"
import { vscode } from "@/utils/vscode"
import ApiOptions from "@/components/settings/ApiOptions"
import ClineLogoWhite from "@/assets/ClineLogoWhite"
import { AccountServiceClient, ModelsServiceClient } from "@/services/grpc-client"
import { EmptyRequest } from "@shared/proto/common"
import { UpdateApiConfigurationRequest } from "@shared/proto/models"
import { convertApiConfigurationToProto } from "@shared/proto-conversions/models/api-configuration-conversion"

const WelcomeView = memo(() => {
	const { apiConfiguration } = useExtensionState()
	const [apiErrorMessage, setApiErrorMessage] = useState<string | undefined>(undefined)
	const [showApiOptions, setShowApiOptions] = useState(false)

	const disableLetsGoButton = apiErrorMessage != null

	const handleLogin = () => {
		vscode.postMessage({ type: "accountLoginClickedSSY" })
	}

	const handleSubmit = async () => {
		if (apiConfiguration) {
			try {
				await ModelsServiceClient.updateApiConfigurationProto(
					UpdateApiConfigurationRequest.create({
						apiConfiguration: convertApiConfigurationToProto(apiConfiguration),
					}),
				)
			} catch (error) {
				console.error("Failed to update API configuration:", error)
			}
		}
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
				<div className="flex flex-col gap-3">
					<div className="bg-white p-3 text-gray-800">
						Cline中文版，由中国胜算云Router赞助开发，一分钟注册，国内就能调用，Claude / GPT 等全球100个大模型
					</div>
					<div className="bg-white p-3 text-gray-800">限时新用户，注册限时赠送 Claude 4 Sonnet 免费额度！</div>
				</div>

				<VSCodeButton appearance="primary" onClick={handleLogin} className="w-full mt-1">
					注册领取 免费额度
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
