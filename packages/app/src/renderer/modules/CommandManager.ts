import { inject, injectable } from "inversify"

import type Response from "@shared/types/Response"
import type { TreeViewModel } from "../viewmodels/TreeViewModel"
import type { SettingsViewModel } from "../viewmodels/SettingsViewModel"
import type { TreeDto } from "@shared/dto/TreeDto"
import type { TabEditorDto, TabEditorsDto } from "@shared/dto/TabEditorDto"

import closedFolderSvg from "../assets/icons/closed_folder.svg?raw"
import openedFolderSvg from "../assets/icons/opened_folder.svg?raw"

import { DI, DOM } from "../constants"

import { FocusManager } from "../core"

import { TabEditorFacade, TreeFacade, SettingsFacade } from "./index"

import type { ICommand } from "../commands/"
import { CreateCommand, DeleteCommand, PasteCommand, RenameCommand } from "../commands"

import { debounce } from "../utils/debounce"
import { sleep } from "../utils/sleep"

@injectable()
export class CommandManager {
	private undoStack: ICommand[] = []
	private redoStack: ICommand[] = []

	constructor(
		@inject(DI.FocusManager) private readonly focusManager: FocusManager,
		@inject(DI.SettingsFacade) private readonly settingsFacade: SettingsFacade,
		@inject(DI.TabEditorFacade) private readonly tabEditorFacade: TabEditorFacade,
		@inject(DI.TreeFacade) private readonly treeFacade: TreeFacade
	) {
		this.tabEditorFacade.findInput.addEventListener(
			"input",
			debounce(() => {
				this.performFind(this.tabEditorFacade.findDirection)
			}, 300)
		)
	}

	//

	performUndoEditor() {
		this.tabEditorFacade.undoEditor()
	}

	async performUndoTree() {
		try {
			window.rendererToMain.setWatchSkipState(true)
			const cmd = this.undoStack.pop()
			if (!cmd) return
			await cmd.undo()
			this.redoStack.push(cmd)
		} catch (err) {
			// Undo failed (e.g., parent copied into child, or src/dest no longer exists).
			// OS/File system may have ignored the operation; we just skip it to avoid breaking the stack.
		} finally {
			await sleep(300)
			window.rendererToMain.setWatchSkipState(false)
		}
	}

	performRedoEditor() {
		this.tabEditorFacade.redoEditor()
	}

	async performRedoTree() {
		try {
			window.rendererToMain.setWatchSkipState(true)
			const cmd = this.redoStack.pop()
			if (!cmd) return
			await cmd.execute()
			this.undoStack.push(cmd)
		} catch (err) {
			// intentionally empty
		} finally {
			await sleep(300)
			window.rendererToMain.setWatchSkipState(false)
		}
	}

	//

	async performNewTab() {
		const response: Response<number> = await window.rendererToMain.newTab()
		if (response.result) await this.tabEditorFacade.addTab(response.data)
	}

	async performOpenFile(filePath?: string) {
		if (filePath) {
			const tabEditorView = this.tabEditorFacade.getTabEditorViewByPath(filePath)
			if (tabEditorView) {
				this.tabEditorFacade.activateTabEditorById(tabEditorView.getId())
				return
			}
		}

		const response: Response<TabEditorDto> = await window.rendererToMain.openFile(filePath)
		if (response.result && response.data) {
			const data = response.data
			await this.tabEditorFacade.addTab(data.id, data.filePath, data.fileName, data.content, data.isBinary)
		}
	}

