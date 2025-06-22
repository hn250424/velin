import TabData from "../../shared/interface/TabData"
// import TabData from "@shared/interface/TabData"
import { electronAPI } from "../../shared/constants/electronAPI"
import TabDataManager from "../modules/core/TabDataManager"

export default function registerLoadHandlers() {
    window[electronAPI.channel].tabSession(async (tabs: TabData[]) => {
        const tabDataManager = TabDataManager.getInstance()
        await tabDataManager.restoreTabs(tabs)
        window[electronAPI.channel].showMainWindow()
    })
}