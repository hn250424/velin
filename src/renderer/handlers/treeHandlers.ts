import "@milkdown/theme-nord/style.css"

import performOpenDirectory from "../actions/performOpenDirectory"
import TreeLayoutMaanger from "../modules/features/TreeLayoutManger"

export default function registerTreeHandlers(treeContentContainer: HTMLElement, treeLayoutManager: TreeLayoutMaanger, contextMenu: HTMLElement) {
    bindTreeClickEvents(treeContentContainer, treeLayoutManager)
    bindTreeContextmenuEvents(treeContentContainer, treeLayoutManager, contextMenu)
    bindTreeContextmenuCommands(treeLayoutManager)
}

function bindTreeClickEvents(treeContentContainer: HTMLElement, treeLayoutManager: TreeLayoutMaanger) {
    treeContentContainer.addEventListener('click', async (e) => {
        const target = e.target as HTMLElement
        const treeDiv = target.closest('.tree_node') as HTMLElement
        if (!treeDiv) return

        // TODO: Check directory or file.
        await performOpenDirectory(treeLayoutManager, treeDiv)
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