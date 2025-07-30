import { TabEditorsDto } from "@shared/dto/TabEditorDto"
import TreeDto from "@shared/dto/TreeDto"
import TabEditorManager from "../modules/managers/TabEditorManager"
import TreeLayoutManager from "../modules/managers/TreeLayoutManager"

export default function registerLoadHandlers(tabEditorManager: TabEditorManager, treeLayoutManager: TreeLayoutManager) {
    window.mainToRenderer.session(async (tabs: TabEditorsDto, tree: TreeDto) => {
        if (tabs) {
            await tabEditorManager.loadTabs(tabs)
        }

        if (tree) {
            const viewModel = treeLayoutManager.toTreeViewModel(tree)
            treeLayoutManager.renderTreeData(viewModel)
            treeLayoutManager.loadFlattenArrayAndMaps(viewModel)
        }

        window.rendererToMain.showMainWindow()
    })
}