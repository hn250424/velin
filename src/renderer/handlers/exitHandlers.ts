import { electronAPI } from "@shared/constants/electronAPI"
import TabEditorManager from "../modules/features/TabEditorManager"
import TreeLayoutMaanger from "../modules/features/TreeLayoutManger"

export default function registerExitHandlers() {
    const tabEditorManager = TabEditorManager.getInstance()
    const treeLayoutManager = TreeLayoutMaanger.getInstance()
    document.querySelectorAll('.exit').forEach(dom => {
        dom.addEventListener('click', () => {
            const tabSessionData = tabEditorManager.getAllTabEditorData()
            const treeSessionData = treeLayoutManager.extractTreeDto()
            window[electronAPI.channel].exit(tabSessionData, treeSessionData)
        })
    })
}