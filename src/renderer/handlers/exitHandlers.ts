import { electronAPI } from "@shared/constants/electronAPI"
import TabAndEditorManager from "../modules/features/TabAndEditorManager"

export default function registerExitHandlers() {
    const tabAndEditorManager = TabAndEditorManager.getInstance()
    document.querySelectorAll('.exit').forEach(dom => {
        dom.addEventListener('click', () => {
            const tabData = tabAndEditorManager.getAllTabData()
            window[electronAPI.channel].exit(tabData)
        })
    })
}