	async performOpenDirectory(treeNode?: HTMLElement) {
		// New open when shortcut or file menu.
		if (!treeNode) {
			const openDirectoryResponse: Response<TreeDto> = await window.rendererToMain.openDirectory()
			if (!openDirectoryResponse.data) return

			// Close existing tab.
			const tabEditorsDto = this.tabEditorFacade.getTabEditorsDto()
			const closeAllTabsResponse = await window.rendererToMain.closeAllTabs(tabEditorsDto)
			if (closeAllTabsResponse.result) this.tabEditorFacade.removeAllTabs(closeAllTabsResponse.data)

			const responseViewModel = this.treeFacade.toTreeViewModel(openDirectoryResponse.data)
			this.treeFacade.render(responseViewModel)
			this.treeFacade.setRootTreeViewModel(responseViewModel)

			return
		}

		// When click directory in tree area.
		const dirPath = treeNode.dataset[DOM.DATASET_ATTR_TREE_PATH]!
		const viewModel = this.treeFacade.getTreeViewModelByPath(dirPath)
		const maybeChildren = treeNode.nextElementSibling
		if (!maybeChildren || !maybeChildren.classList.contains(DOM.CLASS_TREE_NODE_CHILDREN)) return

		const nodeType = treeNode.querySelector(DOM.SELECTOR_TREE_NODE_TYPE) as HTMLElement
		const treeNodeChildren = maybeChildren as HTMLElement

		if (viewModel.expanded) {
			this._updateUI(nodeType, treeNodeChildren, viewModel, false)
			this._syncFlattenTreeArray(viewModel, false)
			return
		}

		if (viewModel.children && viewModel.children.length > 0) {
			if (treeNodeChildren.children.length === 0) {
				this.treeFacade.render(viewModel, treeNodeChildren)
			}
			this._updateUI(nodeType, treeNodeChildren, viewModel, true)
			this._syncFlattenTreeArray(viewModel, true)
			return
		}

		const response: Response<TreeDto> = await window.rendererToMain.openDirectory(viewModel)
		if (!response.data) return

		const responseTreeData = this.treeFacade.toTreeViewModel(response.data)

		viewModel.children = responseTreeData.children
		this.treeFacade.render(responseTreeData, treeNodeChildren)
		this._updateUI(nodeType, treeNodeChildren, viewModel, true)
		this._syncFlattenTreeArray(viewModel, true)
	}

	private _updateUI(nodeType: HTMLElement, children: HTMLElement, viewModel: TreeViewModel, expanded: boolean) {
		viewModel.expanded = expanded

		nodeType.innerHTML = expanded ? openedFolderSvg : closedFolderSvg

		if (expanded) children.classList.add(DOM.CLASS_EXPANDED)
		else children.classList.remove(DOM.CLASS_EXPANDED)
	}

	private _syncFlattenTreeArray(viewModel: TreeViewModel, expanded: boolean) {
		if (expanded) this.treeFacade.insertChildNodes(viewModel)
		else this.treeFacade.removeChildNodes(viewModel)
	}

	async performSave() {
		const data = this.tabEditorFacade.getActiveTabEditorDto()
		if (!data.isModified) return
		const response: Response<TabEditorDto> = await window.rendererToMain.save(data)
		if (response.result && !response.data.isModified) this.tabEditorFacade.applySaveResult(response.data)
	}

	async performSaveAs() {
		const data: TabEditorDto = this.tabEditorFacade.getActiveTabEditorDto()
		const response: Response<TabEditorDto> = await window.rendererToMain.saveAs(data)
		if (response.result && response.data) {
			this.tabEditorFacade.applySaveResult(response.data)
			await this.tabEditorFacade.addTab(
				response.data.id,
				response.data.filePath,
				response.data.fileName,
				response.data.content,
				response.data.isBinary,
				true
			)
		}
	}

	async performSaveAll() {
		const tabEditorsDto: TabEditorsDto = this.tabEditorFacade.getTabEditorsDto()
		const response: Response<TabEditorsDto> = await window.rendererToMain.saveAll(tabEditorsDto)
		if (response.result) this.tabEditorFacade.applySaveAllResults(response.data)
	}

	//

	async performCloseTab(id: number) {
		const data = this.tabEditorFacade.getTabEditorDtoById(id)

		const response: Response<void> = await window.rendererToMain.closeTab(data)
		if (response.result) this.tabEditorFacade.removeTab(data.id)

		if (this.tabEditorFacade.activeTabId === -1) this.performCloseFindReplaceBox()
	}

	async performCloseOtherTabs() {
		const tabEditorDtoToExclude: TabEditorDto = this.tabEditorFacade.getTabEditorDtoById(
			this.tabEditorFacade.contextTabId
		)
		const tabEditorsDto: TabEditorsDto = this.tabEditorFacade.getTabEditorsDto()
		const response: Response<boolean[]> = await window.rendererToMain.closeOtherTabs(
			tabEditorDtoToExclude,
			tabEditorsDto
		)
		if (response.result) this.tabEditorFacade.removeTabsExcept(response.data)
	}

