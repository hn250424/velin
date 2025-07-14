import { electronAPI } from "@shared/constants/electronAPI"
import TabEditorManager from "../modules/manager/TabEditorManager"
import TreeLayoutManager from "../modules/manager/TreeLayoutManager"
import { TabEditorsDto } from "@shared/dto/TabEditorDto"
import CommandDispatcher from "../modules/command/CommandDispatcher"

export default function registerExitHandlers(commandDispatcher: CommandDispatcher, tabEditorManager: TabEditorManager, treeLayoutManager: TreeLayoutManager) {
    document.querySelectorAll('.exit').forEach(dom => {
        dom.addEventListener('click', () => {
            const tabSessionData: TabEditorsDto = tabEditorManager.getAllTabEditorData()
            const treeSessionData = treeLayoutManager.toTreeDto( treeLayoutManager.extractTreeViewModel() )
            window[electronAPI.channel].exit(tabSessionData, treeSessionData)
        })
    })
}