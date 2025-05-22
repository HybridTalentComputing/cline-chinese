import React, { useRef, useState, useEffect } from "react"
import { useClickAway, useWindowSize } from "react-use"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { CODE_BLOCK_BG_COLOR } from "@/components/common/CodeBlock"
import { vscode } from "@/utils/vscode"
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react"
import RulesToggleList from "./RulesToggleList"
import Tooltip from "@/components/common/Tooltip"
import styled from "styled-components"

const ClineRulesToggleModal: React.FC = () => {
	const {
		globalClineRulesToggles = {},
		localClineRulesToggles = {},
		localCursorRulesToggles = {},
		localWindsurfRulesToggles = {},
		workflowToggles = {},
	} = useExtensionState()
	const [isVisible, setIsVisible] = useState(false)
	const buttonRef = useRef<HTMLDivElement>(null)
	const modalRef = useRef<HTMLDivElement>(null)
	const { width: viewportWidth, height: viewportHeight } = useWindowSize()
	const [arrowPosition, setArrowPosition] = useState(0)
	const [menuPosition, setMenuPosition] = useState(0)
	const [currentView, setCurrentView] = useState<"rules" | "workflows">("rules")

	useEffect(() => {
		if (isVisible) {
			vscode.postMessage({ type: "refreshClineRules" })
		}
	}, [isVisible])

	// Format global rules for display with proper typing
	const globalRules = Object.entries(globalClineRulesToggles || {})
		.map(([path, enabled]): [string, boolean] => [path, enabled as boolean])
		.sort(([a], [b]) => a.localeCompare(b))

	// Format local rules for display with proper typing
	const localRules = Object.entries(localClineRulesToggles || {})
		.map(([path, enabled]): [string, boolean] => [path, enabled as boolean])
		.sort(([a], [b]) => a.localeCompare(b))

	const cursorRules = Object.entries(localCursorRulesToggles || {})
		.map(([path, enabled]): [string, boolean] => [path, enabled as boolean])
		.sort(([a], [b]) => a.localeCompare(b))

	const windsurfRules = Object.entries(localWindsurfRulesToggles || {})
		.map(([path, enabled]): [string, boolean] => [path, enabled as boolean])
		.sort(([a], [b]) => a.localeCompare(b))

	const workflows = Object.entries(workflowToggles || {})
		.map(([path, enabled]): [string, boolean] => [path, enabled as boolean])
		.sort(([a], [b]) => a.localeCompare(b))

	// Handle toggle rule
	const toggleRule = (isGlobal: boolean, rulePath: string, enabled: boolean) => {
		vscode.postMessage({
			type: "toggleClineRule",
			isGlobal,
			rulePath,
			enabled,
		})
	}

	const toggleCursorRule = (rulePath: string, enabled: boolean) => {
		vscode.postMessage({
			type: "toggleCursorRule",
			rulePath,
			enabled,
		})
	}

	const toggleWindsurfRule = (rulePath: string, enabled: boolean) => {
		vscode.postMessage({
			type: "toggleWindsurfRule",
			rulePath,
			enabled,
		})
	}

	const toggleWorkflow = (workflowPath: string, enabled: boolean) => {
		vscode.postMessage({
			type: "toggleWorkflow",
			workflowPath,
			enabled,
		})
	}

	// Close modal when clicking outside
	useClickAway(modalRef, () => {
		setIsVisible(false)
	})

	// Calculate positions for modal and arrow
	useEffect(() => {
		if (isVisible && buttonRef.current) {
			const buttonRect = buttonRef.current.getBoundingClientRect()
			const buttonCenter = buttonRect.left + buttonRect.width / 2
			const rightPosition = document.documentElement.clientWidth - buttonCenter - 5

			setArrowPosition(rightPosition)
			setMenuPosition(buttonRect.top + 1)
		}
	}, [isVisible, viewportWidth, viewportHeight])

	return (
		<div ref={modalRef}>
			<div ref={buttonRef} className="inline-flex min-w-0 max-w-full">
				<Tooltip tipText="管理 Cline 规则和工作流" visible={isVisible ? false : undefined}>
					<VSCodeButton
						appearance="icon"
						aria-label="Cline 规则"
						onClick={() => setIsVisible(!isVisible)}
						style={{ padding: "0px 0px", height: "20px" }}>
						<div className="flex items-center gap-1 text-xs whitespace-nowrap min-w-0 w-full">
							<span
								className="codicon codicon-law flex items-center"
								style={{ fontSize: "12.5px", marginBottom: 1 }}
							/>
						</div>
					</VSCodeButton>
				</Tooltip>
			</div>

			{isVisible && (
				<div
					className="fixed left-[15px] right-[15px] border border-[var(--vscode-editorGroup-border)] p-3 rounded z-[1000] overflow-y-auto"
					style={{
						bottom: `calc(100vh - ${menuPosition}px + 6px)`,
						background: CODE_BLOCK_BG_COLOR,
						maxHeight: "calc(100vh - 100px)",
						overscrollBehavior: "contain",
					}}>
					<div
						className="fixed w-[10px] h-[10px] z-[-1] rotate-45 border-r border-b border-[var(--vscode-editorGroup-border)]"
						style={{
							bottom: `calc(100vh - ${menuPosition}px)`,
							right: arrowPosition,
							background: CODE_BLOCK_BG_COLOR,
						}}
					/>

					{/* Tabs container */}
					<div
						style={{
							display: "flex",
							justifyContent: "space-between",
							marginBottom: "10px",
						}}>
						<div
							style={{
								display: "flex",
								gap: "1px",
								borderBottom: "1px solid var(--vscode-panel-border)",
							}}>
							<TabButton isActive={currentView === "rules"} onClick={() => setCurrentView("rules")}>
								规则
							</TabButton>
							<TabButton isActive={currentView === "workflows"} onClick={() => setCurrentView("workflows")}>
								工作流
							</TabButton>
						</div>
					</div>

					{/* Description text */}
					<div className="text-xs text-[var(--vscode-descriptionForeground)] mb-4">
						{currentView === "rules" ? (
							<p>
								规则允许您为 Cline
								提供系统级指导。将它们视为一种持久的方式，以包含项目或每个对话的全局上下文和偏好。
							</p>
						) : (
							<p>
								工作流程允许您定义一系列步骤，以指导Cline完成一系列重复的任务，例如部署服务或提交PR。要调用工作流程，请输入{" "}
								<span
									className=" 
								text-[var(--vscode-foreground)] font-bold">
									/工作流名
								</span>{" "}
								在聊天中。
							</p>
						)}
					</div>

					{currentView === "rules" ? (
						<>
							{/* Global Rules Section */}
							<div className="mb-3">
								<div className="text-sm font-normal mb-2">全局规则</div>
								<RulesToggleList
									rules={globalRules}
									toggleRule={(rulePath, enabled) => toggleRule(true, rulePath, enabled)}
									listGap="small"
									isGlobal={true}
									ruleType={"cline"}
									showNewRule={true}
									showNoRules={false}
								/>
							</div>

							{/* Local Rules Section */}
							<div style={{ marginBottom: -10 }}>
								<div className="text-sm font-normal mb-2">工作区规则</div>
								<RulesToggleList
									rules={localRules}
									toggleRule={(rulePath, enabled) => toggleRule(false, rulePath, enabled)}
									listGap="small"
									isGlobal={false}
									ruleType={"cline"}
									showNewRule={false}
									showNoRules={false}
								/>
								<RulesToggleList
									rules={cursorRules}
									toggleRule={toggleCursorRule}
									listGap="small"
									isGlobal={false}
									ruleType={"cursor"}
									showNewRule={false}
									showNoRules={false}
								/>
								<RulesToggleList
									rules={windsurfRules}
									toggleRule={toggleWindsurfRule}
									listGap="small"
									isGlobal={false}
									ruleType={"windsurf"}
									showNewRule={true}
									showNoRules={false}
								/>
							</div>
						</>
					) : (
						/* Workflows section */
						<div style={{ marginBottom: -10 }}>
							<div className="text-sm font-normal mb-2">工作区工作流</div>
							<RulesToggleList
								rules={workflows}
								toggleRule={toggleWorkflow}
								listGap="small"
								isGlobal={false}
								ruleType={"workflow"}
								showNewRule={true}
								showNoRules={false}
							/>
						</div>
					)}
				</div>
			)}
		</div>
	)
}

const StyledTabButton = styled.button<{ isActive: boolean }>`
	background: none;
	border: none;
	border-bottom: 2px solid ${(props) => (props.isActive ? "var(--vscode-foreground)" : "transparent")};
	color: ${(props) => (props.isActive ? "var(--vscode-foreground)" : "var(--vscode-descriptionForeground)")};
	padding: 8px 16px;
	cursor: pointer;
	font-size: 13px;
	margin-bottom: -1px;
	font-family: inherit;

	&:hover {
		color: var(--vscode-foreground);
	}
`

export const TabButton = ({
	children,
	isActive,
	onClick,
}: {
	children: React.ReactNode
	isActive: boolean
	onClick: () => void
}) => (
	<StyledTabButton isActive={isActive} onClick={onClick}>
		{children}
	</StyledTabButton>
)

export default ClineRulesToggleModal
