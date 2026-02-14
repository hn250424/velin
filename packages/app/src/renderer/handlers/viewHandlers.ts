import ShortcutRegistry from "../modules/input/ShortcutRegistry"
import ZoomManager from "../modules/layout/ZoomManager"

export default function registerViewHandlers(shortcutRegistry: ShortcutRegistry, zoomManager: ZoomManager) {
	bindCommandsWithMenu(zoomManager)
	bindCommandsWithShortcut(shortcutRegistry, zoomManager)
}

function bindCommandsWithMenu(zoomManager: ZoomManager) {
	document.querySelector("#view-menu-zoom-in")!.addEventListener("click", () => {
		zoomManager.zoomIn()
	})

	document.querySelector("#view-menu-zoom-out")!.addEventListener("click", () => {
		zoomManager.zoomOut()
	})

	document.querySelector("#view-menu-zoom-reset")!.addEventListener("click", () => {
		zoomManager.resetZoom()
	})

	// document.querySelector('#view-menu-fullscreen')!.addEventListener('click', () => {
	// 	performFullscreen()
	// })
}

function bindCommandsWithShortcut(shortcutRegistry: ShortcutRegistry, zoomManager: ZoomManager) {
	shortcutRegistry.register("Ctrl++", (e: KeyboardEvent) => zoomManager.zoomIn())
	shortcutRegistry.register("Ctrl+-", (e: KeyboardEvent) => zoomManager.zoomOut())
	shortcutRegistry.register("Ctrl+0", (e: KeyboardEvent) => zoomManager.resetZoom())
	// shortcutRegistry.register('F11', (e: KeyboardEvent) => performFullscreen())
}

// function performFullscreen() {
// 	if (!document.fullscreenElement) {
// 		document.documentElement.requestFullscreen()
// 	} else {
// 		document.exitFullscreen()
// 	}
// }
