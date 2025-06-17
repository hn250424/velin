import TabData from "../../shared/interface/TabData"
import { electronAPI } from "../../shared/constants/electronAPI"
import TabManager from "../modules/core/TabManager"

export default function registerLoadHandlers() {
    window[electronAPI.channel].tabSession(async (tabs: TabData[]) => {
        const tabManager = TabManager.getInstance()
        if (tabs.length > 0) await tabManager.restoreTabs(tabs)
        else await tabManager.addTab()

        console.log(tabManager.getTabData())

        window[electronAPI.channel].showMainWindow()
    })
}