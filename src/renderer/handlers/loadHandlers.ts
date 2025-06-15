import UiManager from "../modules/core/UiManager"
import { electronAPI } from "../../shared/constants/electronAPI"
import TabManager from "../modules/core/TabManager"

export default function registerLoadHandlers() {
    window[electronAPI.channel].noTab(async () => {
        const tabManager = TabManager.getInstance()
        await tabManager.addTab()
    })
}