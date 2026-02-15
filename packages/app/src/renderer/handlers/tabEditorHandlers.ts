import "@milkdown/theme-nord/style.css"

import type Response from "@shared/types/Response"
import type { TabEditorDto, TabEditorsDto } from "@shared/dto/TabEditorDto"

import { CLASS_SELECTED, DATASET_ATTR_TAB_ID, SELECTOR_TAB } from "../constants/dom"
import CommandManager from "../CommandManager"
import ShortcutRegistry from "../core/ShortcutRegistry"
import TabEditorFacade from "../modules/tab_editor/TabEditorFacade"
import { throttle } from "../utils/throttle"

export function handleTabEditor(
	commandManager: CommandManager,
	tabEditorFacade: TabEditorFacade,
	shortcutRegistry: ShortcutRegistry
) {
	bindTabClickEvents(commandManager, tabEditorFacade)

	bindTabContextmenuToggleEvent(tabEditorFacade)
	bindTabContextmenuClickEvents(commandManager, tabEditorFacade)

	bindFindReplaceEvnets(commandManager, tabEditorFacade)

	bindShortcutEvents(commandManager, shortcutRegistry, tabEditorFacade)

	bindMouseDownEvents(tabEditorFacade)
	bindMouseMoveEvents(tabEditorFacade)
	bindMouseUpEvents(tabEditorFacade)
}

//

function bindTabClickEvents(commandManager: CommandManager, tabEditorFacade: TabEditorFacade) {
	const { tabContainer } = tabEditorFacade.renderer.elements

	tabContainer.addEventListener("click", async (e) => {
		const target = e.target as HTMLElement
		const tabBox = target.closest(SELECTOR_TAB) as HTMLElement

		if (tabBox) {
			if (target.tagName === "BUTTON") {
				const id = parseInt(tabBox.dataset[DATASET_ATTR_TAB_ID]!)
				await commandManager.performCloseTab("button", id)
			} else if (target.tagName === "SPAN") {
				const id = tabBox.dataset[DATASET_ATTR_TAB_ID]!
				tabEditorFacade.activateTabEditorById(parseInt(id))
			}
		}
	})
}

//

function bindTabContextmenuToggleEvent(tabEditorFacade: TabEditorFacade) {
	const { tabContainer, tabContextMenu } = tabEditorFacade.renderer.elements

	tabContainer.addEventListener("contextmenu", (e) => {
		const tab = (e.target as HTMLElement).closest(SELECTOR_TAB) as HTMLElement
		if (!tab) return

		tabContextMenu.classList.add(CLASS_SELECTED)
		tabContextMenu.style.left = `${e.clientX}px`
		tabContextMenu.style.top = `${e.clientY}px`
		tabEditorFacade.contextTabId = parseInt(tab.dataset[DATASET_ATTR_TAB_ID]!)
	})
}

function bindTabContextmenuClickEvents(commandManager: CommandManager, tabEditorFacade: TabEditorFacade) {
	const { tabContextClose, tabContextCloseOthers, tabContextCloseRight, tabContextCloseAll } =
		tabEditorFacade.renderer.elements

	tabContextClose.addEventListener("click", async () => {
		await commandManager.performCloseTab("context-menu", tabEditorFacade.contextTabId)
	})

	tabContextCloseOthers.addEventListener("click", async () => {
		const exceptData: TabEditorDto = tabEditorFacade.getTabEditorDataById(tabEditorFacade.contextTabId)
		const allData: TabEditorsDto = tabEditorFacade.getAllTabEditorData()
		const response: Response<boolean[]> = await window.rendererToMain.closeTabsExcept(exceptData, allData)
		if (response.result) tabEditorFacade.removeTabsExcept(response.data)
	})

	tabContextCloseRight.addEventListener("click", async () => {
		const referenceData: TabEditorDto = tabEditorFacade.getTabEditorDataById(tabEditorFacade.contextTabId)
		const allData: TabEditorsDto = tabEditorFacade.getAllTabEditorData()
		const response: Response<boolean[]> = await window.rendererToMain.closeTabsToRight(referenceData, allData)
		if (response.result) tabEditorFacade.removeTabsToRight(response.data)
	})

	tabContextCloseAll.addEventListener("click", async () => {
		const data: TabEditorsDto = tabEditorFacade.getAllTabEditorData()
		const response: Response<boolean[]> = await window.rendererToMain.closeAllTabs(data)
		if (response.result) tabEditorFacade.removeAllTabs(response.data)
	})
}

//

function bindFindReplaceEvnets(commandManager: CommandManager, tabEditorFacade: TabEditorFacade) {
	const { findUp, findDown, findClose, replaceCurrent, replaceAll } = tabEditorFacade.renderer.elements

	findUp.addEventListener("click", async () => {
		commandManager.performFind("menu", "up")
	})

	findDown.addEventListener("click", async () => {
		commandManager.performFind("menu", "down")
	})

	findClose.addEventListener("click", async () => {
		commandManager.performCloseFindReplaceBox("menu")
	})

	replaceCurrent.addEventListener("click", async () => {
		commandManager.performReplace("menu")
	})

	replaceAll.addEventListener("click", async () => {
		commandManager.performReplaceAll("menu")
	})
}

