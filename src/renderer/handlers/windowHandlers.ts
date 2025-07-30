import WindowLayoutManager from "../modules/layout/WindowLayoutManager"

export default function registerWindowHandlers(windowLayoutManager: WindowLayoutManager) {
    const maximize = document.getElementById('maximizeWindow') as HTMLImageElement | null

    window.mainToRenderer.onMaximizeWindow(() => {
        maximize.src = 'src/renderer/assets/icons/unmaximize.png'
        windowLayoutManager.setWindowMax(true)
    })

    window.mainToRenderer.onUnmaximizeWindow(() => {
        maximize.src = 'src/renderer/assets/icons/maximize.png'
        windowLayoutManager.setWindowMax(false)
    })

    maximize.addEventListener('click', () => {
        if (windowLayoutManager.isWindowMax()) window.rendererToMain.requestUnmaximizeWindow()
        else window.rendererToMain.requestMaximizeWindow() 
    })

    document.getElementById('minimizeWindow').addEventListener('click', () => { window.rendererToMain.requestMinimizeWindow() })
}