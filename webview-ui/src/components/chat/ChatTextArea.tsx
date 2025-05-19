import { VSCodeButton } from "@vscode/webview-ui-toolkit/react"
import React, { forwardRef, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import DynamicTextArea from "react-textarea-autosize"
import { useClickAway, useEvent, useWindowSize } from "react-use"
import styled from "styled-components"
import { mentionRegex, mentionRegexGlobal } from "@shared/context-mentions"
import { ExtensionMessage } from "@shared/ExtensionMessage"
import { useExtensionState } from "@/context/ExtensionStateContext"
import {
	ContextMenuOptionType,
	getContextMenuOptions,
	insertMention,
	insertMentionDirectly,
	removeMention,
	shouldShowContextMenu,
	SearchResult,
} from "@/utils/context-mentions"
import {
	SlashCommand,
	slashCommandDeleteRegex,
	shouldShowSlashCommandsMenu,
	getMatchingSlashCommands,
	insertSlashCommand,
	removeSlashCommand,
	validateSlashCommand,
} from "@/utils/slash-commands"
import { useMetaKeyDetection, useShortcut } from "@/utils/hooks"
import { validateApiConfiguration, validateModelId } from "@/utils/validate"
import { vscode } from "@/utils/vscode"
import { EmptyRequest } from "@shared/proto/common"
import { FileServiceClient, StateServiceClient } from "@/services/grpc-client"
import { CODE_BLOCK_BG_COLOR } from "@/components/common/CodeBlock"
import Thumbnails from "@/components/common/Thumbnails"
import Tooltip from "@/components/common/Tooltip"
import ApiOptions, { normalizeApiConfiguration } from "@/components/settings/ApiOptions"
import { MAX_IMAGES_PER_MESSAGE } from "@/components/chat/ChatView"
import ContextMenu from "@/components/chat/ContextMenu"
import SlashCommandMenu from "@/components/chat/SlashCommandMenu"
import { ChatSettings } from "@shared/ChatSettings"
import ServersToggleModal from "./ServersToggleModal"
import ClineRulesToggleModal from "../cline-rules/ClineRulesToggleModal"

const getImageDimensions = (dataUrl: string): Promise<{ width: number; height: number }> => {
	return new Promise((resolve, reject) => {
		const img = new Image()
		img.onload = () => {
			if (img.naturalWidth > 7500 || img.naturalHeight > 7500) {
				reject(new Error("Image dimensions exceed maximum allowed size of 7500px."))
			} else {
				resolve({ width: img.naturalWidth, height: img.naturalHeight })
			}
		}
		img.onerror = (err) => {
			console.error("Failed to load image for dimension check:", err)
			reject(new Error("Failed to load image to check dimensions."))
		}
		img.src = dataUrl
	})
}

interface ChatTextAreaProps {
	inputValue: string
	activeQuote: string | null
	setInputValue: (value: string) => void
	sendingDisabled: boolean
	placeholderText: string
	selectedImages: string[]
	setSelectedImages: React.Dispatch<React.SetStateAction<string[]>>
	onSend: () => void
	onSelectImages: () => void
	shouldDisableImages: boolean
	onHeightChange?: (height: number) => void
	onFocusChange?: (isFocused: boolean) => void
}

interface GitCommit {
	type: ContextMenuOptionType.Git
	value: string
	label: string
	description: string
}

const PLAN_MODE_COLOR = "var(--vscode-inputValidation-warningBorder)"

const SwitchOption = styled.div<{ isActive: boolean }>`
	padding: 2px 8px;
	color: ${(props) => (props.isActive ? "white" : "var(--vscode-input-foreground)")};
	z-index: 1;
	transition: color 0.2s ease;
	font-size: 12px;
	width: 50%;
	text-align: center;

	&:hover {
		background-color: ${(props) => (!props.isActive ? "var(--vscode-toolbar-hoverBackground)" : "transparent")};
	}
`

const SwitchContainer = styled.div<{ disabled: boolean }>`
	display: flex;
	align-items: center;
	background-color: var(--vscode-editor-background);
	border: 1px solid var(--vscode-input-border);
	border-radius: 12px;
	overflow: hidden;
	cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
	opacity: ${(props) => (props.disabled ? 0.5 : 1)};
	transform: scale(0.85);
	transform-origin: right center;
	margin-left: -10px; // compensate for the transform so flex spacing works
	user-select: none; // Prevent text selection
`

const Slider = styled.div<{ isAct: boolean; isPlan?: boolean }>`
	position: absolute;
	height: 100%;
	width: 50%;
	background-color: ${(props) => (props.isPlan ? PLAN_MODE_COLOR : "var(--vscode-focusBorder)")};
	transition: transform 0.2s ease;
	transform: translateX(${(props) => (props.isAct ? "100%" : "0%")});
`

const ButtonGroup = styled.div`
	display: flex;
	align-items: center;
	gap: 4px;
	flex: 1;
	min-width: 0;
`

const ButtonContainer = styled.div`
	display: flex;
	align-items: center;
	gap: 3px;
	font-size: 10px;
	white-space: nowrap;
	min-width: 0;
	width: 100%;
`

const ControlsContainer = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-top: -5px;
	padding: 0px 15px 5px 15px;
`

const ModelSelectorTooltip = styled.div<ModelSelectorTooltipProps>`
	position: fixed;
	bottom: calc(100% + 9px);
	left: 15px;
	right: 15px;
	background: ${CODE_BLOCK_BG_COLOR};
	border: 1px solid var(--vscode-editorGroup-border);
	padding: 12px;
	border-radius: 3px;
	z-index: 1000;
	max-height: calc(100vh - 100px);
	overflow-y: auto;
	overscroll-behavior: contain;

	// Add invisible padding for hover zone
	&::before {
		content: "";
		position: fixed;
		bottom: ${(props) => `calc(100vh - ${props.menuPosition}px - 2px)`};
		left: 0;
		right: 0;
		height: 8px;
	}

	// Arrow pointing down
	&::after {
		content: "";
		position: fixed;
		bottom: ${(props) => `calc(100vh - ${props.menuPosition}px)`};
		right: ${(props) => props.arrowPosition}px;
		width: 10px;
		height: 10px;
		background: ${CODE_BLOCK_BG_COLOR};
		border-right: 1px solid var(--vscode-editorGroup-border);
		border-bottom: 1px solid var(--vscode-editorGroup-border);
		transform: rotate(45deg);
		z-index: -1;
	}
`

const ModelContainer = styled.div`
	position: relative;
	display: flex;
	flex: 1;
	min-width: 0;
`

const ModelButtonWrapper = styled.div`
	display: inline-flex; // Make it shrink to content
	min-width: 0; // Allow shrinking
	max-width: 100%; // Don't overflow parent
`

const ModelDisplayButton = styled.a<{ isActive?: boolean; disabled?: boolean }>`
	padding: 0px 0px;
	height: 20px;
	width: 100%;
	min-width: 0;
	cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
	text-decoration: ${(props) => (props.isActive ? "underline" : "none")};
	color: ${(props) => (props.isActive ? "var(--vscode-foreground)" : "var(--vscode-descriptionForeground)")};
	display: flex;
	align-items: center;
	font-size: 10px;
	outline: none;
	user-select: none;
	opacity: ${(props) => (props.disabled ? 0.5 : 1)};
	pointer-events: ${(props) => (props.disabled ? "none" : "auto")};

	&:hover,
	&:focus {
		color: ${(props) => (props.disabled ? "var(--vscode-descriptionForeground)" : "var(--vscode-foreground)")};
		text-decoration: ${(props) => (props.disabled ? "none" : "underline")};
		outline: none;
	}

	&:active {
		color: ${(props) => (props.disabled ? "var(--vscode-descriptionForeground)" : "var(--vscode-foreground)")};
		text-decoration: ${(props) => (props.disabled ? "none" : "underline")};
		outline: none;
	}

	&:focus-visible {
		outline: none;
	}
`

const ModelButtonContent = styled.div`
	width: 100%;
	min-width: 0;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
`

const ChatTextArea = forwardRef<HTMLTextAreaElement, ChatTextAreaProps>(
	(
		{
			inputValue,
			activeQuote,
			setInputValue,
			sendingDisabled,
			placeholderText,
			selectedImages,
			setSelectedImages,
			onSend,
			onSelectImages,
			shouldDisableImages,
			onHeightChange,
			onFocusChange,
		},
		ref,
	) => {
		const { filePaths, chatSettings, apiConfiguration, openRouterModels, platform, workflowToggles } = useExtensionState()
		const [isTextAreaFocused, setIsTextAreaFocused] = useState(false)
		const [isDraggingOver, setIsDraggingOver] = useState(false)
		const [gitCommits, setGitCommits] = useState<GitCommit[]>([])

		const [showSlashCommandsMenu, setShowSlashCommandsMenu] = useState(false)
		const [selectedSlashCommandsIndex, setSelectedSlashCommandsIndex] = useState(0)
		const [slashCommandsQuery, setSlashCommandsQuery] = useState("")
		const slashCommandsMenuContainerRef = useRef<HTMLDivElement>(null)

		const [thumbnailsHeight, setThumbnailsHeight] = useState(0)
		const [textAreaBaseHeight, setTextAreaBaseHeight] = useState<number | undefined>(undefined)
		const [showContextMenu, setShowContextMenu] = useState(false)
		const [cursorPosition, setCursorPosition] = useState(0)
		const [searchQuery, setSearchQuery] = useState("")
		const textAreaRef = useRef<HTMLTextAreaElement | null>(null)
		const [isMouseDownOnMenu, setIsMouseDownOnMenu] = useState(false)
		const highlightLayerRef = useRef<HTMLDivElement>(null)
		const [selectedMenuIndex, setSelectedMenuIndex] = useState(-1)
		const [selectedType, setSelectedType] = useState<ContextMenuOptionType | null>(null)
		const [justDeletedSpaceAfterMention, setJustDeletedSpaceAfterMention] = useState(false)
		const [justDeletedSpaceAfterSlashCommand, setJustDeletedSpaceAfterSlashCommand] = useState(false)
		const [intendedCursorPosition, setIntendedCursorPosition] = useState<number | null>(null)
		const contextMenuContainerRef = useRef<HTMLDivElement>(null)
		const [showModelSelector, setShowModelSelector] = useState(false)
		const modelSelectorRef = useRef<HTMLDivElement>(null)
		const { width: viewportWidth, height: viewportHeight } = useWindowSize()
		const buttonRef = useRef<HTMLDivElement>(null)
		const [arrowPosition, setArrowPosition] = useState(0)
		const [menuPosition, setMenuPosition] = useState(0)
		const [shownTooltipMode, setShownTooltipMode] = useState<ChatSettings["mode"] | null>(null)
		const [pendingInsertions, setPendingInsertions] = useState<string[]>([])
		const shiftHoldTimerRef = useRef<NodeJS.Timeout | null>(null)
		const [showUnsupportedFileError, setShowUnsupportedFileError] = useState(false)
		const unsupportedFileTimerRef = useRef<NodeJS.Timeout | null>(null)
		const [showDimensionError, setShowDimensionError] = useState(false)
		const dimensionErrorTimerRef = useRef<NodeJS.Timeout | null>(null)

		const [fileSearchResults, setFileSearchResults] = useState<SearchResult[]>([])
		const [searchLoading, setSearchLoading] = useState(false)
		const [, metaKeyChar] = useMetaKeyDetection(platform)

		// Add a ref to track previous menu state
		const prevShowModelSelector = useRef(showModelSelector)

		// Fetch git commits when Git is selected or when typing a hash
		useEffect(() => {
			if (selectedType === ContextMenuOptionType.Git || /^[a-f0-9]+$/i.test(searchQuery)) {
				FileServiceClient.searchCommits({ value: searchQuery || "" })
					.then((response) => {
						if (response.commits) {
							const commits: GitCommit[] = response.commits.map(
								(commit: { hash: string; shortHash: string; subject: string; author: string; date: string }) => ({
									type: ContextMenuOptionType.Git,
									value: commit.hash,
									label: commit.subject,
									description: `${commit.shortHash} by ${commit.author} on ${commit.date}`,
								}),
							)
							setGitCommits(commits)
						}
					})
					.catch((error) => {
						console.error("Error searching commits:", error)
					})
			}
		}, [selectedType, searchQuery])

		const handleMessage = useCallback((event: MessageEvent) => {
			const message: ExtensionMessage = event.data
			switch (message.type) {
				case "fileSearchResults": {
					// Only update results if they match the current query or if there's no mentionsRequestId - better UX
					if (!message.mentionsRequestId || message.mentionsRequestId === currentSearchQueryRef.current) {
						setFileSearchResults(message.results || [])
						setSearchLoading(false)
					}
					break
				}
			}
		}, [])

		useEvent("message", handleMessage)

		const queryItems = useMemo(() => {
			return [
				{ type: ContextMenuOptionType.Problems, value: "problems" },
				{ type: ContextMenuOptionType.Terminal, value: "terminal" },
				...gitCommits,
				...filePaths
					.map((file) => "/" + file)
					.map((path) => ({
						type: path.endsWith("/") ? ContextMenuOptionType.Folder : ContextMenuOptionType.File,
						value: path,
					})),
			]
		}, [filePaths, gitCommits])

		useEffect(() => {
			const handleClickOutside = (event: MouseEvent) => {
				if (contextMenuContainerRef.current && !contextMenuContainerRef.current.contains(event.target as Node)) {
					setShowContextMenu(false)
				}
			}

			if (showContextMenu) {
				document.addEventListener("mousedown", handleClickOutside)
			}

			return () => {
				document.removeEventListener("mousedown", handleClickOutside)
			}
		}, [showContextMenu, setShowContextMenu])

		useEffect(() => {
			const handleClickOutsideSlashMenu = (event: MouseEvent) => {
				if (
					slashCommandsMenuContainerRef.current &&
					!slashCommandsMenuContainerRef.current.contains(event.target as Node)
				) {
					setShowSlashCommandsMenu(false)
				}
			}

			if (showSlashCommandsMenu) {
				document.addEventListener("mousedown", handleClickOutsideSlashMenu)
			}

			return () => {
				document.removeEventListener("mousedown", handleClickOutsideSlashMenu)
			}
		}, [showSlashCommandsMenu])

		const handleMentionSelect = useCallback(
			(type: ContextMenuOptionType, value?: string) => {
				if (type === ContextMenuOptionType.NoResults) {
					return
				}

				if (
					type === ContextMenuOptionType.File ||
					type === ContextMenuOptionType.Folder ||
					type === ContextMenuOptionType.Git
				) {
					if (!value) {
						setSelectedType(type)
						setSearchQuery("")
						setSelectedMenuIndex(0)
						return
					}
				}

				setShowContextMenu(false)
				setSelectedType(null)
				if (textAreaRef.current) {
					let insertValue = value || ""
					if (type === ContextMenuOptionType.URL) {
						insertValue = value || ""
					} else if (type === ContextMenuOptionType.File || type === ContextMenuOptionType.Folder) {
						insertValue = value || ""
					} else if (type === ContextMenuOptionType.Problems) {
						insertValue = "problems"
					} else if (type === ContextMenuOptionType.Terminal) {
						insertValue = "terminal"
					} else if (type === ContextMenuOptionType.Git) {
						insertValue = value || ""
					}

					const { newValue, mentionIndex } = insertMention(textAreaRef.current.value, cursorPosition, insertValue)

					setInputValue(newValue)
					const newCursorPosition = newValue.indexOf(" ", mentionIndex + insertValue.length) + 1
					setCursorPosition(newCursorPosition)
					setIntendedCursorPosition(newCursorPosition)
					// textAreaRef.current.focus()

					// scroll to cursor
					setTimeout(() => {
						if (textAreaRef.current) {
							textAreaRef.current.blur()
							textAreaRef.current.focus()
						}
					}, 0)
				}
			},
			[setInputValue, cursorPosition],
		)

		const handleSlashCommandsSelect = useCallback(
			(command: SlashCommand) => {
				setShowSlashCommandsMenu(false)

				if (textAreaRef.current) {
					const { newValue, commandIndex } = insertSlashCommand(textAreaRef.current.value, command.name)
					const newCursorPosition = newValue.indexOf(" ", commandIndex + 1 + command.name.length) + 1

					setInputValue(newValue)
					setCursorPosition(newCursorPosition)
					setIntendedCursorPosition(newCursorPosition)

					setTimeout(() => {
						if (textAreaRef.current) {
							textAreaRef.current.blur()
							textAreaRef.current.focus()
						}
					}, 0)
				}
			},
			[setInputValue],
		)

		const handleKeyDown = useCallback(
			(event: React.KeyboardEvent<HTMLTextAreaElement>) => {
				if (showSlashCommandsMenu) {
					if (event.key === "Escape") {
						setShowSlashCommandsMenu(false)
						return
					}

					if (event.key === "ArrowUp" || event.key === "ArrowDown") {
						event.preventDefault()
						setSelectedSlashCommandsIndex((prevIndex) => {
							const direction = event.key === "ArrowUp" ? -1 : 1
							// Get commands with workflow toggles
							const allCommands = getMatchingSlashCommands(slashCommandsQuery, workflowToggles)

							if (allCommands.length === 0) {
								return prevIndex
							}

							// Calculate total command count
							const totalCommandCount = allCommands.length

							// Create wraparound navigation - moves from last item to first and vice versa
							const newIndex = (prevIndex + direction + totalCommandCount) % totalCommandCount
							return newIndex
						})
						return
					}

					if ((event.key === "Enter" || event.key === "Tab") && selectedSlashCommandsIndex !== -1) {
						event.preventDefault()
						const commands = getMatchingSlashCommands(slashCommandsQuery, workflowToggles)
						if (commands.length > 0) {
							handleSlashCommandsSelect(commands[selectedSlashCommandsIndex])
						}
						return
					}
				}
				if (showContextMenu) {
					if (event.key === "Escape") {
						// event.preventDefault()
						setSelectedType(null)
						setSelectedMenuIndex(3) // File by default
						return
					}

					if (event.key === "ArrowUp" || event.key === "ArrowDown") {
						event.preventDefault()
						setSelectedMenuIndex((prevIndex) => {
							const direction = event.key === "ArrowUp" ? -1 : 1
							const options = getContextMenuOptions(searchQuery, selectedType, queryItems, fileSearchResults)
							const optionsLength = options.length

							if (optionsLength === 0) return prevIndex

							// Find selectable options (non-URL types)
							const selectableOptions = options.filter(
								(option) =>
									option.type !== ContextMenuOptionType.URL && option.type !== ContextMenuOptionType.NoResults,
							)

							if (selectableOptions.length === 0) return -1 // No selectable options

							// Find the index of the next selectable option
							const currentSelectableIndex = selectableOptions.findIndex((option) => option === options[prevIndex])

							const newSelectableIndex =
								(currentSelectableIndex + direction + selectableOptions.length) % selectableOptions.length

							// Find the index of the selected option in the original options array
							return options.findIndex((option) => option === selectableOptions[newSelectableIndex])
						})
						return
					}
					if ((event.key === "Enter" || event.key === "Tab") && selectedMenuIndex !== -1) {
						event.preventDefault()
						const selectedOption = getContextMenuOptions(searchQuery, selectedType, queryItems, fileSearchResults)[
							selectedMenuIndex
						]
						if (
							selectedOption &&
							selectedOption.type !== ContextMenuOptionType.URL &&
							selectedOption.type !== ContextMenuOptionType.NoResults
						) {
							handleMentionSelect(selectedOption.type, selectedOption.value)
						}
						return
					}
				}

				const isComposing = event.nativeEvent?.isComposing ?? false
				if (event.key === "Enter" && !event.shiftKey && !isComposing) {
					event.preventDefault()

					if (!sendingDisabled) {
						setIsTextAreaFocused(false)
						onSend()
					}
				}

				if (event.key === "Backspace" && !isComposing) {
					const charBeforeCursor = inputValue[cursorPosition - 1]
					const charAfterCursor = inputValue[cursorPosition + 1]

					const charBeforeIsWhitespace =
						charBeforeCursor === " " || charBeforeCursor === "\n" || charBeforeCursor === "\r\n"
					const charAfterIsWhitespace =
						charAfterCursor === " " || charAfterCursor === "\n" || charAfterCursor === "\r\n"

					// Check if we're right after a space that follows a mention or slash command
					if (
						charBeforeIsWhitespace &&
						inputValue.slice(0, cursorPosition - 1).match(new RegExp(mentionRegex.source + "$"))
					) {
						// File mention handling
						const newCursorPosition = cursorPosition - 1
						if (!charAfterIsWhitespace) {
							event.preventDefault()
							textAreaRef.current?.setSelectionRange(newCursorPosition, newCursorPosition)
							setCursorPosition(newCursorPosition)
						}
						setCursorPosition(newCursorPosition)
						setJustDeletedSpaceAfterMention(true)
						setJustDeletedSpaceAfterSlashCommand(false)
					} else if (charBeforeIsWhitespace && inputValue.slice(0, cursorPosition - 1).match(slashCommandDeleteRegex)) {
						// New slash command handling
						const newCursorPosition = cursorPosition - 1
						if (!charAfterIsWhitespace) {
							event.preventDefault()
							textAreaRef.current?.setSelectionRange(newCursorPosition, newCursorPosition)
							setCursorPosition(newCursorPosition)
						}
						setCursorPosition(newCursorPosition)
						setJustDeletedSpaceAfterSlashCommand(true)
						setJustDeletedSpaceAfterMention(false)
					}
					// Handle the second backspace press for mentions or slash commands
					else if (justDeletedSpaceAfterMention) {
						const { newText, newPosition } = removeMention(inputValue, cursorPosition)
						if (newText !== inputValue) {
							event.preventDefault()
							setInputValue(newText)
							setIntendedCursorPosition(newPosition)
						}
						setJustDeletedSpaceAfterMention(false)
						setShowContextMenu(false)
					} else if (justDeletedSpaceAfterSlashCommand) {
						// New slash command deletion
						const { newText, newPosition } = removeSlashCommand(inputValue, cursorPosition)
						if (newText !== inputValue) {
							event.preventDefault()
							setInputValue(newText)
							setIntendedCursorPosition(newPosition)
						}
						setJustDeletedSpaceAfterSlashCommand(false)
						setShowSlashCommandsMenu(false)
					}
					// Default case - reset flags if none of the above apply
					else {
						setJustDeletedSpaceAfterMention(false)
						setJustDeletedSpaceAfterSlashCommand(false)
					}
				}
			},
			[
				onSend,
				showContextMenu,
				searchQuery,
				selectedMenuIndex,
				handleMentionSelect,
				selectedType,
				inputValue,
				cursorPosition,
				setInputValue,
				justDeletedSpaceAfterMention,
				queryItems,
				fileSearchResults,
				showSlashCommandsMenu,
				selectedSlashCommandsIndex,
				slashCommandsQuery,
				handleSlashCommandsSelect,
				sendingDisabled,
			],
		)

		// Effect to set cursor position after state updates
		useLayoutEffect(() => {
			if (intendedCursorPosition !== null && textAreaRef.current) {
				textAreaRef.current.setSelectionRange(intendedCursorPosition, intendedCursorPosition)
				setIntendedCursorPosition(null) // Reset the state after applying
			}
		}, [inputValue, intendedCursorPosition])

		useEffect(() => {
			if (pendingInsertions.length === 0 || !textAreaRef.current) {
				return
			}

			const path = pendingInsertions[0]
			const currentTextArea = textAreaRef.current
			const currentValue = currentTextArea.value
			const currentCursorPos =
				intendedCursorPosition ??
				(currentTextArea.selectionStart >= 0 ? currentTextArea.selectionStart : currentValue.length)

			const { newValue, mentionIndex } = insertMentionDirectly(currentValue, currentCursorPos, path)

			setInputValue(newValue)

			const newCursorPosition = mentionIndex + path.length + 2
			setIntendedCursorPosition(newCursorPosition)

			setPendingInsertions((prev) => prev.slice(1))
		}, [pendingInsertions, setInputValue])

		const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

		const currentSearchQueryRef = useRef<string>("")

		const handleInputChange = useCallback(
			(e: React.ChangeEvent<HTMLTextAreaElement>) => {
				const newValue = e.target.value
				const newCursorPosition = e.target.selectionStart
				setInputValue(newValue)
				setCursorPosition(newCursorPosition)
				let showMenu = shouldShowContextMenu(newValue, newCursorPosition)
				const showSlashCommandsMenu = shouldShowSlashCommandsMenu(newValue, newCursorPosition)

				// we do not allow both menus to be shown at the same time
				// the slash commands menu has precedence bc its a narrower component
				if (showSlashCommandsMenu) {
					showMenu = false
				}

				setShowSlashCommandsMenu(showSlashCommandsMenu)
				setShowContextMenu(showMenu)

				if (showSlashCommandsMenu) {
					const slashIndex = newValue.indexOf("/")
					const query = newValue.slice(slashIndex + 1, newCursorPosition)
					setSlashCommandsQuery(query)
					setSelectedSlashCommandsIndex(0)
				} else {
					setSlashCommandsQuery("")
					setSelectedSlashCommandsIndex(0)
				}

				if (showMenu) {
					const lastAtIndex = newValue.lastIndexOf("@", newCursorPosition - 1)
					const query = newValue.slice(lastAtIndex + 1, newCursorPosition)
					setSearchQuery(query)
					currentSearchQueryRef.current = query

					if (query.length > 0 && !selectedType) {
						setSelectedMenuIndex(0)

						// Clear any existing timeout
						if (searchTimeoutRef.current) {
							clearTimeout(searchTimeoutRef.current)
						}

						setSearchLoading(true)

						// Set a timeout to debounce the search requests
						searchTimeoutRef.current = setTimeout(() => {
							FileServiceClient.searchFiles({
								query: query,
								mentionsRequestId: query,
							})
								.then((results) => {
									setFileSearchResults(results.results || [])
									setSearchLoading(false)
								})
								.catch((error) => {
									console.error("Error searching files:", error)
									setFileSearchResults([])
									setSearchLoading(false)
								})
						}, 200) // 200ms debounce
					} else {
						setSelectedMenuIndex(3) // Set to "File" option by default
					}
				} else {
					setSearchQuery("")
					setSelectedMenuIndex(-1)
					setFileSearchResults([])
				}
			},
			[setInputValue, setFileSearchResults, selectedType],
		)

		useEffect(() => {
			if (!showContextMenu) {
				setSelectedType(null)
			}
		}, [showContextMenu])

		const handleBlur = useCallback(() => {
			// Only hide the context menu if the user didn't click on it
			if (!isMouseDownOnMenu) {
				setShowContextMenu(false)
				setShowSlashCommandsMenu(false)
			}
			setIsTextAreaFocused(false)
			onFocusChange?.(false) // Call prop on blur
		}, [isMouseDownOnMenu, onFocusChange])

		const showDimensionErrorMessage = useCallback(() => {
			setShowDimensionError(true)
			if (dimensionErrorTimerRef.current) {
				clearTimeout(dimensionErrorTimerRef.current)
			}
			dimensionErrorTimerRef.current = setTimeout(() => {
				setShowDimensionError(false)
				dimensionErrorTimerRef.current = null
			}, 3000)
		}, [])

		const handlePaste = useCallback(
			async (e: React.ClipboardEvent) => {
				const items = e.clipboardData.items

				const pastedText = e.clipboardData.getData("text")
				// 检查粘贴的内容是否是 URL，如果是，则在 URL 后添加一个空格，方便用户在不需要时轻松删除
				const urlRegex = /^\S+:\/\/\S+$/
				if (urlRegex.test(pastedText.trim())) {
					e.preventDefault()
					const trimmedUrl = pastedText.trim()
					const newValue = inputValue.slice(0, cursorPosition) + trimmedUrl + " " + inputValue.slice(cursorPosition)
					setInputValue(newValue)
					const newCursorPosition = cursorPosition + trimmedUrl.length + 1
					setCursorPosition(newCursorPosition)
					setIntendedCursorPosition(newCursorPosition)
					setShowContextMenu(false)

					// 滚动到新的光标位置
					// https://stackoverflow.com/questions/29899364/how-do-you-scroll-to-the-position-of-the-cursor-in-a-textarea/40951875#40951875
					setTimeout(() => {
						if (textAreaRef.current) {
							textAreaRef.current.blur()
							textAreaRef.current.focus()
						}
					}, 0)
					// 注意：回调函数不使用返回函数进行清理，但这没关系，因为此超时会立即执行并由浏览器清理（组件在此之前卸载的几率为零）

					return
				}

				const acceptedTypes = ["png", "jpeg", "webp"] // anthropic 和 openrouter 支持的格式（jpg 只是文件扩展名，但图像将被识别为 jpeg）
				const imageItems = Array.from(items).filter((item) => {
					const [type, subtype] = item.type.split("/")
					return type === "image" && acceptedTypes.includes(subtype)
				})
				if (!shouldDisableImages && imageItems.length > 0) {
					e.preventDefault()
					const imagePromises = imageItems.map((item) => {
						return new Promise<string | null>((resolve) => {
							const blob = item.getAsFile()
							if (!blob) {
								resolve(null)
								return
							}
							const reader = new FileReader()
							reader.onloadend = async () => {
								if (reader.error) {
									console.error("Error reading file:", reader.error)
									resolve(null)
								} else {
									const result = reader.result
									if (typeof result === "string") {
										try {
											await getImageDimensions(result)
											resolve(result)
										} catch (error) {
											console.warn((error as Error).message)
											showDimensionErrorMessage()
											resolve(null)
										}
									} else {
										resolve(null)
									}
								}
							}
							reader.readAsDataURL(blob)
						})
					})
					const imageDataArray = await Promise.all(imagePromises)
					const dataUrls = imageDataArray.filter((dataUrl): dataUrl is string => dataUrl !== null)
					//.map((dataUrl) => dataUrl.split(",")[1]) // 去掉 mime 类型前缀，sharp 不需要它
					if (dataUrls.length > 0) {
						setSelectedImages((prevImages) => [...prevImages, ...dataUrls].slice(0, MAX_IMAGES_PER_MESSAGE))
					} else {
						console.warn("No valid images were processed")
					}
				}
			},
			[shouldDisableImages, setSelectedImages, cursorPosition, setInputValue, inputValue, showDimensionErrorMessage],
		)

		const handleThumbnailsHeightChange = useCallback((height: number) => {
			setThumbnailsHeight(height)
		}, [])

		useEffect(() => {
			if (selectedImages.length === 0) {
				setThumbnailsHeight(0)
			}
		}, [selectedImages])

		const handleMenuMouseDown = useCallback(() => {
			setIsMouseDownOnMenu(true)
		}, [])

		const updateHighlights = useCallback(() => {
			if (!textAreaRef.current || !highlightLayerRef.current) return

			let processedText = textAreaRef.current.value

			processedText = processedText
				.replace(/\n$/, "\n\n")
				.replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" })[c] || c)
				// 高亮 @提及
				.replace(mentionRegexGlobal, '<mark class="mention-context-textarea-highlight">$&</mark>')

			// 检查是否高亮 /斜杠命令
			if (/^\s*\//.test(processedText)) {
				const slashIndex = processedText.indexOf("/")

				// 命令的结束是文本的末尾或第一个空白字符
				const spaceIndex = processedText.indexOf(" ", slashIndex)
				const endIndex = spaceIndex > -1 ? spaceIndex : processedText.length

				// 提取并验证确切的命令文本
				const commandText = processedText.substring(slashIndex + 1, endIndex)
				const isValidCommand = validateSlashCommand(commandText, workflowToggles)

				if (isValidCommand) {
					const fullCommand = processedText.substring(slashIndex, endIndex) // 包含斜杠

					const highlighted = `<mark class="mention-context-textarea-highlight">${fullCommand}</mark>`
					processedText = processedText.substring(0, slashIndex) + highlighted + processedText.substring(endIndex)
				}
			}

			highlightLayerRef.current.innerHTML = processedText
			highlightLayerRef.current.scrollTop = textAreaRef.current.scrollTop
			highlightLayerRef.current.scrollLeft = textAreaRef.current.scrollLeft
		}, [workflowToggles])

		useLayoutEffect(() => {
			updateHighlights()
		}, [inputValue, updateHighlights])

		const updateCursorPosition = useCallback(() => {
			if (textAreaRef.current) {
				setCursorPosition(textAreaRef.current.selectionStart)
			}
		}, [])

		const handleKeyUp = useCallback(
			(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
				if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(e.key)) {
					updateCursorPosition()
				}
			},
			[updateCursorPosition],
		)

		// 分离 API 配置提交逻辑
		const submitApiConfig = useCallback(() => {
			const apiValidationResult = validateApiConfiguration(apiConfiguration)
			const modelIdValidationResult = validateModelId(apiConfiguration, openRouterModels)

			if (!apiValidationResult && !modelIdValidationResult) {
				vscode.postMessage({ type: "apiConfiguration", apiConfiguration })
			} else {
				StateServiceClient.getLatestState(EmptyRequest.create())
					.then(() => {
						console.log("State refreshed")
					})
					.catch((error) => {
						console.error("Error refreshing state:", error)
					})
			}
		}, [apiConfiguration, openRouterModels])

		const onModeToggle = useCallback(() => {
			// if (textAreaDisabled) return
			let changeModeDelay = 0
			if (showModelSelector) {
				// 用户打开了模型选择器，因此我们应该在切换模式之前保存它
				submitApiConfig()
				changeModeDelay = 250 // 需要让 API 配置更新（我们发送消息并等待它被保存） FIXME: 这是一个临时的解决方案，理想情况下，我们应该检查 API 配置的更改，然后等待它被保存，再切换模式
			}
			setTimeout(() => {
				const newMode = chatSettings.mode === "plan" ? "act" : "plan"
				vscode.postMessage({
					type: "togglePlanActMode",
					chatSettings: {
						mode: newMode,
					},
					chatContent: {
						message: inputValue.trim() ? inputValue : undefined,
						images: selectedImages.length > 0 ? selectedImages : undefined,
					},
				})
				// 模式切换后，稍作延迟，聚焦文本区域
				setTimeout(() => {
					textAreaRef.current?.focus()
				}, 100)
			}, changeModeDelay)
		}, [chatSettings.mode, showModelSelector, submitApiConfig, inputValue, selectedImages])

		useShortcut("Meta+Shift+a", onModeToggle, { disableTextInputs: false }) // 重要提示：此处不要禁用文本输入

		const handleContextButtonClick = useCallback(() => {
			// 首先聚焦文本区域
			textAreaRef.current?.focus()

			// 如果输入为空，则直接插入 @
			if (!inputValue.trim()) {
				const event = {
					target: {
						value: "@",
						selectionStart: 1,
					},
				} as React.ChangeEvent<HTMLTextAreaElement>
				handleInputChange(event)
				updateHighlights()
				return
			}

			// 如果输入以空格结尾或为空，则直接追加 @
			if (inputValue.endsWith(" ")) {
				const event = {
					target: {
						value: inputValue + "@",
						selectionStart: inputValue.length + 1,
					},
				} as React.ChangeEvent<HTMLTextAreaElement>
				handleInputChange(event)
				updateHighlights()
				return
			}

			// 否则先添加空格再添加 @
			const event = {
				target: {
					value: inputValue + " @",
					selectionStart: inputValue.length + 2,
				},
			} as React.ChangeEvent<HTMLTextAreaElement>
			handleInputChange(event)
			updateHighlights()
		}, [inputValue, handleInputChange, updateHighlights])

		// 使用 effect 检测菜单关闭
		useEffect(() => {
			if (prevShowModelSelector.current && !showModelSelector) {
				// 菜单刚刚关闭
				submitApiConfig()
			}
			prevShowModelSelector.current = showModelSelector
		}, [showModelSelector, submitApiConfig])

		// 移除 handleApiConfigSubmit 回调
		// 更新点击处理程序以仅切换菜单
		const handleModelButtonClick = () => {
			setShowModelSelector(!showModelSelector)
		}

		// 更新点击外部区域的处理程序以仅关闭菜单
		useClickAway(modelSelectorRef, () => {
			setShowModelSelector(false)
		})

		// 获取模型显示名称
		const modelDisplayName = useMemo(() => {
			const { selectedProvider, selectedModelId } = normalizeApiConfiguration(apiConfiguration)
			const unknownModel = "unknown"
			if (!apiConfiguration) return unknownModel
			switch (selectedProvider) {
				case "cline":
					return `${selectedProvider}:${selectedModelId}`
				case "openai":
					return `openai-compat:${selectedModelId}`
				case "vscode-lm":
					return `vscode-lm:${apiConfiguration.vsCodeLmModelSelector ? `${apiConfiguration.vsCodeLmModelSelector.vendor ?? ""}/${apiConfiguration.vsCodeLmModelSelector.family ?? ""}` : unknownModel}`
				case "together":
					return `${selectedProvider}:${apiConfiguration.togetherModelId}`
				case "fireworks":
					return `fireworks:${apiConfiguration.fireworksModelId}`
				case "lmstudio":
					return `${selectedProvider}:${apiConfiguration.lmStudioModelId}`
				case "ollama":
					return `${selectedProvider}:${apiConfiguration.ollamaModelId}`
				case "litellm":
					return `${selectedProvider}:${apiConfiguration.liteLlmModelId}`
				case "requesty":
				case "anthropic":
				case "openrouter":
				default:
					return `${selectedProvider}:${selectedModelId}`
			}
		}, [apiConfiguration])

		// 根据按钮位置计算箭头位置和菜单位置
		useEffect(() => {
			if (showModelSelector && buttonRef.current) {
				const buttonRect = buttonRef.current.getBoundingClientRect()
				const buttonCenter = buttonRect.left + buttonRect.width / 2

				// 使用视口坐标计算与视口右边缘的距离
				const rightPosition = document.documentElement.clientWidth - buttonCenter - 5

				setArrowPosition(rightPosition)
				setMenuPosition(buttonRect.top + 1) // 添加 +1 以将菜单下移 1px
			}
		}, [showModelSelector, viewportWidth, viewportHeight])

		useEffect(() => {
			if (!showModelSelector) {
				// 如果可能，尝试保存
				// 注意：我们不能在这里调用它，因为 getLatestState 会更新状态，从而导致此 effect 和回调之间产生无限循环。我们应该在菜单明确关闭时提交 API 配置，而不是作为 showModelSelector 变化的副作用。
				// handleApiConfigSubmit()

				// 通过模糊按钮重置任何活动样式
				const button = buttonRef.current?.querySelector("a")
				if (button) {
					button.blur()
				}
			}
		}, [showModelSelector])

		// 用于显示拖放不支持文件的错误消息的函数
		const showUnsupportedFileErrorMessage = () => {
			// 显示不支持文件的错误消息
			setShowUnsupportedFileError(true)

			// 清除任何现有的计时器
			if (unsupportedFileTimerRef.current) {
				clearTimeout(unsupportedFileTimerRef.current)
			}

			// 设置计时器，3 秒后隐藏错误
			unsupportedFileTimerRef.current = setTimeout(() => {
				setShowUnsupportedFileError(false)
				unsupportedFileTimerRef.current = null
			}, 3000)
		}

		const handleDragEnter = (e: React.DragEvent) => {
			e.preventDefault()
			setIsDraggingOver(true)

			// 检查是否正在拖动文件
			if (e.dataTransfer.types.includes("Files")) {
				// 检查是否有任何文件不是图像
				const items = Array.from(e.dataTransfer.items)
				const hasNonImageFile = items.some((item) => {
					if (item.kind === "file") {
						const type = item.type.split("/")[0]
						return type !== "image"
					}
					return false
				})

				if (hasNonImageFile) {
					showUnsupportedFileErrorMessage()
				}
			}
		}
		/**
		 * Handles the drag over event to allow dropping.
		 * Prevents the default behavior to enable drop.
		 *
		 * @param {React.DragEvent} e - The drag event.
		 */
		const onDragOver = (e: React.DragEvent) => {
			e.preventDefault()
			// 确保如果拖动继续在元素上，状态保持为 true
			if (!isDraggingOver) {
				setIsDraggingOver(true)
			}
		}

		const handleDragLeave = (e: React.DragEvent) => {
			e.preventDefault()
			// 检查相关目标是否仍在拖放区域内；防止闪烁
			const dropZone = e.currentTarget as HTMLElement
			if (!dropZone.contains(e.relatedTarget as Node)) {
				setIsDraggingOver(false)
				// 不要在这里清除错误消息，让它自然超时
			}
		}

		// 用于检测拖动操作在组件外部结束的 Effect
		useEffect(() => {
			const handleGlobalDragEnd = () => {
				// 当拖动操作在任何地方结束时，将触发此操作
				setIsDraggingOver(false)
				// 不要清除错误消息，让它自然超时
			}

			document.addEventListener("dragend", handleGlobalDragEnd)

			return () => {
				document.removeEventListener("dragend", handleGlobalDragEnd)
			}
		}, [])

		/**
		 * Handles the drop event for files and text.
		 * Processes dropped images and text, updating the state accordingly.
		 *
		 * @param {React.DragEvent} e - The drop event.
		 */
		const onDrop = async (e: React.DragEvent) => {
			e.preventDefault()
			setIsDraggingOver(false) // 拖放时重置状态

			// 当实际放置某些内容时清除所有错误消息
			setShowUnsupportedFileError(false)
			if (unsupportedFileTimerRef.current) {
				clearTimeout(unsupportedFileTimerRef.current)
				unsupportedFileTimerRef.current = null
			}

			// --- 1. VSCode 资源管理器拖放处理 ---
			let uris: string[] = []
			const resourceUrlsData = e.dataTransfer.getData("resourceurls")
			const vscodeUriListData = e.dataTransfer.getData("application/vnd.code.uri-list")

			// 1a. 首先尝试 'resourceurls'（用于多选）
			if (resourceUrlsData) {
				try {
					uris = JSON.parse(resourceUrlsData)
					uris = uris.map((uri) => decodeURIComponent(uri))
				} catch (error) {
					console.error("Failed to parse resourceurls JSON:", error)
					uris = [] // 如果解析失败则重置
				}
			}

			// 1b. 回退到 'application/vnd.code.uri-list'（换行符分隔）
			if (uris.length === 0 && vscodeUriListData) {
				uris = vscodeUriListData.split("\n").map((uri) => uri.trim())
			}

			// 1c. 筛选有效的 scheme（file 或 vscode-file）和非空字符串
			const validUris = uris.filter((uri) => uri && (uri.startsWith("vscode-file:") || uri.startsWith("file:")))

			if (validUris.length > 0) {
				setPendingInsertions([])
				let initialCursorPos = inputValue.length
				if (textAreaRef.current) {
					initialCursorPos = textAreaRef.current.selectionStart
				}
				setIntendedCursorPosition(initialCursorPos)

				FileServiceClient.getRelativePaths({ uris: validUris })
					.then((response) => {
						if (response.paths.length > 0) {
							setPendingInsertions((prev) => [...prev, ...response.paths])
						}
					})
					.catch((error) => {
						console.error("Error getting relative paths:", error)
					})
				return
			}

			const text = e.dataTransfer.getData("text")
			if (text) {
				handleTextDrop(text)
				return
			}

			// --- 3. 图像拖放处理 ---
			// 仅当不是 VSCode 资源或纯文本拖放时才继续
			const files = Array.from(e.dataTransfer.files)
			const acceptedTypes = ["png", "jpeg", "webp"]
			const imageFiles = files.filter((file) => {
				const [type, subtype] = file.type.split("/")
				return type === "image" && acceptedTypes.includes(subtype)
			})

			if (shouldDisableImages || imageFiles.length === 0) {
				return
			}

			const imageDataArray = await readImageFiles(imageFiles)
			const dataUrls = imageDataArray.filter((dataUrl): dataUrl is string => dataUrl !== null)

			if (dataUrls.length > 0) {
				setSelectedImages((prevImages) => [...prevImages, ...dataUrls].slice(0, MAX_IMAGES_PER_MESSAGE))
			} else {
				console.warn("No valid images were processed")
			}
		}

		/**
		 * Handles the drop event for text.
		 * Inserts the dropped text at the current cursor position.
		 *
		 * @param {string} text - The dropped text.
		 */
		const handleTextDrop = (text: string) => {
			const newValue = inputValue.slice(0, cursorPosition) + text + inputValue.slice(cursorPosition)
			setInputValue(newValue)
			const newCursorPosition = cursorPosition + text.length
			setCursorPosition(newCursorPosition)
			setIntendedCursorPosition(newCursorPosition)
		}

		/**
		 * Reads image files and returns their data URLs.
		 * Uses FileReader to read the files as data URLs.
		 *
		 * @param {File[]} imageFiles - The image files to read.
		 * @returns {Promise<(string | null)[]>} - A promise that resolves to an array of data URLs or null values.
		 */
		const readImageFiles = (imageFiles: File[]): Promise<(string | null)[]> => {
			return Promise.all(
				imageFiles.map(
					(file) =>
						new Promise<string | null>((resolve) => {
							const reader = new FileReader()
							reader.onloadend = async () => {
								// 使其异步
								if (reader.error) {
									console.error("Error reading file:", reader.error)
									resolve(null)
								} else {
									const result = reader.result
									if (typeof result === "string") {
										try {
											await getImageDimensions(result) // 检查尺寸
											resolve(result)
										} catch (error) {
											console.warn((error as Error).message)
											showDimensionErrorMessage() // 向用户显示错误
											resolve(null) // 不要添加此图像
										}
									} else {
										resolve(null)
									}
								}
							}
							reader.readAsDataURL(file)
						}),
				),
			)
		}

		return (
			<div>
				<div
					style={{
						padding: "10px 15px",
						opacity: 1,
						position: "relative",
						display: "flex",
						// 拖拽悬浮样式已移至 DynamicTextArea
						transition: "background-color 0.1s ease-in-out, border 0.1s ease-in-out",
					}}
					onDrop={onDrop}
					onDragOver={onDragOver}
					onDragEnter={handleDragEnter}
					onDragLeave={handleDragLeave}>
					{showDimensionError && (
						<div
							style={{
								position: "absolute",
								inset: "10px 15px",
								backgroundColor: "rgba(var(--vscode-errorForeground-rgb), 0.1)",
								border: "2px solid var(--vscode-errorForeground)",
								borderRadius: 2,
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								zIndex: 10, // 确保它在其他元素之上
								pointerEvents: "none",
							}}>
							<span
								style={{
									color: "var(--vscode-errorForeground)",
									fontWeight: "bold",
									fontSize: "12px",
									textAlign: "center",
								}}>
								Image dimensions exceed 7500px
							</span>
						</div>
					)}
					{showUnsupportedFileError && (
						<div
							style={{
								position: "absolute",
								inset: "10px 15px",
								backgroundColor: "rgba(var(--vscode-errorForeground-rgb), 0.1)",
								border: "2px solid var(--vscode-errorForeground)",
								borderRadius: 2,
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								zIndex: 10,
								pointerEvents: "none",
							}}>
							<span
								style={{
									color: "var(--vscode-errorForeground)",
									fontWeight: "bold",
									fontSize: "12px",
								}}>
								Only image files are supported
							</span>
						</div>
					)}
					{showSlashCommandsMenu && (
						<div ref={slashCommandsMenuContainerRef}>
							<SlashCommandMenu
								onSelect={handleSlashCommandsSelect}
								selectedIndex={selectedSlashCommandsIndex}
								setSelectedIndex={setSelectedSlashCommandsIndex}
								onMouseDown={handleMenuMouseDown}
								query={slashCommandsQuery}
								workflowToggles={workflowToggles}
							/>
						</div>
					)}

					{showContextMenu && (
						<div ref={contextMenuContainerRef}>
							<ContextMenu
								onSelect={handleMentionSelect}
								searchQuery={searchQuery}
								onMouseDown={handleMenuMouseDown}
								selectedIndex={selectedMenuIndex}
								setSelectedIndex={setSelectedMenuIndex}
								selectedType={selectedType}
								queryItems={queryItems}
								dynamicSearchResults={fileSearchResults}
								isLoading={searchLoading}
							/>
						</div>
					)}
					{!isTextAreaFocused && !activeQuote && (
						<div
							style={{
								position: "absolute",
								inset: "10px 15px",
								border: "1px solid var(--vscode-input-border)",
								borderRadius: 2,
								pointerEvents: "none",
								zIndex: 5,
							}}
						/>
					)}
					<div
						ref={highlightLayerRef}
						style={{
							position: "absolute",
							top: 10,
							left: 15,
							right: 15,
							bottom: 10,
							pointerEvents: "none",
							whiteSpace: "pre-wrap",
							wordWrap: "break-word",
							color: "transparent",
							overflow: "hidden",
							backgroundColor: "var(--vscode-input-background)",
							fontFamily: "var(--vscode-font-family)",
							fontSize: "var(--vscode-editor-font-size)",
							lineHeight: "var(--vscode-editor-line-height)",
							borderRadius: 2,
							borderLeft: 0,
							borderRight: 0,
							borderTop: 0,
							borderColor: "transparent",
							borderBottom: `${thumbnailsHeight + 6}px solid transparent`,
							padding: "9px 28px 3px 9px",
						}}
					/>
					<DynamicTextArea
						data-testid="chat-input"
						ref={(el) => {
							if (typeof ref === "function") {
								ref(el)
							} else if (ref) {
								ref.current = el
							}
							textAreaRef.current = el
						}}
						value={inputValue}
						onChange={(e) => {
							handleInputChange(e)
							updateHighlights()
						}}
						onKeyDown={handleKeyDown}
						onKeyUp={handleKeyUp}
						onFocus={() => {
							setIsTextAreaFocused(true)
							onFocusChange?.(true) // 在聚焦时调用 prop
						}}
						onBlur={handleBlur}
						onPaste={handlePaste}
						onSelect={updateCursorPosition}
						onMouseUp={updateCursorPosition}
						onHeightChange={(height) => {
							if (textAreaBaseHeight === undefined || height < textAreaBaseHeight) {
								setTextAreaBaseHeight(height)
							}
							onHeightChange?.(height)
						}}
						placeholder={showUnsupportedFileError || showDimensionError ? "" : placeholderText}
						maxRows={10}
						autoFocus={true}
						style={{
							width: "100%",
							boxSizing: "border-box",
							backgroundColor: "transparent",
							color: "var(--vscode-input-foreground)",
							//border: "1px solid var(--vscode-input-border)",
							borderRadius: 2,
							fontFamily: "var(--vscode-font-family)",
							fontSize: "var(--vscode-editor-font-size)",
							lineHeight: "var(--vscode-editor-line-height)",
							resize: "none",
							overflowX: "hidden",
							overflowY: "scroll",
							scrollbarWidth: "none",
							// 由于我们设置了 maxRows，当文本足够长时，它会开始溢出底部填充，显示在缩略图后面。为了解决这个问题，我们使用透明边框将文本向上推。(https://stackoverflow.com/questions/42631947/maintaining-a-padding-inside-of-text-area/52538410#52538410)
							// borderTop: "9px solid transparent",
							borderLeft: 0,
							borderRight: 0,
							borderTop: 0,
							borderBottom: `${thumbnailsHeight + 6}px solid transparent`,
							borderColor: "transparent",
							// borderRight: "54px solid transparent",
							// borderLeft: "9px solid transparent", // 注意：react-textarea-autosize 在使用 borderLeft/borderRight 时无法计算正确的高度，因此我们需要改用水平填充
							// 我们使用带边框的 div 来代替 boxShadow，以便更好地模拟文本区域聚焦时的行为
							// boxShadow: "0px 0px 0px 1px var(--vscode-input-border)",
							padding: "9px 28px 3px 9px",
							cursor: "text",
							flex: 1,
							zIndex: 1,
							outline:
								isDraggingOver && !showUnsupportedFileError // 仅在未显示错误时显示拖动轮廓
									? "2px dashed var(--vscode-focusBorder)"
									: isTextAreaFocused
										? `1px solid ${chatSettings.mode === "plan" ? PLAN_MODE_COLOR : "var(--vscode-focusBorder)"}`
										: "none",
							outlineOffset: isDraggingOver && !showUnsupportedFileError ? "1px" : "0px", // 为拖拽悬浮轮廓添加偏移量
						}}
						onScroll={() => updateHighlights()}
					/>
					{selectedImages.length > 0 && (
						<Thumbnails
							images={selectedImages}
							setImages={setSelectedImages}
							onHeightChange={handleThumbnailsHeightChange}
							style={{
								position: "absolute",
								paddingTop: 4,
								bottom: 14,
								left: 22,
								right: 47, // (54 + 9) + 4 额外填充
								zIndex: 2,
							}}
						/>
					)}
					<div
						style={{
							position: "absolute",
							right: 23,
							display: "flex",
							alignItems: "flex-center",
							height: textAreaBaseHeight || 31,
							bottom: 9.5, // 应该是 10 但在 mac 上看起来不好
							zIndex: 2,
						}}>
						<div
							style={{
								display: "flex",
								flexDirection: "row",
								alignItems: "center",
							}}>
							{/* <div
								className={`input-icon-button ${shouldDisableImages ? "disabled" : ""} codicon codicon-device-camera`}
								onClick={() => {
									if (!shouldDisableImages) {
										onSelectImages()
									}
								}}
								style={{
									marginRight: 5.5,
									fontSize: 16.5,
								}}
							/> */}
							<div
								data-testid="send-button"
								className={`input-icon-button ${sendingDisabled ? "disabled" : ""} codicon codicon-send`}
								onClick={() => {
									if (!sendingDisabled) {
										setIsTextAreaFocused(false)
										onSend()
									}
								}}
								style={{ fontSize: 15 }}></div>
						</div>
					</div>
				</div>

				<ControlsContainer>
					{/* 始终渲染两个组件，但使用 CSS 控制可见性 */}
					<div
						style={{
							position: "relative",
							flex: 1,
							minWidth: 0,
							height: "28px", // 固定高度以防止容器收缩
						}}>
						{/* ButtonGroup - 始终在 DOM 中，但可见性受控 */}
						<ButtonGroup
							style={{
								position: "absolute",
								top: 0,
								left: 0,
								right: 0,
								transition: "opacity 0.3s ease-in-out",
								width: "100%",
								height: "100%",
								zIndex: 6,
							}}>
							<Tooltip tipText="添加上下文" style={{ left: 0 }}>
								<VSCodeButton
									data-testid="context-button"
									appearance="icon"
									aria-label="添加上下文"
									onClick={handleContextButtonClick}
									style={{ padding: "0px 0px", height: "20px" }}>
									<ButtonContainer>
										<span className="flex items-center" style={{ fontSize: "13px", marginBottom: 1 }}>
											@
										</span>
									</ButtonContainer>
								</VSCodeButton>
							</Tooltip>

							<Tooltip tipText="添加图片">
								<VSCodeButton
									data-testid="images-button"
									appearance="icon"
									aria-label="添加图片"
									disabled={shouldDisableImages}
									onClick={() => {
										if (!shouldDisableImages) {
											onSelectImages()
										}
									}}
									style={{ padding: "0px 0px", height: "20px" }}>
									<ButtonContainer>
										<span
											className="codicon codicon-device-camera flex items-center"
											style={{ fontSize: "14px", marginBottom: -3 }}
										/>
									</ButtonContainer>
								</VSCodeButton>
							</Tooltip>
							<ServersToggleModal />
							<ClineRulesToggleModal />
							<ModelContainer ref={modelSelectorRef}>
								<ModelButtonWrapper ref={buttonRef}>
									<ModelDisplayButton
										role="button"
										isActive={showModelSelector}
										disabled={false}
										title="选择模型 / API 提供者"
										onClick={handleModelButtonClick}
										tabIndex={0}>
										<ModelButtonContent>{modelDisplayName}</ModelButtonContent>
									</ModelDisplayButton>
								</ModelButtonWrapper>
								{showModelSelector && (
									<ModelSelectorTooltip
										arrowPosition={arrowPosition}
										menuPosition={menuPosition}
										style={{
											bottom: `calc(100vh - ${menuPosition}px + 6px)`,
										}}>
										<ApiOptions
											showModelOptions={true}
											apiErrorMessage={undefined}
											modelIdErrorMessage={undefined}
											isPopup={true}
											saveImmediately={true} // 确保弹窗立即保存
										/>
									</ModelSelectorTooltip>
								)}
							</ModelContainer>
						</ButtonGroup>
					</div>
					{/* Plan/Act 切换的 Tooltip 保留在条件渲染之外 */}
					<Tooltip
						style={{ zIndex: 1000 }}
						visible={shownTooltipMode !== null}
						tipText={`在 ${shownTooltipMode === "act" ? "Act" : "Plan"} 模式下，Cline 将${shownTooltipMode === "act" ? "立即完成任务" : "收集信息以构建计划"}`}
						hintText={`使用 ${metaKeyChar}+Shift+A 切换`}>
						<SwitchContainer data-testid="mode-switch" disabled={false} onClick={onModeToggle}>
							<Slider isAct={chatSettings.mode === "act"} isPlan={chatSettings.mode === "plan"} />
							<SwitchOption
								isActive={chatSettings.mode === "plan"}
								onMouseOver={() => setShownTooltipMode("plan")}
								onMouseLeave={() => setShownTooltipMode(null)}>
								Plan
							</SwitchOption>
							<SwitchOption
								isActive={chatSettings.mode === "act"}
								onMouseOver={() => setShownTooltipMode("act")}
								onMouseLeave={() => setShownTooltipMode(null)}>
								Act
							</SwitchOption>
						</SwitchContainer>
					</Tooltip>
				</ControlsContainer>
			</div>
		)
	},
)

// Update TypeScript interface for styled-component props
interface ModelSelectorTooltipProps {
	arrowPosition: number
	menuPosition: number
}

export default ChatTextArea