	async performCloseTabsToRight() {
		const tabEditorDtoAsReference: TabEditorDto = this.tabEditorFacade.getTabEditorDtoById(
			this.tabEditorFacade.contextTabId
		)
		const tabEditorsDto: TabEditorsDto = this.tabEditorFacade.getTabEditorsDto()
		const response: Response<boolean[]> = await window.rendererToMain.closeTabsToRight(
			tabEditorDtoAsReference,
			tabEditorsDto
		)
		if (response.result) this.tabEditorFacade.removeTabsToRight(response.data)
	}

	async performCloseAllTabs() {
		const tabEditorsDto: TabEditorsDto = this.tabEditorFacade.getTabEditorsDto()
		const response: Response<boolean[]> = await window.rendererToMain.closeAllTabs(tabEditorsDto)
		if (response.result) this.tabEditorFacade.removeAllTabs(response.data)
	}

	//

	async performCreate(directory: boolean) {
		let idx = Math.max(this.treeFacade.lastSelectedIndex, 0)
		let viewModel = this.treeFacade.getTreeViewModelByIndex(idx)

		if (!viewModel.directory) {
			idx = this.treeFacade.findParentDirectoryIndex(idx)
			viewModel = this.treeFacade.getTreeViewModelByIndex(idx)
		} else {
			// if (!viewModel.expanded) await this.performOpenDirectory("programmatic", this.treeFacade.getTreeNodeByIndex(idx))
			if (!viewModel.expanded) await this.performOpenDirectory(this.treeFacade.getTreeNodeByIndex(idx))
		}

		let parentContainer: HTMLElement
		if (idx === 0) {
			parentContainer = this.treeFacade.renderer.elements.treeNodeContainer
		} else {
			const parentWrapper = this.treeFacade.getTreeWrapperByIndex(idx)!
			parentContainer = parentWrapper.querySelector(DOM.SELECTOR_TREE_NODE_CHILDREN) as HTMLElement
		}

		const { wrapper, input } = this.treeFacade.createInput(directory, viewModel.indent)
		parentContainer.appendChild(wrapper)
		input.focus()

		let alreadyFinished = false

		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Enter") finalize()
			else if (e.key === "Escape") cancel()
		}
		const onBlur = () => finalize()

		input.addEventListener("keydown", onKeyDown)
		input.addEventListener("blur", onBlur)

		const finalize = async () => {
			if (alreadyFinished) return
			alreadyFinished = true

			input.removeEventListener("keydown", onKeyDown)
			input.removeEventListener("blur", onBlur)

			wrapper.remove()

			const name = input.value.trim()
			if (name) {
				const cmd = new CreateCommand(this.treeFacade, this.tabEditorFacade, viewModel.path, name, directory)

				try {
					window.rendererToMain.setWatchSkipState(true)
					await cmd.execute()
					this.undoStack.push(cmd)
					this.redoStack.length = 0

					this.treeFacade.clearTreeSelected()

					const filePath = window.utils.getJoinedPath(viewModel.path, name)

					const createdIdx = this.treeFacade.getFlattenIndexByPath(filePath)!
					this.treeFacade.addSelectedIndices(createdIdx)
					this.treeFacade.lastSelectedIndex = createdIdx

					const createdNode = this.treeFacade.getTreeNodeByIndex(createdIdx)
					createdNode.classList.add(DOM.CLASS_FOCUSED)
					createdNode.classList.add(DOM.CLASS_SELECTED)

					if (!directory) {
						// await this.performOpenFile("programmatic", filePath)
						await this.performOpenFile(filePath)
						this.focusManager.setFocus("editor")
						const createdTabView = this.tabEditorFacade.getTabEditorViewByPath(filePath)!
						cmd.setOpenedTabId(createdTabView.getId())
					}
				} catch (error) {
					// intentionally empty
				} finally {
					await sleep(300)
					window.rendererToMain.setWatchSkipState(false)
				}
			}
		}

