import { Button } from "@components/ui/button"
import { EmptyRequest } from "@shared/proto/cline/common"
import React, { useCallback, useRef } from "react"
import { useMount } from "react-use"
import { Dialog, DialogContent } from "@/components/ui/dialog"
// import { useClineAuth } from "@/context/ClineAuthContext"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { AccountServiceClient } from "@/services/grpc-client"
import { useApiConfigurationHandlers } from "../settings/utils/useApiConfigurationHandlers"

interface WhatsNewModalProps {
	open: boolean
	onClose: () => void
	version: string
}

export const WhatsNewModal: React.FC<WhatsNewModalProps> = ({ open, onClose, version }) => {
	const { userInfo, openRouterModels, setShowChatModelSelector, refreshOpenRouterModels } = useExtensionState()
	const { handleFieldsChange } = useApiConfigurationHandlers()
	const clickedModelsRef = useRef<Set<string>>(new Set())

	// Get latest model list in case user hits shortcut button to set model
	useMount(refreshOpenRouterModels)

	const setModel = useCallback(
		(modelId: string) => {
			handleFieldsChange({
				planModeOpenRouterModelId: modelId,
				actModeOpenRouterModelId: modelId,
				planModeOpenRouterModelInfo: openRouterModels[modelId],
				actModeOpenRouterModelInfo: openRouterModels[modelId],
				planModeApiProvider: "shengsuanyun",
				actModeApiProvider: "shengsuanyun",
			})
			clickedModelsRef.current.add(modelId)
			setShowChatModelSelector(true)
			onClose()
		},
		[handleFieldsChange, openRouterModels, setShowChatModelSelector, onClose],
	)

	const handleShowAccount = useCallback(() => {
		AccountServiceClient.shengSuanYunLoginClicked(EmptyRequest.create()).catch((err) =>
			console.error("Failed to get login URL:", err),
		)
	}, [])

	const ModelButton: React.FC<{ modelId: string; label: string }> = ({ modelId, label }) => {
		const isClicked = clickedModelsRef.current.has(modelId)
		if (isClicked) {
			return null
		}

		return (
			<Button className="my-1" onClick={() => setModel(modelId)} size="sm">
				{label}
			</Button>
		)
	}

	const AuthButton: React.FC<{ children: React.ReactNode }> = ({ children }) =>
		userInfo?.email ? (
			<div className="flex gap-2 flex-wrap">{children}</div>
		) : (
			<Button className="my-1" onClick={handleShowAccount} size="sm">
				Cline Chinese赞助商--胜算云中使用
			</Button>
		)

	return (
		<Dialog onOpenChange={(isOpen) => !isOpen && onClose()} open={open}>
			<DialogContent className="pt-5 px-5 pb-4 gap-0">
				aria-describedby="whats-new-description" aria-labelledby="whats-new-title"
				<div id="whats-new-description">
					<h2
						className="text-lg font-semibold mb-3 pr-6"
						id="whats-new-title"
						style={{ color: "var(--vscode-editor-foreground)" }}>
						🎉 v{version} 新功能
					</h2>

					<ul className="text-sm pl-3 list-disc" style={{ color: "var(--vscode-descriptionForeground)" }}>
						<li className="mb-2">
							<strong>新增供应商</strong> 现在运行在 Vercel AI 网关上，延迟更低，错误更少。
						</li>
						<li>
							<strong>GLM 4.7</strong> 现在可用！
							<br />
							<AuthButton>
								<ModelButton label="Try GLM 4.7" modelId="z-ai/glm-4.7" />
							</AuthButton>
						</li>
						<li>
							<strong>MiMo V2 Flash</strong>, 限时免费!
							<br />
							<AuthButton>
								<ModelButton label="Try MiMo V2 Flash" modelId="xiaomi/mimo-v2-flash" />
							</AuthButton>
						</li>
						<li>
							<strong>Gemini 3 Flash Preview</strong> 现在可用！
							<br />
							<AuthButton>
								<ModelButton label="Try Gemini 3 Flash Preview" modelId="google/gemini-3-flash-preview" />
							</AuthButton>
						</li>
					</ul>
				</div>
			</DialogContent>
		</Dialog>
	)
}

export default WhatsNewModal
