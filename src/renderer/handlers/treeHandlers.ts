import "@milkdown/theme-nord/style.css"
import TreeLayoutManager from "../modules/domains/TreeLayoutManager"
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
    SELECTOR_TREE_NODE_CONTAINER,
    CLASS_TREE_NODE_WRAPPER,
    CLASS_TREE_NODE
} from "../constants/dom"
import ShortcutRegistry from "../modules/input/ShortcutRegistry"
import FocusManager from "../modules/state/FocusManager"
import CommandDispatcher from "../CommandDispatcher"
import TreeDragManager from "../modules/drag/TreeDragManager"
import { aL } from "vitest/dist/chunks/reporters.d.BFLkQcL6"

export default function registerTreeHandlers(
    commandDispatcher: CommandDispatcher,
    focusManager: FocusManager,
    dragManager: TreeDragManager,
    treeNodeContainer: HTMLElement,
    treeLayoutManager: TreeLayoutManager,
    treeContextMenu: HTMLElement,
    shortcutRegistry: ShortcutRegistry
) {
    const treeContextPasteButton = treeContextMenu.querySelector(SELECTOR_TREE_CONTEXT_PASTE) as HTMLElement

    bindTreeClickEvents(commandDispatcher, treeNodeContainer, treeLayoutManager)
    bindTreeContextmenuEvents(treeNodeContainer, treeContextMenu, treeLayoutManager, treeContextPasteButton)
    bindCommandsWithContextmenu(commandDispatcher)
    bindCommandsWithShortcut(commandDispatcher, shortcutRegistry, focusManager, treeLayoutManager)
    bindTreeMenuEvents(commandDispatcher, treeNodeContainer)

    // Drag.
    bindMouseDownEvents(dragManager, treeLayoutManager, treeNodeContainer)
    bindMouseMoveEvents(dragManager, treeLayoutManager)
    bindMouseUpEvents(dragManager, treeLayoutManager, treeNodeContainer, commandDispatcher)
}

function bindMouseDownEvents(dragManager: TreeDragManager, treeManager: TreeLayoutManager, treeContainer: HTMLElement) {
    treeContainer.addEventListener('mousedown', (e) => {
        const count = treeManager.getSelectedIndices().length
        dragManager.setDragTreeCount(count)
        dragManager.setMouseDown(true)
        dragManager.setStartPosition(e.clientX, e.clientY)
    })
}

function bindMouseMoveEvents(dragManager: TreeDragManager, treeManager: TreeLayoutManager) {
    document.addEventListener('mousemove', (e: MouseEvent) => {
        if (!dragManager.isMouseDown()) return

        if (!dragManager.isDrag()) {
            const dx = Math.abs(e.clientX - dragManager.getStartPosition_x())
            const dy = Math.abs(e.clientY - dragManager.getStartPosition_y())
            if (dx > 5 || dy > 5) {
                dragManager.startDrag()
            } else {
                return
            }
        }

        const div = treeManager.createGhostBox(dragManager.getDragTreeCount())
        div.style.left = `${e.clientX + 5}px`
        div.style.top = `${e.clientY + 5}px`

        const target = e.target as HTMLElement
        let wrapper = target.closest(SELECTOR_TREE_NODE_WRAPPER) as HTMLElement
        let isContainer = false
        if (!wrapper) {
            const _container = target.closest(SELECTOR_TREE_NODE_CONTAINER) as HTMLElement
            if (!_container) return
            
            wrapper = _container
            isContainer = true
        }

        const inserWrapper = dragManager.getInsertWrapper()
        if (inserWrapper === wrapper) return
        if (inserWrapper) inserWrapper.style.background = ''

        let viewModel
        if (!isContainer) {
            const node = wrapper.querySelector(SELECTOR_TREE_NODE) as HTMLElement
            viewModel = treeManager.getTreeViewModelByPath(node.dataset[DATASET_ATTR_TREE_PATH])
        } else {
            viewModel = treeManager.getTreeViewModelByPath(wrapper.dataset[DATASET_ATTR_TREE_PATH])
        }
        
        if (!viewModel || !viewModel.directory) return
        dragManager.setInsertPath(viewModel.path)

        wrapper.style.background = 'green'
        dragManager.setInsertWrapper(wrapper)
    })
}

function bindMouseUpEvents(dragManager: TreeDragManager, treeManager: TreeLayoutManager, treeContainer: HTMLElement, commandDispatcher: CommandDispatcher) {
    treeContainer.addEventListener('mouseup', async (e: MouseEvent) => {
        if (!dragManager.isDrag()) {
            dragManager.setMouseDown(false)
            return
        }

        const path = dragManager.getInsertPath()
        dragManager.endDrag()
        treeManager.removeGhostBox()
        treeManager.setSelectedDragIndexByPath(path)
        await commandDispatcher.performCut('drag')
        commandDispatcher.performPaste('drag')
    })
}

function bindTreeMenuEvents(commandDispatcher: CommandDispatcher, treeNodeContainer: HTMLElement) {
    const addFile = document.getElementById('tree_top_add_file')
    const addDirectory = document.getElementById('tree_top_add_directory')

    addFile.addEventListener('click', () => {
        commandDispatcher.performCreate('element', treeNodeContainer, false)
    })

    addDirectory.addEventListener('click', () => {
        commandDispatcher.performCreate('element', treeNodeContainer, true)
    })
}

function bindTreeClickEvents(
    commandDispatcher: CommandDispatcher,
    treeNodeContainer: HTMLElement,
    treeLayoutManager: TreeLayoutManager,
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
        await commandDispatcher.performRename('context_menu')
    })

    document.getElementById('tree_context_delete').addEventListener('click', async () => {
        await commandDispatcher.performDelete('context_menu')
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
    shortcutRegistry.register('F2', async (e: KeyboardEvent) => await commandDispatcher.performRename('shortcut'))
    shortcutRegistry.register('DELETE', async (e: KeyboardEvent) => await commandDispatcher.performDelete('shortcut'))
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