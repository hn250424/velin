import "@milkdown/theme-nord/style.css"

import { electronAPI } from '@shared/constants/electronAPI'
import { TabEditorDto, TabEditorsDto } from "@shared/dto/TabEditorDto"
import Response from "@shared/types/Response"
import { DATASET_ATTR_TAB_ID, SELECTOR_TAB } from "../constants/dom"
import shortcutRegistry from "../modules/features/shortcutRegistry"
import TabEditorManager from "../modules/features/TabEditorManager"

export default function registerTabHandlers(
    tabContainer: HTMLElement, 
    tabEditorManager: TabEditorManager, 
    tabContextMenu: HTMLElement,
) {
    bindTabClickEvents(tabContainer, tabEditorManager)
    bindTabContextmenuEvents(tabContainer, tabEditorManager, tabContextMenu)
    bindTabContextmenuCommands(tabEditorManager)

    shortcutRegistry.register('Ctrl+W', async (e: KeyboardEvent) => await performCloseTab(tabEditorManager, tabEditorManager.activeTabId))
}

function bindTabClickEvents(tabContainer: HTMLElement, tabEditorManager: TabEditorManager) {
    tabContainer.addEventListener('click', async (e) => {
        const target = e.target as HTMLElement
        const tabDiv = target.closest(SELECTOR_TAB) as HTMLElement
        if (tabDiv) {
            if (target.tagName === 'BUTTON') {
                const id = parseInt(tabDiv.dataset[DATASET_ATTR_TAB_ID], 10)
                const data = tabEditorManager.getTabEditorDataById(id)
                const response: Response<void> = await window[electronAPI.channel].closeTab(data)
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
        
        tabContextMenu.style.display = 'flex'
        tabContextMenu.style.left = `${e.clientX}px`
        tabContextMenu.style.top = `${e.clientY}px`
        tabEditorManager.contextTabId = parseInt(tab.dataset[DATASET_ATTR_TAB_ID], 10)
    })
}

function bindTabContextmenuCommands(tabEditorManager: TabEditorManager) {
    document.getElementById('tab_context_close').addEventListener('click', async () => {
        await performCloseTab(tabEditorManager, tabEditorManager.contextTabId)
    })

    document.getElementById('tab_context_close_others').addEventListener('click', async () => {
        const exceptData: TabEditorDto = tabEditorManager.getTabEditorDataById(tabEditorManager.contextTabId)
        const allData: TabEditorsDto = tabEditorManager.getAllTabEditorData()
        const response: Response<boolean[]> = await window[electronAPI.channel].closeTabsExcept(exceptData, allData)
        if (response.result) tabEditorManager.removeTabsExcept(response.data)
    })

    document.getElementById('tab_context_close_right').addEventListener('click', async () => {
        const referenceData: TabEditorDto = tabEditorManager.getTabEditorDataById(tabEditorManager.contextTabId)
        const allData: TabEditorsDto = tabEditorManager.getAllTabEditorData()
        const response: Response<boolean[]> = await window[electronAPI.channel].closeTabsToRight(referenceData, allData)
        if (response.result) tabEditorManager.removeTabsToRight(response.data)
    })

    document.getElementById('tab_context_close_all').addEventListener('click', async () => {
        const data: TabEditorsDto = tabEditorManager.getAllTabEditorData()
        const response: Response<boolean[]> = await window[electronAPI.channel].closeAllTabs(data)
        if (response.result) tabEditorManager.removeAllTabs(response.data)
    })
}

async function performCloseTab(tabEditorManager: TabEditorManager, id: number) {
    const data = tabEditorManager.getTabEditorDataById(id)
    if (!data) return
    
    const response: Response<void> = await window[electronAPI.channel].closeTab(data)
    if (response.result) tabEditorManager.removeTab(data.id)
}