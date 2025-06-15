import { electronAPI } from "../../shared/constants/electronAPI"

export default function registerWindowsHandlers() {
    const maximize = document.getElementById('maximize') as HTMLImageElement | null
    let isMax = false
    maximize.addEventListener('click', () => {
        if (isMax) maximize.src = 'src/renderer/assets/icons/maximize.png'
        else maximize.src = 'src/renderer/assets/icons/unmaximize.png'
        isMax = ! isMax
        window[electronAPI.channel].maximize() 
    })

    document.getElementById('minimize').addEventListener('click', () => { window[electronAPI.channel].minimize() })
    document.getElementById('close').addEventListener('click', () => { window[electronAPI.channel].close() })
}