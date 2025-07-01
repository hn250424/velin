import TabEditorDto from "@shared/dto/TabEditorDto"
import { electronAPI } from "@shared/constants/electronAPI"
import TabEditorManager from "../modules/features/TabEditorManager"

export default function registerLoadHandlers() {
    window[electronAPI.channel].tabSession(async (tabs: TabEditorDto[]) => {
        if (tabs.length > 0) {
            const tabEditorManager = TabEditorManager.getInstance()
            await tabEditorManager.restoreTabs(tabs)
        }
        window[electronAPI.channel].showMainWindow()
    })
}