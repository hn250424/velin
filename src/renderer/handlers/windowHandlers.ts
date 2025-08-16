import WindowLayoutManager from "../modules/state/WindowLayoutManager"

export default function registerWindowHandlers(windowLayoutManager: WindowLayoutManager) {
    const maximizeBtn = document.getElementById('maximizeWindow') as HTMLImageElement | null
    const maximizeImg = maximizeBtn?.querySelector('img') as HTMLImageElement | null

    window.mainToRenderer.onMaximizeWindow(() => {
        maximizeImg.src = new URL('../assets/icons/unmaximize.png', import.meta.url).toString()
        windowLayoutManager.setWindowMax(true)
    })

    window.mainToRenderer.onUnmaximizeWindow(() => {
        maximizeImg.src = new URL('../assets/icons/maximize.png', import.meta.url).toString()
        windowLayoutManager.setWindowMax(false)
    })

    maximizeBtn.addEventListener('click', () => {
        if (windowLayoutManager.isWindowMax()) window.rendererToMain.requestUnmaximizeWindow()
        else window.rendererToMain.requestMaximizeWindow() 
    })

    document.getElementById('minimizeWindow').addEventListener('click', () => { window.rendererToMain.requestMinimizeWindow() })
}