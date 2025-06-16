import { electronAPI } from "../../shared/constants/electronAPI"
import TabManager from "../modules/core/TabManager"
import TabSession from "../../shared/interface/TabSession"

export default function registerLoadHandlers() {
    window[electronAPI.channel].tabSession(async (tabs: TabSession[]) => {
        const tabManager = TabManager.getInstance()
        if (tabs.length > 0) await tabManager.restoreTabs(tabs)
        else await tabManager.addTab()

        // document.getElementById('loading-container').style.display = 'none'
        // document.getElementById('container').style.display = 'flex'

        window[electronAPI.channel].showMainWindow()
    })
}