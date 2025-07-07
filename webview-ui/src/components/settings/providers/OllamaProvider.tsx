import { VSCodeLink } from "@vscode/webview-ui-toolkit/react"
import { useState, useCallback, useEffect } from "react"
import { useInterval } from "react-use"
import { DebouncedTextField } from "../common/DebouncedTextField"
import { ModelsServiceClient } from "@/services/grpc-client"
import { StringRequest } from "@shared/proto/common"
import OllamaModelPicker from "../OllamaModelPicker"
import { BaseUrlField } from "../common/BaseUrlField"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { useApiConfigurationHandlers } from "../utils/useApiConfigurationHandlers"

/**
 * Props for the OllamaProvider component
 */
interface OllamaProviderProps {
	showModelOptions: boolean
	isPopup?: boolean
}

/**
 * The Ollama provider configuration component
 */
export const OllamaProvider = ({ showModelOptions, isPopup }: OllamaProviderProps) => {
	const { apiConfiguration } = useExtensionState()
	const { handleFieldChange } = useApiConfigurationHandlers()

	const [ollamaModels, setOllamaModels] = useState<string[]>([])

	// Poll ollama models
	const requestOllamaModels = useCallback(async () => {
		try {
			const response = await ModelsServiceClient.getOllamaModels(
				StringRequest.create({
					value: apiConfiguration?.ollamaBaseUrl || "",
				}),
			)
			if (response && response.values) {
				setOllamaModels(response.values)
			}
		} catch (error) {
			console.error("Failed to fetch Ollama models:", error)
			setOllamaModels([])
		}
	}, [apiConfiguration?.ollamaBaseUrl])

	useEffect(() => {
		requestOllamaModels()
	}, [requestOllamaModels])

	useInterval(requestOllamaModels, 2000)

	return (
		<div>
			<BaseUrlField
				initialValue={apiConfiguration?.ollamaBaseUrl}
				onChange={(value) => handleFieldChange("ollamaBaseUrl", value)}
				placeholder="Default: http://localhost:11434"
				label="自定义 URL"
			/>

			{/* Model selection - use filterable picker */}
			<label htmlFor="ollama-model-selection">
				<span style={{ fontWeight: 500 }}>模型</span>
			</label>
			<OllamaModelPicker
				ollamaModels={ollamaModels}
				selectedModelId={apiConfiguration?.ollamaModelId || ""}
				onModelChange={(modelId) => {
					handleFieldChange("ollamaModelId", modelId)
				}}
				placeholder={ollamaModels.length > 0 ? "搜索选择模型..." : "e.g. llama3.1"}
			/>

			{/* Show status message based on model availability */}
			{ollamaModels.length === 0 && (
				<p
					style={{
						fontSize: "12px",
						marginTop: "3px",
						color: "var(--vscode-descriptionForeground)",
						fontStyle: "italic",
					}}>
					无法从 Ollama 服务器获取模型。请确保 Ollama 正在运行且可访问，或者在上方手动输入模型 ID。
				</p>
			)}

			<DebouncedTextField
				initialValue={apiConfiguration?.ollamaApiOptionsCtxNum || "32768"}
				onChange={(value) => handleFieldChange("ollamaApiOptionsCtxNum", value)}
				style={{ width: "100%" }}
				placeholder={"e.g. 32768"}>
				<span style={{ fontWeight: 500 }}>输入窗口大小</span>
			</DebouncedTextField>

			{showModelOptions && (
				<>
					<DebouncedTextField
						initialValue={apiConfiguration?.requestTimeoutMs ? apiConfiguration.requestTimeoutMs.toString() : "30000"}
						onChange={(value) => {
							// Convert to number, with validation
							const numValue = parseInt(value, 10)
							if (!isNaN(numValue) && numValue > 0) {
								handleFieldChange("requestTimeoutMs", numValue)
							}
						}}
						style={{ width: "100%" }}
						placeholder="Default: 30000 (30 seconds)">
						<span style={{ fontWeight: 500 }}>请求超时 (ms)</span>
					</DebouncedTextField>
					<p style={{ fontSize: "12px", marginTop: 3, color: "var(--vscode-descriptionForeground)" }}>
						超时前等待 API 响应的最长时间（以毫秒为单位）。
					</p>
				</>
			)}

			<p
				style={{
					fontSize: "12px",
					marginTop: "5px",
					color: "var(--vscode-descriptionForeground)",
				}}>
				Ollama 允许您在计算机上本地运行模型。有关如何开始使用的说明，请参阅他们的{" "}
				<VSCodeLink
					href="https://github.com/ollama/ollama/blob/main/README.md"
					style={{ display: "inline", fontSize: "inherit" }}>
					快速入门指南.
				</VSCodeLink>{" "}
				<span style={{ color: "var(--vscode-errorForeground)" }}>
					(<span style={{ fontWeight: 500 }}>注意:</span> Cline 使用复杂的提示，与 Claude
					模型配合使用效果最佳。性能较差的模型可能无法达到预期效果。)
				</span>
			</p>
		</div>
	)
}
