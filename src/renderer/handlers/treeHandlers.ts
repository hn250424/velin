import "@milkdown/theme-nord/style.css"

import { electronAPI } from '@shared/constants/electronAPI'
import Response from "@shared/types/Response"
import TabData from "@shared/types/TabData"
import TabAndEditorManager from "../modules/features/TabAndEditorManager"
import shortcutRegistry from "../modules/features/shortcutRegistry"
import TreeNode from "@shared/types/TreeNode"
import TreeLayoutMaanger from "../modules/features/TreeLayoutManger"
import { DATASET_ATTR_TREE_PATH, EXPANDED_TEXT, NOT_EXPANDED_TEXT } from "../constants/dom"
import performOpenDirectory from "../actions/performOpenDirectory"

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