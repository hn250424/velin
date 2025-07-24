import "@milkdown/theme-nord/style.css"
import TreeLayoutManager from "../modules/managers/TreeLayoutManager"
import {
    DATASET_ATTR_TREE_PATH,
    CLASS_FOCUSED,
    CLASS_SELECTED,
    SELECTOR_TREE_NODE,
    SELECTOR_TREE_NODE_WRAPPER,
    SELECTOR_TREE_NODE_CHILDREN,
    CLASS_DEACTIVE,
    ID_TREE_CONTEXT_PASTE,
    SELECTOR_TREE_CONTEXT_PASTE,
    ID_TREE_NODE_CONTAINER,
    SELECTOR_TREE_NODE_CONTAINER
} from "../constants/dom"
import ShortcutRegistry from "../modules/input/ShortcutRegistry"
import TabEditorManager from "../modules/managers/TabEditorManager"
import FocusManager from "../modules/state/FocusManager"
import CommandDispatcher from "../modules/command/CommandDispatcher"
import { wrap } from "node:module"

export default function registerTreeHandlers(
    commandDispatcher: CommandDispatcher,
    focusManager: FocusManager,
    treeNodeContainer: HTMLElement,
    treeLayoutManager: TreeLayoutManager,
    tabEditorManager: TabEditorManager,
    treeContextMenu: HTMLElement,
    shortcutRegistry: ShortcutRegistry
) {
    const treeContextPasteButton = treeContextMenu.querySelector(SELECTOR_TREE_CONTEXT_PASTE) as HTMLElement

    bindTreeClickEvents(commandDispatcher, treeNodeContainer, treeLayoutManager, tabEditorManager)
    bindTreeContextmenuEvents(treeNodeContainer, treeContextMenu, treeLayoutManager, treeContextPasteButton)
    bindCommandsWithContextmenu(commandDispatcher)
    bindCommandsWithShortcut(commandDispatcher, shortcutRegistry, focusManager, treeLayoutManager)
}

function bindTreeClickEvents(
    commandDispatcher: CommandDispatcher,
    treeNodeContainer: HTMLElement,
    treeLayoutManager: TreeLayoutManager,
    tabEditorManager: TabEditorManager
) {
    treeNodeContainer.addEventListener('click', async (e) => {
        if (treeLayoutManager.isAnyTreeNodeSelected()) {
            const _idx = treeLayoutManager.lastSelectedIndex
            const _treeNode = treeLayoutManager.getTreeNodeByIndex(_idx)
            _treeNode.classList.remove(CLASS_FOCUSED)
        }

        const target = e.target as HTMLElement
        const treeNode = target.closest(SELECTOR_TREE_NODE) as HTMLElement
        if (!treeNode) {
            const isTreeNodeContainer = target.closest(SELECTOR_TREE_NODE_CONTAINER) as HTMLElement
            if (isTreeNodeContainer) {
                const selectedIndices = treeLayoutManager.getSelectedIndices()
                for (const i of selectedIndices) {
                    const div = treeLayoutManager.getTreeNodeByIndex(i)
                    div.classList.remove(CLASS_SELECTED)
                }

                treeLayoutManager.clearSelectedIndices()

                treeNodeContainer.classList.add(CLASS_FOCUSED)
                treeLayoutManager.lastSelectedIndex = 0
            }

            return
        }

        treeNodeContainer.classList.remove(CLASS_FOCUSED)

        treeNode.classList.add(CLASS_FOCUSED)
        const path = treeNode.dataset[DATASET_ATTR_TREE_PATH]

        if (e.shiftKey && treeLayoutManager.isAnyTreeNodeSelected()) {
            const startIndex = treeLayoutManager.lastSelectedIndex
            const endIndex = treeLayoutManager.getIndexByPath(path)
            treeLayoutManager.setLastSelectedIndexByPath(path)
            const [start, end] = [startIndex, endIndex].sort((a, b) => a - b)

            for (let i = start; i <= end; i++) {
                treeLayoutManager.addSelectedIndices(i)
                const div = treeLayoutManager.getTreeNodeByIndex(i)
                div.classList.add(CLASS_SELECTED)
            }

        } else if (e.ctrlKey) {
            treeNode.classList.add(CLASS_SELECTED)
            const index = treeLayoutManager.getIndexByPath(path)
            treeLayoutManager.setLastSelectedIndexByPath(path)
            treeLayoutManager.addSelectedIndices(index)

        } else {
            const selectedIndices = treeLayoutManager.getSelectedIndices()
            for (const i of selectedIndices) {
                const div = treeLayoutManager.getTreeNodeByIndex(i)
                div.classList.remove(CLASS_SELECTED)
            }

            treeLayoutManager.clearSelectedIndices()
            treeNode.classList.add(CLASS_SELECTED)
            treeLayoutManager.setLastSelectedIndexByPath(path)
            treeLayoutManager.addSelectedIndices(treeLayoutManager.getIndexByPath(path))
            const viewModel = treeLayoutManager.getTreeViewModelByPath(path)
            if (viewModel.directory) {
                await commandDispatcher.performOpenDirectory('element', treeNode)
            } else {
                await commandDispatcher.performOpenFile('element', path)
            }
        }
    })
}

