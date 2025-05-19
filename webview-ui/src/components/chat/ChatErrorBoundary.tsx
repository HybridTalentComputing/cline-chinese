import React from "react"

interface ChatErrorBoundaryProps {
	children: React.ReactNode
	errorTitle?: string // 错误标题
	errorBody?: string // 错误正文
	height?: string // 高度
}

interface ChatErrorBoundaryState {
	hasError: boolean // 是否有错误
	error: Error | null // 错误对象
}

/**
 * 一个可重用的错误边界组件，专为聊天小部件设计。
 * 它提供了一致的错误用户界面，并带有可自定义的标题和正文文本。
 */
export class ChatErrorBoundary extends React.Component<ChatErrorBoundaryProps, ChatErrorBoundaryState> {
	constructor(props: ChatErrorBoundaryProps) {
		super(props)
		this.state = { hasError: false, error: null }
	}

	static getDerivedStateFromError(error: Error) {
		// 更新 state 以便下一次渲染能够显示降级后的 UI
		return { hasError: true, error }
	}

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
		// 你同样可以将错误日志上报给服务器
		console.error("ChatErrorBoundary 发生错误:", error.message)
		console.error("组件堆栈:", errorInfo.componentStack)
	}

	render() {
		const { errorTitle, errorBody, height } = this.props

		if (this.state.hasError) {
			// 你可以自定义降级后的 UI 并渲染
			return (
				<div
					style={{
						padding: "10px",
						color: "var(--vscode-errorForeground)",
						height: height || "auto",
						maxWidth: "512px",
						overflow: "auto",
						border: "1px solid var(--vscode-editorError-foreground)",
						borderRadius: "4px",
						backgroundColor: "var(--vscode-inputValidation-errorBackground, rgba(255, 0, 0, 0.1))",
					}}>
					<h3 style={{ margin: "0 0 8px 0" }}>{errorTitle || "显示此内容时出错"}</h3>
					<p style={{ margin: "0" }}>{errorBody || `错误: ${this.state.error?.message || "未知错误"}`}</p>
				</div>
			)
		}

		return this.props.children
	}
}

/**
 * 一个演示组件，在延迟后抛出错误。
 * 这对于在开发过程中测试错误边界非常有用。
 */
interface ErrorAfterDelayProps {
	numSecondsToWait?: number // 等待的秒数
}

interface ErrorAfterDelayState {
	tickCount: number // 计时次数
}

export class ErrorAfterDelay extends React.Component<ErrorAfterDelayProps, ErrorAfterDelayState> {
	private intervalID: NodeJS.Timeout | null = null

	constructor(props: ErrorAfterDelayProps) {
		super(props)
		this.state = {
			tickCount: 0,
		}
	}

	componentDidMount() {
		const secondsToWait = this.props.numSecondsToWait ?? 5

		this.intervalID = setInterval(() => {
			if (this.state.tickCount >= secondsToWait) {
				if (this.intervalID) {
					clearInterval(this.intervalID)
				}
				// 错误边界无法捕获异步代码 :(
				// 所以这只能通过在 setState 内部抛出错误来工作
				this.setState(() => {
					throw new Error("这是一个用于测试错误边界的错误")
				})
			} else {
				this.setState({
					tickCount: this.state.tickCount + 1,
				})
			}
		}, 1000)
	}

	componentWillUnmount() {
		if (this.intervalID) {
			clearInterval(this.intervalID)
		}
	}

	render() {
		// 添加一个小的视觉指示器，表明此组件将导致错误
		return (
			<div
				style={{
					position: "absolute",
					top: 0,
					right: 0,
					background: "rgba(255, 0, 0, 0.5)",
					color: "var(--vscode-errorForeground)",
					padding: "2px 5px",
					fontSize: "12px",
					borderRadius: "0 0 0 4px",
					zIndex: 100,
				}}>
				错误倒计时: {this.state.tickCount}/{this.props.numSecondsToWait ?? 5} 秒
			</div>
		)
	}
}

export default ChatErrorBoundary
