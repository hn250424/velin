import "@milkdown/theme-nord/style.css"

import type Response from "@shared/types/Response"
import type { TabEditorDto, TabEditorsDto } from "@shared/dto/TabEditorDto"

import { CLASS_SELECTED, DATASET_ATTR_TAB_ID, SELECTOR_TAB } from "../constants/dom"
import { ShortcutRegistry } from "../core"
import { TabEditorFacade } from "../modules"
import { throttle } from "../utils/throttle"
import { Dispatcher } from "@renderer/dispatch"

export function handleTabEditor(
	dispatcher: Dispatcher,
	tabEditorFacade: TabEditorFacade,
	shortcutRegistry: ShortcutRegistry
) {
	bindTabClickEvents(dispatcher, tabEditorFacade)

	bindTabContextmenuToggleEvent(tabEditorFacade)
	bindTabContextmenuClickEvents(dispatcher, tabEditorFacade)

	bindFindReplaceEvnets(dispatcher, tabEditorFacade)

	bindShortcutEvents(dispatcher, shortcutRegistry, tabEditorFacade)

	bindMouseDownEventsForDrag(tabEditorFacade)
	bindMouseMoveEventsForDrag(tabEditorFacade)
	bindMouseUpEventsForDrag(tabEditorFacade)
	bindMouseLeaveEventsForDrag(tabEditorFacade)
}

//

function bindTabClickEvents(dispatcher: Dispatcher, tabEditorFacade: TabEditorFacade) {
	const { tabContainer } = tabEditorFacade.renderer.elements

	tabContainer.addEventListener("click", async (e: MouseEvent) => {
		const target = e.target as HTMLElement
		const tabBox = target.closest(SELECTOR_TAB) as HTMLElement
		if (!tabBox) return

		if (target.tagName === "BUTTON") {
			const id = parseInt(tabBox.dataset[DATASET_ATTR_TAB_ID]!)
			await dispatcher.dispatch("closeTab", "button", id)
		} else if (target.tagName === "SPAN") {
			const id = tabBox.dataset[DATASET_ATTR_TAB_ID]!
			tabEditorFacade.activateTabEditorById(parseInt(id))
		}
	})
}

//

function bindTabContextmenuToggleEvent(tabEditorFacade: TabEditorFacade) {
	const { tabContainer, tabContextMenu } = tabEditorFacade.renderer.elements

	tabContainer.addEventListener("contextmenu", (e: MouseEvent) => {
		const tab = (e.target as HTMLElement).closest(SELECTOR_TAB) as HTMLElement
		if (!tab) return

		tabContextMenu.classList.add(CLASS_SELECTED)
		tabContextMenu.style.left = `${e.clientX}px`
		tabContextMenu.style.top = `${e.clientY}px`
		tabEditorFacade.contextTabId = parseInt(tab.dataset[DATASET_ATTR_TAB_ID]!)
	})
}

function bindTabContextmenuClickEvents(dispatcher: Dispatcher, tabEditorFacade: TabEditorFacade) {
	const { tabContextClose, tabContextCloseOthers, tabContextCloseRight, tabContextCloseAll } =
		tabEditorFacade.renderer.elements

	tabContextClose.addEventListener("click", async () => {
		await dispatcher.dispatch("closeTab", "context-menu", tabEditorFacade.contextTabId)
	})

	tabContextCloseOthers.addEventListener("click", async () => {
		await dispatcher.dispatch("closeOtherTabs", "context-menu")
	})

	tabContextCloseRight.addEventListener("click", async () => {
		await dispatcher.dispatch("closeTabsToRight", "context-menu")
	})

	tabContextCloseAll.addEventListener("click", async () => {
		await dispatcher.dispatch("closeAllTabs", "context-menu")
	})
}

//

function bindFindReplaceEvnets(dispatcher: Dispatcher, tabEditorFacade: TabEditorFacade) {
	const { findUp, findDown, replaceCurrent, replaceAll, closeFindReplace } = tabEditorFacade.renderer.elements

	findUp.addEventListener("click", async () => {
		await dispatcher.dispatch("find", "menu", "up")
	})

	findDown.addEventListener("click", async () => {
		await dispatcher.dispatch("find", "menu", "down")
	})

	replaceCurrent.addEventListener("click", async () => {
		await dispatcher.dispatch("replace", "menu")
	})

	replaceAll.addEventListener("click", async () => {
		await dispatcher.dispatch("replaceAll", "menu")
	})

	closeFindReplace.addEventListener("click", async () => {
		await dispatcher.dispatch("closeFindReplace", "menu")
	})
}

//

function bindShortcutEvents(
	dispatcher: Dispatcher,
	shortcutRegistry: ShortcutRegistry,
	tabEditorFacade: TabEditorFacade
) {
	shortcutRegistry.register(
		"Ctrl+W",
		async () => await dispatcher.dispatch("closeTab", "shortcut", tabEditorFacade.activeTabId)
	)
	shortcutRegistry.register("Ctrl+Alt+ENTER", async () => await dispatcher.dispatch("replaceAll", "shortcut"))
}

//

function bindMouseDownEventsForDrag(tabEditorFacade: TabEditorFacade) {
	const { tabContainer } = tabEditorFacade.renderer.elements

	tabContainer.addEventListener("mousedown", (e: MouseEvent) => {
		const target = e.target as HTMLElement
		const tab = target.closest(SELECTOR_TAB) as HTMLElement
		if (!tab) return
		tabEditorFacade.initDrag(tab, e.clientX, e.clientY)
	})
}

function bindMouseMoveEventsForDrag(tabEditorFacade: TabEditorFacade) {
	const updateInsertion = throttle((clientX: number) => {
		if (!tabEditorFacade.isDrag()) return

		const newIndex = tabEditorFacade.getInsertIndexFromMouseX(clientX)

		if (tabEditorFacade.getInsertIndex() !== newIndex) {
      tabEditorFacade.setInsertIndex(newIndex)
      tabEditorFacade.updateDragIndicator(newIndex)
    }
	}, 100)

	document.addEventListener("mousemove", (e: MouseEvent) => {
		if (!tabEditorFacade.isMouseDown()) return

		if (!tabEditorFacade.isDrag()) {
			const { x, y } = tabEditorFacade.getStartPosition()
			if (Math.abs(e.clientX - x) > 5 || Math.abs(e.clientY - y) > 5) {
				tabEditorFacade.startDrag()
			} else {
				return
			}
		}

		tabEditorFacade.moveGhostBox(e.clientX, e.clientY);
		updateInsertion(e.clientX);
	})
}

function bindMouseUpEventsForDrag(tabEditorFacade: TabEditorFacade) {
	document.addEventListener("mouseup", async (e: MouseEvent) => {
		if (!tabEditorFacade.isDrag()) {
			tabEditorFacade.setMouseDown(false)
			return
		}

		const from = tabEditorFacade.getTabEditorViewIndexById(tabEditorFacade.getTargetTabId())
		const to = tabEditorFacade.getInsertIndex()
		tabEditorFacade.moveTabEditorViewAndUpdateActiveIndex(from, to)

		tabEditorFacade.clearDrag()

		const dtos = tabEditorFacade.getAllTabEditorData()
		const response = await window.rendererToMain.syncTabSessionFromRenderer(dtos)

		if (!response) tabEditorFacade.moveTabEditorViewAndUpdateActiveIndex(to, from)
	})
}

function bindMouseLeaveEventsForDrag(tabEditorFacade: TabEditorFacade) {
  document.addEventListener("mouseleave", () => {
    if (tabEditorFacade.isDrag()) {
      tabEditorFacade.clearDrag()
    }
  })
}
