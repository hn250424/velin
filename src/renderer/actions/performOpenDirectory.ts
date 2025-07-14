import TreeLayoutManager from "../modules/manager/TreeLayoutManager"
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
export default async function performOpenDirectory(treeLayoutManager: TreeLayoutManager, treeDiv?: HTMLElement) {
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
    const viewModel = treeLayoutManager.getTreeViewModelByPath(dirPath)
    const maybeChildren = treeDiv.nextElementSibling
    if (!maybeChildren || !maybeChildren.classList.contains(CLASS_TREE_NODE_CHILDREN)) return

    const openStatus = treeDiv.querySelector(SELECTOR_TREE_NODE_OPEN) as HTMLElement
    const treeDivChildren = maybeChildren as HTMLElement

    function updateUI(viewModel: TreeViewModel, expanded: boolean) {
        viewModel.expanded = expanded
        openStatus.textContent = expanded ? EXPANDED_TEXT : NOT_EXPANDED_TEXT
        if (expanded) treeDivChildren.classList.add(CLASS_EXPANDED)
        else treeDivChildren.classList.remove(CLASS_EXPANDED)
    }

    function syncFlattenTreeArray(viewModel: TreeViewModel, expanded: boolean) {
        if (expanded) treeLayoutManager.expandNode(viewModel)
        else treeLayoutManager.collapseNode(viewModel)
    }

    if (viewModel.expanded) {
        updateUI(viewModel, false)
        syncFlattenTreeArray(viewModel, false)
        return
    }

    if (viewModel.children && viewModel.children.length > 0) {
        if (treeDivChildren.children.length === 0) {
            treeLayoutManager.renderTreeData(viewModel, treeDivChildren)
        }
        updateUI(viewModel, true)
        syncFlattenTreeArray(viewModel, true)
        return
    }

    const response: Response<TreeDto> = await window[electronAPI.channel].openDirectory(viewModel)
    if (!response.data) return

    const responseTreeData = treeLayoutManager.toTreeViewModel(response.data)

    viewModel.children = responseTreeData.children
    treeLayoutManager.renderTreeData(responseTreeData, treeDivChildren)
    updateUI(viewModel, true)
    syncFlattenTreeArray(viewModel, true)
}