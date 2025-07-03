import { ApiConfiguration } from "@shared/api"
import { VSCodeCheckbox, VSCodeDropdown, VSCodeOption, VSCodeLink } from "@vscode/webview-ui-toolkit/react"
import { DebouncedTextField } from "../common/DebouncedTextField"
import { DropdownContainer } from "../common/ModelSelector"
import { useState } from "react"
import { getOpenRouterAuthUrl } from "../utils/providerUtils"
import { useOpenRouterKeyInfo } from "../../ui/hooks/useOpenRouterKeyInfo"
import VSCodeButtonLink from "../../common/VSCodeButtonLink"
import OpenRouterModelPicker, { OPENROUTER_MODEL_PICKER_Z_INDEX } from "../OpenRouterModelPicker"
import { formatPrice } from "../utils/pricingUtils"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { useApiConfigurationHandlers } from "../utils/useApiConfigurationHandlers"

/**
 * Component to display OpenRouter balance information
 */
const OpenRouterBalanceDisplay = ({ apiKey }: { apiKey: string }) => {
	const { data: keyInfo, isLoading, error } = useOpenRouterKeyInfo(apiKey)

	if (isLoading) {
		return <span style={{ fontSize: "12px", color: "var(--vscode-descriptionForeground)" }}>加载中...</span>
	}

	if (error || !keyInfo || keyInfo.limit === null) {
		// Don't show anything if there's an error, no info, or no limit set
		return null
	}

	// Calculate remaining balance
	const remainingBalance = keyInfo.limit - keyInfo.usage
	const formattedBalance = formatPrice(remainingBalance)

	return (
		<VSCodeLink
			href="https://openrouter.ai/settings/keys"
			title={`Remaining balance: ${formattedBalance}\nLimit: ${formatPrice(keyInfo.limit)}\nUsage: ${formatPrice(keyInfo.usage)}`}
			style={{
				fontSize: "12px",
				color: "var(--vscode-foreground)",
				textDecoration: "none",
				fontWeight: 500,
				paddingLeft: 4,
				cursor: "pointer",
			}}>
			余额: {formattedBalance}
		</VSCodeLink>
	)
}

/**
 * Props for the OpenRouterProvider component
 */
interface OpenRouterProviderProps {
	showModelOptions: boolean
	isPopup?: boolean
	uriScheme?: string
}

/**
 * The OpenRouter provider configuration component
 */
export const OpenRouterProvider = ({ showModelOptions, isPopup, uriScheme }: OpenRouterProviderProps) => {
	const { apiConfiguration } = useExtensionState()
	const { handleFieldChange } = useApiConfigurationHandlers()

	const [providerSortingSelected, setProviderSortingSelected] = useState(!!apiConfiguration?.openRouterProviderSorting)

	return (
		<div>
			<div>
				<DebouncedTextField
					initialValue={apiConfiguration?.openRouterApiKey || ""}
					onChange={(value) => handleFieldChange("openRouterApiKey", value)}
					style={{ width: "100%" }}
					type="password"
					placeholder="Enter API Key...">
					<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
						<span style={{ fontWeight: 500 }}>OpenRouter API Key</span>
						{apiConfiguration?.openRouterApiKey && (
							<OpenRouterBalanceDisplay apiKey={apiConfiguration.openRouterApiKey} />
						)}
					</div>
				</DebouncedTextField>
				{!apiConfiguration?.openRouterApiKey && (
					<VSCodeButtonLink
						href={getOpenRouterAuthUrl(uriScheme)}
						style={{ margin: "5px 0 0 0" }}
						appearance="secondary">
						获取 OpenRouter API Key
					</VSCodeButtonLink>
				)}
				<p
					style={{
						fontSize: "12px",
						marginTop: "5px",
						color: "var(--vscode-descriptionForeground)",
					}}>
					此密钥存储在本地，仅用于从此扩展发出 API 请求。
				</p>
			</div>

			{showModelOptions && (
				<>
					<VSCodeCheckbox
						style={{ marginTop: -10 }}
						checked={providerSortingSelected}
						onChange={(e: any) => {
							const isChecked = e.target.checked === true
							setProviderSortingSelected(isChecked)
							if (!isChecked) {
								handleFieldChange("openRouterProviderSorting", "")
							}
						}}>
						对底层提供商路由进行排序
					</VSCodeCheckbox>

					{providerSortingSelected && (
						<div style={{ marginBottom: -6 }}>
							<DropdownContainer className="dropdown-container" zIndex={OPENROUTER_MODEL_PICKER_Z_INDEX + 1}>
								<VSCodeDropdown
									style={{ width: "100%", marginTop: 3 }}
									value={apiConfiguration?.openRouterProviderSorting}
									onChange={(e: any) => {
										handleFieldChange("openRouterProviderSorting", e.target.value)
									}}>
									<VSCodeOption value="">默认</VSCodeOption>
									<VSCodeOption value="price">价格</VSCodeOption>
									<VSCodeOption value="throughput">吞吐量</VSCodeOption>
									<VSCodeOption value="latency">响应时间</VSCodeOption>
								</VSCodeDropdown>
							</DropdownContainer>
							<p style={{ fontSize: "12px", marginTop: 3, color: "var(--vscode-descriptionForeground)" }}>
								{!apiConfiguration?.openRouterProviderSorting &&
									"默认行为是跨提供商（如 AWS、Google Vertex、Anthropic）对请求进行负载平衡，优先考虑价格，同时考虑提供商的正常运行时间"}
								{apiConfiguration?.openRouterProviderSorting === "price" &&
									"按价格对供应商进行排序，优先选择成本最低的供应商"}
								{apiConfiguration?.openRouterProviderSorting === "throughput" &&
									"按吞吐量对提供商进行排序，优先考虑吞吐量最高的提供商（可能会增加成本）"}
								{apiConfiguration?.openRouterProviderSorting === "latency" &&
									"按响应时间对提供商进行排序，优先选择延迟最低的提供商"}
							</p>
						</div>
					)}

					<OpenRouterModelPicker isPopup={isPopup} />
				</>
			)}
		</div>
	)
}
