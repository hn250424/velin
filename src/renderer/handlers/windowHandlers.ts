import { electronAPI } from "@shared/constants/electronAPI"
import WindowLayoutManager from "../modules/layout/WindowLayoutManager"

export default function registerWindowHandlers(windowLayoutManager: WindowLayoutManager) {
    const maximize = document.getElementById('maximizeWindow') as HTMLImageElement | null

    window[electronAPI.channel].onMaximizeWindow(() => {
        maximize.src = 'src/renderer/assets/icons/unmaximize.png'
        windowLayoutManager.setWindowMax(true)
    })

    window[electronAPI.channel].onUnmaximizeWindow(() => {
        maximize.src = 'src/renderer/assets/icons/maximize.png'
        windowLayoutManager.setWindowMax(false)
    })

    maximize.addEventListener('click', () => {
        if (windowLayoutManager.isWindowMax()) window[electronAPI.channel].requestUnmaximizeWindow()
        else window[electronAPI.channel].requestMaximizeWindow() 
    })

    document.getElementById('minimizeWindow').addEventListener('click', () => { window[electronAPI.channel].requestMinimizeWindow() })
}