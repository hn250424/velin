import { TabEditorsDto } from "@shared/dto/TabEditorDto"
import TreeDto from "@shared/dto/TreeDto"
import TabEditorFacade from "../modules/tab_editor/TabEditorFacade"
import TreeFacade from "../modules/tree/TreeFacade"
import SideDto from "@shared/dto/SideDto"
import SideState from "../modules/state/SideState"
import WindowState from "../modules/state/WindowState"
import WindowDto from "@shared/dto/WindowDto"

export default function registerLoadHandlers(windowState: WindowState, sideState: SideState, tabEditorFacade: TabEditorFacade, treeFacade: TreeFacade, callback: Function) {
    window.mainToRenderer.session(async (windowDto: WindowDto, sideDto: SideDto, tabs: TabEditorsDto, tree: TreeDto) => {
        if (windowDto) {
            windowState.setWindowMaximizeState(windowDto.maximize)
        }

        if (sideDto) {
            sideState.setTreeOpenState(sideDto.open)
            sideState.setTreeSidth(sideDto.width)
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