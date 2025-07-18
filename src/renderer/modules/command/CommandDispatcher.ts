import { inject, injectable } from "inversify"
import DI_KEYS from "../../constants/di_keys"
import { electronAPI } from "@shared/constants/electronAPI"
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
    CLASS_TREE_NODE_INPUT
} from "../../constants/dom"

import TreeDto from "@shared/dto/TreeDto"

import FocusManager from "../state/FocusManager"
import TabEditorManager from "../manager/TabEditorManager"
import TreeLayoutManager from "../manager/TreeLayoutManager"

import TreeViewModel from "../../viewmodels/TreeViewModel"
import { TabEditorDto } from "@shared/dto/TabEditorDto"
import path from "path"

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
    constructor(
        @inject(DI_KEYS.FocusManager) private readonly focusManager: FocusManager,
        @inject(DI_KEYS.TabEditorManager) private readonly tabEditorManager: TabEditorManager,
        @inject(DI_KEYS.TreeLayoutManager) private readonly treeLayoutManager: TreeLayoutManager
    ) {

    }

    async performNewTab(source: CommandSource) {
        const response: Response<number> = await window[electronAPI.channel].newTab()
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

        const response: Response<TabEditorDto> = await window[electronAPI.channel].openFile(filePath)
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
            const response: Response<TreeDto> = await window[electronAPI.channel].openDirectory()
            if (!response.data) return

            const responseViewModel = this.treeLayoutManager.toTreeViewModel(response.data)

            this.treeLayoutManager.renderTreeData(responseViewModel)
            this.treeLayoutManager.restoreFlattenArrayAndMaps(responseViewModel)
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

        const response: Response<TreeDto> = await window[electronAPI.channel].openDirectory(viewModel)
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
        const response: Response<TabEditorDto> = await window[electronAPI.channel].save(data)
        if (response.result && !response.data.isModified) this.tabEditorManager.applySaveResult(response.data)
    }

    async performSaveAs(source: CommandSource) {
        const data: TabEditorDto = this.tabEditorManager.getActiveTabEditorData()
        const response: Response<TabEditorDto> = await window[electronAPI.channel].saveAs(data)
        if (response.result && response.data) {
            const wasApplied = this.tabEditorManager.applySaveResult(response.data)
            if (!wasApplied) await this.tabEditorManager.addTab(response.data.id, response.data.filePath, response.data.fileName, response.data.content, true)
        }
    }

    async performCloseTab(source: CommandSource, id: number) {
        const data = this.tabEditorManager.getTabEditorDataById(id)
        if (!data) return

        const response: Response<void> = await window[electronAPI.channel].closeTab(data)
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
            await window[electronAPI.channel].cut(selectedText)
            sel.deleteFromDocument()

            return
        }

        if (focus === 'tree') {

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
            await window[electronAPI.channel].copy(selectedText)

            return
        }

        if (focus === 'tree') {

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
            const text = await window[electronAPI.channel].paste()
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

            return
        }
    }

    async performTreeNodeCut(source: CommandSource) {
        const focus = this.focusManager.getFocus()
        if (focus !== 'tree') return

        if (source === 'context_menu') {
            const selectedIndices = this.treeLayoutManager.getMultiSelectedIndex()

            for (let i = 0; i < selectedIndices.length; i++) {
                //
            }

            return
        }

        // === context_menu ?
        if (source === 'shortcut') {
            return
        }
    }

    async performTreeNodeCopy(source: CommandSource) {
        const focus = this.focusManager.getFocus()
        if (focus !== 'tree') return

        if (source === 'context_menu') {
            const selectedIndices = this.treeLayoutManager.getMultiSelectedIndex()

            for (let i = 0; i < selectedIndices.length; i++) {
                //
            }

            return
        }

        // === context_menu ?
        if (source === 'shortcut') {
            return
        }
    }
    
    async performTreeNodeRename(source: CommandSource) {
        const focus = this.focusManager.getFocus()
        if (focus !== 'tree') return

        const selectedIndices = this.treeLayoutManager.getMultiSelectedIndex()
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
            const ret: Response<string | null> = await window[electronAPI.channel].renameTree(prePath, newName)

            if (ret.result) {
                const newSpan = document.createElement('span')
                newSpan.classList.add(CLASS_TREE_NODE_TEXT, 'ellipsis')

                const newPath = ret.data
                const newBaseName = window[electronAPI.channel].getBaseName(newPath)

                newSpan.textContent = newBaseName
                treeNode.replaceChild(newSpan, treeInput)

                this.treeLayoutManager.applyRenameResultByPath(prePath, newPath)
                await this.tabEditorManager.rename(prePath, newPath)
            } else {
                treeNode.replaceChild(treeSpan, treeInput)
            }
        }
    }

    async performTreeNodeDelete(source: CommandSource) {
        const focus = this.focusManager.getFocus()
        if (focus !== 'tree') return

        if (source === 'context_menu') {
            const selectedIndices = this.treeLayoutManager.getMultiSelectedIndex()

            for (let i = 0; i < selectedIndices.length; i++) {
                //
            }

            return
        }

        // === context_menu ?
        if (source === 'shortcut') {
            return
        }
    }
}