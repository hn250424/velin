import "@milkdown/theme-nord/style.css"
import TreeFacade from "../modules/tree/TreeFacade"
import {
    DATASET_ATTR_TREE_PATH,
    CLASS_FOCUSED,
    CLASS_SELECTED,
    SELECTOR_TREE_NODE,
    SELECTOR_TREE_NODE_WRAPPER,
    CLASS_DEACTIVE,
    SELECTOR_TREE_CONTEXT_PASTE,
    SELECTOR_TREE_NODE_CONTAINER,
    CLASS_TREE_DRAG_OVERLAY
} from "../constants/dom"
import ShortcutRegistry from "../modules/input/ShortcutRegistry"
import FocusManager from "../modules/state/FocusManager"
import CommandDispatcher from "../CommandDispatcher"

export default function registerTreeHandlers(
    commandDispatcher: CommandDispatcher,
    focusManager: FocusManager,
    treeNodeContainer: HTMLElement,
    treeFacade: TreeFacade,
    treeContextMenu: HTMLElement,
    shortcutRegistry: ShortcutRegistry
) {
    const treeContextPasteButton = treeContextMenu.querySelector(SELECTOR_TREE_CONTEXT_PASTE) as HTMLElement

    bindTreeClickEvents(commandDispatcher, treeNodeContainer, treeFacade)
    bindTreeContextmenuEvents(treeNodeContainer, treeContextMenu, treeFacade, treeContextPasteButton)
    bindCommandsWithContextmenu(commandDispatcher)
    bindCommandsWithShortcut(commandDispatcher, shortcutRegistry, focusManager, treeFacade)
    bindTreeMenuEvents(commandDispatcher, treeNodeContainer)

    // Drag.
    bindMouseDownEvents(treeFacade, treeNodeContainer)
    bindMouseMoveEvents(treeFacade)
    bindMouseUpEvents(treeFacade, treeNodeContainer, commandDispatcher)
}

function bindMouseDownEvents(treeFacade: TreeFacade, treeContainer: HTMLElement) {
    treeContainer.addEventListener('mousedown', (e) => {
        let count = treeFacade.getSelectedIndices().length
        if (count === 0) {
            const target = e.target as HTMLElement
            const node = target.closest(SELECTOR_TREE_NODE) as HTMLElement
            if (!node) return
            
            const path = node.dataset[DATASET_ATTR_TREE_PATH]
            const idx = treeFacade.getFlattenArrayIndexByPath(path)
            treeFacade.addSelectedIndices(idx)
            count = 1
        }

        treeFacade.setDragTreeCount(count)
        treeFacade.setMouseDown(true)
        treeFacade.setStartPosition(e.clientX, e.clientY)
    })
}

function bindMouseMoveEvents(treeFacade: TreeFacade) {
    document.addEventListener('mousemove', (e: MouseEvent) => {
        if (!treeFacade.isMouseDown()) return

        if (!treeFacade.isDrag()) {
            const dx = Math.abs(e.clientX - treeFacade.getStartPosition_x())
            const dy = Math.abs(e.clientY - treeFacade.getStartPosition_y())
            if (dx > 5 || dy > 5) {
                treeFacade.startDrag()
            } else {
                return
            }
        }

        const div = treeFacade.createGhostBox(treeFacade.getDragTreeCount())
        div.style.left = `${e.clientX + 5}px`
        div.style.top = `${e.clientY + 5}px`

        const target = e.target as HTMLElement
        let wrapper = target.closest(SELECTOR_TREE_NODE_WRAPPER) as HTMLElement
        let isContainer = false
        if (!wrapper) {
            const _container = target.closest(SELECTOR_TREE_NODE_CONTAINER) as HTMLElement
            if (!_container) {
                treeFacade.setInsertWrapper(null)
                treeFacade.setInsertPath('') // Set falsy empty string as flag since path-based logic must run if mouse up event completes properly.
                return 
            }
            
            wrapper = _container
            isContainer = true
        }

        const inserWrapper = treeFacade.getInsertWrapper()
        if (inserWrapper === wrapper) return // Wrapper comparison faster than Path
        
        if (inserWrapper) inserWrapper.classList.remove(CLASS_TREE_DRAG_OVERLAY)

        let viewModel
        if (!isContainer) {
            const node = wrapper.querySelector(SELECTOR_TREE_NODE) as HTMLElement
            viewModel = treeFacade.getTreeViewModelByPath(node.dataset[DATASET_ATTR_TREE_PATH])
        } else {
            viewModel = treeFacade.getTreeViewModelByPath(wrapper.dataset[DATASET_ATTR_TREE_PATH])
        }
        
        if (!viewModel || !viewModel.directory) {
            treeFacade.setInsertWrapper(null)
            treeFacade.setInsertPath('')
            return
        }
        treeFacade.setInsertPath(viewModel.path)

        wrapper.classList.add(CLASS_TREE_DRAG_OVERLAY)
        treeFacade.setInsertWrapper(wrapper)
    })
}

