import { electronAPI } from "../../shared/constants/electronAPI"
import TabManager from "../modules/core/TabManager"
import TabSession from "../../shared/interface/TabSession"

export default function registerLoadHandlers() {
    window[electronAPI.channel].tabSession((tabs: TabSession[]) => {
        const tabManager = TabManager.getInstance()
        if (tabs.length > 0) tabManager.restoreTabs(tabs)
        else tabManager.addTab()
    })
}