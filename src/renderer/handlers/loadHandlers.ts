import { TabEditorsDto } from "@shared/dto/TabEditorDto"
import TreeDto from "@shared/dto/TreeDto"
import TabEditorFacade from "../modules/tab_editor/TabEditorFacade"
import TreeFacade from "../modules/tree/TreeFacade"

export default function registerLoadHandlers(tabEditorFacade: TabEditorFacade, treeFacade: TreeFacade) {
    window.mainToRenderer.session(async (tabs: TabEditorsDto, tree: TreeDto) => {
        if (tabs) {
            await tabEditorFacade.loadTabs(tabs)
        }

        if (tree) {
            const viewModel = treeFacade.toTreeViewModel(tree)
            treeFacade.renderTreeData(viewModel)
            treeFacade.loadFlattenArrayAndMaps(viewModel)
        }

        window.rendererToMain.showMainWindow()
    })
}