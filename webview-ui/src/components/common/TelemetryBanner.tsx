import { VSCodeButton, VSCodeLink } from "@vscode/webview-ui-toolkit/react" // 导入 VSCode UI 组件
import { memo, useState } from "react" // 导入 React 相关钩子和函数
import styled from "styled-components" // 导入 styled-components 用于样式化
import { vscode } from "@/utils/vscode" // 导入 VSCode API 的封装
import { TelemetrySetting } from "@shared/TelemetrySetting" // 导入遥测设置类型

// 横幅容器样式
const BannerContainer = styled.div`
	background-color: var(--vscode-banner-background);
	padding: 12px 20px;
	display: flex;
	flex-direction: column;
	gap: 10px;
	flex-shrink: 0;
	margin-bottom: 6px;
	position: relative;
`

// 关闭按钮样式
const CloseButton = styled.button`
	position: absolute;
	top: 12px;
	right: 12px;
	background: none;
	border: none;
	color: var(--vscode-foreground);
	cursor: pointer;
	font-size: 16px;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 4px;
	opacity: 0.7;
	&:hover {
		opacity: 1;
	}
`

// 按钮容器样式 (在此组件中未使用，但保留定义)
const ButtonContainer = styled.div`
	display: flex;
	gap: 8px;
	width: 100%;

	& > vscode-button {
		flex: 1;
	}
`

// 遥测信息横幅组件
const TelemetryBanner = () => {
	// 处理打开设置的函数
	const handleOpenSettings = () => {
		handleClose() // 关闭横幅（并启用遥测）
		vscode.postMessage({ type: "openSettings" }) // 发送消息打开设置
	}

	// 处理关闭横幅的函数（默认启用遥测）
	const handleClose = () => {
		vscode.postMessage({ type: "telemetrySetting", telemetrySetting: "enabled" satisfies TelemetrySetting }) // 发送消息设置遥测为启用
	}

	return (
		<BannerContainer>
			<CloseButton onClick={handleClose} aria-label="关闭横幅并启用遥测">
				✕
			</CloseButton>
			<div>
				<strong>帮助改进 Cline</strong>
				<i>
					<br />
					（并访问实验性功能）
				</i>
				<div style={{ marginTop: 4 }}>
					Cline 收集匿名错误和使用数据，以帮助我们修复错误并改进扩展。不会发送任何代码、提示或个人信息。
					<div style={{ marginTop: 4 }}>
						您可以在{" "}
						<VSCodeLink href="#" onClick={handleOpenSettings}>
							设置
						</VSCodeLink>
						中关闭此设置。
					</div>
				</div>
			</div>
		</BannerContainer>
	)
}

export default memo(TelemetryBanner) // 导出经过 memo 优化的组件
