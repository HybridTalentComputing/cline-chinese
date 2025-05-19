import { VSCodeButton, VSCodeTextField, VSCodeRadioGroup, VSCodeRadio, VSCodeCheckbox } from "@vscode/webview-ui-toolkit/react"
import { useExtensionState } from "@/context/ExtensionStateContext"
import { vscode } from "@/utils/vscode"
import { Virtuoso } from "react-virtuoso"
import { memo, useMemo, useState, useEffect, useCallback } from "react"
import Fuse, { FuseResult } from "fuse.js"
import { TaskServiceClient } from "@/services/grpc-client"
import { formatLargeNumber } from "@/utils/format"
import { formatSize } from "@/utils/format"
import { ExtensionMessage } from "@shared/ExtensionMessage"
import { useEvent } from "react-use"
import DangerButton from "@/components/common/DangerButton"

type HistoryViewProps = {
	onDone: () => void
}

type SortOption = "newest" | "oldest" | "mostExpensive" | "mostTokens" | "mostRelevant"

// Tailwind 样式的单选按钮，支持自定义图标 - 独立于 VSCodeRadioGroup 工作，但外观相同
// 用于工作区和收藏夹过滤器

interface CustomFilterRadioProps {
	checked: boolean
	onChange: () => void
	icon: string
	label: string
}

const CustomFilterRadio = ({ checked, onChange, icon, label }: CustomFilterRadioProps) => {
	return (
		<div
			onClick={onChange}
			className="flex items-center cursor-pointer py-[0.3em] px-0 mr-[10px] text-[var(--vscode-font-size)] select-none">
			<div
				className={`w-[14px] h-[14px] rounded-full border border-[var(--vscode-checkbox-border)] relative flex justify-center items-center mr-[6px] ${
					checked ? "bg-[var(--vscode-checkbox-background)]" : "bg-transparent"
				}`}>
				{checked && <div className="w-[6px] h-[6px] rounded-full bg-[var(--vscode-checkbox-foreground)]" />}
			</div>
			<span className="flex items-center gap-[3px]">
				<div className={`codicon codicon-${icon} text-[var(--vscode-button-background)] text-base`} />
				{label}
			</span>
		</div>
	)
}

