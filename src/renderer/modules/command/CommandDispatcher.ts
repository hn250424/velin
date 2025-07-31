import { inject, injectable } from "inversify"
import DI_KEYS from "../../constants/di_keys"
import Response from "@shared/types/Response"

import {
    CLASS_EXPANDED,
    CLASS_TREE_NODE_CHILDREN,
    CLASS_TREE_NODE_TEXT,
    SELECTOR_TREE_NODE_TEXT,
    DATASET_ATTR_TAB_ID,
    DATASET_ATTR_TREE_PATH,
    EXPANDED_TEXT,
    NOT_EXPANDED_TEXT,
    SELECTOR_TREE_NODE_OPEN,
    CLASS_TREE_NODE_INPUT,
    CLASS_SELECTED,
    CLASS_CUT,
    ID_FIND_REPLACE_CONTAINER,
    ID_FIND,
    ID_REPLACE,
    ID_FIND_INPUT,
    ID_REPLACE_INPUT,
    ID_FIND_INFO
} from "../../constants/dom"

import TreeDto from "@shared/dto/TreeDto"

import FocusManager from "../state/FocusManager"
import TabEditorManager from "../managers/TabEditorManager"
import TreeLayoutManager from "../managers/TreeLayoutManager"

import TreeViewModel from "../../viewmodels/TreeViewModel"
import { TabEditorDto } from "@shared/dto/TabEditorDto"
import RenameCommand from "../../commands/RenameCommand"
import ICommand from "../../commands/ICommand"
import DeleteCommand from "../../commands/DeleteCommand"
import PasteCommand from "../../commands/PasteCommand"
import FindReplaceState from "../state/FindReplaceState"

type CommandSource = 'shortcut' | 'menu' | 'element' | 'context_menu' | 'programmatic'

/**
 * CommandDispatcher centrally handles commands
 * triggered from multiple input sources (keyboard shortcuts, menus, context menus, etc.).
 * 
 * - Commands invoked via multiple UI paths should go through this dispatcher
 *   to ensure consistent handling and side effect management.
 * 
 * - Commands triggered from a single, localized UI event without duplication
 *   can be handled directly in their respective event handlers without dispatching.
 */
@injectable()
export default class CommandDispatcher {
    private undoStack: ICommand[] = []
    private redoStack: ICommand[] = []

    private findAndReplaceContainer: HTMLElement
    private findBox: HTMLElement
    private replaceBox: HTMLElement
    private findInput: HTMLInputElement
    private replaceInput: HTMLInputElement
    private findInfo: HTMLElement

    constructor(
        @inject(DI_KEYS.FocusManager) private readonly focusManager: FocusManager,
        @inject(DI_KEYS.FindReplaceState) private readonly findReplaceState: FindReplaceState,
        @inject(DI_KEYS.TabEditorManager) private readonly tabEditorManager: TabEditorManager,
        @inject(DI_KEYS.TreeLayoutManager) private readonly treeLayoutManager: TreeLayoutManager
    ) {
        this.findAndReplaceContainer = document.getElementById(ID_FIND_REPLACE_CONTAINER)
        this.findBox = document.getElementById(ID_FIND)
        this.replaceBox = document.getElementById(ID_REPLACE)
        this.findInput = document.getElementById(ID_FIND_INPUT) as HTMLInputElement
        this.replaceInput = document.getElementById(ID_REPLACE_INPUT) as HTMLInputElement
        this.findInfo = document.getElementById(ID_FIND_INFO)
    }

    async performNewTab(source: CommandSource) {
        const response: Response<number> = await window.rendererToMain.newTab()
        if (response.result) await this.tabEditorManager.addTab(response.data)
    }

    async performOpenFile(source: CommandSource, filePath?: string) {
        if (filePath) {
            const tabEditorView = this.tabEditorManager.getTabEditorViewByPath(filePath)

            if (tabEditorView) {
                this.tabEditorManager.activateTabEditorById(tabEditorView.getId())
                return
            }
        }

        const response: Response<TabEditorDto> = await window.rendererToMain.openFile(filePath)
        if (response.result && response.data) {
            const data = response.data
            await this.tabEditorManager.addTab(data.id, data.filePath, data.fileName, data.content)
        }
    }

