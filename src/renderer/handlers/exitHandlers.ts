import { TabEditorsDto } from "@shared/dto/TabEditorDto"
import TabEditorFacade from "../modules/tab_editor/TabEditorFacade"
import TreeFacade from "../modules/tree/TreeFacade"

// TODO: Alt+F4
export default function registerExitHandlers(
    tabEditorFacade: TabEditorFacade,
    treeLayoutFacade: TreeFacade
) {
    document.querySelectorAll('.exit').forEach(dom => {
        dom.addEventListener('click', () => {
            const tabSessionData: TabEditorsDto = tabEditorFacade.getAllTabEditorData()
            const treeSessionData = treeLayoutFacade.toTreeDto(treeLayoutFacade.extractTreeViewModel())
            window.rendererToMain.exit(tabSessionData, treeSessionData)
        })
    })
}