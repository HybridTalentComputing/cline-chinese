import { SapAiCoreModelDeployment, SapAiCoreModelsRequest } from "@shared/proto/index.cline"
import { Mode } from "@shared/storage/types"
import { VSCodeCheckbox, VSCodeLink } from "@vscode/webview-ui-toolkit/react"
import { useCallback, useEffect, useState } from "react"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { ModelsServiceClient } from "@/services/grpc-client"
import { DebouncedTextField } from "../common/DebouncedTextField"
import { ModelInfoView } from "../common/ModelInfoView"
import SapAiCoreModelPicker from "../SapAiCoreModelPicker"
import { normalizeApiConfiguration } from "../utils/providerUtils"
import { useApiConfigurationHandlers } from "../utils/useApiConfigurationHandlers"

/**
 * Props for the SapAiCoreProvider component
 */
interface SapAiCoreProviderProps {
	showModelOptions: boolean
	isPopup?: boolean
	currentMode: Mode
}

/**
 * The SAP AI Core provider configuration component
 */
export const SapAiCoreProvider = ({ showModelOptions, isPopup, currentMode }: SapAiCoreProviderProps) => {
	const { apiConfiguration } = useExtensionState()
	const { handleFieldChange, handleModeFieldsChange } = useApiConfigurationHandlers()

	// Handle orchestration checkbox change
	const handleOrchestrationChange = async (checked: boolean) => {
		await handleFieldChange("sapAiCoreUseOrchestrationMode", checked)
	}

	const { selectedModelId, selectedModelInfo } = normalizeApiConfiguration(apiConfiguration, currentMode)

	// State for dynamic model fetching
	const [sapAiCoreModelDeployments, setSapAiCoreModelDeployments] = useState<SapAiCoreModelDeployment[]>([])
	const [orchestrationAvailable, setOrchestrationAvailable] = useState<boolean>(false)
	const [hasCheckedOrchestration, setHasCheckedOrchestration] = useState<boolean>(false)
	const [isLoadingModels, setIsLoadingModels] = useState(false)
	const [modelError, setModelError] = useState<string | null>(null)

	// Check if all required credentials are available
	const hasRequiredCredentials =
		apiConfiguration?.sapAiCoreClientId &&
		apiConfiguration?.sapAiCoreClientSecret &&
		apiConfiguration?.sapAiCoreBaseUrl &&
		apiConfiguration?.sapAiCoreTokenUrl

	// Function to fetch SAP AI Core models
	const fetchSapAiCoreModels = useCallback(async () => {
		if (!hasRequiredCredentials) {
			setSapAiCoreModelDeployments([])
			setOrchestrationAvailable(false)
			setHasCheckedOrchestration(false)
			return
		}

		setIsLoadingModels(true)
		setModelError(null)

		try {
			const response = await ModelsServiceClient.getSapAiCoreModels(
				SapAiCoreModelsRequest.create({
					clientId: apiConfiguration.sapAiCoreClientId,
					clientSecret: apiConfiguration.sapAiCoreClientSecret,
					baseUrl: apiConfiguration.sapAiCoreBaseUrl,
					tokenUrl: apiConfiguration.sapAiCoreTokenUrl,
					resourceGroup: apiConfiguration.sapAiResourceGroup,
				}),
			)

			if (response) {
				setSapAiCoreModelDeployments(response.deployments || [])
				setOrchestrationAvailable(response.orchestrationAvailable || false)
				setHasCheckedOrchestration(true)
			} else {
				setSapAiCoreModelDeployments([])
				setOrchestrationAvailable(false)
				setHasCheckedOrchestration(true)
			}
		} catch (error) {
			console.error("Error fetching SAP AI Core models:", error)
			setModelError("Failed to fetch models. Please check your configuration.")
			setSapAiCoreModelDeployments([])
			setOrchestrationAvailable(false)
			setHasCheckedOrchestration(true)
		} finally {
			setIsLoadingModels(false)
		}
	}, [
		apiConfiguration?.sapAiCoreClientId,
		apiConfiguration?.sapAiCoreClientSecret,
		apiConfiguration?.sapAiCoreBaseUrl,
		apiConfiguration?.sapAiCoreTokenUrl,
		apiConfiguration?.sapAiResourceGroup,
	])

	// Fetch models when configuration changes
	useEffect(() => {
		if (showModelOptions && hasRequiredCredentials) {
			fetchSapAiCoreModels()
		}
	}, [showModelOptions, hasRequiredCredentials, fetchSapAiCoreModels])

	// Handle automatic disabling of orchestration mode when not available
	useEffect(() => {
		if (hasCheckedOrchestration && !orchestrationAvailable && apiConfiguration?.sapAiCoreUseOrchestrationMode) {
			handleFieldChange("sapAiCoreUseOrchestrationMode", false)
		}
	}, [hasCheckedOrchestration, orchestrationAvailable, apiConfiguration?.sapAiCoreUseOrchestrationMode, handleFieldChange])

	// Handle model selection
	const handleModelChange = useCallback(
		(modelId: string, deploymentId: string) => {
			// Update both model ID and deployment ID atomically
			handleModeFieldsChange(
				{
					modelId: { plan: "planModeApiModelId", act: "actModeApiModelId" },
					deploymentId: { plan: "planModeSapAiCoreDeploymentId", act: "actModeSapAiCoreDeploymentId" },
				},
				{ modelId, deploymentId },
				currentMode,
			)
		},
		[handleModeFieldsChange, currentMode],
	)

	return (
		<div className="flex flex-col gap-1.5">
			<DebouncedTextField
				initialValue={apiConfiguration?.sapAiCoreClientId || ""}
				onChange={(value) => handleFieldChange("sapAiCoreClientId", value)}
				placeholder="Enter AI Core Client Id..."
				style={{ width: "100%" }}
				type="password">
				<span className="font-medium">AI Core Client Id</span>
			</DebouncedTextField>
			{apiConfiguration?.sapAiCoreClientId && (
				<p className="text-xs text-(--vscode-descriptionForeground)">客户端 ID 已设置。如需更改，请重新输入该值。</p>
			)}

			<DebouncedTextField
				initialValue={apiConfiguration?.sapAiCoreClientSecret || ""}
				onChange={(value) => handleFieldChange("sapAiCoreClientSecret", value)}
				placeholder="Enter AI Core Client Secret..."
				style={{ width: "100%" }}
				type="password">
				<span className="font-medium">AI Core Client Secret</span>
			</DebouncedTextField>
			{apiConfiguration?.sapAiCoreClientSecret && (
				<p className="text-xs text-(--vscode-descriptionForeground)">客户端密钥已设置。如需更改，请重新输入该值。</p>
			)}

			<DebouncedTextField
				initialValue={apiConfiguration?.sapAiCoreBaseUrl || ""}
				onChange={(value) => handleFieldChange("sapAiCoreBaseUrl", value)}
				placeholder="Enter AI Core Base URL..."
				style={{ width: "100%" }}>
				<span className="font-medium">AI Core Base URL</span>
			</DebouncedTextField>

			<DebouncedTextField
				initialValue={apiConfiguration?.sapAiCoreTokenUrl || ""}
				onChange={(value) => handleFieldChange("sapAiCoreTokenUrl", value)}
				placeholder="Enter AI Core Auth URL..."
				style={{ width: "100%" }}>
				<span className="font-medium">AI Core Auth URL</span>
			</DebouncedTextField>

			<DebouncedTextField
				initialValue={apiConfiguration?.sapAiResourceGroup || ""}
				onChange={(value) => handleFieldChange("sapAiResourceGroup", value)}
				placeholder="Enter AI Core Resource Group..."
				style={{ width: "100%" }}>
				<span className="font-medium">AI Core Resource Group</span>
			</DebouncedTextField>

			<p className="text-xs mt-1.5 text-(--vscode-descriptionForeground)">
				这些凭证存储在本地，仅用于从此扩展发出 API 请求。
				<VSCodeLink
					className="inline"
					href="https://help.sap.com/docs/sap-ai-core/sap-ai-core-service-guide/access-sap-ai-core-via-api">
					您可以在此处找到有关 SAP AI Core API 访问的更多信息。
				</VSCodeLink>
			</p>

			{orchestrationAvailable && (
				<div className="flex flex-col gap-2.5 mt-[15px]">
					<div className="flex items-center gap-2">
						<VSCodeCheckbox
							aria-label="Orchestration Mode"
							checked={apiConfiguration?.sapAiCoreUseOrchestrationMode}
							onChange={(e) => handleOrchestrationChange((e.target as HTMLInputElement).checked)}
						/>
						<span className="font-medium">Orchestration Mode</span>
					</div>

					<p className="text-xs text-(--vscode-descriptionForeground)">
						启用后，无需单独部署即可访问所有可用模型。
						<br />
						<br />
						禁用后，仅允许访问 AI Core 服务实例中已部署的模型。
					</p>
				</div>
			)}

			{showModelOptions && (
				<>
					<div className="flex flex-col gap-1.5">
						{isLoadingModels ? (
							<div className="text-xs text-(--vscode-descriptionForeground)">加载模型...</div>
						) : modelError ? (
							<div className="text-xs text-(--vscode-errorForeground)">
								{modelError}
								<button
									className="ml-2 text-[11px] px-1.5 py-0.5 bg-(--vscode-button-background) text-(--vscode-button-foreground) border-none rounded-sm cursor-pointer"
									onClick={fetchSapAiCoreModels}>
									重试
								</button>
							</div>
						) : hasRequiredCredentials ? (
							<>
								{sapAiCoreModelDeployments.length === 0 && (
									<div className="text-xs text-(--vscode-errorForeground) mb-2">
										无法从 SAP AI Core 服务实例获取模型。请检查您的 SAP AI Core
										配置，或确保您的部署已部署并在服务实例中运行。
									</div>
								)}
								<SapAiCoreModelPicker
									onModelChange={handleModelChange}
									placeholder="Select a model..."
									sapAiCoreModelDeployments={sapAiCoreModelDeployments}
									selectedDeploymentId={
										apiConfiguration?.[
											currentMode === "plan"
												? "planModeSapAiCoreDeploymentId"
												: "actModeSapAiCoreDeploymentId"
										]
									}
									selectedModelId={selectedModelId || ""}
									useOrchestrationMode={apiConfiguration?.sapAiCoreUseOrchestrationMode}
								/>
							</>
						) : (
							<div className="text-xs text-(--vscode-errorForeground)">
								请配置您的 SAP AI Core 凭据以查看可用模型。
							</div>
						)}
					</div>

					<ModelInfoView isPopup={isPopup} modelInfo={selectedModelInfo} selectedModelId={selectedModelId} />
				</>
			)}
		</div>
	)
}
