import { TabEditorDto, TabEditorsDto } from "@shared/dto/TabEditorDto"
import { electronAPI } from "@shared/constants/electronAPI"
import TabEditorManager from "../modules/features/TabEditorManager"
import TreeDto from "@shared/dto/TreeDto"
import TreeLayoutMaanger from "../modules/features/TreeLayoutManger"

export default function registerLoadHandlers() {
    window[electronAPI.channel].session(async (tabs: TabEditorsDto, tree: TreeDto) => {
        console.log(tabs)
        if (tabs && tabs.data.length > 0) {
            const tabEditorManager = TabEditorManager.getInstance()
            await tabEditorManager.restoreTabs(tabs)
        }

        if (tree) {
            const treeLayoutManager = TreeLayoutMaanger.getInstance()
            const viewModel = treeLayoutManager.toTreeViewModel(tree)
            treeLayoutManager.renderTreeData(viewModel)
            treeLayoutManager.restoreFlattenArrayAndMaps(viewModel)
        }

        window[electronAPI.channel].showMainWindow()
    })
}