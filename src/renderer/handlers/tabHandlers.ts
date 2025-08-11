import "@milkdown/theme-nord/style.css"

import { TabEditorDto, TabEditorsDto } from "@shared/dto/TabEditorDto"
import Response from "@shared/types/Response"
import { CLASS_SELECTED, DATASET_ATTR_TAB_ID, DATASET_ATTR_TREE_PATH, SELECTOR_TAB } from "../constants/dom"
import CommandDispatcher from "../CommandDispatcher"
import ShortcutRegistry from "../modules/input/ShortcutRegistry"
import TabEditorFacade from "../modules/tab_editor/TabEditorFacade"
import TabDragManager from "../modules/drag/TabDragManager"
import { throttle } from "../utils/throttle"

export default function registerTabHandlers(
    commandDispatcher: CommandDispatcher,
    dragManager: TabDragManager,
    tabContainer: HTMLElement,
    tabEditorFacade: TabEditorFacade,
    tabContextMenu: HTMLElement,
    shortcutRegistry: ShortcutRegistry
) {
    bindTabClickEvents(tabContainer, tabEditorFacade)
    bindTabContextmenuEvents(tabContainer, tabEditorFacade, tabContextMenu)
    bindCommandsWithContextmenu(commandDispatcher, tabEditorFacade)
    bindCommandsWithShortcut(commandDispatcher, shortcutRegistry, tabEditorFacade)

    // Drag.
    bindMouseDownEvents(dragManager, tabEditorFacade, tabContainer)
    bindMouseMoveEvents(dragManager, tabEditorFacade, tabContainer)
    bindMouseUpEvents(dragManager, tabEditorFacade)
}

function bindMouseDownEvents(dragManager: TabDragManager, tabEditorFacade: TabEditorFacade, tabContainer: HTMLElement) {
    tabContainer.addEventListener('mousedown', (e) => {
        const target = e.target as HTMLElement
        const tab = target.closest(SELECTOR_TAB) as HTMLElement
        if (!tab) return
        const id = parseInt(tab.dataset[DATASET_ATTR_TAB_ID], 10)
        const viewModel = tabEditorFacade.getTabEditorViewModelById(id)
        dragManager.setDragTargetTabName(viewModel.fileName)
        dragManager.setDragTargetTabId(id)
        dragManager.setTargetElement(tab)
        dragManager.setTabs(Array.from(tabContainer.children) as HTMLElement[])
        dragManager.setMouseDown(true)
        dragManager.setStartPosition(e.clientX, e.clientY)
    })
}

function bindMouseMoveEvents(dragManager: TabDragManager, tabEditorFacade: TabEditorFacade, tabContainer: HTMLElement) {
    document.addEventListener('mousemove', (e: MouseEvent) => {
        if (!dragManager.isMouseDown()) return

        if (!dragManager.isDrag()) {
            const dx = Math.abs(e.clientX - dragManager.getStartPosition_x())
            const dy = Math.abs(e.clientY - dragManager.getStartPosition_y())
            if (dx > 5 || dy > 5) {
                dragManager.startDrag()
            } else {
                return
            }
        }

        const div = tabEditorFacade.createGhostBox(dragManager.getDragTargetTabName())
        div.style.left = `${e.clientX + 5}px`
        div.style.top = `${e.clientY + 5}px`
    })

    document.addEventListener('mousemove', throttle((e: MouseEvent) => {
        if (!dragManager.isDrag()) return

        const insertIndex = getInsertIndexFromMouseX(dragManager.getTabs(), e.clientX)
        if (dragManager.getInsertIndex() === insertIndex) return
        dragManager.setInsertIndex(insertIndex)
        const indicator = tabEditorFacade.createIndicator()
        const tab = tabEditorFacade.getTabEditorViewByIndex(insertIndex)
        if (tab) {
            const tabRect = tab.tabDiv.getBoundingClientRect()
            indicator.style.left = `${tabRect.left - tabContainer.getBoundingClientRect().left + tabContainer.scrollLeft}px`
        } else {
            const lastTab = tabEditorFacade.getTabEditorViewByIndex(insertIndex - 1)
            if (lastTab) {
                const lastRect = lastTab.tabDiv.getBoundingClientRect()
                indicator.style.left = `${lastRect.right - tabContainer.getBoundingClientRect().left + tabContainer.scrollLeft}px`
            } else {
                indicator.style.left = `0px`
            }
        }

        tabContainer.appendChild(indicator)
    }, 1000))
}

