import { View } from "electron"
import { electronAPI } from "../../shared/constants/electronAPI"
import ViewManager from "../modules/feature/ViewManager"

export default function registerWindowHandlers() {
    const maximize = document.getElementById('maximize') as HTMLImageElement | null

    maximize.addEventListener('click', () => {
        const viewManager = ViewManager.getInstance()

        if (viewManager.isWindowMax()) {
            maximize.src = 'src/renderer/assets/icons/maximize.png'
            viewManager.setWindowMax(false)
            window[electronAPI.channel].unmaximize()
        } else {
            maximize.src = 'src/renderer/assets/icons/unmaximize.png'
            viewManager.setWindowMax(true)
            window[electronAPI.channel].maximize() 
        }
    })

    document.getElementById('minimize').addEventListener('click', () => { window[electronAPI.channel].minimize() })
    document.getElementById('close').addEventListener('click', () => { window[electronAPI.channel].close() })
}