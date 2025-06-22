import { electronAPI } from "../../shared/constants/electronAPI"
import ViewManager from "../modules/features/ViewManager"

export default function registerWindowHandlers() {
    const maximize = document.getElementById('maximizeWindow') as HTMLImageElement | null

    maximize.addEventListener('click', () => {
        const viewManager = ViewManager.getInstance()

        if (viewManager.isWindowMax()) {
            maximize.src = 'src/renderer/assets/icons/maximize.png'
            viewManager.setWindowMax(false)
            window[electronAPI.channel].unmaximizeWindow()
        } else {
            maximize.src = 'src/renderer/assets/icons/unmaximize.png'
            viewManager.setWindowMax(true)
            window[electronAPI.channel].maximizeWindow() 
        }
    })

    document.getElementById('minimizeWindow').addEventListener('click', () => { window[electronAPI.channel].minimizeWindow() })
    document.getElementById('closeWindow').addEventListener('click', () => { window[electronAPI.channel].closeWindow() })
}