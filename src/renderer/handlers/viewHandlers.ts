import CommandDispatcher from "../modules/command/CommandDispatcher"
import shortcutRegistry from "../modules/input/shortcutRegistry"
import ZoomManager from "../modules/layout/ZoomManager"

export default function registerViewHandlers(commandDispatcher: CommandDispatcher, zoomManager: ZoomManager) {
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