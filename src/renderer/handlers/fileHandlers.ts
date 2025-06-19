import "@milkdown/theme-nord/style.css"

import { electronAPI } from '../../shared/constants/electronAPI'
import Response from "../../shared/interface/Response"
import { default as TabData, default as TabsData } from "../../shared/interface/TabData"
import TabDataManager from "../modules/core/TabDataManager"

export default function registerFileHandlers() {
    bindMenuFileCommands()
}

function bindMenuFileCommands() {
    const tabDataManager = TabDataManager.getInstance()

    document.getElementById('new_tab').addEventListener('click', async () => {
        const response: Response<number> = await window[electronAPI.channel].newTab()
        if (response.result) tabDataManager.addTab(response.data)
    })

    document.getElementById('open').addEventListener('click', async () => {
        const response: Response<TabData> = await window[electronAPI.channel].open()
        if (response.result) {
            const data = response.data
            tabDataManager.addTab(data.id, data.filePath, data.fileName, data.content)
        }
    })

    document.getElementById('save').addEventListener('click', async () => {
        const tabData = tabDataManager.getActivatedTab()
        if (!tabData.isModified) return
        const response: Response<TabData> = await window[electronAPI.channel].save(tabData)
        if (response.result) tabDataManager.applySaveResult(response.data)
    })

    document.getElementById('save_as').addEventListener('click', async () => {
        const tabData: TabsData = tabDataManager.getActivatedTab()
        const response: Response<TabData> = await window[electronAPI.channel].saveAs(tabData)
        if (response.result) {
            const newData = response.data
            tabDataManager.addTab(newData.id, newData.filePath, newData.fileName, newData.content, true)
        }
    })

    document.getElementById('save_all').addEventListener('click', async () => {
        const tabsData: TabsData[] = tabDataManager.getTabData()
        const response: Response<TabData[]> = await window[electronAPI.channel].saveAll(tabsData)
        if (response.result) tabDataManager.applySaveAllResults(response.data)
    })

    document.getElementById('close_tab').addEventListener('click', async () => {
        const tabsData: TabsData = tabDataManager.getActivatedTab()
        const response: Response<void> = await window[electronAPI.channel].closeTab(tabsData)
        if (response.result) tabDataManager.deleteTab(tabsData.id)
    })
}