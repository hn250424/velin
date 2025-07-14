import shortcutRegistry from "../modules/features/shortcutRegistry"
import ZoomManager from "../modules/features/ZoomManager"

export default function registerViewHandlers() {
    const zoomManager = ZoomManager.getInstance()

    shortcutRegistry.register('Ctrl++', (e: KeyboardEvent) => zoomManager.zoomIn())
    shortcutRegistry.register('Ctrl+-', (e: KeyboardEvent) => zoomManager.zoomOut())
    shortcutRegistry.register('Ctrl+0', (e: KeyboardEvent) => zoomManager.resetZoom())
    shortcutRegistry.register('F11', (e: KeyboardEvent) => performFullscreen())

    document.getElementById('view_menu_zoom_in').addEventListener('click', () => {
        zoomManager.zoomIn()
    })

    document.getElementById('view_menu_zoom_out').addEventListener('click', () => {
        zoomManager.zoomOut()
    })

    document.getElementById('view_menu_zoom_reset').addEventListener('click', () => {
        zoomManager.resetZoom()
    })

    document.getElementById('view_menu_fullscreen').addEventListener('click', () => {
        performFullscreen()
    })
}

function performFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen()
    } else {
        document.exitFullscreen()
    }
}