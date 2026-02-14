import type MenuElements from "@renderer/modules/menu/MenuElements"
import ShortcutRegistry from "../../modules/input/ShortcutRegistry"
import ZoomManager from "../../modules/layout/ZoomManager"
import type SideFacade from "@renderer/modules/side/SideFacade"
import { toggleSide } from "@renderer/actions"

export function handleViewMenu(
	shortcutRegistry: ShortcutRegistry,
	menuElements: MenuElements,
	zoomManager: ZoomManager,
	sideFacade: SideFacade
) {
	bindCommandsWithMenu(menuElements, zoomManager)
	bindSideToggleEvent(menuElements, sideFacade)
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

function bindCommandsWithShortcut(shortcutRegistry: ShortcutRegistry, zoomManager: ZoomManager) {
	shortcutRegistry.register("Ctrl++", () => zoomManager.zoomIn())
	shortcutRegistry.register("Ctrl+-", () => zoomManager.zoomOut())
	shortcutRegistry.register("Ctrl+0", () => zoomManager.resetZoom())
}
