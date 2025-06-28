import { electronAPI } from "@shared/constants/electronAPI"
import WndowManager from "../modules/features/WndowManager"

export default function registerWindowHandlers() {
    const maximize = document.getElementById('maximizeWindow') as HTMLImageElement | null

    maximize.addEventListener('click', () => {
        const windowManager = WndowManager.getInstance()

        if (windowManager.isWindowMax()) {
            maximize.src = 'src/renderer/assets/icons/maximize.png'
            windowManager.setWindowMax(false)
            window[electronAPI.channel].unmaximizeWindow()
        } else {
            maximize.src = 'src/renderer/assets/icons/unmaximize.png'
            windowManager.setWindowMax(true)
            window[electronAPI.channel].maximizeWindow() 
        }
    })

    document.getElementById('minimizeWindow').addEventListener('click', () => { window[electronAPI.channel].minimizeWindow() })
}