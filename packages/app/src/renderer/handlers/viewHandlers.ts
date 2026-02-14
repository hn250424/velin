import type MenuElements from "@renderer/modules/menu/MenuElements"
import ShortcutRegistry from "../modules/input/ShortcutRegistry"
import ZoomManager from "../modules/layout/ZoomManager"

export default function registerViewHandlers(
	shortcutRegistry: ShortcutRegistry,
	menuElements: MenuElements,
	zoomManager: ZoomManager
) {
	bindCommandsWithMenu(menuElements, zoomManager)
	bindCommandsWithShortcut(shortcutRegistry, zoomManager)
}

function bindCommandsWithMenu(menuElements: MenuElements, zoomManager: ZoomManager) {
	const {
		zoomIn,
		zoomOut,
		zoomReset,
	} = menuElements

	zoomIn.addEventListener("click", () => {
		zoomManager.zoomIn()
	})

	zoomOut.addEventListener("click", () => {
		zoomManager.zoomOut()
	})

	zoomReset.addEventListener("click", () => {
		zoomManager.resetZoom()
	})

	// document.querySelector('#view-menu-fullscreen')!.addEventListener('click', () => {
	// 	performFullscreen()
	// })
}

function bindCommandsWithShortcut(shortcutRegistry: ShortcutRegistry, zoomManager: ZoomManager) {
	shortcutRegistry.register("Ctrl++", () => zoomManager.zoomIn())
	shortcutRegistry.register("Ctrl+-", () => zoomManager.zoomOut())
	shortcutRegistry.register("Ctrl+0", () => zoomManager.resetZoom())
	// shortcutRegistry.register('F11', () => performFullscreen())
}

// function performFullscreen() {
// 	if (!document.fullscreenElement) {
// 		document.documentElement.requestFullscreen()
// 	} else {
// 		document.exitFullscreen()
// 	}
// }
