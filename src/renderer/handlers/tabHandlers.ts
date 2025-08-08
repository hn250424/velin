import "@milkdown/theme-nord/style.css"

import { TabEditorDto, TabEditorsDto } from "@shared/dto/TabEditorDto"
import Response from "@shared/types/Response"
import { CLASS_SELECTED, DATASET_ATTR_TAB_ID, DATASET_ATTR_TREE_PATH, SELECTOR_TAB } from "../constants/dom"
import CommandDispatcher from "../CommandDispatcher"
import ShortcutRegistry from "../modules/input/ShortcutRegistry"
import TabEditorManager from "../modules/domains/TabEditorManager"
import TabDragManager from "../modules/drag/TabDragManager"
import { throttle } from "../utils/throttle"

export default function registerTabHandlers(
    commandDispatcher: CommandDispatcher,
    dragManager: TabDragManager,
    tabContainer: HTMLElement,
    tabEditorManager: TabEditorManager,
    tabContextMenu: HTMLElement,
    shortcutRegistry: ShortcutRegistry
) {
    bindTabClickEvents(tabContainer, tabEditorManager)
    bindTabContextmenuEvents(tabContainer, tabEditorManager, tabContextMenu)
    bindCommandsWithContextmenu(commandDispatcher, tabEditorManager)
    bindCommandsWithShortcut(commandDispatcher, shortcutRegistry, tabEditorManager)

    // Drag.
    bindMouseDownEvents(dragManager, tabEditorManager, tabContainer)
    bindMouseMoveEvents(dragManager, tabEditorManager, tabContainer)
    bindMouseUpEvents(dragManager, tabEditorManager)
}

function bindMouseDownEvents(dragManager: TabDragManager, tabEditorManager: TabEditorManager, tabContainer: HTMLElement) {
    tabContainer.addEventListener('mousedown', (e) => {
        const target = e.target as HTMLElement
        const tab = target.closest(SELECTOR_TAB) as HTMLElement
        if (!tab) return
        const id = parseInt(tab.dataset[DATASET_ATTR_TAB_ID], 10)
        const viewModel = tabEditorManager.getTabEditorViewModelById(id)
        dragManager.setDragTargetTabName(viewModel.fileName)
        dragManager.setDragTargetTabId(id)
        dragManager.setTargetElement(tab)
        dragManager.setTabs(Array.from(tabContainer.children) as HTMLElement[])
        dragManager.setMouseDown(true)
        dragManager.setStartPosition(e.clientX, e.clientY)
    })
}

function bindMouseMoveEvents(dragManager: TabDragManager, tabEditorManager: TabEditorManager, tabContainer: HTMLElement) {
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

        const div = tabEditorManager.createGhostBox(dragManager.getDragTargetTabName())
        div.style.left = `${e.clientX + 5}px`
        div.style.top = `${e.clientY + 5}px`
    })

    document.addEventListener('mousemove', throttle((e: MouseEvent) => {
        if (!dragManager.isDrag()) return

        const insertIndex = getInsertIndexFromMouseX(dragManager.getTabs(), e.clientX)
        if (dragManager.getInsertIndex() === insertIndex) return
        dragManager.setInsertIndex(insertIndex)
        const indicator = tabEditorManager.createIndicator()
        const refNode = tabEditorManager.getTabEditorViewByIndex(insertIndex)?.tabDiv ?? null
        tabContainer.insertBefore(indicator, refNode)
    }, 1000))
}

