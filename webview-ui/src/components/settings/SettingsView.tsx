import {
	VSCodeButton,
	VSCodeCheckbox,
	VSCodeDropdown,
	VSCodeLink,
	VSCodeOption,
	VSCodeTextArea,
} from "@vscode/webview-ui-toolkit/react"
import { memo, useCallback, useEffect, useState } from "react"
import PreferredLanguageSetting from "./PreferredLanguageSetting" // 已添加导入
import { OpenAIReasoningEffort } from "@shared/ChatSettings"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { validateApiConfiguration, validateModelId } from "@/utils/validate"
import { vscode } from "@/utils/vscode"
import SettingsButton from "@/components/common/SettingsButton"
import ApiOptions from "./ApiOptions"
import { TabButton } from "../mcp/configuration/McpConfigurationView"
import { useEvent } from "react-use"
import { ExtensionMessage } from "@shared/ExtensionMessage"
import { StateServiceClient } from "@/services/grpc-client"
import FeatureSettingsSection from "./FeatureSettingsSection"
import BrowserSettingsSection from "./BrowserSettingsSection"
import TerminalSettingsSection from "./TerminalSettingsSection"
import { FEATURE_FLAGS } from "@shared/services/feature-flags/feature-flags"
const { IS_DEV } = process.env

type SettingsViewProps = {
	onDone: () => void
}

