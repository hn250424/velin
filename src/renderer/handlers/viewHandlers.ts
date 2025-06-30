import shortcutRegistry from "../modules/features/shortcutRegistry"
import ZoomManager from "../modules/features/ZoomManager"

export default function registerViewHandlers() {
    const zoomManager = ZoomManager.getInstance()

    shortcutRegistry.register('Ctrl++', () => zoomManager.zoomIn())
    shortcutRegistry.register('Ctrl+-', () => zoomManager.zoomOut())
    shortcutRegistry.register('Ctrl+0', () => zoomManager.resetZoom())
    shortcutRegistry.register('F11', () => performFullscreen())

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