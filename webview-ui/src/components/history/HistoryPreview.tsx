import { VSCodeButton } from "@vscode/webview-ui-toolkit/react"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { vscode } from "@/utils/vscode" // 尽管在此选择中未直接使用，但保留导入
import { memo, useState } from "react"
import { TaskServiceClient } from "@/services/grpc-client"
import { formatLargeNumber } from "@/utils/format"

type HistoryPreviewProps = {
	showHistoryView: () => void
}

const HistoryPreview = ({ showHistoryView }: HistoryPreviewProps) => {
	const { taskHistory } = useExtensionState()
	const [isExpanded, setIsExpanded] = useState(true) // 控制历史记录预览是否展开的状态

	// 处理历史记录项选择事件
	const handleHistorySelect = (id: string) => {
		TaskServiceClient.showTaskWithId({ value: id }).catch((error) => console.error("显示任务时出错：", error))
	}

	// 切换历史记录预览的展开/折叠状态
	const toggleExpanded = () => {
		setIsExpanded(!isExpanded)
	}

	// 格式化时间戳为本地化的日期时间字符串
	const formatDate = (timestamp: number) => {
		const date = new Date(timestamp)
		// 使用中文区域设置格式化日期和时间
		return date
			?.toLocaleString("zh-CN", { // 更改为中文区域设置
				month: "long", // 月份（例如“十月”）
				day: "numeric", // 日期（例如“26”）
				hour: "numeric", // 小时（例如“10”）
				minute: "2-digit", // 分钟（例如“00”）
				hour12: true, // 使用12小时制（会显示上午/下午）
			})
		// 移除了原先针对英文格式的 .replace() 和 .toUpperCase() 调用，
		// 因为 "zh-CN" 的输出格式不同，且相关的CSS textTransform: "uppercase" 样式对中文通常无效。
	}

	return (
		<div style={{ flexShrink: 0 }}>
			<style>
				{`
					.history-preview-item {
						background-color: color-mix(in srgb, var(--vscode-toolbar-hoverBackground) 65%, transparent);
						border-radius: 4px;
						position: relative;
						overflow: hidden;
						opacity: 0.8;
						cursor: pointer;
						margin-bottom: 12px;
					}
					.history-preview-item:hover {
						background-color: color-mix(in srgb, var(--vscode-toolbar-hoverBackground) 100%, transparent);
						opacity: 1;
						pointer-events: auto;
					}
					.history-header {
						cursor: pointer;
						user-select: none;
					}
					.history-header:hover {
						opacity: 0.8;
					}
				`}
			</style>

			<div
				className="history-header"
				onClick={toggleExpanded}
				style={{
					color: "var(--vscode-descriptionForeground)",
					margin: "10px 20px 10px 20px",
					display: "flex",
					alignItems: "center",
				}}>
				<span
					className={`codicon codicon-chevron-${isExpanded ? "down" : "right"}`}
					style={{
						marginRight: "4px",
						transform: "scale(0.9)",
					}}></span>
				<span
					className="codicon codicon-comment-discussion"
					style={{
						marginRight: "4px",
						transform: "scale(0.9)",
					}}></span>
				<span
					style={{
						fontWeight: 500,
						fontSize: "0.85em",
						textTransform: "uppercase",
					}}>
					最近任务
				</span>
			</div>

			{isExpanded && (
				<div style={{ padding: "0px 20px 0 20px" }}>
					{taskHistory.filter((item) => item.ts && item.task).length > 0 ? (
						<>
							{taskHistory
								.filter((item) => item.ts && item.task) // 过滤有效的历史任务
								.slice(0, 3) // 只显示最近的3个任务
								.map((item) => (
									<div
										key={item.id}
										className="history-preview-item"
										onClick={() => handleHistorySelect(item.id)}>
										<div style={{ padding: "12px" }}>
											<div style={{ marginBottom: "8px" }}>
												<span
													style={{
														color: "var(--vscode-descriptionForeground)",
														fontWeight: 500,
														fontSize: "0.85em",
														textTransform: "uppercase", // 样式保持，但对中文日期格式影响不大
													}}>
													{formatDate(item.ts)}
												</span>
											</div>
											{item.isFavorited && (
												<div
													style={{
														position: "absolute",
														top: "12px",
														right: "12px",
														color: "var(--vscode-button-background)",
													}}>
													<span className="codicon codicon-star-full" aria-label="已收藏" />
												</div>
											)}

											<div
												id={`history-preview-task-${item.id}`}
												className="history-preview-task"
												style={{
													fontSize: "var(--vscode-font-size)",
													color: "var(--vscode-descriptionForeground)",
													marginBottom: "8px",
													display: "-webkit-box",
													WebkitLineClamp: 3, // 限制任务文本显示为3行
													WebkitBoxOrient: "vertical",
													overflow: "hidden",
													whiteSpace: "pre-wrap",
													wordBreak: "break-word",
													overflowWrap: "anywhere",
												}}>
												<span className="ph-no-capture">{item.task}</span>
											</div>
											<div
												style={{
													fontSize: "0.85em",
													color: "var(--vscode-descriptionForeground)",
												}}>
												<span>
													令牌：↑{formatLargeNumber(item.tokensIn || 0)} ↓
													{formatLargeNumber(item.tokensOut || 0)}
												</span>
												{!!item.cacheWrites && ( // 如果有缓存写入，则显示缓存信息
													<>
														{" • "}
														<span>
															缓存：+{formatLargeNumber(item.cacheWrites || 0)} →{" "}
															{formatLargeNumber(item.cacheReads || 0)}
														</span>
													</>
												)}
												{!!item.totalCost && ( // 如果有总成本，则显示API成本信息
													<>
														{" • "}
														<span>API 成本：${item.totalCost?.toFixed(4)}</span>
													</>
												)}
											</div>
										</div>
									</div>
								))}
							<div
								style={{
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
								}}>
								<VSCodeButton
									appearance="icon"
									onClick={() => showHistoryView()}
									style={{
										opacity: 0.9,
									}}>
									<div
										style={{
											fontSize: "var(--vscode-font-size)",
											color: "var(--vscode-descriptionForeground)",
										}}>
										查看所有历史记录
									</div>
								</VSCodeButton>
							</div>
						</>
					) : (
						// 如果没有最近任务，则显示提示信息
						<div
							style={{
								textAlign: "center",
								color: "var(--vscode-descriptionForeground)",
								fontSize: "var(--vscode-font-size)",
								padding: "10px 0",
							}}>
							没有最近任务
						</div>
					)}
				</div>
			)}
		</div>
	)
}

export default memo(HistoryPreview) // 使用 memo 优化性能，避免不必要的重渲染