const SettingsView = ({ onDone }: SettingsViewProps) => {
	const {
		apiConfiguration,
		version,
		customInstructions,
		setCustomInstructions,
		openRouterModels,
		telemetrySetting,
		setTelemetrySetting,
		chatSettings,
		setChatSettings,
		planActSeparateModelsSetting,
		setPlanActSeparateModelsSetting,
		enableCheckpointsSetting,
		mcpMarketplaceEnabled,
	} = useExtensionState()
	const [apiErrorMessage, setApiErrorMessage] = useState<string | undefined>(undefined)
	const [modelIdErrorMessage, setModelIdErrorMessage] = useState<string | undefined>(undefined)
	const [pendingTabChange, setPendingTabChange] = useState<"plan" | "act" | null>(null)

	const handleSubmit = (withoutDone: boolean = false) => {
		const apiValidationResult = validateApiConfiguration(apiConfiguration)
		const modelIdValidationResult = validateModelId(apiConfiguration, openRouterModels)

		// setApiErrorMessage(apiValidationResult)
		// setModelIdErrorMessage(modelIdValidationResult)

		let apiConfigurationToSubmit = apiConfiguration
		if (!apiValidationResult && !modelIdValidationResult) {
			// vscode.postMessage({ type: "apiConfiguration", apiConfiguration })
			// vscode.postMessage({
			// 	type: "customInstructions",
			// 	text: customInstructions,
			// })
			// vscode.postMessage({
			// 	type: "telemetrySetting",
			// 	text: telemetrySetting,
			// })
			// console.log("handleSubmit", withoutDone)
			// vscode.postMessage({
			// 	type: "separateModeSetting",
			// 	text: separateModeSetting,
			// })
		} else {
			// 如果 API 配置无效，则不保存
			apiConfigurationToSubmit = undefined
		}

		vscode.postMessage({
			type: "updateSettings",
			planActSeparateModelsSetting,
			customInstructionsSetting: customInstructions,
			telemetrySetting,
			enableCheckpointsSetting,
			mcpMarketplaceEnabled,
			apiConfiguration: apiConfigurationToSubmit,
		})

		if (!withoutDone) {
			onDone()
		}
	}

	useEffect(() => {
		setApiErrorMessage(undefined)
		setModelIdErrorMessage(undefined)
	}, [apiConfiguration])

	// 组件挂载后立即进行验证
	/*
	useEffect 如果其依赖项数组中未包含某些变量，则会使用这些变量的陈旧值。
	因此，举例来说，尝试使用仅包含一个值的依赖项数组的 useEffect 将会使用任何其他变量的旧值。
	在大多数情况下，您不希望这样做，而应选择使用 react-use 钩子。
    
		// 使用 someVar 和 anotherVar
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [someVar])
	如果我们只想在挂载时运行一次代码，可以使用 react-use 的 useEffectOnce 或 useMount
	*/

	const handleMessage = useCallback(
		(event: MessageEvent) => {
			const message: ExtensionMessage = event.data
			switch (message.type) {
				case "didUpdateSettings":
					if (pendingTabChange) {
						vscode.postMessage({
							type: "togglePlanActMode",
							chatSettings: {
								mode: pendingTabChange,
							},
						})
						setPendingTabChange(null)
					}
					break
				case "scrollToSettings":
					setTimeout(() => {
						const elementId = message.text
						if (elementId) {
							const element = document.getElementById(elementId)
							if (element) {
								element.scrollIntoView({ behavior: "smooth" })

								element.style.transition = "background-color 0.5s ease"
								element.style.backgroundColor = "var(--vscode-textPreformat-background)"

								setTimeout(() => {
									element.style.backgroundColor = "transparent"
								}, 1200)
							}
						}
					}, 300)
					break
			}
		},
		[pendingTabChange],
	)

	useEvent("message", handleMessage)

	const handleResetState = async () => {
		try {
			await StateServiceClient.resetState({})
		} catch (error) {
			console.error("Failed to reset state:", error) // 日志信息保持英文
		}
	}

	const handleTabChange = (tab: "plan" | "act") => {
		if (tab === chatSettings.mode) {
			return
		}
		setPendingTabChange(tab)
		handleSubmit(true)
	}

	return (
		<div className="fixed top-0 left-0 right-0 bottom-0 pt-[10px] pr-0 pb-0 pl-5 flex flex-col overflow-hidden">
			<div className="flex justify-between items-center mb-[13px] pr-[17px]">
				<h3 className="text-[var(--vscode-foreground)] m-0">设置</h3>
				<VSCodeButton onClick={() => handleSubmit(false)}>保存</VSCodeButton>
			</div>
			<div className="grow overflow-y-scroll pr-2 flex flex-col">
				{/* 标签页容器 */}
				{planActSeparateModelsSetting ? (
					<div className="border border-solid border-[var(--vscode-panel-border)] rounded-md p-[10px] mb-5 bg-[var(--vscode-panel-background)]">
						<div className="flex gap-[1px] mb-[10px] -mt-2 border-0 border-b border-solid border-[var(--vscode-panel-border)]">
							<TabButton isActive={chatSettings.mode === "plan"} onClick={() => handleTabChange("plan")}>
								计划模式
							</TabButton>
							<TabButton isActive={chatSettings.mode === "act"} onClick={() => handleTabChange("act")}>
								执行模式
							</TabButton>
						</div>

						{/* 内容容器 */}
						<div className="-mb-3">
							<ApiOptions
								key={chatSettings.mode}
								showModelOptions={true}
								apiErrorMessage={apiErrorMessage}
								modelIdErrorMessage={modelIdErrorMessage}
							/>
						</div>
					</div>
				) : (
					<ApiOptions
						key={"single"}
						showModelOptions={true}
						apiErrorMessage={apiErrorMessage}
						modelIdErrorMessage={modelIdErrorMessage}
					/>
				)}

				<div className="mb-[5px]">
					<VSCodeTextArea
						value={customInstructions ?? ""}
						className="w-full"
						resize="vertical"
						rows={4}
						placeholder={'例如："在最后运行单元测试"，"使用 TypeScript 和 async/await"，"用西班牙语交流"'}
						onInput={(e: any) => setCustomInstructions(e.target?.value ?? "")}>
						<span className="font-medium">自定义指令</span>
					</VSCodeTextArea>
					<p className="text-xs mt-[5px] text-[var(--vscode-descriptionForeground)]">
						这些指令会添加到每个请求发送的系统提示的末尾。
					</p>
				</div>

				{chatSettings && <PreferredLanguageSetting chatSettings={chatSettings} setChatSettings={setChatSettings} />}

				<div className="mb-[5px]">
					<VSCodeCheckbox
						className="mb-[5px]"
						checked={planActSeparateModelsSetting}
						onChange={(e: any) => {
							const checked = e.target.checked === true
							setPlanActSeparateModelsSetting(checked)
						}}>
						为计划模式和执行模式使用不同模型
					</VSCodeCheckbox>
					<p className="text-xs mt-[5px] text-[var(--vscode-descriptionForeground)]">
						在计划模式和执行模式之间切换将会保留先前模式中使用的 API 和模型。例如，当使用强大的推理模型来规划架构，然后让较便宜的编码模型来执行时，这可能很有用。
					</p>
				</div>

				<div className="mb-[5px]">
					<VSCodeCheckbox
						className="mb-[5px]"
						checked={telemetrySetting === "enabled"}
						onChange={(e: any) => {
							const checked = e.target.checked === true
							setTelemetrySetting(checked ? "enabled" : "disabled")
						}}>
						允许匿名错误和使用情况报告
					</VSCodeCheckbox>
					<p className="text-xs mt-[5px] text-[var(--vscode-descriptionForeground)]">
						通过发送匿名使用数据和错误报告来帮助改进 Cline。绝不会发送任何代码、提示或个人信息。有关更多详细信息，请参阅我们的{" "}
						<VSCodeLink href="https://docs.cline.bot/more-info/telemetry" className="text-inherit">
							遥测概述
						</VSCodeLink>{" "}
						和{" "}
						<VSCodeLink href="https://cline.bot/privacy" className="text-inherit">
							隐私政策
						</VSCodeLink>
						。
					</p>
				</div>

				{/* 功能设置区域 */}
				<FeatureSettingsSection />

				{/* 浏览器设置区域 */}
				<BrowserSettingsSection />

				{/* 终端设置区域 */}
				<TerminalSettingsSection />

				{IS_DEV && (
					<>
						<div className="mt-[10px] mb-1">调试</div>
						<VSCodeButton
							onClick={handleResetState}
							className="mt-[5px] w-auto"
							style={{ backgroundColor: "var(--vscode-errorForeground)", color: "black" }}>
							重置状态
						</VSCodeButton>
						<p className="text-xs mt-[5px] text-[var(--vscode-descriptionForeground)]">
							这将重置扩展中的所有全局状态和密钥存储。
						</p>
					</>
				)}

				<div className="text-center text-[var(--vscode-descriptionForeground)] text-xs leading-[1.2] px-0 py-0 pr-2 pb-[15px] mt-auto">
					<p className="break-words m-0 p-0">
						如果您有任何问题或反馈，请随时在{" "}
						<VSCodeLink href="https://github.com/cline/cline" className="inline">
							https://github.com/cline/cline
						</VSCodeLink>{" "}
						上提交问题。
					</p>
					<p className="italic mt-[10px] mb-0 p-0">v{version}</p>
				</div>
			</div>
		</div>
	)
}

export default memo(SettingsView)
