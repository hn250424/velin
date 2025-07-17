import "@milkdown/theme-nord/style.css"
import TreeLayoutManager from "../modules/manager/TreeLayoutManager"
import {
    DATASET_ATTR_TREE_PATH,
    CLASS_FOCUSED,
    CLASS_SELECTED,
    SELECTOR_TREE_NODE,
    SELECTOR_TREE_NODE_WRAPPER,
    SELECTOR_TREE_NODE_CHILDREN
} from "../constants/dom"
import ShortcutRegistry from "../modules/input/ShortcutRegistry"
import TabEditorManager from "../modules/manager/TabEditorManager"
import FocusManager from "../modules/state/FocusManager"
import CommandDispatcher from "../modules/command/CommandDispatcher"

export default function registerTreeHandlers(
    commandDispatcher: CommandDispatcher,
    focusManager: FocusManager,
    treeContentContainer: HTMLElement,
    treeLayoutManager: TreeLayoutManager,
    tabEditorManager: TabEditorManager,
    treeContextMenu: HTMLElement,
    shortcutRegistry: ShortcutRegistry
) {
    bindTreeClickEvents(commandDispatcher, treeContentContainer, treeLayoutManager, tabEditorManager)
    bindTreeContextmenuEvents(treeContentContainer, treeContextMenu, treeLayoutManager)
    bindCommandsWithContextmenu(treeLayoutManager)
    bindCommandsWithShortcut(shortcutRegistry, focusManager, treeLayoutManager)
}

function bindTreeClickEvents(commandDispatcher: CommandDispatcher, treeContentContainer: HTMLElement, treeLayoutManager: TreeLayoutManager, tabEditorManager: TabEditorManager) {
    treeContentContainer.addEventListener('click', async (e) => {
        const target = e.target as HTMLElement
        const treeNode = target.closest(SELECTOR_TREE_NODE) as HTMLElement
        if (!treeNode) return

        if (treeLayoutManager.isTreeSelected()) {
            const idx = treeLayoutManager.lastSelectedIndex
            const treeNode = treeLayoutManager.getTreeNodeByIndex(idx)
            treeNode.classList.remove(CLASS_FOCUSED)
        }
        treeNode.classList.add(CLASS_FOCUSED)

        if (e.shiftKey && treeLayoutManager.isTreeSelected()) {
            const startIndex = treeLayoutManager.lastSelectedIndex
            const endIndex = treeLayoutManager.getIndexByPath(treeNode.dataset[DATASET_ATTR_TREE_PATH])
            treeLayoutManager.setLastSelectedIndexByPath(treeNode.dataset[DATASET_ATTR_TREE_PATH])
            const [start, end] = [startIndex, endIndex].sort((a, b) => a - b)

            for (let i = start; i <= end; i++) {
                treeLayoutManager.addMultiSelectedIndex(i)
                const div = treeLayoutManager.getTreeNodeByIndex(i)
                div.classList.add(CLASS_SELECTED)
            }

        } else if (e.ctrlKey) {
            treeNode.classList.add(CLASS_SELECTED)
            const path = treeNode.dataset[DATASET_ATTR_TREE_PATH]
            const index = treeLayoutManager.getIndexByPath(path)
            treeLayoutManager.setLastSelectedIndexByPath(path)
            treeLayoutManager.addMultiSelectedIndex(index)

        } else {
            const multiSelectedIndexArr = treeLayoutManager.getMultiSelectedIndex()
            for (const i of multiSelectedIndexArr) {
                const div = treeLayoutManager.getTreeNodeByIndex(i)
                div.classList.remove(CLASS_SELECTED)
            }

            treeLayoutManager.clearMultiSelectedIndex()
            treeNode.classList.add(CLASS_SELECTED)
            const path = treeNode.dataset[DATASET_ATTR_TREE_PATH]
            treeLayoutManager.setLastSelectedIndexByPath(path)
            treeLayoutManager.addMultiSelectedIndex(treeLayoutManager.getIndexByPath(path))
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
    treeContentContainer: HTMLElement,
    treeContextMenu: HTMLElement,
    treeLayoutManager: TreeLayoutManager
) {
    treeContentContainer.addEventListener('contextmenu', (e) => {
        const treeNode = (e.target as HTMLElement).closest(SELECTOR_TREE_NODE) as HTMLElement
        if (!treeNode) return

        treeContextMenu.classList.add(CLASS_SELECTED)
        treeContextMenu.style.left = `${e.clientX}px`
        treeContextMenu.style.top = `${e.clientY}px`

        const path = treeNode.dataset[DATASET_ATTR_TREE_PATH]
        treeLayoutManager.setLastSelectedIndexByPath(path)
        treeNode.classList.add(CLASS_FOCUSED)
    })
}

function bindCommandsWithContextmenu(treeLayoutManager: TreeLayoutManager) {
    document.getElementById('tree_context_cut').addEventListener('click', async () => {
        await performTreeNodeCut()
    })

    document.getElementById('tree_context_copy').addEventListener('click', async () => {
        await performTreeNodeCopy()
    })

    document.getElementById('tree_context_rename').addEventListener('click', async () => {
        await performTreeNodeRename()
    })

    document.getElementById('tree_context_delete').addEventListener('click', async () => {
        await performTreeNodeDelete()
    })
}

function bindCommandsWithShortcut(shortcutRegistry: ShortcutRegistry, focusManager: FocusManager, treeLayoutManager: TreeLayoutManager) {
    shortcutRegistry.register('ARROWUP', (e: KeyboardEvent) => moveUpFocus(e, focusManager, treeLayoutManager))
    shortcutRegistry.register('ARROWDOWN', (e: KeyboardEvent) => moveDownFocus(e, focusManager, treeLayoutManager))
    shortcutRegistry.register('Shift+ARROWUP', (e: KeyboardEvent) => moveUpFocus(e, focusManager, treeLayoutManager))
    shortcutRegistry.register('Shift+ARROWDOWN', (e: KeyboardEvent) => moveDownFocus(e, focusManager, treeLayoutManager))
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
        treeLayoutManager.addMultiSelectedIndex(lastIdx)
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
        treeLayoutManager.addMultiSelectedIndex(lastIdx)
    }
}












async function performTreeNodeCut() {
    // const response: Response<void> = await window[electronAPI.channel].closeTab(data)
}

async function performTreeNodeCopy() {

}

async function performTreeNodeRename() {

}

async function performTreeNodeDelete() {

}