function bindMouseUpEvents(dragManager: TabDragManager, tabEditorManager: TabEditorManager) {
    document.addEventListener('mouseup', async (e: MouseEvent) => {
        if (!dragManager.isDrag()) {
            dragManager.setMouseDown(false)
            return
        }

        const to = dragManager.getInsertIndex()
        const id = dragManager.getDragTargetTabId()
        const from = tabEditorManager.getTabEditorViewIndexById(id)
        tabEditorManager.moveTabEditorView(from, to)

        dragManager.endDrag()
        tabEditorManager.removeIndicator()
        tabEditorManager.removeGhostBox()

        const dtos = tabEditorManager.getAllTabEditorData()
        const response = await window.rendererToMain.syncTabSessionFromRenderer(dtos)

        if (!response) tabEditorManager.moveTabEditorView(to, from)
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

function bindTabClickEvents(tabContainer: HTMLElement, tabEditorManager: TabEditorManager) {
    tabContainer.addEventListener('click', async (e) => {
        const target = e.target as HTMLElement
        const tabDiv = target.closest(SELECTOR_TAB) as HTMLElement
        if (tabDiv) {
            if (target.tagName === 'BUTTON') {
                const id = parseInt(tabDiv.dataset[DATASET_ATTR_TAB_ID], 10)
                const data = tabEditorManager.getTabEditorDataById(id)
                const response: Response<void> = await window.rendererToMain.closeTab(data)
                if (response.result) tabEditorManager.removeTab(data.id)
            } else if (target.tagName === 'SPAN') {
                const id = tabDiv.dataset[DATASET_ATTR_TAB_ID]
                tabEditorManager.activateTabEditorById(parseInt(id, 10))
            }
        }
    })
}

function bindTabContextmenuEvents(
    tabContainer: HTMLElement,
    tabEditorManager: TabEditorManager,
    tabContextMenu: HTMLElement,
) {
    tabContainer.addEventListener('contextmenu', (e) => {
        const tab = (e.target as HTMLElement).closest(SELECTOR_TAB) as HTMLElement
        if (!tab) return

        tabContextMenu.classList.add(CLASS_SELECTED)
        tabContextMenu.style.left = `${e.clientX}px`
        tabContextMenu.style.top = `${e.clientY}px`
        tabEditorManager.contextTabId = parseInt(tab.dataset[DATASET_ATTR_TAB_ID], 10)
    })
}

function bindCommandsWithContextmenu(commandDispatcher: CommandDispatcher, tabEditorManager: TabEditorManager) {
    document.getElementById('tab_context_close').addEventListener('click', async () => {
        await commandDispatcher.performCloseTab('context_menu', tabEditorManager.contextTabId)
    })

    document.getElementById('tab_context_close_others').addEventListener('click', async () => {
        const exceptData: TabEditorDto = tabEditorManager.getTabEditorDataById(tabEditorManager.contextTabId)
        const allData: TabEditorsDto = tabEditorManager.getAllTabEditorData()
        const response: Response<boolean[]> = await window.rendererToMain.closeTabsExcept(exceptData, allData)
        if (response.result) tabEditorManager.removeTabsExcept(response.data)
    })

    document.getElementById('tab_context_close_right').addEventListener('click', async () => {
        const referenceData: TabEditorDto = tabEditorManager.getTabEditorDataById(tabEditorManager.contextTabId)
        const allData: TabEditorsDto = tabEditorManager.getAllTabEditorData()
        const response: Response<boolean[]> = await window.rendererToMain.closeTabsToRight(referenceData, allData)
        if (response.result) tabEditorManager.removeTabsToRight(response.data)
    })

    document.getElementById('tab_context_close_all').addEventListener('click', async () => {
        const data: TabEditorsDto = tabEditorManager.getAllTabEditorData()
        const response: Response<boolean[]> = await window.rendererToMain.closeAllTabs(data)
        if (response.result) tabEditorManager.removeAllTabs(response.data)
    })
}

function bindCommandsWithShortcut(commandDispatcher: CommandDispatcher, shortcutRegistry: ShortcutRegistry, tabEditorManager: TabEditorManager) {
    shortcutRegistry.register('Ctrl+W',
        async (e: KeyboardEvent) => await commandDispatcher.performCloseTab('shortcut', tabEditorManager.activeTabId)
    )
}