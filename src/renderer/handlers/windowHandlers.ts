import { electronAPI } from "@shared/constants/electronAPI"
import LayoutManager from "../modules/features/LayoutManager"

export default function registerWindowHandlers() {
    const layoutManager = LayoutManager.getInstance()
    const maximize = document.getElementById('maximizeWindow') as HTMLImageElement | null

    window[electronAPI.channel].onMaximizeWindow(() => {
        maximize.src = 'src/renderer/assets/icons/unmaximize.png'
        layoutManager.setWindowMax(true)
    })

    window[electronAPI.channel].onUnmaximizeWindow(() => {
        maximize.src = 'src/renderer/assets/icons/maximize.png'
        layoutManager.setWindowMax(false)
    })

    maximize.addEventListener('click', () => {
        if (layoutManager.isWindowMax()) window[electronAPI.channel].requestUnmaximizeWindow()
        else window[electronAPI.channel].requestMaximizeWindow() 
    })

    document.getElementById('minimizeWindow').addEventListener('click', () => { window[electronAPI.channel].requestMinimizeWindow() })
}