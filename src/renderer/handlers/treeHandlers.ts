import "@milkdown/theme-nord/style.css"

import performOpenDirectory from "../actions/performOpenDirectory"
import TreeLayoutMaanger from "../modules/features/TreeLayoutManger"

export default function registerTreeHandlers(treeContentContainer: HTMLElement, treeLayoutManager: TreeLayoutMaanger) {
    bindTreeClickEvents(treeContentContainer, treeLayoutManager)
}

function bindTreeClickEvents(treeContentContainer: HTMLElement, treeLayoutManager: TreeLayoutMaanger) {
    treeContentContainer.addEventListener('click', async (e) => {
        const target = e.target as HTMLElement
        const treeDiv = target.closest('.tree_node') as HTMLElement
        if (!treeDiv) return
        await performOpenDirectory(treeLayoutManager, treeDiv)
    })
}