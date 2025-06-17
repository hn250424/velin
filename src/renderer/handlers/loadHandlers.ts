import TabData from "../../shared/interface/TabData"
import { electronAPI } from "../../shared/constants/electronAPI"
import TabManager from "../modules/core/TabManager"

export default function registerLoadHandlers() {
    window[electronAPI.channel].tabSession(async (tabs: TabData[]) => {
        const tabManager = TabManager.getInstance()
        await tabManager.restoreTabs(tabs)
        window[electronAPI.channel].showMainWindow()
    })
}