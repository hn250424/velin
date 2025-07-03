import TreeLayoutMaanger from "../modules/features/TreeLayoutManger"
import Response from "@shared/types/Response"
import { electronAPI } from "@shared/constants/electronAPI"
import { DATASET_ATTR_TREE_PATH } from "../constants/dom"
import { EXPANDED_TEXT, NOT_EXPANDED_TEXT } from "../constants/dom"
import TreeDto from "@shared/dto/TreeDto"

export default async function performOpenDirectory(treeLayoutManager: TreeLayoutMaanger, treeDiv?: HTMLElement) {
    // New open when shortcut or file menu.
    if (!treeDiv) {
        const response: Response<TreeDto> = await window[electronAPI.channel].openDirectory()
        if (!response.data) return
        

        treeLayoutManager.renderTreeData(response.data)
        treeLayoutManager.setTreeDtoByPath(response.data.path, response.data)
        return
    }

    // When click directory in tree area.
    const dirPath = treeDiv.dataset[DATASET_ATTR_TREE_PATH]
    const treeNode = treeLayoutManager.getTreeDtoByPath(dirPath)
    const maybeChildren = treeDiv.nextElementSibling
    if (!maybeChildren || !maybeChildren.classList.contains('tree_children')) return

    const openStatus = treeDiv.querySelector('.tree_node_open_status') as HTMLElement
    const treeDivChildren = maybeChildren as HTMLElement

    function updateUI(expanded: boolean) {
        treeNode.expanded = expanded
        openStatus.textContent = expanded ? EXPANDED_TEXT : NOT_EXPANDED_TEXT
        treeDivChildren.style.display = expanded ? 'block' : 'none'
    }

    if (treeNode.expanded) {
        updateUI(false)
        return
    }

    if (treeNode.children && treeNode.children.length > 0) {
        updateUI(true)
        return
    }

    const response: Response<TreeDto> = await window[electronAPI.channel].openDirectory(treeNode)
    if (!response.data) return

    treeLayoutManager.renderTreeData(response.data, treeDivChildren)
    treeLayoutManager.setTreeDtoByPath(response.data.path, response.data)
    updateUI(true)
}