import { toggleSide } from "@renderer/actions"

import { ShortcutRegistry } from "../../core"
import { MenuElements, SideFacade, ZoomManager } from "@renderer/modules"

export function handleViewMenu(
	shortcutRegistry: ShortcutRegistry,
	menuElements: MenuElements,
	zoomManager: ZoomManager,
	sideFacade: SideFacade
) {
	bindSideToggleEvent(menuElements, sideFacade)
	bindZoomEventsWithMenu(menuElements, zoomManager)
	bindZoomEventsWithShortcut(shortcutRegistry, zoomManager)
}

function bindSideToggleEvent(menuElements: MenuElements, sideFacade: SideFacade) {
	const { fileTree } = menuElements

	fileTree.addEventListener("click", () => {
		const isOpen = sideFacade.isSideOpen()
		sideFacade.setSideOpenState(!isOpen)
		sideFacade.syncSession()
		toggleSide(menuElements, sideFacade)
	})
}

function bindZoomEventsWithMenu(menuElements: MenuElements, zoomManager: ZoomManager) {
	const { zoomIn, zoomOut, zoomReset } = menuElements

	zoomIn.addEventListener("click", () => {
		zoomManager.zoomIn()
	})

	zoomOut.addEventListener("click", () => {
		zoomManager.zoomOut()
	})

	zoomReset.addEventListener("click", () => {
		zoomManager.resetZoom()
	})
}

function bindZoomEventsWithShortcut(shortcutRegistry: ShortcutRegistry, zoomManager: ZoomManager) {
	shortcutRegistry.register("Ctrl++", () => zoomManager.zoomIn())
	shortcutRegistry.register("Ctrl+-", () => zoomManager.zoomOut())
	shortcutRegistry.register("Ctrl+0", () => zoomManager.resetZoom())
}
