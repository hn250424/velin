import "@milkdown/theme-nord/style.css"

import { electronAPI } from '@shared/constants/electronAPI'
import Response from "@shared/types/Response"
import { default as TabData, default as TabsData } from "@shared/types/TabData"
import TabDataManager from "../modules/core/TabDataManager"

export default function registerFileHandlers() {
    bindMenuFileCommands()
}

function bindMenuFileCommands() {
    const tabDataManager = TabDataManager.getInstance()

    document.getElementById('file_menu_new_tab').addEventListener('click', async () => {
        const response: Response<number> = await window[electronAPI.channel].newTab()
        if (response.result) await tabDataManager.addTab(response.data)
    })

    document.getElementById('file_menu_open_file').addEventListener('click', async () => {
        const response: Response<TabData> = await window[electronAPI.channel].openFile()
        if (response.result) {
            const data = response.data
            await tabDataManager.addTab(data.id, data.filePath, data.fileName, data.content)
        }
    })

    document.getElementById('file_menu_save').addEventListener('click', async () => {
        const tabData = tabDataManager.getActivatedTabData()
        if (!tabData.isModified) return
        const response: Response<TabData> = await window[electronAPI.channel].save(tabData)
        if (response.result && !response.data.isModified) tabDataManager.applySaveResult(response.data)
    })

    document.getElementById('file_menu_save_as').addEventListener('click', async () => {
        const tabData: TabsData = tabDataManager.getActivatedTabData()
        const response: Response<TabData> = await window[electronAPI.channel].saveAs(tabData)
        if (response.result) {
            const wasApplied = tabDataManager.applySaveResult(response.data)
            if (!wasApplied) await tabDataManager.addTab(response.data.id, response.data.filePath, response.data.fileName, response.data.content, true)
        }
    })

    document.getElementById('file_menu_save_all').addEventListener('click', async () => {
        const tabsData: TabsData[] = tabDataManager.getAllTabData()
        const response: Response<TabData[]> = await window[electronAPI.channel].saveAll(tabsData)
        if (response.result) tabDataManager.applySaveAllResults(response.data)
    })

    document.getElementById('tab_context_close').addEventListener('click', async () => {
        const id = tabDataManager.contextTabId
        const tabData = tabDataManager.getTabDataById(id)
        const response: Response<void> = await window[electronAPI.channel].closeTab(tabData)
        if (response.result) tabDataManager.removeTab(tabData.id)
    })

    document.getElementById('tab_context_close_others').addEventListener('click', async () => {
        const exceptData: TabData = tabDataManager.getTabDataById(tabDataManager.contextTabId)
        const allData: TabData[] = tabDataManager.getAllTabData()
        const response: Response<boolean[]> = await window[electronAPI.channel].closeTabsExcept(exceptData, allData)
        if (response.result) tabDataManager.removeTabsExcept(response.data)
    })

    document.getElementById('tab_context_close_right').addEventListener('click', async () => {
        const referenceData: TabData = tabDataManager.getTabDataById(tabDataManager.contextTabId)
        const allData: TabData[] = tabDataManager.getAllTabData()
        const response: Response<boolean[]> = await window[electronAPI.channel].closeTabsToRight(referenceData, allData)
        if (response.result) tabDataManager.removeTabsToRight(response.data)
    })

    document.getElementById('tab_context_close_all').addEventListener('click', async () => {
        const data: TabData[] = tabDataManager.getAllTabData()
        const response: Response<boolean[]> = await window[electronAPI.channel].closeAllTabs(data)
        if (response.result) tabDataManager.removeAllTabs(response.data)
    })
}