import { TabEditorsDto } from "@shared/dto/TabEditorDto"
import TreeDto from "@shared/dto/TreeDto"
import TabEditorFacade from "../modules/tab_editor/TabEditorFacade"
import TreeFacade from "../modules/tree/TreeFacade"

export default function registerLoadHandlers(tabEditorFacade: TabEditorFacade, treeLayoutFacade: TreeFacade) {
    window.mainToRenderer.session(async (tabs: TabEditorsDto, tree: TreeDto) => {
        if (tabs) {
            await tabEditorFacade.loadTabs(tabs)
        }

        if (tree) {
            const viewModel = treeLayoutFacade.toTreeViewModel(tree)
            treeLayoutFacade.renderTreeData(viewModel)
            treeLayoutFacade.loadFlattenArrayAndMaps(viewModel)
        }

        window.rendererToMain.showMainWindow()
    })
}