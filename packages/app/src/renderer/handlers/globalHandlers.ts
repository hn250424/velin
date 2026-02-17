import {
	CLASS_SELECTED,
	SELECTOR_MENU_ITEM,
	SELECTOR_TAB_CONTEXT_MENU,
	SELECTOR_TREE_CONTEXT_MENU,
	SELECTOR_TREE_NODE_CONTAINER,
} from "@renderer/constants/dom"
import { FocusManager, ShortcutRegistry } from "@renderer/core"
import type { Dispatcher } from "@renderer/dispatch"
import { MenuElements, TabEditorFacade, TreeFacade } from "@renderer/modules"

export function handleGlobalInput(
	dispatcher: Dispatcher,
	focusManager: FocusManager,
	menuElements: MenuElements,
	tabEditorFacade: TabEditorFacade,
	treeFacade: TreeFacade,
	shortcutRegistry: ShortcutRegistry
) {
	bindDocumentClickEvent(tabEditorFacade, treeFacade)
	bindDocumentMousedownEvnet(focusManager, menuElements, tabEditorFacade, treeFacade)
	bindDocumentKeydownEvent(shortcutRegistry)
	bindShortcutEvent(dispatcher, shortcutRegistry)
}

function bindDocumentClickEvent(tabEditorFacade: TabEditorFacade, treeFacade: TreeFacade) {
	const { tabContextMenu } = tabEditorFacade.renderer.elements
	const { treeContextMenu } = treeFacade.renderer.elements

	document.addEventListener("click", () => {
		tabContextMenu.classList.remove(CLASS_SELECTED)
		treeContextMenu.classList.remove(CLASS_SELECTED)
	})
}

function bindDocumentMousedownEvnet(
	focusManager: FocusManager,
	menuElements: MenuElements,
	tabEditorFacade: TabEditorFacade,
	treeFacade: TreeFacade
) {
	const { menuItems } = menuElements
	const { tabContextMenu } = tabEditorFacade.renderer.elements
	const { treeContextMenu } = treeFacade.renderer.elements

	document.addEventListener("mousedown", (e) => {
		const target = e.target as HTMLElement
		const isInTreeContextMenu = !!target.closest(SELECTOR_TREE_CONTEXT_MENU)
		const isInTabContextMenu = !!target.closest(SELECTOR_TAB_CONTEXT_MENU)
		const isInTreeNodeContainer = !!target.closest(SELECTOR_TREE_NODE_CONTAINER)
		const isInMenuItem = !!target.closest(SELECTOR_MENU_ITEM)

		if (!isInMenuItem) menuItems.forEach((i) => i.classList.remove(CLASS_SELECTED))
		if (!isInTabContextMenu) tabContextMenu.classList.remove(CLASS_SELECTED)
		if (!isInTreeContextMenu) treeContextMenu.classList.remove(CLASS_SELECTED)

		focusManager.trackRelevantFocus(e.target as HTMLElement)

		if (!isInTabContextMenu) tabEditorFacade.removeContextTabId()
		if (!isInTreeContextMenu && !isInTreeNodeContainer) {
			treeFacade.removeTreeFocus()
			treeFacade.removeLastSelectedIndex()
			treeFacade.clearTreeSelected()
		}
	})
}

function bindDocumentKeydownEvent(shortcutRegistry: ShortcutRegistry) {
	document.addEventListener("keydown", (e) => {
		shortcutRegistry.handleKeyEvent(e)
	})
}

function bindShortcutEvent(dispatcher: Dispatcher, shortcutRegistry: ShortcutRegistry) {
	shortcutRegistry.register("ESC", async () => await dispatcher.dispatch("esc", "shortcut"))
	shortcutRegistry.register("ENTER", async () => await dispatcher.dispatch("enter", "shortcut"))
}