    /**
     * Opens or expands a directory in the file tree.
     * 
     * - If `treeDiv` is not provided, it is assumed that the user is opening a new root directory
     *   via menu or shortcut, so the tree is initialized by loading that directory.
     * 
     * - If `treeDiv` is provided, it represents a clicked directory node,
     *   and this function dynamically loads and expands its child nodes.
     * 
     * @param treeLayoutManager
     * @param treeDiv The DOM element of the clicked directory node if omitted, a new root directory is opened
     * @returns Promise<void>
     */
    async performOpenDirectory(source: CommandSource, treeDiv?: HTMLElement) {
        // New open when shortcut or file menu.
        if (!treeDiv) {
            const response: Response<TreeDto> = await window.rendererToMain.openDirectory()
            if (!response.data) return

            const responseViewModel = this.treeLayoutManager.toTreeViewModel(response.data)

            this.treeLayoutManager.renderTreeData(responseViewModel)
            this.treeLayoutManager.loadFlattenArrayAndMaps(responseViewModel)
            return
        }

        // When click directory in tree area.
        const dirPath = treeDiv.dataset[DATASET_ATTR_TREE_PATH]
        const viewModel = this.treeLayoutManager.getTreeViewModelByPath(dirPath)
        const maybeChildren = treeDiv.nextElementSibling
        if (!maybeChildren || !maybeChildren.classList.contains(CLASS_TREE_NODE_CHILDREN)) return

        const openStatus = treeDiv.querySelector(SELECTOR_TREE_NODE_OPEN) as HTMLElement
        const treeDivChildren = maybeChildren as HTMLElement

        function updateUI(viewModel: TreeViewModel, expanded: boolean) {
            viewModel.expanded = expanded
            openStatus.textContent = expanded ? EXPANDED_TEXT : NOT_EXPANDED_TEXT
            if (expanded) treeDivChildren.classList.add(CLASS_EXPANDED)
            else treeDivChildren.classList.remove(CLASS_EXPANDED)
        }

        const syncFlattenTreeArray = (viewModel: TreeViewModel, expanded: boolean) => {
            if (expanded) this.treeLayoutManager.expandNode(viewModel)
            else this.treeLayoutManager.collapseNode(viewModel)
        }

        if (viewModel.expanded) {
            updateUI(viewModel, false)
            syncFlattenTreeArray(viewModel, false)
            return
        }

        if (viewModel.children && viewModel.children.length > 0) {
            if (treeDivChildren.children.length === 0) {
                this.treeLayoutManager.renderTreeData(viewModel, treeDivChildren)
            }
            updateUI(viewModel, true)
            syncFlattenTreeArray(viewModel, true)
            return
        }

        const response: Response<TreeDto> = await window.rendererToMain.openDirectory(viewModel)
        if (!response.data) return

        const responseTreeData = this.treeLayoutManager.toTreeViewModel(response.data)

        viewModel.children = responseTreeData.children
        this.treeLayoutManager.renderTreeData(responseTreeData, treeDivChildren)
        updateUI(viewModel, true)
        syncFlattenTreeArray(viewModel, true)
    }

    async performSave(source: CommandSource) {
        const data = this.tabEditorManager.getActiveTabEditorData()
        if (!data.isModified) return
        const response: Response<TabEditorDto> = await window.rendererToMain.save(data)
        if (response.result && !response.data.isModified) this.tabEditorManager.applySaveResult(response.data)
    }

    async performSaveAs(source: CommandSource) {
        const data: TabEditorDto = this.tabEditorManager.getActiveTabEditorData()
        const response: Response<TabEditorDto> = await window.rendererToMain.saveAs(data)
        if (response.result && response.data) {
            const wasApplied = this.tabEditorManager.applySaveResult(response.data)
            if (!wasApplied) await this.tabEditorManager.addTab(response.data.id, response.data.filePath, response.data.fileName, response.data.content, true)
        }
    }

    async performCloseTab(source: CommandSource, id: number) {
        const data = this.tabEditorManager.getTabEditorDataById(id)
        if (!data) return

        const response: Response<void> = await window.rendererToMain.closeTab(data)
        if (response.result) this.tabEditorManager.removeTab(data.id)
    }

    async performUndo(source: CommandSource) {
        const focus = this.focusManager.getFocus()

        if (focus === 'editor' && source === 'shortcut') return

        if (focus === 'editor') {
            this.tabEditorManager.undo()
            return
        }

        if (focus === 'tree') {
            const cmd = this.undoStack.pop()
            if (!cmd) return
            await cmd.undo()
            this.redoStack.push(cmd)
            return
        }
    }

    async performRedo(source: CommandSource) {
        const focus = this.focusManager.getFocus()

        if (focus === 'editor' && source === 'shortcut') return

        if (focus === 'editor') {
            this.tabEditorManager.redo()
            return
        }

        if (focus === 'tree') {
            const cmd = this.redoStack.pop()
            if (!cmd) return
            await cmd.execute()
            this.undoStack.push(cmd)
            return
        }
    }

