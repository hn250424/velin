import TabData from "@shared/types/TabData"
import { electronAPI } from "@shared/constants/electronAPI"
import TabDataManager from "../modules/core/TabDataManager"

export default function registerLoadHandlers() {
    window[electronAPI.channel].tabSession(async (tabs: TabData[]) => {
        if (tabs.length > 0) {
            const tabDataManager = TabDataManager.getInstance()
            await tabDataManager.restoreTabs(tabs)
        }
        window[electronAPI.channel].showMainWindow()
    })
}