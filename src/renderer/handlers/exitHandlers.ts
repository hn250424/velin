import { electronAPI } from "@shared/constants/electronAPI"
import TabEditorManager from "../modules/features/TabEditorManager"
import TreeLayoutMaanger from "../modules/features/TreeLayoutManger"
import { TabEditorsDto } from "@shared/dto/TabEditorDto"

export default function registerExitHandlers() {
    const tabEditorManager = TabEditorManager.getInstance()
    const treeLayoutManager = TreeLayoutMaanger.getInstance()
    document.querySelectorAll('.exit').forEach(dom => {
        dom.addEventListener('click', () => {
            const tabSessionData: TabEditorsDto = tabEditorManager.getAllTabEditorData()
            const treeSessionData = treeLayoutManager.toTreeDto( treeLayoutManager.extractTreeViewModel() )
            window[electronAPI.channel].exit(tabSessionData, treeSessionData)
        })
    })
}