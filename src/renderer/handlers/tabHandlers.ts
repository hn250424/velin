import "@milkdown/theme-nord/style.css"

import { electronAPI } from '@shared/constants/electronAPI'
import Response from "@shared/types/Response"
import TabData from "@shared/types/TabData"
import TabAndEditorManager from "../modules/features/TabAndEditorManager"
import shortcutRegistry from "../modules/features/shortcutRegistry"
import TreeNode from "@shared/types/TreeNode"
import TreeLayoutMaanger from "../modules/features/TreeLayoutManger"
import { DATASET_ATTR_TAB_ID } from "../constants/dom"

export default function registerTabHandlers(tabContainer: HTMLElement, tabAndEditorManager: TabAndEditorManager, contextMenu: HTMLElement) {
    bindTabClickEvents(tabContainer, tabAndEditorManager)
    bindTabContextmenuEvents(tabContainer, tabAndEditorManager, contextMenu)
    bindTabContextmenuCommands(tabAndEditorManager)

    shortcutRegistry.register('Ctrl+W', async () => await performCloseTab(tabAndEditorManager, tabAndEditorManager.activeTabId))
}

function bindTabClickEvents(tabContainer: HTMLElement, tabAndEditorManager: TabAndEditorManager) {
    tabContainer.addEventListener('click', async (e) => {
        const target = e.target as HTMLElement
        const tabDiv = target.closest('.tab') as HTMLElement
        if (tabDiv) {
            if (target.tagName === 'BUTTON') {
                const id = parseInt(tabDiv.dataset[DATASET_ATTR_TAB_ID], 10)
                const tabData = tabAndEditorManager.getTabDataById(id)
                const response: Response<void> = await window[electronAPI.channel].closeTab(tabData)
                if (response.result) tabAndEditorManager.removeTab(tabData.id)
            } else if (target.tagName === 'SPAN') {
                const id = tabDiv.dataset[DATASET_ATTR_TAB_ID]
                tabAndEditorManager.activateTabById(parseInt(id, 10))
            }
        }
    })
}

function bindTabContextmenuEvents(tabContainer: HTMLElement, tabAndEditorManager: TabAndEditorManager, contextMenu: HTMLElement) {
    tabContainer.addEventListener('contextmenu', (e) => {
        const tab = (e.target as HTMLElement).closest('.tab') as HTMLElement
        if (!tab) {
            contextMenu.style.display = 'none'
            tabAndEditorManager.removeContextTabId()
        } else {
            e.preventDefault()
            contextMenu.style.display = 'flex'
            contextMenu.style.left = `${e.clientX}px`
            contextMenu.style.top = `${e.clientY}px`
            tabAndEditorManager.contextTabId = parseInt(tab.dataset[DATASET_ATTR_TAB_ID], 10)
        }
    })
}

function bindTabContextmenuCommands(tabAndEditorManager: TabAndEditorManager) {
    document.getElementById('tab_context_close').addEventListener('click', async () => {
        await performCloseTab(tabAndEditorManager, tabAndEditorManager.contextTabId)
    })

    document.getElementById('tab_context_close_others').addEventListener('click', async () => {
        const exceptData: TabData = tabAndEditorManager.getTabDataById(tabAndEditorManager.contextTabId)
        const allData: TabData[] = tabAndEditorManager.getAllTabData()
        const response: Response<boolean[]> = await window[electronAPI.channel].closeTabsExcept(exceptData, allData)
        if (response.result) tabAndEditorManager.removeTabsExcept(response.data)
    })

    document.getElementById('tab_context_close_right').addEventListener('click', async () => {
        const referenceData: TabData = tabAndEditorManager.getTabDataById(tabAndEditorManager.contextTabId)
        const allData: TabData[] = tabAndEditorManager.getAllTabData()
        const response: Response<boolean[]> = await window[electronAPI.channel].closeTabsToRight(referenceData, allData)
        if (response.result) tabAndEditorManager.removeTabsToRight(response.data)
    })

    document.getElementById('tab_context_close_all').addEventListener('click', async () => {
        const data: TabData[] = tabAndEditorManager.getAllTabData()
        const response: Response<boolean[]> = await window[electronAPI.channel].closeAllTabs(data)
        if (response.result) tabAndEditorManager.removeAllTabs(response.data)
    })
}

async function performCloseTab(tabAndEditorManager: TabAndEditorManager, id: number) {
    const tabData = tabAndEditorManager.getTabDataById(id)
    const response: Response<void> = await window[electronAPI.channel].closeTab(tabData)
    if (response.result) tabAndEditorManager.removeTab(tabData.id)
}