const HistoryView = ({ onDone }: HistoryViewProps) => {
	const { taskHistory, totalTasksSize, filePaths } = useExtensionState()
	const [searchQuery, setSearchQuery] = useState("")
	const [sortOption, setSortOption] = useState<SortOption>("newest")
	const [lastNonRelevantSort, setLastNonRelevantSort] = useState<SortOption | null>("newest")
	const [deleteAllDisabled, setDeleteAllDisabled] = useState(false)
	const [selectedItems, setSelectedItems] = useState<string[]>([])
	const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
	const [showCurrentWorkspaceOnly, setShowCurrentWorkspaceOnly] = useState(false)

	// 跟踪待处理的收藏切换操作
	const [pendingFavoriteToggles, setPendingFavoriteToggles] = useState<Record<string, boolean>>({})

	// 使用 gRPC 加载过滤后的任务历史记录
	const [filteredTasks, setFilteredTasks] = useState<any[]>([])

	// 加载并刷新任务历史记录
	const loadTaskHistory = useCallback(async () => {
		try {
			const response = await TaskServiceClient.getTaskHistory({
				favoritesOnly: showFavoritesOnly,
				searchQuery: searchQuery || undefined,
				sortBy: sortOption,
				currentWorkspaceOnly: showCurrentWorkspaceOnly,
			})
			setFilteredTasks(response.tasks || [])
		} catch (error) {
			console.error("加载任务历史记录时出错：", error)
		}
	}, [showFavoritesOnly, showCurrentWorkspaceOnly, searchQuery, sortOption, taskHistory])

	// 过滤器更改时加载
	useEffect(() => {
		// 当两个过滤器都激活时强制完全刷新
		// 以确保正确的组合过滤
		if (showFavoritesOnly && showCurrentWorkspaceOnly) {
			setFilteredTasks([])
		}
		loadTaskHistory()
	}, [loadTaskHistory, showFavoritesOnly, showCurrentWorkspaceOnly])

	const toggleFavorite = useCallback(
		async (taskId: string, currentValue: boolean) => {
			// 乐观 UI 更新
			setPendingFavoriteToggles((prev) => ({ ...prev, [taskId]: !currentValue }))

			try {
				await TaskServiceClient.toggleTaskFavorite({
					taskId,
					isFavorited: !currentValue,
				})

				// 如果任一过滤器激活则刷新，以确保正确的组合过滤
				if (showFavoritesOnly || showCurrentWorkspaceOnly) {
					loadTaskHistory()
				}
			} catch (err) {
				console.error(`[收藏切换界面] 任务 ${taskId} 出错：`, err)
				// 恢复乐观更新
				setPendingFavoriteToggles((prev) => {
					const updated = { ...prev }
					delete updated[taskId]
					return updated
				})
			} finally {
				// 1 秒后清理待处理状态
				setTimeout(() => {
					setPendingFavoriteToggles((prev) => {
						const updated = { ...prev }
						delete updated[taskId]
						return updated
					})
				}, 1000)
			}
		},
		[showFavoritesOnly, loadTaskHistory],
	)

	const handleMessage = useCallback((event: MessageEvent<ExtensionMessage>) => {
		if (event.data.type === "relinquishControl") {
			setDeleteAllDisabled(false)
		}
	}, [])
	useEvent("message", handleMessage)

	// 组件挂载时请求任务总大小
	useEffect(() => {
		vscode.postMessage({ type: "requestTotalTasksSize" })
	}, [])

	useEffect(() => {
		if (searchQuery && sortOption !== "mostRelevant" && !lastNonRelevantSort) {
			setLastNonRelevantSort(sortOption)
			setSortOption("mostRelevant")
		} else if (!searchQuery && sortOption === "mostRelevant" && lastNonRelevantSort) {
			setSortOption(lastNonRelevantSort)
			setLastNonRelevantSort(null)
		}
	}, [searchQuery, sortOption, lastNonRelevantSort])

	const handleShowTaskWithId = useCallback((id: string) => {
		TaskServiceClient.showTaskWithId({ value: id }).catch((error) => console.error("显示任务时出错：", error))
	}, [])

	const handleHistorySelect = useCallback((itemId: string, checked: boolean) => {
		setSelectedItems((prev) => {
			if (checked) {
				return [...prev, itemId]
			} else {
				return prev.filter((id) => id !== itemId)
			}
		})
	}, [])

	const handleDeleteHistoryItem = useCallback((id: string) => {
		TaskServiceClient.deleteTasksWithIds({ value: [id] })
	}, [])

	const handleDeleteSelectedHistoryItems = useCallback((ids: string[]) => {
		if (ids.length > 0) {
			TaskServiceClient.deleteTasksWithIds({ value: ids })
			setSelectedItems([])
		}
	}, [])

	const formatDate = useCallback((timestamp: number) => {
		const date = new Date(timestamp)
		return date
			.toLocaleString("zh-CN", {
				month: "long",
				day: "numeric",
				hour: "numeric",
				minute: "2-digit",
				hour12: false, // 使用24小时制，更常见于中文技术界面
			})
	}, [])

	const presentableTasks = useMemo(() => filteredTasks, [filteredTasks])

	const fuse = useMemo(() => {
		return new Fuse(presentableTasks, {
			keys: ["task"],
			threshold: 0.6,
			shouldSort: true,
			isCaseSensitive: false,
			ignoreLocation: false,
			includeMatches: true,
			minMatchCharLength: 1,
		})
	}, [presentableTasks])

	const taskHistorySearchResults = useMemo(() => {
		const results = searchQuery ? highlight(fuse.search(searchQuery)) : presentableTasks

		results.sort((a, b) => {
			switch (sortOption) {
				case "oldest":
					return a.ts - b.ts
				case "mostExpensive":
					return (b.totalCost || 0) - (a.totalCost || 0)
				case "mostTokens":
					return (
						(b.tokensIn || 0) +
						(b.tokensOut || 0) +
						(b.cacheWrites || 0) +
						(b.cacheReads || 0) -
						((a.tokensIn || 0) + (a.tokensOut || 0) + (a.cacheWrites || 0) + (a.cacheReads || 0))
					)
				case "mostRelevant":
					// 注意：切勿直接对对象进行排序，否则会导致成员重新排序
					return searchQuery ? 0 : b.ts - a.ts // 如果正在搜索，则保留 fuse 顺序，否则按最新排序
				case "newest":
				default:
					return b.ts - a.ts
			}
		})

		return results
	}, [presentableTasks, searchQuery, fuse, sortOption])

	// 计算所选项目的总大小
	const selectedItemsSize = useMemo(() => {
		if (selectedItems.length === 0) return 0

		return taskHistory.filter((item) => selectedItems.includes(item.id)).reduce((total, item) => total + (item.size || 0), 0)
	}, [selectedItems, taskHistory])

	const handleBatchHistorySelect = useCallback(
		(selectAll: boolean) => {
			if (selectAll) {
				setSelectedItems(taskHistorySearchResults.map((item) => item.id))
			} else {
				setSelectedItems([])
			}
		},
		[taskHistorySearchResults],
	)

	return (
		<>
			<style>
				{`
					.history-item:hover {
						background-color: var(--vscode-list-hoverBackground);
					}
					.delete-button, .export-button {
						opacity: 0;
						pointer-events: none;
					}
					.history-item:hover .delete-button,
					.history-item:hover .export-button {
						opacity: 1;
						pointer-events: auto;
					}
					.history-item-highlight {
						background-color: var(--vscode-editor-findMatchHighlightBackground);
						color: inherit;
					}
				`}
			</style>
			<div
				style={{
					position: "fixed",
					top: 0,
					left: 0,
					right: 0,
					bottom: 0,
					display: "flex",
					flexDirection: "column",
					overflow: "hidden",
				}}>
				<div
					style={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						padding: "10px 17px 10px 20px",
					}}>
					<h3
						style={{
							color: "var(--vscode-foreground)",
							margin: 0,
						}}>
						历史记录
					</h3>
					<VSCodeButton onClick={onDone}>完成</VSCodeButton>
				</div>
				<div style={{ padding: "5px 17px 6px 17px" }}>
					<div
						style={{
							display: "flex",
							flexDirection: "column",
							gap: "6px",
						}}>
						<VSCodeTextField
							style={{ width: "100%" }}
							placeholder="模糊搜索历史记录..."
							value={searchQuery}
							onInput={(e) => {
								const newValue = (e.target as HTMLInputElement)?.value
								setSearchQuery(newValue)
								if (newValue && !searchQuery && sortOption !== "mostRelevant") {
									setLastNonRelevantSort(sortOption)
									setSortOption("mostRelevant")
								}
							}}>
							<div
								slot="start"
								className="codicon codicon-search"
								style={{
									fontSize: 13,
									marginTop: 2.5,
									opacity: 0.8,
								}}></div>
							{searchQuery && (
								<div
									className="input-icon-button codicon codicon-close"
									aria-label="清除搜索"
									onClick={() => setSearchQuery("")}
									slot="end"
									style={{
										display: "flex",
										justifyContent: "center",
										alignItems: "center",
										height: "100%",
									}}
								/>
							)}
						</VSCodeTextField>
						<VSCodeRadioGroup
							style={{ display: "flex", flexWrap: "wrap" }}
							value={sortOption}
							onChange={(e) => setSortOption((e.target as HTMLInputElement).value as SortOption)}>
							<VSCodeRadio value="newest">最新</VSCodeRadio>
							<VSCodeRadio value="oldest">最早</VSCodeRadio>
							<VSCodeRadio value="mostExpensive">最贵</VSCodeRadio>
							<VSCodeRadio value="mostTokens">最多令牌</VSCodeRadio>
							<VSCodeRadio value="mostRelevant" disabled={!searchQuery} style={{ opacity: searchQuery ? 1 : 0.5 }}>
								最相关
							</VSCodeRadio>
							<CustomFilterRadio
								checked={showCurrentWorkspaceOnly}
								onChange={() => setShowCurrentWorkspaceOnly(!showCurrentWorkspaceOnly)}
								icon="workspace"
								label="工作区"
							/>
							<CustomFilterRadio
								checked={showFavoritesOnly}
								onChange={() => setShowFavoritesOnly(!showFavoritesOnly)}
								icon="star-full"
								label="收藏夹"
							/>
						</VSCodeRadioGroup>

						<div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
							<VSCodeButton
								onClick={() => {
									handleBatchHistorySelect(true)
								}}>
								全选
							</VSCodeButton>
							<VSCodeButton
								onClick={() => {
									handleBatchHistorySelect(false)
								}}>
								全不选
							</VSCodeButton>
						</div>
					</div>
				</div>
				<div style={{ flexGrow: 1, overflowY: "auto", margin: 0 }}>
					{/* {presentableTasks.length === 0 && (
						<div
							style={{
								
								alignItems: "center",
								fontStyle: "italic",
								color: "var(--vscode-descriptionForeground)",
								textAlign: "center",
								padding: "0px 10px",
							}}>
							<span
								className="codicon codicon-robot"
								style={{ fontSize: "60px", marginBottom: "10px" }}></span>
							<div>开始一个任务以在此处查看</div>
						</div>
					)} */}
					<Virtuoso
						style={{
							flexGrow: 1,
							overflowY: "scroll",
						}}
						data={taskHistorySearchResults}
						itemContent={(index, item) => (
							<div
								key={item.id}
								className="history-item"
								style={{
									cursor: "pointer",
									borderBottom:
										index < taskHistory.length - 1 ? "1px solid var(--vscode-panel-border)" : "none",
									display: "flex",
								}}>
								<VSCodeCheckbox
									className="pl-3 pr-1 py-auto"
									checked={selectedItems.includes(item.id)}
									onClick={(e) => {
										const checked = (e.target as HTMLInputElement).checked
										handleHistorySelect(item.id, checked)
										e.stopPropagation()
									}}
								/>
								<div
									style={{
										display: "flex",
										flexDirection: "column",
										gap: "8px",
										padding: "12px 20px",
										paddingLeft: "16px",
										position: "relative",
										flexGrow: 1,
									}}
									onClick={() => handleShowTaskWithId(item.id)}>
									<div
										style={{
											display: "flex",
											justifyContent: "space-between",
											alignItems: "center",
										}}>
										<span
											style={{
												color: "var(--vscode-descriptionForeground)",
												fontWeight: 500,
												fontSize: "0.85em",
												textTransform: "uppercase", // 注意：中文通常不使用大写
											}}>
											{formatDate(item.ts)}
										</span>
										<div style={{ display: "flex", gap: "4px" }}>
											{/* 仅当任务未收藏时显示删除按钮 */}
											{!(pendingFavoriteToggles[item.id] ?? item.isFavorited) && (
												<VSCodeButton
													appearance="icon"
													onClick={(e) => {
														e.stopPropagation()
														handleDeleteHistoryItem(item.id)
													}}
													className="delete-button"
													style={{ padding: "0px 0px" }}>
													<div
														style={{
															display: "flex",
															alignItems: "center",
															gap: "3px",
															fontSize: "11px",
														}}>
														<span className="codicon codicon-trash"></span>
														{formatSize(item.size)}
													</div>
												</VSCodeButton>
											)}
											<VSCodeButton
												appearance="icon"
												onClick={(e) => {
													e.stopPropagation()
													toggleFavorite(item.id, item.isFavorited || false)
												}}
												style={{ padding: "0px" }}>
												<div
													className={`codicon ${
														pendingFavoriteToggles[item.id] !== undefined
															? pendingFavoriteToggles[item.id]
																? "codicon-star-full"
																: "codicon-star-empty"
															: item.isFavorited
																? "codicon-star-full"
																: "codicon-star-empty"
													}`}
													style={{
														color:
															(pendingFavoriteToggles[item.id] ?? item.isFavorited)
																? "var(--vscode-button-background)"
																: "inherit",
														opacity: (pendingFavoriteToggles[item.id] ?? item.isFavorited) ? 1 : 0.7,
														display:
															(pendingFavoriteToggles[item.id] ?? item.isFavorited)
																? "block"
																: undefined,
													}}
												/>
											</VSCodeButton>
										</div>
									</div>

									<div style={{ marginBottom: "8px", position: "relative" }}>
										<div
											style={{
												fontSize: "var(--vscode-font-size)",
												color: "var(--vscode-foreground)",
												display: "-webkit-box",
												WebkitLineClamp: 3,
												WebkitBoxOrient: "vertical",
												overflow: "hidden",
												whiteSpace: "pre-wrap",
												wordBreak: "break-word",
												overflowWrap: "anywhere",
											}}>
											<span
												className="ph-no-capture"
												dangerouslySetInnerHTML={{
													__html: item.task,
												}}
											/>
										</div>
									</div>
									<div
										style={{
											display: "flex",
											flexDirection: "column",
											gap: "4px",
										}}>
										<div
											style={{
												display: "flex",
												justifyContent: "space-between",
												alignItems: "center",
											}}>
											<div
												style={{
													display: "flex",
													alignItems: "center",
													gap: "4px",
													flexWrap: "wrap",
												}}>
												<span
													style={{
														fontWeight: 500,
														color: "var(--vscode-descriptionForeground)",
													}}>
													令牌：
												</span>
												<span
													style={{
														display: "flex",
														alignItems: "center",
														gap: "3px",
														color: "var(--vscode-descriptionForeground)",
													}}>
													<i
														className="codicon codicon-arrow-up"
														style={{
															fontSize: "12px",
															fontWeight: "bold",
															marginBottom: "-2px",
														}}
													/>
													{formatLargeNumber(item.tokensIn || 0)}
												</span>
												<span
													style={{
														display: "flex",
														alignItems: "center",
														gap: "3px",
														color: "var(--vscode-descriptionForeground)",
													}}>
													<i
														className="codicon codicon-arrow-down"
														style={{
															fontSize: "12px",
															fontWeight: "bold",
															marginBottom: "-2px",
														}}
													/>
													{formatLargeNumber(item.tokensOut || 0)}
												</span>
											</div>
											{!item.totalCost && <ExportButton itemId={item.id} />}
										</div>

										{!!item.cacheWrites && (
											<div
												style={{
													display: "flex",
													alignItems: "center",
													gap: "4px",
													flexWrap: "wrap",
												}}>
												<span
													style={{
														fontWeight: 500,
														color: "var(--vscode-descriptionForeground)",
													}}>
													缓存：
												</span>
												<span
													style={{
														display: "flex",
														alignItems: "center",
														gap: "3px",
														color: "var(--vscode-descriptionForeground)",
													}}>
													<i
														className="codicon codicon-database"
														style={{
															fontSize: "12px",
															fontWeight: "bold",
															marginBottom: "-1px",
														}}
													/>
													+{formatLargeNumber(item.cacheWrites || 0)}
												</span>
												<span
													style={{
														display: "flex",
														alignItems: "center",
														gap: "3px",
														color: "var(--vscode-descriptionForeground)",
													}}>
													<i
														className="codicon codicon-arrow-right"
														style={{
															fontSize: "12px",
															fontWeight: "bold",
															marginBottom: 0,
														}}
													/>
													{formatLargeNumber(item.cacheReads || 0)}
												</span>
											</div>
										)}
										{!!item.totalCost && (
											<div
												style={{
													display: "flex",
													justifyContent: "space-between",
													alignItems: "center",
													marginTop: -2,
												}}>
												<div
													style={{
														display: "flex",
														alignItems: "center",
														gap: "4px",
													}}>
													<span
														style={{
															fontWeight: 500,
															color: "var(--vscode-descriptionForeground)",
														}}>
														API 成本：
													</span>
													<span
														style={{
															color: "var(--vscode-descriptionForeground)",
														}}>
														${item.totalCost?.toFixed(4)}
													</span>
												</div>
												<ExportButton itemId={item.id} />
											</div>
										)}
									</div>
								</div>
							</div>
						)}
					/>
				</div>
				<div
					style={{
						padding: "10px 10px",
						borderTop: "1px solid var(--vscode-panel-border)",
					}}>
					{selectedItems.length > 0 ? (
						<DangerButton
							style={{ width: "100%" }}
							onClick={() => {
								handleDeleteSelectedHistoryItems(selectedItems)
							}}>
							删除{selectedItems.length > 1 ? ` ${selectedItems.length} 个` : ""}选定项
							{selectedItemsSize > 0 ? ` (${formatSize(selectedItemsSize)})` : ""}
						</DangerButton>
					) : (
						<DangerButton
							style={{ width: "100%" }}
							disabled={deleteAllDisabled || taskHistory.length === 0}
							onClick={() => {
								setDeleteAllDisabled(true)
								vscode.postMessage({ type: "clearAllTaskHistory" })
							}}>
							删除全部历史记录{totalTasksSize !== null ? ` (${formatSize(totalTasksSize)})` : ""}
						</DangerButton>
					)}
				</div>
			</div>
		</>
	)
}

