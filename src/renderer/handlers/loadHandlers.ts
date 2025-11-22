import { TabEditorsDto } from "@shared/dto/TabEditorDto"
import TreeDto from "@shared/dto/TreeDto"
import TabEditorFacade from "../modules/tab_editor/TabEditorFacade"
import TreeFacade from "../modules/tree/TreeFacade"
import SideDto from "@shared/dto/SideDto"
import SideState from "../modules/state/SideState"
import WindowState from "../modules/state/WindowState"
import WindowDto from "@shared/dto/WindowDto"
import SettingsDto from "@shared/dto/SettingsDto"
import SettingsFacade from "../modules/settings/SettingsFacade"

export default function registerLoadHandlers(
    windowState: WindowState, 
    settingsFacade: SettingsFacade,
    sideState: SideState, 
    tabEditorFacade: TabEditorFacade, 
    treeFacade: TreeFacade, 
    callback: Function
) {
    let sessionDone = false
    let infoDone = false

    function finish() {
        if (sessionDone && infoDone) {
            callback()  
            window.rendererToMain.showMainWindow()
        }
    }

    window.mainToRenderer.session(async (windowDto: WindowDto, settingsDto: SettingsDto, sideDto: SideDto, tabs: TabEditorsDto, tree: TreeDto) => {
        if (windowDto) {
            windowState.setWindowMaximizeState(windowDto.maximize)
        }

        if (settingsDto) {
            const settingsViewModel = settingsFacade.toSettingsViewModel(settingsDto)
            settingsFacade.setSettingsValue(settingsViewModel)
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

        sessionDone = true
        finish()
    })

    window.mainToRenderer.info((version: string) => {
        document.querySelector('#info-version > span').textContent = version

        infoDone = true
        finish()
    })
}