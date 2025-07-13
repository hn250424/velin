import "@milkdown/theme-nord/style.css"

import performOpenDirectory from "../actions/performOpenDirectory"
import TreeLayoutMaanger from "../modules/features/TreeLayoutManger"
import { 
    DATASET_ATTR_TREE_PATH, 
    CLASS_FOCUSED, 
    CLASS_SELECTED,
    SELECTOR_TREE_NODE,
    SELECTOR_TREE_NODE_WRAPPER,
    SELECTOR_TREE_NODE_CHILDREN
} from "../constants/dom"
import shortcutRegistry from "../modules/features/shortcutRegistry"
import performOpenFile from "../actions/pertormOpenFile"
import TabEditorManager from "../modules/features/TabEditorManager"
import FocusManager from "../modules/core/FocusManager"

export default function registerTreeHandlers(
    focusManager: FocusManager,
    treeContentContainer: HTMLElement,
    treeLayoutManager: TreeLayoutMaanger,
    tabEditorManager: TabEditorManager,
    contextMenu: HTMLElement
) {
    bindTreeClickEvents(treeContentContainer, treeLayoutManager, tabEditorManager)
    bindTreeContextmenuEvents(treeContentContainer, treeLayoutManager, contextMenu)
    bindTreeContextmenuCommands(treeLayoutManager)

    shortcutRegistry.register('ARROWUP', () => moveUpFocus(focusManager))
    shortcutRegistry.register('ARROWDOWN', () => moveDownFocus(focusManager))
}

function bindTreeClickEvents(treeContentContainer: HTMLElement, treeLayoutManager: TreeLayoutMaanger, tabEditorManager: TabEditorManager) {
    treeContentContainer.addEventListener('click', async (e) => {
        const target = e.target as HTMLElement
        const treeNode = target.closest(SELECTOR_TREE_NODE) as HTMLElement
        if (!treeNode) return

        if (treeLayoutManager.isTreeSelected()) {
            const idx = treeLayoutManager.getLastSelectedIndex()
            const viewModel = treeLayoutManager.getTreeViewModelByIndex(idx)
            const preSelectedWrapper = treeLayoutManager.getTreeWrapperByPath(viewModel.path)
            const treeNode = preSelectedWrapper.querySelector(SELECTOR_TREE_NODE) as HTMLElement
            treeNode.classList.remove(CLASS_FOCUSED)
        }
        treeNode.classList.add(CLASS_FOCUSED)

        if (e.shiftKey && treeLayoutManager.isTreeSelected()) {
            const startIndex = treeLayoutManager.getLastSelectedIndex()
            const endIndex = treeLayoutManager.getIndexByPath(treeNode.dataset[DATASET_ATTR_TREE_PATH])
            treeLayoutManager.setLastSelectedIndexByPath(treeNode.dataset[DATASET_ATTR_TREE_PATH])
            const [start, end] = [startIndex, endIndex].sort((a, b) => a - b)

            for (let i = start; i <= end; i++) {
                treeLayoutManager.addMultiSelectedIndex(i)
                const dataset_path = treeLayoutManager.getTreeViewModelByIndex(i).path
                const wrapper = treeLayoutManager.getTreeWrapperByPath(dataset_path)
                const div = wrapper.querySelector(SELECTOR_TREE_NODE) as HTMLElement
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
                const wrapper = treeLayoutManager.getTreeWrapperByPath( treeLayoutManager.getTreeViewModelByIndex(i).path  )
                const div = wrapper.querySelector(SELECTOR_TREE_NODE) as HTMLElement
                div.classList.remove(CLASS_SELECTED)
            }

            treeLayoutManager.clearMultiSelectedIndex()
            treeNode.classList.add(CLASS_SELECTED)
            const path = treeNode.dataset[DATASET_ATTR_TREE_PATH]
            treeLayoutManager.setLastSelectedIndexByPath(path)
            treeLayoutManager.addMultiSelectedIndex( treeLayoutManager.getIndexByPath(path) )
            const idx = treeLayoutManager.getFlattenTreeIndexByPath(path)
            const viewModel = treeLayoutManager.getTreeViewModelByIndex(idx)
            if (viewModel.directory) {
                await performOpenDirectory(treeLayoutManager, treeNode)
            } else {
                await performOpenFile(tabEditorManager, path)
            }
        }
    })
}

function bindTreeContextmenuEvents(treeContentContainer: HTMLElement, treeLayoutManager: TreeLayoutMaanger, contextMenu: HTMLElement) {
    treeContentContainer.addEventListener('contextmenu', (e) => {
        const treeNode = (e.target as HTMLElement).closest(SELECTOR_TREE_NODE) as HTMLElement
        if (!treeNode) {
            contextMenu.style.display = 'none'
            //     tabEditorManager.removeContextTabId()    
        } else {
            e.preventDefault()
            contextMenu.style.display = 'flex'
            contextMenu.style.left = `${e.clientX}px`
            contextMenu.style.top = `${e.clientY}px`

            const path = treeNode.dataset[DATASET_ATTR_TREE_PATH]

            // tabEditorManager.contextTabId = parseInt(tab.dataset[DATASET_ATTR_TAB_ID], 10)
        }
    })
}

function bindTreeContextmenuCommands(treeLayoutManager: TreeLayoutMaanger) {
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

function moveUpFocus(focusManager: FocusManager) {
    if (focusManager.getFocus() !== 'tree') return

}

function moveDownFocus(focusManager: FocusManager) {
    if (focusManager.getFocus() !== 'tree') return

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