function bindTreeContextmenuEvents(
    treeNodeContainer: HTMLElement,
    treeContextMenu: HTMLElement,
    treeLayoutManager: TreeLayoutManager,
    treeContextPasteButton: HTMLElement
) {
    treeNodeContainer.addEventListener('contextmenu', (e) => {
        const treeNode = (e.target as HTMLElement).closest(SELECTOR_TREE_NODE) as HTMLElement
        if (!treeNode) return

        treeContextMenu.classList.add(CLASS_SELECTED)
        treeContextMenu.style.left = `${e.clientX}px`
        treeContextMenu.style.top = `${e.clientY}px`

        const path = treeNode.dataset[DATASET_ATTR_TREE_PATH]
        const viewModel = treeLayoutManager.getTreeViewModelByPath(path)

        const isPasteDisabled =
            treeLayoutManager.clipboardMode === 'none' ||
            !viewModel.directory ||
            treeLayoutManager.getSelectedIndices().length === 0

        treeContextPasteButton.classList.toggle(CLASS_DEACTIVE, isPasteDisabled)

        treeLayoutManager.setContextTreeIndexByPath(path)
        treeNode.classList.add(CLASS_FOCUSED)
    })
}

function bindCommandsWithContextmenu(commandDispatcher: CommandDispatcher) {
    document.getElementById('tree_context_cut').addEventListener('click', async () => {
        await commandDispatcher.performCut('context_menu')
    })

    document.getElementById('tree_context_copy').addEventListener('click', async () => {
        await commandDispatcher.performCopy('context_menu')
    })

    document.getElementById('tree_context_paste').addEventListener('click', async () => {
        await commandDispatcher.performPaste('context_menu')
    })

    document.getElementById('tree_context_rename').addEventListener('click', async () => {
        await commandDispatcher.performRenameTreeNode('context_menu')
    })

    document.getElementById('tree_context_delete').addEventListener('click', async () => {
        await commandDispatcher.performDeleteTreeNode('context_menu')
    })
}

function bindCommandsWithShortcut(
    commandDispatcher: CommandDispatcher,
    shortcutRegistry: ShortcutRegistry,
    focusManager: FocusManager,
    treeLayoutManager: TreeLayoutManager
) {
    shortcutRegistry.register('ARROWUP', (e: KeyboardEvent) => moveUpFocus(e, focusManager, treeLayoutManager))
    shortcutRegistry.register('ARROWDOWN', (e: KeyboardEvent) => moveDownFocus(e, focusManager, treeLayoutManager))
    shortcutRegistry.register('Shift+ARROWUP', (e: KeyboardEvent) => moveUpFocus(e, focusManager, treeLayoutManager))
    shortcutRegistry.register('Shift+ARROWDOWN', (e: KeyboardEvent) => moveDownFocus(e, focusManager, treeLayoutManager))

    shortcutRegistry.register('Ctrl+X', async (e: KeyboardEvent) => await commandDispatcher.performCut('shortcut'))
    shortcutRegistry.register('Ctrl+C', async (e: KeyboardEvent) => await commandDispatcher.performCopy('shortcut'))
    shortcutRegistry.register('Ctrl+V', async (e: KeyboardEvent) => await commandDispatcher.performPaste('shortcut'))
    shortcutRegistry.register('F2', async (e: KeyboardEvent) => await commandDispatcher.performRenameTreeNode('shortcut'))
    shortcutRegistry.register('DELETE', async (e: KeyboardEvent) => await commandDispatcher.performDeleteTreeNode('shortcut'))
}

function moveUpFocus(e: KeyboardEvent, focusManager: FocusManager, treeLayoutManager: TreeLayoutManager) {
    if (focusManager.getFocus() !== 'tree') return

    let lastIdx = treeLayoutManager.lastSelectedIndex
    if (lastIdx <= 0) return

    const preTreeNode = treeLayoutManager.getTreeNodeByIndex(lastIdx)
    preTreeNode.classList.remove(CLASS_FOCUSED)

    lastIdx--
    treeLayoutManager.lastSelectedIndex = lastIdx
    const newTreeNode = treeLayoutManager.getTreeNodeByIndex(lastIdx)
    newTreeNode.classList.add(CLASS_FOCUSED)

    if (e.shiftKey) {
        newTreeNode.classList.add(CLASS_SELECTED)
        treeLayoutManager.addSelectedIndices(lastIdx)
    }
}

function moveDownFocus(e: KeyboardEvent, focusManager: FocusManager, treeLayoutManager: TreeLayoutManager) {
    if (focusManager.getFocus() !== 'tree') return

    let lastIdx = treeLayoutManager.lastSelectedIndex
    let totalLength = treeLayoutManager.getFlattenTreeArrayLength()
    if (lastIdx >= totalLength) return

    const preTreeNode = treeLayoutManager.getTreeNodeByIndex(lastIdx)
    preTreeNode.classList.remove(CLASS_FOCUSED)

    lastIdx++
    treeLayoutManager.lastSelectedIndex = lastIdx
    const newTreeNode = treeLayoutManager.getTreeNodeByIndex(lastIdx)
    newTreeNode.classList.add(CLASS_FOCUSED)

    if (e.shiftKey) {
        newTreeNode.classList.add(CLASS_SELECTED)
        treeLayoutManager.addSelectedIndices(lastIdx)
    }
}