    async performCut(source: CommandSource) {
        const focus = this.focusManager.getFocus()

        if (focus === 'editor' && source === 'shortcut') return

        if (focus === 'editor') {
            const sel = window.getSelection()
            const selectedText = window.getSelection()?.toString()
            if (!sel || !selectedText) return
            await window.rendererToMain.cutEditor(selectedText)
            sel.deleteFromDocument()

            return
        }

        if (focus === 'tree') {
            this.treeLayoutManager.clearClipboardIndices()
            this.treeLayoutManager.clipboardMode = 'cut'
            const selectedIndices = this.treeLayoutManager.getSelectedIndices()

            for (const idx of selectedIndices) {
                this.treeLayoutManager.getTreeWrapperByIndex(idx).classList.add(CLASS_CUT)
                this.treeLayoutManager.addClipboardIndices(idx)
                const viewModel = this.treeLayoutManager.getTreeViewModelByIndex(idx)

                if (viewModel.directory) {
                    for (let i = idx + 1; i < this.treeLayoutManager.getFlattenTreeArrayLength(); i++) {
                        const isChildViewModel = this.treeLayoutManager.getTreeViewModelByIndex(i)

                        if (viewModel.indent < isChildViewModel.indent) {
                            // note: We skip adding CLASS_CUT to children, as parent visually affects them
                            // this.treeLayoutManager.getTreeWrapperByIndex(i).classList.add(CLASS_CUT) 
                            this.treeLayoutManager.addClipboardIndices(i)
                            continue
                        }

                        break
                    }
                }
            }

            return
        }
    }

    async performCopy(source: CommandSource) {
        const focus = this.focusManager.getFocus()

        if (focus === 'editor' && source === 'shortcut') return

        if (focus === 'editor') {
            const sel = window.getSelection()
            const selectedText = window.getSelection()?.toString()
            if (!sel || !selectedText) return
            await window.rendererToMain.copyEditor(selectedText)

            return
        }

        if (focus === 'tree') {
            this.treeLayoutManager.clearClipboardIndices()
            this.treeLayoutManager.clipboardMode = 'copy'
            const selectedIndices = this.treeLayoutManager.getSelectedIndices()

            for (const idx of selectedIndices) {
                this.treeLayoutManager.addClipboardIndices(idx)
                const viewModel = this.treeLayoutManager.getTreeViewModelByIndex(idx)

                if (viewModel.directory) {
                    for (let i = idx + 1; i < this.treeLayoutManager.getFlattenTreeArrayLength(); i++) {
                        const isChildViewModel = this.treeLayoutManager.getTreeViewModelByIndex(i)

                        if (viewModel.indent < isChildViewModel.indent) {
                            this.treeLayoutManager.addClipboardIndices(i)
                            continue
                        }

                        break
                    }
                }
            }

            return
        }
    }

    async performPaste(source: CommandSource) {
        const focus = this.focusManager.getFocus()

        if (focus === 'editor' && source === 'shortcut') return

        if (focus === 'editor') {
            const editable = document.querySelector('#editor_container [contenteditable="true"]') as HTMLElement
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

            return
        }

        if (focus === 'tree') {
            let targetIndex
            if (source === 'context_menu') targetIndex = this.treeLayoutManager.contextTreeIndex
            else if (source === 'shortcut') targetIndex = this.treeLayoutManager.lastSelectedIndex
            if (targetIndex === -1) return
            const targetViewModel = this.treeLayoutManager.getTreeViewModelByIndex(targetIndex)

            const selectedViewModels = []
            const clipboardIndices = this.treeLayoutManager.getClipboardIndices()
            for (const idx of clipboardIndices) {
                selectedViewModels.push(this.treeLayoutManager.getTreeViewModelByIndex(idx))
            }

            const cmd = new PasteCommand(this.treeLayoutManager, this.tabEditorManager, targetViewModel, selectedViewModels, this.treeLayoutManager.clipboardMode)

            try {
                await cmd.execute()
                this.undoStack.push(cmd)
                this.redoStack.length = 0
            } catch {

            }

            return
        }
    }

