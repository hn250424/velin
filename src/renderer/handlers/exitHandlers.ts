import { electronAPI } from "@shared/constants/electronAPI"
import TabDataManager from "../modules/core/TabDataManager"

export default function registerExitHandlers() {
    const tabDataManager = TabDataManager.getInstance()
    document.querySelectorAll('.exit').forEach(dom => {
        dom.addEventListener('click', () => {
            const tabData = tabDataManager.getAllTabData()
            window[electronAPI.channel].exit(tabData)
        })
    })
}