const ExportButton = ({ itemId }: { itemId: string }) => (
	<VSCodeButton
		className="export-button"
		appearance="icon"
		onClick={(e) => {
			e.stopPropagation()
			TaskServiceClient.exportTaskWithId({ value: itemId }).catch((err) => console.error("导出任务失败：", err))
		}}>
		<div style={{ fontSize: "11px", fontWeight: 500, opacity: 1 }}>导出</div>
	</VSCodeButton>
)

// https://gist.github.com/evenfrost/1ba123656ded32fb7a0cd4651efd4db0
export const highlight = (fuseSearchResult: FuseResult<any>[], highlightClassName: string = "history-item-highlight") => {
	const set = (obj: Record<string, any>, path: string, value: any) => {
		const pathValue = path.split(".")
		let i: number

		for (i = 0; i < pathValue.length - 1; i++) {
			obj = obj[pathValue[i]] as Record<string, any>
		}

		obj[pathValue[i]] = value
	}

	// 合并重叠区域的函数
	const mergeRegions = (regions: [number, number][]): [number, number][] => {
		if (regions.length === 0) return regions

		// 按起始索引对区域进行排序
		regions.sort((a, b) => a[0] - b[0])

		const merged: [number, number][] = [regions[0]]

		for (let i = 1; i < regions.length; i++) {
			const last = merged[merged.length - 1]
			const current = regions[i]

			if (current[0] <= last[1] + 1) {
				// 重叠或相邻区域
				last[1] = Math.max(last[1], current[1])
			} else {
				merged.push(current)
			}
		}

		return merged
	}

	const generateHighlightedText = (inputText: string, regions: [number, number][] = []) => {
		if (regions.length === 0) {
			return inputText
		}

		// 排序并合并重叠区域
		const mergedRegions = mergeRegions(regions)

		let content = ""
		let nextUnhighlightedRegionStartingIndex = 0

		mergedRegions.forEach((region) => {
			const start = region[0]
			const end = region[1]
			const lastRegionNextIndex = end + 1

			content += [
				inputText.substring(nextUnhighlightedRegionStartingIndex, start),
				`<span class="${highlightClassName}">`,
				inputText.substring(start, lastRegionNextIndex),
				"</span>",
			].join("")

			nextUnhighlightedRegionStartingIndex = lastRegionNextIndex
		})

		content += inputText.substring(nextUnhighlightedRegionStartingIndex)

		return content
	}

	return fuseSearchResult
		.filter(({ matches }) => matches && matches.length)
		.map(({ item, matches }) => {
			const highlightedItem = { ...item }

			matches?.forEach((match) => {
				if (match.key && typeof match.value === "string" && match.indices) {
					// 在生成高亮文本之前合并重叠区域
					const mergedIndices = mergeRegions([...match.indices])
					set(highlightedItem, match.key, generateHighlightedText(match.value, mergedIndices))
				}
			})

			return highlightedItem
		})
}

export default memo(HistoryView)