    async performRename(source: CommandSource) {
        const focus = this.focusManager.getFocus()
        if (focus !== 'tree') return

        const selectedIndices = this.treeLayoutManager.getSelectedIndices()
        if (selectedIndices.length !== 1) return

        const treeNode = this.treeLayoutManager.getTreeNodeByIndex(selectedIndices[0])
        const treeSpan = treeNode.querySelector(SELECTOR_TREE_NODE_TEXT)
        if (!treeSpan) return

        const treeInput = document.createElement('input')
        treeInput.type = 'text'
        treeInput.value = treeSpan.textContent ?? ''
        treeInput.classList.add(CLASS_TREE_NODE_INPUT)

        treeNode.replaceChild(treeInput, treeSpan)

        treeInput.focus()
        treeInput.select()

        let alreadyFinished = false

        const onKeyDown = (e: KeyboardEvent) => { if (e.key === 'Enter') finishRename() }
        const onBlur = () => finishRename()
        treeInput.addEventListener('keydown', onKeyDown)
        treeInput.addEventListener('blur', onBlur)

        const finishRename = async () => {
            if (alreadyFinished) return
            alreadyFinished = true

            treeInput.removeEventListener('keydown', onKeyDown)
            treeInput.removeEventListener('blur', onBlur)

            const prePath = treeNode.dataset[DATASET_ATTR_TREE_PATH]
            const newName = treeInput.value.trim()
            const dir = window.utils.getDirName(prePath)
            const newPath = window.utils.getJoinedPath(dir, newName)

            const viewModel = this.treeLayoutManager.getTreeViewModelByPath(treeNode.dataset[DATASET_ATTR_TREE_PATH])
            const cmd = new RenameCommand(this.treeLayoutManager, this.tabEditorManager, treeNode, viewModel.directory, prePath, newPath)

            try {
                await cmd.execute()
                this.undoStack.push(cmd)
                this.redoStack.length = 0
            } catch {
                treeNode.replaceChild(treeSpan, treeInput)
            }
        }
    }

    async performDelete(source: CommandSource) {
        const focus = this.focusManager.getFocus()
        if (focus !== 'tree') return

        const selectedIndices = this.treeLayoutManager.getSelectedIndices()
        const cmd = new DeleteCommand(this.treeLayoutManager, this.tabEditorManager, selectedIndices)

        try {
            await cmd.execute()
            this.undoStack.push(cmd)
            this.redoStack.length = 0
        } catch {

        }
    }

    toggleFindReplaceBox(source: CommandSource, showReplace: boolean) {
        this.findAndReplaceContainer.style.display = 'block'
        this.replaceBox.style.display = showReplace ? 'flex' : 'none'

        if (this.findReplaceState.getDirectionUp()) this.performFind('programmatic', 'up')
        else this.performFind('programmatic', 'down')
    }

    performFind(source: CommandSource, direction: 'up' | 'down') {
        const input = this.findInput.value
        const view = this.tabEditorManager.getActiveTabEditorView()

        const result = view.findAndSelect(input, direction)
        if (result) this.findInfo.textContent = `${result.current} of ${result.total}`
        else this.findInfo.textContent = 'No results'

        const bDirect = direction === 'up'
        this.findReplaceState.setDirectionUp(bDirect)
    }

    // performFindUp(source: CommandSource) {
    //     const input = this.findInput.value
    //     const view = this.tabEditorManager.getActiveTabEditorView()

    //     const result = view.findAndSelect(input, 'up')
    //     if (result) this.findInfo.textContent = `${result.current} of ${result.total}`
    //     else this.findInfo.textContent = 'No results'

    //     this.findReplaceState.setDirectionUp(true)
    // }

    // performFindDown(source: CommandSource) {
    //     const input = this.findInput.value
    //     const view = this.tabEditorManager.getActiveTabEditorView()

    //     const result = view.findAndSelect(input, 'down')
    //     if (result) this.findInfo.textContent = `${result.current} of ${result.total}`
    //     else this.findInfo.textContent = 'No results'

    //     this.findReplaceState.setDirectionUp(false)
    // }

    performCloseFindReplaceBox(source: CommandSource) {
        this.findAndReplaceContainer.style.display = 'none'

        const activeView = this.tabEditorManager.getActiveTabEditorView()
        if (activeView) activeView.clearSearch()
    }

    async performESC(source: CommandSource) {
        const focus = this.focusManager.getFocus()

        if (focus === 'find_replace') {
            this.performCloseFindReplaceBox(source)
        }
    }

    async performENTER(e: KeyboardEvent, source: CommandSource) {
        const focus = this.focusManager.getFocus()

        if (focus === 'find_replace') {
            const activateElement = document.activeElement

            if (activateElement === this.findInput) {
                if (this.findReplaceState.getDirectionUp()) {
                    this.performFind(source, 'up')
                } else {
                    this.performFind(source, 'down')
                }
            } else if (activateElement === this.replaceInput) {
                console.log('replaceinput')
            }
        }
    }
}