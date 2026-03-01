import { DOM } from "@renderer/constants"
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

	document.addEventListener("click", (e) => {
		const target = e.target as HTMLElement

		const {
			isInMenuItem,
			isInTabContextMenu,
			isInTreeContextMenu,
			isInTreeNode,
			isInSide,
			isInTreeTop,
			isInTreeNodeContainer,
			isInsideTreeSystem,
		} = _getDiscriminationFlags(target)

		tabContextMenu.classList.remove(DOM.CLASS_SELECTED)
		treeContextMenu.classList.remove(DOM.CLASS_SELECTED)

		if (isInTreeNodeContainer) {
			const treeEvent = new CustomEvent("click:in-tree-container", {
				detail: { originalEvent: e },
			})
			document.dispatchEvent(treeEvent)
		}
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
		focusManager.trackRelevantFocus(target)

		const {
			isInMenuItem,
			isInTabContextMenu,
			isInTreeContextMenu,
			isInTreeNode,
			isInSide,
			isInTreeTop,
			isInTreeNodeContainer,
			isInsideTreeSystem,
		} = _getDiscriminationFlags(target)

		if (!isInMenuItem) menuItems.forEach((i) => i.classList.remove(DOM.CLASS_SELECTED))
		if (!isInTabContextMenu) tabContextMenu.classList.remove(DOM.CLASS_SELECTED)
		if (!isInTreeContextMenu) treeContextMenu.classList.remove(DOM.CLASS_SELECTED)

		if (!isInTabContextMenu) tabEditorFacade.removeContextTabId()

		if (!isInsideTreeSystem) {
			treeFacade.blur(treeFacade.lastSelectedIndex)
			treeFacade.removeLastSelectedIndex()
			treeFacade.clearTreeSelected()
		} else if (isInTreeTop) {
			treeFacade.blur(treeFacade.lastSelectedIndex)
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

function _getDiscriminationFlags(target: HTMLElement) {
	const isInMenuItem = !!target.closest(DOM.SELECTOR_MENU_ITEM)
	const isInTabContextMenu = !!target.closest(DOM.SELECTOR_TAB_CONTEXT_MENU)
	const isInTreeContextMenu = !!target.closest(DOM.SELECTOR_TREE_CONTEXT_MENU)
	const isInTreeNode = !!target.closest(DOM.SELECTOR_TREE_NODE)
	const isInSide = !!target.closest(DOM.SELECTOR_SIDE)
	const isInTreeTop = !!target.closest(DOM.SELECTOR_TREE_TOP)
	const isInTreeNodeContainer = !!target.closest(DOM.SELECTOR_TREE_NODE_CONTAINER)
	const isInsideTreeSystem = isInTreeContextMenu || isInSide

	return {
		isInMenuItem,
		isInTabContextMenu,
		isInTreeContextMenu,
		isInTreeNode,
		isInSide,
		isInTreeTop,
		isInTreeNodeContainer,
		isInsideTreeSystem,
	}
}
