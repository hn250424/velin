import { DOM, CUSTOM_EVENTS } from "@renderer/constants"
import { FocusManager, ShortcutRegistry } from "@renderer/core"
import type { Dispatcher } from "@renderer/dispatch"
import { MenuElements, TabEditorFacade, TreeFacade } from "@renderer/modules"
import { EventEmitter } from "events"

const state = {
	down: false,
	ticking: false,
}

export function handleGlobalInput(
	dispatcher: Dispatcher,
	emitter: EventEmitter,
	focusManager: FocusManager,
	menuElements: MenuElements,
	tabEditorFacade: TabEditorFacade,
	treeFacade: TreeFacade,
	shortcutRegistry: ShortcutRegistry
) {
	bindDocumentClickEvent(emitter, tabEditorFacade, treeFacade)
	bindDocumentMousedownEvnet(focusManager, emitter, menuElements, tabEditorFacade, treeFacade)

	bindDocumentMousedownEvnetForDrag(emitter)
	bindDocumentMousemoveEvnetForDrag(emitter)
	bindDocumentMouseupEvnetForDrag(emitter)
	bindDocumentMouseleaveEvnetForDrag(emitter)

	bindDocumentKeydownEvent(shortcutRegistry)
	bindShortcutEvent(dispatcher, shortcutRegistry)
}

function bindDocumentClickEvent(emitter: EventEmitter, tabEditorFacade: TabEditorFacade, treeFacade: TreeFacade) {
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
			emitter.emit(CUSTOM_EVENTS.CLICK.IN.TREE_NODE_CONTAINER, e)
		}
	})
}

function bindDocumentMousedownEvnet(
	focusManager: FocusManager,
	emitter: EventEmitter,
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

//

function bindDocumentMousedownEvnetForDrag(emitter: EventEmitter) {
	document.addEventListener("mousedown", (e) => {
		if (e.button !== 0) return
		state.down = true
		emitter.emit(CUSTOM_EVENTS.DRAG.MOUSE_DOWN, e)
	})
}

function bindDocumentMousemoveEvnetForDrag(emitter: EventEmitter) {
	document.addEventListener("mousemove", (e) => {
		if (!state.ticking) {
			state.ticking = true
			window.requestAnimationFrame(() => {
				emitter.emit(CUSTOM_EVENTS.DRAG.MOUSE_MOVE, e)
				state.ticking = false
			})
		}
	})
}

function bindDocumentMouseupEvnetForDrag(emitter: EventEmitter) {
	document.addEventListener("mouseup", (e) => {
		if (state.down) {
			emitter.emit(CUSTOM_EVENTS.DRAG.MOUSE_UP, e)
			state.down = false
		}
	})
}

function bindDocumentMouseleaveEvnetForDrag(emitter: EventEmitter) {
	document.addEventListener("mouseleave", (e) => {
		if (state.down) state.down = false
		emitter.emit(CUSTOM_EVENTS.DRAG.MOUSE_LEAVE, e)
	})
}

//

function bindDocumentKeydownEvent(shortcutRegistry: ShortcutRegistry) {
	document.addEventListener("keydown", (e) => {
		shortcutRegistry.handleKeyEvent(e)
	})
}

function bindShortcutEvent(dispatcher: Dispatcher, shortcutRegistry: ShortcutRegistry) {
	shortcutRegistry.register("ESC", async () => await dispatcher.dispatch("esc", "shortcut"))
	shortcutRegistry.register("ENTER", async () => await dispatcher.dispatch("enter", "shortcut"))
}

//

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