function bindMouseUpEvents(treeFacade: TreeFacade, treeContainer: HTMLElement, commandDispatcher: CommandDispatcher) {
    document.addEventListener('mouseup', async (e: MouseEvent) => {
        if (!treeFacade.isDrag()) {
            treeFacade.setMouseDown(false)
            return
        }

        let isRight = true
        const path = treeFacade.getInsertPath()
        if (path === '') isRight = false

        treeFacade.endDrag()
        treeFacade.removeGhostBox()
        
        if (isRight) {
            treeFacade.setSelectedDragIndexByPath(path)
            await commandDispatcher.performCut('drag')
            commandDispatcher.performPaste('drag')
        }
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
    treeFacade: TreeFacade,
) {
    treeNodeContainer.addEventListener('click', async (e) => {
        if (treeFacade.isAnyTreeNodeSelected()) {
            const _idx = treeFacade.lastSelectedIndex
            const _treeNode = treeFacade.getTreeNodeByIndex(_idx)
            _treeNode.classList.remove(CLASS_FOCUSED)
        }

        const target = e.target as HTMLElement
        const treeNode = target.closest(SELECTOR_TREE_NODE) as HTMLElement
        if (!treeNode) {
            const isTreeNodeContainer = target.closest(SELECTOR_TREE_NODE_CONTAINER) as HTMLElement
            if (isTreeNodeContainer) {
                const selectedIndices = treeFacade.getSelectedIndices()
                for (const i of selectedIndices) {
                    const div = treeFacade.getTreeNodeByIndex(i)
                    div.classList.remove(CLASS_SELECTED)
                }

                treeFacade.clearSelectedIndices()

                treeNodeContainer.classList.add(CLASS_FOCUSED)
                treeFacade.lastSelectedIndex = 0
            }

            return
        }

        treeNodeContainer.classList.remove(CLASS_FOCUSED)

        treeNode.classList.add(CLASS_FOCUSED)
        const path = treeNode.dataset[DATASET_ATTR_TREE_PATH]

        if (e.shiftKey && treeFacade.isAnyTreeNodeSelected()) {
            const startIndex = treeFacade.lastSelectedIndex
            const endIndex = treeFacade.getFlattenArrayIndexByPath(path)
            treeFacade.setLastSelectedIndexByPath(path)
            const [start, end] = [startIndex, endIndex].sort((a, b) => a - b)

            for (let i = start; i <= end; i++) {
                treeFacade.addSelectedIndices(i)
                const div = treeFacade.getTreeNodeByIndex(i)
                div.classList.add(CLASS_SELECTED)
            }

        } else if (e.ctrlKey) {
            treeNode.classList.add(CLASS_SELECTED)
            const index = treeFacade.getFlattenArrayIndexByPath(path)
            treeFacade.setLastSelectedIndexByPath(path)
            treeFacade.addSelectedIndices(index)

        } else {
            const selectedIndices = treeFacade.getSelectedIndices()
            for (const i of selectedIndices) {
                const div = treeFacade.getTreeNodeByIndex(i)
                div.classList.remove(CLASS_SELECTED)
            }

            treeFacade.clearSelectedIndices()
            treeNode.classList.add(CLASS_SELECTED)
            treeFacade.setLastSelectedIndexByPath(path)
            treeFacade.addSelectedIndices(treeFacade.getFlattenArrayIndexByPath(path))

            const viewModel = treeFacade.getTreeViewModelByPath(path)
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
    treeFacade: TreeFacade,
    treeContextPasteButton: HTMLElement
) {
    treeNodeContainer.addEventListener('contextmenu', (e) => {
        const treeNode = (e.target as HTMLElement).closest(SELECTOR_TREE_NODE) as HTMLElement
        if (!treeNode) return

        treeContextMenu.classList.add(CLASS_SELECTED)
        treeContextMenu.style.left = `${e.clientX}px`
        treeContextMenu.style.top = `${e.clientY}px`

        const path = treeNode.dataset[DATASET_ATTR_TREE_PATH]
        const viewModel = treeFacade.getTreeViewModelByPath(path)

        const isPasteDisabled =
            treeFacade.clipboardMode === 'none' ||
            !viewModel.directory ||
            treeFacade.getSelectedIndices().length === 0

        treeContextPasteButton.classList.toggle(CLASS_DEACTIVE, isPasteDisabled)

        treeFacade.setContextTreeIndexByPath(path)
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
    treeFacade: TreeFacade
) {
    shortcutRegistry.register('ARROWUP', (e: KeyboardEvent) => moveUpFocus(e, focusManager, treeFacade))
    shortcutRegistry.register('ARROWDOWN', (e: KeyboardEvent) => moveDownFocus(e, focusManager, treeFacade))
    shortcutRegistry.register('Shift+ARROWUP', (e: KeyboardEvent) => moveUpFocus(e, focusManager, treeFacade))
    shortcutRegistry.register('Shift+ARROWDOWN', (e: KeyboardEvent) => moveDownFocus(e, focusManager, treeFacade))

    shortcutRegistry.register('Ctrl+X', async (e: KeyboardEvent) => await commandDispatcher.performCut('shortcut'))
    shortcutRegistry.register('Ctrl+C', async (e: KeyboardEvent) => await commandDispatcher.performCopy('shortcut'))
    shortcutRegistry.register('Ctrl+V', async (e: KeyboardEvent) => await commandDispatcher.performPaste('shortcut'))
    shortcutRegistry.register('F2', async (e: KeyboardEvent) => await commandDispatcher.performRename('shortcut'))
    shortcutRegistry.register('DELETE', async (e: KeyboardEvent) => await commandDispatcher.performDelete('shortcut'))
}

function moveUpFocus(e: KeyboardEvent, focusManager: FocusManager, treeFacade: TreeFacade) {
    if (focusManager.getFocus() !== 'tree') return

    let lastIdx = treeFacade.lastSelectedIndex
    if (lastIdx <= 0) return

    const preTreeNode = treeFacade.getTreeNodeByIndex(lastIdx)
    preTreeNode.classList.remove(CLASS_FOCUSED)

    lastIdx--
    treeFacade.lastSelectedIndex = lastIdx
    const newTreeNode = treeFacade.getTreeNodeByIndex(lastIdx)
    newTreeNode.classList.add(CLASS_FOCUSED)

    if (e.shiftKey) {
        newTreeNode.classList.add(CLASS_SELECTED)
        treeFacade.addSelectedIndices(lastIdx)
    }
}

function moveDownFocus(e: KeyboardEvent, focusManager: FocusManager, treeFacade: TreeFacade) {
    if (focusManager.getFocus() !== 'tree') return

    let lastIdx = treeFacade.lastSelectedIndex
    let totalLength = treeFacade.getFlattenTreeArrayLength()
    if (lastIdx >= totalLength) return

    const preTreeNode = treeFacade.getTreeNodeByIndex(lastIdx)
    preTreeNode.classList.remove(CLASS_FOCUSED)

    lastIdx++
    treeFacade.lastSelectedIndex = lastIdx
    const newTreeNode = treeFacade.getTreeNodeByIndex(lastIdx)
    newTreeNode.classList.add(CLASS_FOCUSED)

    if (e.shiftKey) {
        newTreeNode.classList.add(CLASS_SELECTED)
        treeFacade.addSelectedIndices(lastIdx)
    }
}