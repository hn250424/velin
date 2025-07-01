import { electronAPI } from "@shared/constants/electronAPI"
import TabEditorManager from "../modules/features/TabEditorManager"

export default function registerExitHandlers() {
    const tabEditorManager = TabEditorManager.getInstance()
    document.querySelectorAll('.exit').forEach(dom => {
        dom.addEventListener('click', () => {
            const data = tabEditorManager.getAllTabEditorData()
            window[electronAPI.channel].exit(data)
        })
    })
}