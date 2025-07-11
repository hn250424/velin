import { electronAPI } from "@shared/constants/electronAPI"
import { TabEditorDto } from "@shared/dto/TabEditorDto"
import Response from "@shared/types/Response"
import TabEditorManager from "../modules/features/TabEditorManager"

export default async function performOpenFile(tabEditorManager: TabEditorManager, filePath?: string) {
    if (filePath) {
        const tabEditorView = tabEditorManager.getTabEditorViewByPath(filePath)
        
        if (tabEditorView) {
            tabEditorManager.activateTabEditorById( tabEditorView.getId() )
            return
        } 
    }

    const response: Response<TabEditorDto> = await window[electronAPI.channel].openFile(filePath)
    if (response.result && response.data) {
        const data = response.data
        await tabEditorManager.addTab(data.id, data.filePath, data.fileName, data.content)
    }
}