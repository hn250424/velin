import TabData from "@shared/types/TabData"
import { electronAPI } from "@shared/constants/electronAPI"
import TabAndEditorManager from "../modules/features/TabAndEditorManager"

export default function registerLoadHandlers() {
    window[electronAPI.channel].tabSession(async (tabs: TabData[]) => {
        if (tabs.length > 0) {
            const tabAndEditorManager = TabAndEditorManager.getInstance()
            await tabAndEditorManager.restoreTabs(tabs)
        }
        window[electronAPI.channel].showMainWindow()
    })
}