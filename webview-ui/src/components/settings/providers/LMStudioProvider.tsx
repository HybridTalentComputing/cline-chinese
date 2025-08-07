import { VSCodeRadioGroup, VSCodeRadio, VSCodeLink } from "@vscode/webview-ui-toolkit/react"
import { useState, useCallback, useEffect } from "react"
import { useInterval } from "react-use"
import { DebouncedTextField } from "../common/DebouncedTextField"
import { ModelsServiceClient } from "@/services/grpc-client"
import { StringRequest } from "@shared/proto/cline/common"
import { BaseUrlField } from "../common/BaseUrlField"
import { useApiConfigurationHandlers } from "../utils/useApiConfigurationHandlers"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { getModeSpecificFields } from "../utils/providerUtils"
import { Mode } from "@shared/storage/types"
/**
 * Props for the LMStudioProvider component
 */
interface LMStudioProviderProps {
	showModelOptions: boolean
	isPopup?: boolean
	currentMode: Mode
}

/**
 * The LM Studio provider configuration component
 */
export const LMStudioProvider = ({ showModelOptions, isPopup, currentMode }: LMStudioProviderProps) => {
	const { apiConfiguration } = useExtensionState()
	const { handleFieldChange, handleModeFieldChange } = useApiConfigurationHandlers()

	const { lmStudioModelId } = getModeSpecificFields(apiConfiguration, currentMode)

	const [lmStudioModels, setLmStudioModels] = useState<string[]>([])

	// Poll LM Studio models
	const requestLmStudioModels = useCallback(async () => {
		try {
			const response = await ModelsServiceClient.getLmStudioModels(
				StringRequest.create({
					value: apiConfiguration?.lmStudioBaseUrl || "",
				}),
			)
			if (response && response.values) {
				setLmStudioModels(response.values)
			}
		} catch (error) {
			console.error("Failed to fetch LM Studio models:", error)
			setLmStudioModels([])
		}
	}, [apiConfiguration?.lmStudioBaseUrl])

	useEffect(() => {
		requestLmStudioModels()
	}, [requestLmStudioModels])

	useInterval(requestLmStudioModels, 2000)

	return (
		<div>
			<BaseUrlField
				initialValue={apiConfiguration?.lmStudioBaseUrl}
				onChange={(value) => handleFieldChange("lmStudioBaseUrl", value)}
				placeholder="Default: http://localhost:1234"
				label="自定义 URL"
			/>

			<DebouncedTextField
				initialValue={lmStudioModelId || ""}
				onChange={(value) =>
					handleModeFieldChange({ plan: "planModeLmStudioModelId", act: "actModeLmStudioModelId" }, value, currentMode)
				}
				style={{ width: "100%" }}
				placeholder={"e.g. meta-llama-3.1-8b-instruct"}>
				<span style={{ fontWeight: 500 }}>模型 ID</span>
			</DebouncedTextField>

			{lmStudioModels.length > 0 && (
				<VSCodeRadioGroup
					value={lmStudioModels.includes(lmStudioModelId || "") ? lmStudioModelId : ""}
					onChange={(e) => {
						const value = (e.target as HTMLInputElement)?.value
						// need to check value first since radio group returns empty string sometimes
						if (value) {
							handleModeFieldChange(
								{ plan: "planModeLmStudioModelId", act: "actModeLmStudioModelId" },
								value,
								currentMode,
							)
						}
					}}>
					{lmStudioModels.map((model) => (
						<VSCodeRadio key={model} value={model} checked={lmStudioModelId === model}>
							{model}
						</VSCodeRadio>
					))}
				</VSCodeRadioGroup>
			)}

			<p
				style={{
					fontSize: "12px",
					marginTop: "5px",
					color: "var(--vscode-descriptionForeground)",
				}}>
				LM Studio 帮助您在计算机上本地运行模型。有关如何开始使用的说明，请参阅其
				<VSCodeLink href="https://lmstudio.ai/docs" style={{ display: "inline", fontSize: "inherit" }}>
					快速入门指南.
				</VSCodeLink>
				您还需要启动 LM Studio 的{" "}
				<VSCodeLink href="https://lmstudio.ai/docs/basics/server" style={{ display: "inline", fontSize: "inherit" }}>
					本地服务
				</VSCodeLink>{" "}
				功能以与此扩展一起使用.{" "}
				<span style={{ color: "var(--vscode-errorForeground)" }}>
					(<span style={{ fontWeight: 500 }}>注意:</span> Cline 使用复杂的提示，与 Claude
					模型配合使用效果最佳。性能较差的模型可能无法达到预期效果。)
				</span>
			</p>
		</div>
	)
}
