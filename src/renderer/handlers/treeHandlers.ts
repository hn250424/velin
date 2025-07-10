import "@milkdown/theme-nord/style.css"

import performOpenDirectory from "../actions/performOpenDirectory"
import TreeLayoutMaanger from "../modules/features/TreeLayoutManger"
import { DATASET_ATTR_TREE_PATH } from "../constants/dom"
import shortcutRegistry from "../modules/features/shortcutRegistry"
import performOpenFile from "../actions/pertormOpenFile"
import TabEditorManager from "../modules/features/TabEditorManager"

export default function registerTreeHandlers(
    treeContentContainer: HTMLElement,
    treeLayoutManager: TreeLayoutMaanger,
    tabEditorManager: TabEditorManager,
    contextMenu: HTMLElement
) {
    bindTreeClickEvents(treeContentContainer, treeLayoutManager, tabEditorManager)
    bindTreeContextmenuEvents(treeContentContainer, treeLayoutManager, contextMenu)
    bindTreeContextmenuCommands(treeLayoutManager)
}

function bindTreeClickEvents(treeContentContainer: HTMLElement, treeLayoutManager: TreeLayoutMaanger, tabEditorManager: TabEditorManager) {
    treeContentContainer.addEventListener('click', async (e) => {
        const target = e.target as HTMLElement
        const treeDiv = target.closest('.tree_node') as HTMLElement
        if (!treeDiv) return

        const treeNodes = Array.from(document.querySelectorAll('.tree_node'))

        if (treeLayoutManager.isTreeSelected()) {
            const preViewModel = treeLayoutManager.getTreeViewModelByIndex(treeLayoutManager.getLastSelectedIndex())
            const preDiv = treeNodes.find(div => (div as HTMLElement).dataset[DATASET_ATTR_TREE_PATH] === preViewModel.path) as HTMLElement
            preDiv.style.border = 'none'
        }

        treeDiv.style.border = '1px solid red'

        if (e.shiftKey && treeLayoutManager.isTreeSelected()) {
            const allNodes = document.querySelectorAll('.tree_node') as NodeListOf<HTMLElement>
            allNodes.forEach(node => node.style.background = '')

            const startIndex = treeLayoutManager.getLastSelectedIndex()
            const endIndex = treeLayoutManager.getIndexByPath(treeDiv.dataset[DATASET_ATTR_TREE_PATH])
            treeLayoutManager.setLastSelectedIndexByPath(treeDiv.dataset[DATASET_ATTR_TREE_PATH])
            const [start, end] = [startIndex, endIndex].sort((a, b) => a - b)

            for (let i = start; i <= end; i++) {
                treeLayoutManager.addMultiSelectedIndex(i)
                const dataset_path = treeLayoutManager.getTreeViewModelByIndex(i).path

                const nodeDiv = treeNodes.find(div => (div as HTMLElement).dataset[DATASET_ATTR_TREE_PATH] === dataset_path) as HTMLElement
                nodeDiv.style.background = 'grey'
            }

        } else if (e.ctrlKey) {
            treeDiv.style.background = 'grey'
            const path = treeDiv.dataset[DATASET_ATTR_TREE_PATH]
            const index = treeLayoutManager.getIndexByPath(path)
            treeLayoutManager.setLastSelectedIndexByPath(path)
            treeLayoutManager.addMultiSelectedIndex(index)

        } else {
            const allNodes = document.querySelectorAll('.tree_node') as NodeListOf<HTMLElement>
            allNodes.forEach(node => node.style.background = '')

            treeLayoutManager.clearMultiSelectedIndex()
            treeDiv.style.background = 'grey'
            const path = treeDiv.dataset[DATASET_ATTR_TREE_PATH]
            treeLayoutManager.setLastSelectedIndexByPath(path)
            const idx = treeLayoutManager.getFlattenTreeIndexByPath(path)
            const viewModel = treeLayoutManager.getTreeViewModelByIndex(idx)
            if (viewModel.directory) {
                await performOpenDirectory(treeLayoutManager, treeDiv)
            } else {
                await performOpenFile(tabEditorManager, path)
            }
        }
    })
}

function bindTreeContextmenuEvents(treeContentContainer: HTMLElement, treeLayoutManager: TreeLayoutMaanger, contextMenu: HTMLElement) {
    treeContentContainer.addEventListener('contextmenu', (e) => {
        const treeNode = (e.target as HTMLElement).closest('.tree_node') as HTMLElement
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

async function performTreeNodeCut() {
    // const response: Response<void> = await window[electronAPI.channel].closeTab(data)
}

async function performTreeNodeCopy() {

}

async function performTreeNodeRename() {

}

async function performTreeNodeDelete() {

}