import { TabEditorDto, TabEditorsDto } from "@shared/dto/TabEditorDto"
import { electronAPI } from "@shared/constants/electronAPI"
import TabEditorManager from "../modules/features/TabEditorManager"
import TreeDto from "@shared/dto/TreeDto"
import TreeLayoutManager from "../modules/features/TreeLayoutManager"

export default function registerLoadHandlers() {
    window[electronAPI.channel].session(async (tabs: TabEditorsDto, tree: TreeDto) => {
        if (tabs) {
            const tabEditorManager = TabEditorManager.getInstance()
            await tabEditorManager.restoreTabs(tabs)
        }

        if (tree) {
            const treeLayoutManager = TreeLayoutManager.getInstance()
            const viewModel = treeLayoutManager.toTreeViewModel(tree)
            treeLayoutManager.renderTreeData(viewModel)
            treeLayoutManager.restoreFlattenArrayAndMaps(viewModel)
        }

        window[electronAPI.channel].showMainWindow()
    })
}