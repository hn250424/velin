import TreeLayoutMaanger from "../modules/features/TreeLayoutManger"
import Response from "@shared/types/Response"
import { electronAPI } from "@shared/constants/electronAPI"
import { CLASS_EXPANDED, DATASET_ATTR_TREE_PATH } from "../constants/dom"
import { 
    EXPANDED_TEXT, 
    NOT_EXPANDED_TEXT,
    CLASS_TREE_NODE_CHILDREN,
    SELECTOR_TREE_NODE_OPEN
} from "../constants/dom"
import TreeDto from "@shared/dto/TreeDto"
import TreeViewModel from "../viewmodels/TreeViewModel"

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

        const responseViewModel = treeLayoutManager.toTreeViewModel(response.data)

        treeLayoutManager.renderTreeData(responseViewModel)
        treeLayoutManager.restoreFlattenArrayAndMaps(responseViewModel)
        return
    }

    // When click directory in tree area.
    const dirPath = treeDiv.dataset[DATASET_ATTR_TREE_PATH]
    const idx = treeLayoutManager.getFlattenTreeIndexByPath(dirPath)
    const treeNode = treeLayoutManager.getTreeViewModelByIndex(idx)
    const maybeChildren = treeDiv.nextElementSibling
    if (!maybeChildren || !maybeChildren.classList.contains(CLASS_TREE_NODE_CHILDREN)) return

    const openStatus = treeDiv.querySelector(SELECTOR_TREE_NODE_OPEN) as HTMLElement
    const treeDivChildren = maybeChildren as HTMLElement

    function updateUI(treeNode: TreeViewModel, expanded: boolean) {
        treeNode.expanded = expanded
        openStatus.textContent = expanded ? EXPANDED_TEXT : NOT_EXPANDED_TEXT
        if (expanded) treeDivChildren.classList.add(CLASS_EXPANDED)
        else treeDivChildren.classList.remove(CLASS_EXPANDED)
    }

    function syncFlattenTreeArray(treeNode: TreeViewModel, expanded: boolean) {
        if (expanded) treeLayoutManager.expandNode(treeNode)
        else treeLayoutManager.collapseNode(treeNode)
    }

    if (treeNode.expanded) {
        updateUI(treeNode, false)
        syncFlattenTreeArray(treeNode, false)
        return
    }

    if (treeNode.children && treeNode.children.length > 0) {
        if (treeDivChildren.children.length === 0) {
            treeLayoutManager.renderTreeData(treeNode, treeDivChildren)
        }
        updateUI(treeNode, true)
        syncFlattenTreeArray(treeNode, true)
        return
    }

    const response: Response<TreeDto> = await window[electronAPI.channel].openDirectory(treeNode)
    if (!response.data) return

    const responseTreeData = treeLayoutManager.toTreeViewModel(response.data)

    treeNode.children = responseTreeData.children
    treeLayoutManager.renderTreeData(responseTreeData, treeDivChildren)
    updateUI(treeNode, true)
    syncFlattenTreeArray(treeNode, true)
}