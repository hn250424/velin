import { electronAPI } from "@shared/constants/electronAPI"
import { TabEditorsDto } from "@shared/dto/TabEditorDto"
import TreeDto from "@shared/dto/TreeDto"
import TabEditorManager from "../modules/manager/TabEditorManager"
import TreeLayoutManager from "../modules/manager/TreeLayoutManager"

export default function registerLoadHandlers(tabEditorManager: TabEditorManager, treeLayoutManager: TreeLayoutManager) {
    window[electronAPI.channel].session(async (tabs: TabEditorsDto, tree: TreeDto) => {
        if (tabs) {
            await tabEditorManager.restoreTabs(tabs)
        }

        if (tree) {
            const viewModel = treeLayoutManager.toTreeViewModel(tree)
            treeLayoutManager.renderTreeData(viewModel)
            treeLayoutManager.restoreFlattenArrayAndMaps(viewModel)
        }

        window[electronAPI.channel].showMainWindow()
    })
}