//

function bindShortcutEvents(
	commandManager: CommandManager,
	shortcutRegistry: ShortcutRegistry,
	tabEditorFacade: TabEditorFacade
) {
	shortcutRegistry.register(
		"Ctrl+W",
		async () => await commandManager.performCloseTab("shortcut", tabEditorFacade.activeTabId)
	)
}

//

function bindMouseDownEvents(tabEditorFacade: TabEditorFacade) {
	const { tabContainer } = tabEditorFacade.renderer.elements

	tabContainer.addEventListener("mousedown", (e) => {
		const target = e.target as HTMLElement
		const tab = target.closest(SELECTOR_TAB) as HTMLElement
		if (!tab) return
		const id = parseInt(tab.dataset[DATASET_ATTR_TAB_ID]!)
		const viewModel = tabEditorFacade.getTabEditorViewModelById(id)!
		tabEditorFacade.setDragTargetTabName(viewModel.fileName)
		tabEditorFacade.setDragTargetTabId(id)
		tabEditorFacade.setTargetElement(tab)
		tabEditorFacade.setTabs(Array.from(tabContainer.children) as HTMLElement[])
		tabEditorFacade.setMouseDown(true)
		tabEditorFacade.setStartPosition(e.clientX, e.clientY)
	})
}

function bindMouseMoveEvents(tabEditorFacade: TabEditorFacade) {
	const { tabContainer } = tabEditorFacade.renderer.elements

	document.addEventListener("mousemove", (e: MouseEvent) => {
		if (!tabEditorFacade.isMouseDown()) return

		if (!tabEditorFacade.isDrag()) {
			const dx = Math.abs(e.clientX - tabEditorFacade.getStartPosition_x())
			const dy = Math.abs(e.clientY - tabEditorFacade.getStartPosition_y())
			if (dx > 5 || dy > 5) {
				tabEditorFacade.startDrag()
			} else {
				return
			}
		}

		const div = tabEditorFacade.createGhostBox(tabEditorFacade.getDragTargetTabName())
		div.style.left = `${e.clientX + 5}px`
		div.style.top = `${e.clientY + 5}px`
	})

	document.addEventListener(
		"mousemove",
		throttle((e: MouseEvent) => {
			if (!tabEditorFacade.isDrag()) return

			const insertIndex = getInsertIndexFromMouseX(tabEditorFacade.getTabs()!, e.clientX)
			if (tabEditorFacade.getInsertIndex() === insertIndex) return
			tabEditorFacade.setInsertIndex(insertIndex)

			const indicator = tabEditorFacade.createIndicator()
			const tab = tabEditorFacade.getTabEditorViewByIndex(insertIndex)

			if (tab) {
				const tabRect = tab.tabBox.getBoundingClientRect()
				indicator.style.left = `${tabRect.left - tabContainer.getBoundingClientRect().left + tabContainer.scrollLeft}px`
			} else {
				const lastTab = tabEditorFacade.getTabEditorViewByIndex(insertIndex - 1)

				if (lastTab) {
					const lastRect = lastTab.tabBox.getBoundingClientRect()
					indicator.style.left = `${
						lastRect.right - tabContainer.getBoundingClientRect().left + tabContainer.scrollLeft
					}px`
				} else {
					indicator.style.left = `0px`
				}
			}

			tabContainer.appendChild(indicator)
		}, 1000)
	)
}

function bindMouseUpEvents(tabEditorFacade: TabEditorFacade) {
	document.addEventListener("mouseup", async (e: MouseEvent) => {
		if (!tabEditorFacade.isDrag()) {
			tabEditorFacade.setMouseDown(false)
			return
		}

		const to = tabEditorFacade.getInsertIndex()
		const id = tabEditorFacade.getDragTargetTabId()
		const from = tabEditorFacade.getTabEditorViewIndexById(id)
		tabEditorFacade.moveTabEditorViewAndUpdateActiveIndex(from, to)

		tabEditorFacade.endDrag()
		tabEditorFacade.removeIndicator()
		tabEditorFacade.removeGhostBox()

		const dtos = tabEditorFacade.getAllTabEditorData()
		const response = await window.rendererToMain.syncTabSessionFromRenderer(dtos)

		if (!response) tabEditorFacade.moveTabEditorViewAndUpdateActiveIndex(to, from)
	})
}

function getInsertIndexFromMouseX(tabs: HTMLElement[], mouseX: number): number {
	for (let i = 0; i < tabs.length; i++) {
		const rect = tabs[i].getBoundingClientRect()
		const middleX = rect.left + rect.width / 2

		if (mouseX < middleX) {
			return i
		}
	}

	return tabs.length
}
