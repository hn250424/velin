import { TabEditorsDto } from "@shared/dto/TabEditorDto"
import TreeDto from "@shared/dto/TreeDto"
import TabEditorFacade from "../modules/tab_editor/TabEditorFacade"
import TreeFacade from "../modules/tree/TreeFacade"
import SideDto from "@shared/dto/SideDto"
import SideState from "../modules/state/SideState"

export default function registerLoadHandlers(sideState: SideState, tabEditorFacade: TabEditorFacade, treeFacade: TreeFacade, callback: Function) {
    window.mainToRenderer.session(async (sideDto: SideDto, tabs: TabEditorsDto, tree: TreeDto) => {
        if (sideDto) {
            sideState.setOpenState(sideDto.open)
            sideState.setSidth(sideDto.width)
        }

        if (tabs) {
            await tabEditorFacade.loadTabs(tabs)
        }

        if (tree) {
            const viewModel = treeFacade.toTreeViewModel(tree)
            treeFacade.renderTreeData(viewModel)
            treeFacade.loadFlattenArrayAndMaps(viewModel)
        }

        callback()

        window.rendererToMain.showMainWindow()
    })
}