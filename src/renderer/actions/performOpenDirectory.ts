import TreeLayoutMaanger from "../modules/features/TreeLayoutManger"
import Response from "@shared/types/Response"
import { electronAPI } from "@shared/constants/electronAPI"
import { DATASET_ATTR_TREE_PATH } from "../constants/dom"
import { EXPANDED_TEXT, NOT_EXPANDED_TEXT } from "../constants/dom"
import TreeDto from "@shared/dto/TreeDto"

// TODO: Check.
/**
 * Opens or expands a directory in the file tree.
 * 
 * - If `treeDiv` is not provided, it is assumed that the user is opening a new root directory
 *   via menu or shortcut, so the tree is initialized by loading that directory.
 * 
 * - If `treeDiv` is provided, it represents a clicked directory node,
 *   and this function dynamically loads and expands its child nodes.
 * 
 * @param treeLayoutManager
 * @param treeDiv The DOM element of the clicked directory node; if omitted, a new root directory is opened
 * @returns Promise<void>
 */
export default async function performOpenDirectory(treeLayoutManager: TreeLayoutMaanger, treeDiv?: HTMLElement) {
    // New open when shortcut or file menu.
    if (!treeDiv) {
        const response: Response<TreeDto> = await window[electronAPI.channel].openDirectory()
        if (!response.data) return

        treeLayoutManager.renderTreeData(response.data)
        treeLayoutManager.restoreFlattenTree(response.data)
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

        if (expanded) {
            treeLayoutManager.expandNode(treeNode)
        } else {
            treeLayoutManager.collapseNode(treeNode)
        }
    }

    if (treeNode.expanded) {
        updateUI(false)
        return
    }

    if (treeNode.children && treeNode.children.length > 0) {
        if (treeDivChildren.children.length === 0) {
            treeLayoutManager.renderTreeData(treeNode, treeDivChildren)
        }
        updateUI(true)
        return
    }

    const response: Response<TreeDto> = await window[electronAPI.channel].openDirectory(treeNode)
    if (!response.data) return

    treeNode.children = response.data.children
    treeLayoutManager.renderTreeData(response.data, treeDivChildren)
    updateUI(true)
}