function bindMouseUpEvents(dragManager: TabDragManager, tabEditorFacade: TabEditorFacade) {
    document.addEventListener('mouseup', async (e: MouseEvent) => {
        if (!dragManager.isDrag()) {
            dragManager.setMouseDown(false)
            return
        }

        const to = dragManager.getInsertIndex()
        const id = dragManager.getDragTargetTabId()
        const from = tabEditorFacade.getTabEditorViewIndexById(id)
        tabEditorFacade.moveTabEditorViewAndUpdateActiveIndex(from, to)

        dragManager.endDrag()
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

function bindTabClickEvents(tabContainer: HTMLElement, tabEditorFacade: TabEditorFacade) {
    tabContainer.addEventListener('click', async (e) => {
        const target = e.target as HTMLElement
        const tabDiv = target.closest(SELECTOR_TAB) as HTMLElement
        if (tabDiv) {
            if (target.tagName === 'BUTTON') {
                const id = parseInt(tabDiv.dataset[DATASET_ATTR_TAB_ID], 10)
                const data = tabEditorFacade.getTabEditorDataById(id)
                const response: Response<void> = await window.rendererToMain.closeTab(data)
                if (response.result) tabEditorFacade.removeTab(data.id)
            } else if (target.tagName === 'SPAN') {
                const id = tabDiv.dataset[DATASET_ATTR_TAB_ID]
                tabEditorFacade.activateTabEditorById(parseInt(id, 10))
            }
        }
    })
}

function bindTabContextmenuEvents(
    tabContainer: HTMLElement,
    tabEditorFacade: TabEditorFacade,
    tabContextMenu: HTMLElement,
) {
    tabContainer.addEventListener('contextmenu', (e) => {
        const tab = (e.target as HTMLElement).closest(SELECTOR_TAB) as HTMLElement
        if (!tab) return

        tabContextMenu.classList.add(CLASS_SELECTED)
        tabContextMenu.style.left = `${e.clientX}px`
        tabContextMenu.style.top = `${e.clientY}px`
        tabEditorFacade.contextTabId = parseInt(tab.dataset[DATASET_ATTR_TAB_ID], 10)
    })
}

function bindCommandsWithContextmenu(commandDispatcher: CommandDispatcher, tabEditorFacade: TabEditorFacade) {
    document.getElementById('tab_context_close').addEventListener('click', async () => {
        await commandDispatcher.performCloseTab('context_menu', tabEditorFacade.contextTabId)
    })

    document.getElementById('tab_context_close_others').addEventListener('click', async () => {
        const exceptData: TabEditorDto = tabEditorFacade.getTabEditorDataById(tabEditorFacade.contextTabId)
        const allData: TabEditorsDto = tabEditorFacade.getAllTabEditorData()
        const response: Response<boolean[]> = await window.rendererToMain.closeTabsExcept(exceptData, allData)
        if (response.result) tabEditorFacade.removeTabsExcept(response.data)
    })

    document.getElementById('tab_context_close_right').addEventListener('click', async () => {
        const referenceData: TabEditorDto = tabEditorFacade.getTabEditorDataById(tabEditorFacade.contextTabId)
        const allData: TabEditorsDto = tabEditorFacade.getAllTabEditorData()
        const response: Response<boolean[]> = await window.rendererToMain.closeTabsToRight(referenceData, allData)
        if (response.result) tabEditorFacade.removeTabsToRight(response.data)
    })

    document.getElementById('tab_context_close_all').addEventListener('click', async () => {
        const data: TabEditorsDto = tabEditorFacade.getAllTabEditorData()
        const response: Response<boolean[]> = await window.rendererToMain.closeAllTabs(data)
        if (response.result) tabEditorFacade.removeAllTabs(response.data)
    })
}

function bindCommandsWithShortcut(commandDispatcher: CommandDispatcher, shortcutRegistry: ShortcutRegistry, tabEditorFacade: TabEditorFacade) {
    shortcutRegistry.register('Ctrl+W',
        async (e: KeyboardEvent) => await commandDispatcher.performCloseTab('shortcut', tabEditorFacade.activeTabId)
    )
}