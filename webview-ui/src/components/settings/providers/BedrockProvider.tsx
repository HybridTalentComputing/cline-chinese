import { bedrockDefaultModelId, bedrockModels } from "@shared/api"
import { VSCodeCheckbox, VSCodeDropdown, VSCodeOption, VSCodeRadio, VSCodeRadioGroup } from "@vscode/webview-ui-toolkit/react"
import { useState } from "react"
import { DebouncedTextField } from "../common/DebouncedTextField"
import { ModelInfoView } from "../common/ModelInfoView"
import { DropdownContainer } from "../common/ModelSelector"
import ThinkingBudgetSlider from "../ThinkingBudgetSlider"
import { normalizeApiConfiguration } from "../utils/providerUtils"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { useApiConfigurationHandlers } from "../utils/useApiConfigurationHandlers"

// Z-index constants for proper dropdown layering
const DROPDOWN_Z_INDEX = 1000

interface BedrockProviderProps {
	showModelOptions: boolean
	isPopup?: boolean
}

export const BedrockProvider = ({ showModelOptions, isPopup }: BedrockProviderProps) => {
	const { apiConfiguration } = useExtensionState()
	const { handleFieldChange, handleFieldsChange } = useApiConfigurationHandlers()

	const { selectedModelId, selectedModelInfo } = normalizeApiConfiguration(apiConfiguration)
	const [awsEndpointSelected, setAwsEndpointSelected] = useState(!!apiConfiguration?.awsBedrockEndpoint)

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				gap: 5,
			}}>
			<VSCodeRadioGroup
				value={apiConfiguration?.awsUseProfile ? "profile" : "credentials"}
				onChange={(e) => {
					const value = (e.target as HTMLInputElement)?.value
					const useProfile = value === "profile"

					handleFieldChange("awsUseProfile", useProfile)
				}}>
				<VSCodeRadio value="credentials">AWS 凭证</VSCodeRadio>
				<VSCodeRadio value="profile">AWS 账号</VSCodeRadio>
			</VSCodeRadioGroup>

			{apiConfiguration?.awsUseProfile ? (
				<DebouncedTextField
					initialValue={apiConfiguration?.awsProfile || ""}
					onChange={(value) => handleFieldChange("awsProfile", value)}
					style={{ width: "100%" }}
					placeholder="Enter profile name (default if empty)">
					<span style={{ fontWeight: 500 }}>AWS 账户名</span>
				</DebouncedTextField>
			) : (
				<>
					<DebouncedTextField
						initialValue={apiConfiguration?.awsAccessKey || ""}
						onChange={(value) => handleFieldChange("awsAccessKey", value)}
						style={{ width: "100%" }}
						type="password"
						placeholder="Enter Access Key...">
						<span style={{ fontWeight: 500 }}>AWS Access Key</span>
					</DebouncedTextField>
					<DebouncedTextField
						initialValue={apiConfiguration?.awsSecretKey || ""}
						onChange={(value) => handleFieldChange("awsSecretKey", value)}
						style={{ width: "100%" }}
						type="password"
						placeholder="Enter Secret Key...">
						<span style={{ fontWeight: 500 }}>AWS Secret Key</span>
					</DebouncedTextField>
					<DebouncedTextField
						initialValue={apiConfiguration?.awsSessionToken || ""}
						onChange={(value) => handleFieldChange("awsSessionToken", value)}
						style={{ width: "100%" }}
						type="password"
						placeholder="Enter Session Token...">
						<span style={{ fontWeight: 500 }}>AWS Session Token</span>
					</DebouncedTextField>
				</>
			)}

			<DropdownContainer zIndex={DROPDOWN_Z_INDEX - 1} className="dropdown-container">
				<label htmlFor="aws-region-dropdown">
					<span style={{ fontWeight: 500 }}>AWS Region</span>
				</label>
				<VSCodeDropdown
					id="aws-region-dropdown"
					value={apiConfiguration?.awsRegion || ""}
					style={{ width: "100%" }}
					onChange={(e: any) => handleFieldChange("awsRegion", e.target.value)}>
					<VSCodeOption value="">Select a region...</VSCodeOption>
					{/* The user will have to choose a region that supports the model they use, but this shouldn't be a problem since they'd have to request access for it in that region in the first place. */}
					<VSCodeOption value="us-east-1">us-east-1</VSCodeOption>
					<VSCodeOption value="us-east-2">us-east-2</VSCodeOption>
					{/* <VSCodeOption value="us-west-1">us-west-1</VSCodeOption> */}
					<VSCodeOption value="us-west-2">us-west-2</VSCodeOption>
					{/* <VSCodeOption value="af-south-1">af-south-1</VSCodeOption> */}
					{/* <VSCodeOption value="ap-east-1">ap-east-1</VSCodeOption> */}
					<VSCodeOption value="ap-south-1">ap-south-1</VSCodeOption>
					<VSCodeOption value="ap-northeast-1">ap-northeast-1</VSCodeOption>
					<VSCodeOption value="ap-northeast-2">ap-northeast-2</VSCodeOption>
					<VSCodeOption value="ap-northeast-3">ap-northeast-3</VSCodeOption>
					<VSCodeOption value="ap-southeast-1">ap-southeast-1</VSCodeOption>
					<VSCodeOption value="ap-southeast-2">ap-southeast-2</VSCodeOption>
					<VSCodeOption value="ca-central-1">ca-central-1</VSCodeOption>
					<VSCodeOption value="eu-central-1">eu-central-1</VSCodeOption>
					<VSCodeOption value="eu-central-2">eu-central-2</VSCodeOption>
					<VSCodeOption value="eu-west-1">eu-west-1</VSCodeOption>
					<VSCodeOption value="eu-west-2">eu-west-2</VSCodeOption>
					<VSCodeOption value="eu-west-3">eu-west-3</VSCodeOption>
					<VSCodeOption value="eu-north-1">eu-north-1</VSCodeOption>
					<VSCodeOption value="eu-south-1">eu-south-1</VSCodeOption>
					<VSCodeOption value="eu-south-2">eu-south-2</VSCodeOption>
					{/* <VSCodeOption value="me-south-1">me-south-1</VSCodeOption> */}
					<VSCodeOption value="sa-east-1">sa-east-1</VSCodeOption>
					<VSCodeOption value="us-gov-east-1">us-gov-east-1</VSCodeOption>
					<VSCodeOption value="us-gov-west-1">us-gov-west-1</VSCodeOption>
					{/* <VSCodeOption value="us-gov-east-1">us-gov-east-1</VSCodeOption> */}
				</VSCodeDropdown>
			</DropdownContainer>

			<div style={{ display: "flex", flexDirection: "column" }}>
				<VSCodeCheckbox
					checked={awsEndpointSelected}
					onChange={(e: any) => {
						const isChecked = e.target.checked === true
						setAwsEndpointSelected(isChecked)
						if (!isChecked) {
							handleFieldChange("awsBedrockEndpoint", "")
						}
					}}>
					使用自定义 VPC 接口
				</VSCodeCheckbox>

				{awsEndpointSelected && (
					<DebouncedTextField
						initialValue={apiConfiguration?.awsBedrockEndpoint || ""}
						onChange={(value) => handleFieldChange("awsBedrockEndpoint", value)}
						style={{ width: "100%", marginTop: 3, marginBottom: 5 }}
						type="url"
						placeholder="Enter VPC Endpoint URL (optional)"
					/>
				)}

				<VSCodeCheckbox
					checked={apiConfiguration?.awsUseCrossRegionInference || false}
					onChange={(e: any) => {
						const isChecked = e.target.checked === true

						handleFieldChange("awsUseCrossRegionInference", isChecked)
					}}>
					使用跨地区推理
				</VSCodeCheckbox>

				{selectedModelInfo.supportsPromptCache && (
					<>
						<VSCodeCheckbox
							checked={apiConfiguration?.awsBedrockUsePromptCache || false}
							onChange={(e: any) => {
								const isChecked = e.target.checked === true
								handleFieldChange("awsBedrockUsePromptCache", isChecked)
							}}>
							使用提示词缓存
						</VSCodeCheckbox>
					</>
				)}
			</div>

			<p
				style={{
					fontSize: "12px",
					marginTop: "5px",
					color: "var(--vscode-descriptionForeground)",
				}}>
				{apiConfiguration?.awsUseProfile ? (
					<>
						使用来自 ~/.aws/credentials 的 AWS
						配置文件凭证。将配置文件名称留空即可使用默认配置文件。这些凭证仅在本地用于从此扩展程序发出 API 请求。
					</>
				) : (
					<>
						通过提供上述密钥或使用默认 AWS 凭证提供程序（即 ~/.aws/credentials
						或环境变量）进行身份验证。这些凭证仅在本地用于从此扩展程序发出 API 请求。
					</>
				)}
			</p>

			{showModelOptions && (
				<>
					<label htmlFor="bedrock-model-dropdown">
						<span style={{ fontWeight: 500 }}>模型</span>
					</label>
					<DropdownContainer zIndex={DROPDOWN_Z_INDEX - 2} className="dropdown-container">
						<VSCodeDropdown
							id="bedrock-model-dropdown"
							value={apiConfiguration?.awsBedrockCustomSelected ? "custom" : selectedModelId}
							onChange={(e: any) => {
								const isCustom = e.target.value === "custom"

								handleFieldsChange({
									apiModelId: isCustom ? "" : e.target.value,
									awsBedrockCustomSelected: isCustom,
									awsBedrockCustomModelBaseId: bedrockDefaultModelId,
								})
							}}
							style={{ width: "100%" }}>
							<VSCodeOption value="">选择模型...</VSCodeOption>
							{Object.keys(bedrockModels).map((modelId) => (
								<VSCodeOption
									key={modelId}
									value={modelId}
									style={{
										whiteSpace: "normal",
										wordWrap: "break-word",
										maxWidth: "100%",
									}}>
									{modelId}
								</VSCodeOption>
							))}
							<VSCodeOption value="custom">自定义</VSCodeOption>
						</VSCodeDropdown>
					</DropdownContainer>

					{apiConfiguration?.awsBedrockCustomSelected && (
						<div>
							<p
								style={{
									fontSize: "12px",
									marginTop: "5px",
									color: "var(--vscode-descriptionForeground)",
								}}>
								在 Bedrock 中使用应用程序推理配置文件时，请选择“自定义”。在“模型 ID”字段中输入应用程序推理配置文件
								ARN。
							</p>
							<DebouncedTextField
								id="bedrock-model-input"
								initialValue={apiConfiguration?.apiModelId || ""}
								onChange={(value) => handleFieldChange("apiModelId", value)}
								style={{ width: "100%", marginTop: 3 }}
								placeholder="Enter custom model ID...">
								<span style={{ fontWeight: 500 }}>模型 ID</span>
							</DebouncedTextField>
							<label htmlFor="bedrock-base-model-dropdown">
								<span style={{ fontWeight: 500 }}>基本推理模型</span>
							</label>
							<DropdownContainer zIndex={DROPDOWN_Z_INDEX - 3} className="dropdown-container">
								<VSCodeDropdown
									id="bedrock-base-model-dropdown"
									value={apiConfiguration?.awsBedrockCustomModelBaseId || bedrockDefaultModelId}
									onChange={(e: any) => handleFieldChange("awsBedrockCustomModelBaseId", e.target.value)}
									style={{ width: "100%" }}>
									<VSCodeOption value="">Select a model...</VSCodeOption>
									{Object.keys(bedrockModels).map((modelId) => (
										<VSCodeOption
											key={modelId}
											value={modelId}
											style={{
												whiteSpace: "normal",
												wordWrap: "break-word",
												maxWidth: "100%",
											}}>
											{modelId}
										</VSCodeOption>
									))}
								</VSCodeDropdown>
							</DropdownContainer>
						</div>
					)}

					{(selectedModelId === "anthropic.claude-3-7-sonnet-20250219-v1:0" ||
						selectedModelId === "anthropic.claude-sonnet-4-20250514-v1:0" ||
						selectedModelId === "anthropic.claude-opus-4-20250514-v1:0" ||
						(apiConfiguration?.awsBedrockCustomSelected &&
							apiConfiguration?.awsBedrockCustomModelBaseId === "anthropic.claude-3-7-sonnet-20250219-v1:0") ||
						(apiConfiguration?.awsBedrockCustomSelected &&
							apiConfiguration?.awsBedrockCustomModelBaseId === "anthropic.claude-sonnet-4-20250514-v1:0") ||
						(apiConfiguration?.awsBedrockCustomSelected &&
							apiConfiguration?.awsBedrockCustomModelBaseId === "anthropic.claude-opus-4-20250514-v1:0")) && (
						<ThinkingBudgetSlider />
					)}

					<ModelInfoView selectedModelId={selectedModelId} modelInfo={selectedModelInfo} isPopup={isPopup} />
				</>
			)}
		</div>
	)
}
