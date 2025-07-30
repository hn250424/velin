import { TabEditorsDto } from "@shared/dto/TabEditorDto"
import TabEditorManager from "../modules/managers/TabEditorManager"
import TreeLayoutManager from "../modules/managers/TreeLayoutManager"

// TODO: Alt+F4
export default function registerExitHandlers(
    tabEditorManager: TabEditorManager,
    treeLayoutManager: TreeLayoutManager
) {
    document.querySelectorAll('.exit').forEach(dom => {
        dom.addEventListener('click', () => {
            const tabSessionData: TabEditorsDto = tabEditorManager.getAllTabEditorData()
            const treeSessionData = treeLayoutManager.toTreeDto(treeLayoutManager.extractTreeViewModel())
            window.rendererToMain.exit(tabSessionData, treeSessionData)
        })
    })
}