		const cancel = () => {
			if (alreadyFinished) return
			alreadyFinished = true

			input.removeEventListener("keydown", onKeyDown)
			input.removeEventListener("blur", onBlur)
			wrapper.remove()
		}
	}

	async performRename() {
		const focus = this.focusManager.getFocus()
		if (focus !== "tree") return

		const lastSelectedIndex = this.treeFacade.lastSelectedIndex
		const treeNode = this.treeFacade.getTreeNodeByIndex(lastSelectedIndex)
		const treeSpan = treeNode.querySelector(DOM.SELECTOR_TREE_NODE_TEXT)
		if (!treeSpan) return

		const treeInput = document.createElement("input")
		treeInput.type = "text"
		treeInput.value = treeSpan.textContent ?? ""
		treeInput.classList.add(DOM.CLASS_TREE_NODE_INPUT)

		treeNode.classList.remove(DOM.CLASS_FOCUSED)
		treeNode.replaceChild(treeInput, treeSpan)
		treeInput.focus()

		// Except ext name.
		const fileName = treeInput.value
		const lastDotIndex = fileName.lastIndexOf(".")
		if (lastDotIndex > 0) {
			treeInput.setSelectionRange(0, lastDotIndex)
		} else {
			treeInput.select()
		}

		let alreadyFinished = false

		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Enter") finishRename()
			else if (e.key === "Escape") cancelRename()
		}
		const onBlur = () => finishRename()

		treeInput.addEventListener("keydown", onKeyDown)
		treeInput.addEventListener("blur", onBlur)

		const finishRename = async () => {
			if (alreadyFinished) return
			alreadyFinished = true

			treeInput.removeEventListener("keydown", onKeyDown)
			treeInput.removeEventListener("blur", onBlur)

			const prePath = treeNode.dataset[DOM.DATASET_ATTR_TREE_PATH]!
			const newName = treeInput.value.trim()
			const dir = window.utils.getDirName(prePath)
			const newPath = window.utils.getJoinedPath(dir, newName)

			// Skip unique name generation for unchanged rename (unlike create or paste)
			if (prePath === newPath) {
				const restoreSpan = document.createElement("span")
				restoreSpan.classList.add(DOM.CLASS_TREE_NODE_TEXT, "ellipsis")
				restoreSpan.textContent = window.utils.getBaseName(newPath)
				treeNode.replaceChild(restoreSpan, treeInput)
				return
			}

			const viewModel = this.treeFacade.getTreeViewModelByPath(treeNode.dataset[DOM.DATASET_ATTR_TREE_PATH]!)

			const cmd = new RenameCommand(
				this.treeFacade,
				this.tabEditorFacade,
				treeNode,
				viewModel.directory,
				prePath,
				newPath
			)

			try {
				window.rendererToMain.setWatchSkipState(true)
				await cmd.execute()
				this.undoStack.push(cmd)
				this.redoStack.length = 0
			} catch {
				treeNode.replaceChild(treeSpan, treeInput)
			} finally {
				await sleep(300)
				window.rendererToMain.setWatchSkipState(false)
			}
		}

		const cancelRename = () => {
			if (alreadyFinished) return
			alreadyFinished = true

			treeInput.removeEventListener("keydown", onKeyDown)
			treeInput.removeEventListener("blur", onBlur)

			treeNode.replaceChild(treeSpan, treeInput)
		}
	}

	async performDelete() {
		const focus = this.focusManager.getFocus()
		if (focus !== "tree") return

		const selectedIndices = this.treeFacade.getSelectedIndices()

		const cmd = new DeleteCommand(this.treeFacade, this.tabEditorFacade, selectedIndices)

		try {
			await window.rendererToMain.setWatchSkipState(true)
			await cmd.execute()
			this.undoStack.push(cmd)
			this.redoStack.length = 0
		} catch {
			// intentionally empty
		} finally {
			await sleep(300)
			window.rendererToMain.setWatchSkipState(false)
		}
	}

	//

	performCutEditor() {
		const view = this.tabEditorFacade.getActiveTabEditorView()
		view.markAsModified()
	}

	async performCutEditorManual() {
		const sel = window.getSelection()
		const selectedText = sel?.toString()
		if (!sel || !selectedText) return

		await window.rendererToMain.cutEditor(selectedText)
		sel.deleteFromDocument()

		this.performCutEditor()
	}

	performCutTree() {
		this.treeFacade.clearClipboardPaths()
		this.treeFacade.clipboardMode = "cut"
		const selectedIndices = this.treeFacade.getSelectedIndices()

		for (const idx of selectedIndices) {
			this.treeFacade.getTreeWrapperByIndex(idx)!.classList.add(DOM.CLASS_CUT)
			this.treeFacade.addClipboardPaths(this.treeFacade.getTreeViewModelByIndex(idx).path)
			const viewModel = this.treeFacade.getTreeViewModelByIndex(idx)

			if (viewModel.directory) {
				for (let i = idx + 1; i < this.treeFacade.flattenTree.length; i++) {
					const isChildViewModel = this.treeFacade.getTreeViewModelByIndex(i)

					if (viewModel.indent < isChildViewModel.indent) {
						// note: We skip adding CLASS_CUT to children, as parent visually affects them
						// this.treeFacade.getTreeWrapperByIndex(i).classList.add(CLASS_CUT)
						this.treeFacade.addClipboardPaths(this.treeFacade.getTreeViewModelByIndex(idx).path)
						continue
					}

					break
				}
			}
		}

		return
	}

	async performCopyEditor() {
		const sel = window.getSelection()
		const selectedText = window.getSelection()?.toString()
		if (!sel || !selectedText) return

		await window.rendererToMain.copyEditor(selectedText)
	}

	performCopyTree() {
		this.treeFacade.clearClipboardPaths()
		this.treeFacade.clipboardMode = "copy"
		const selectedIndices = this.treeFacade.getSelectedIndices()

		for (const idx of selectedIndices) {
			this.treeFacade.addClipboardPaths(this.treeFacade.getTreeViewModelByIndex(idx).path)
			const viewModel = this.treeFacade.getTreeViewModelByIndex(idx)

			if (viewModel.directory) {
				for (let i = idx + 1; i < this.treeFacade.flattenTree.length; i++) {
					const isChildViewModel = this.treeFacade.getTreeViewModelByIndex(i)

					if (viewModel.indent < isChildViewModel.indent) {
						this.treeFacade.addClipboardPaths(this.treeFacade.getTreeViewModelByIndex(idx).path)
						continue
					}

					break
				}
			}
		}
	}

	performPasteEditor() {
		const view = this.tabEditorFacade.getActiveTabEditorView()
		view.markAsModified()
	}

	async performPasteEditorManual() {
		const editable = document.querySelector('#editor-container [contenteditable="true"]') as HTMLElement
		if (!editable) return
		editable.focus()

		const sel = window.getSelection()
		if (!sel || !sel.rangeCount) return
		sel.deleteFromDocument()

		const text = await window.rendererToMain.pasteEditor()
		const textNode = document.createTextNode(text)
		const range = sel.getRangeAt(0)
		range.insertNode(textNode)
		range.setStartAfter(textNode)
		// Defensive code to ensure cursor positioning
		range.collapse(true)
		sel.removeAllRanges()
		sel.addRange(range)

		this.performPasteEditor()
	}

	async performPasteTreeWithContextmenu() {
		const targetIndex = this.treeFacade.contextTreeIndex
		await this.performPasteTree(targetIndex)
	}

	async performPasteTreeWithShortcut() {
		const targetIndex = this.treeFacade.lastSelectedIndex
		await this.performPasteTree(targetIndex)
	}

	async performPasteTreeWithDrag() {
		const targetIndex = this.treeFacade.selectedDragIndex
		await this.performPasteTree(targetIndex)
	}

	private async performPasteTree(targetIndex: number) {
		if (targetIndex === -1) return

		let targetViewModel = this.treeFacade.getTreeViewModelByIndex(targetIndex!)
		if (!targetViewModel.directory) {
			targetIndex = this.treeFacade.findParentDirectoryIndex(targetIndex!)
			targetViewModel = this.treeFacade.getTreeViewModelByIndex(targetIndex)
		}

		const selectedViewModels = []
		const clipboardPaths = this.treeFacade.getClipboardPaths() ?? []

		for (const path of clipboardPaths) {
			selectedViewModels.push(this.treeFacade.getTreeViewModelByPath(path))
		}

		const cmd = new PasteCommand(
			this.treeFacade,
			this.tabEditorFacade,
			targetViewModel,
			selectedViewModels,
			this.treeFacade.clipboardMode
		)

		try {
			window.rendererToMain.setWatchSkipState(true)
			await cmd.execute()
			this.undoStack.push(cmd)
			this.redoStack.length = 0
		} catch {
			// intentionally empty
		} finally {
			await sleep(300)
			window.rendererToMain.setWatchSkipState(false)
		}

		return
	}

	//

	toggleFindReplaceBox(showReplace: boolean) {
		if (this.tabEditorFacade.activeTabId === -1) return

		this.focusManager.setFocus("find-replace")

		this.tabEditorFacade.findAndReplaceContainer.style.display = "flex"
		this.tabEditorFacade.replaceBox.style.display = showReplace ? "flex" : "none"
		this.tabEditorFacade.findReplaceOpen = true

		if (showReplace) this.tabEditorFacade.replaceInput.focus()
		else this.tabEditorFacade.findInput.focus()

		this.performFind(this.tabEditorFacade.findDirection)
	}

	performFind(direction: "up" | "down") {
		this.tabEditorFacade.findAndSelect(direction)
	}

	performReplace() {
		const findInput = this.tabEditorFacade.findInput.value
		const replaceInput = this.tabEditorFacade.replaceInput.value
		const view = this.tabEditorFacade.getActiveTabEditorView()

		const replaced = view.replaceCurrent(findInput, replaceInput)
		if (!replaced) return

		this.tabEditorFacade.findAndSelect()
	}

	performReplaceAll() {
		const focus = this.focusManager.getFocus()
		if (focus !== "find-replace") return

		const findInput = this.tabEditorFacade.findInput.value
		const replaceInput = this.tabEditorFacade.replaceInput.value

		const view = this.tabEditorFacade.getActiveTabEditorView()
		view.replaceAll(findInput, replaceInput)
	}

	performCloseFindReplaceBox() {
		this.focusManager.setFocus("none")
		this.tabEditorFacade.findAndReplaceContainer.style.display = "none"

		const activeView = this.tabEditorFacade.getActiveTabEditorView()
		if (activeView) activeView.clearSearch()

		this.tabEditorFacade.findReplaceOpen = false
	}

	//

	performApplySettings(viewModel: SettingsViewModel) {
		const font = viewModel.settingFontViewModel

		font.size && this.tabEditorFacade.changeFontSize(font.size)
		font.family && this.tabEditorFacade.changeFontFamily(font.family)

		this.settingsFacade.applyChangeSet()
	}

	async performApplyAndSaveSettings(viewModel: SettingsViewModel) {
		this.performApplySettings(viewModel)
		const settingsDto = this.settingsFacade.toSettingsDto(this.settingsFacade.getDraftSettings())
		await window.rendererToMain.syncSettingsSessionFromRenderer(settingsDto)
	}

	//

	async performESC() {
		const focus = this.focusManager.getFocus()

		if (focus === "editor" || focus === "find-replace") {
			this.performCloseFindReplaceBox()
		}
	}

	async performENTER() {
		const focus = this.focusManager.getFocus()

		if (focus === "find-replace") {
			const activateElement = document.activeElement

			if (activateElement === this.tabEditorFacade.findInput) {
				this.performFind(this.tabEditorFacade.findDirection)
			} else if (activateElement === this.tabEditorFacade.replaceInput) {
				this.performReplace()
			}

			return
		}

		if (focus === "tree") {
			const idx = Math.max(this.treeFacade.lastSelectedIndex, 0)
			const viewModel = this.treeFacade.getTreeViewModelByIndex(idx)

			if (viewModel.directory) {
				const treeNode = this.treeFacade.getTreeNodeByIndex(idx)
				await this.performOpenDirectory(treeNode)
			} else {
				await this.performOpenFile(viewModel.path)
			}

			// Re-focus the tree node to reclaim focus lost to the editor during the opening process.
			const treeNode = this.treeFacade.getTreeNodeByIndex(idx)
			treeNode.focus()

			return
		}
	}
}
