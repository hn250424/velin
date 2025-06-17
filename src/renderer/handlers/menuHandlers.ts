import "@milkdown/theme-nord/style.css"

import { electronAPI } from '../../shared/constants/electronAPI'
import Response from "../../shared/interface/Response"
import { default as TabData, default as TabsData } from "../../shared/interface/TabData"
import TabManager from "../modules/core/TabManager"

export default function registerMenuHandlers() {
    bindMenuEvents()
    bindMenuItemCommands()
}

function bindMenuEvents() {
    const menuItems = document.querySelectorAll('#menu_bar .menu_item')

    menuItems.forEach(item => {
        item.addEventListener('click', e => {
            e.stopPropagation()

            menuItems.forEach(i => {
                if (i !== item) i.classList.remove('active')
            })

            item.classList.toggle('active')
        })
    })

    document.addEventListener('click', () => {
        menuItems.forEach(i => i.classList.remove('active'))
    })

    document.getElementById('title_bar').addEventListener('mousedown', () => {
        document.querySelectorAll('.menu_item').forEach(item => item.classList.remove('active'))
    })
}

function bindMenuItemCommands() {
    const tabManager = TabManager.getInstance()

    document.getElementById('new_tab').addEventListener('click', async () => {
        const response: Response<number> = await window[electronAPI.channel].newTab()
        if (response.result) tabManager.addTab(response.data)
    })

    document.getElementById('open').addEventListener('click', async () => {
        const response: Response<TabData> = await window[electronAPI.channel].open()
        if (response.result) {
            const data = response.data
            tabManager.addTab(data.id, data.filePath, data.fileName, data.content)
        }
    })

    document.getElementById('save').addEventListener('click', async () => {
        const tabData = tabManager.getActivatedTab()
        if (!tabData.isModified) return
        const response: Response<TabData> = await window[electronAPI.channel].save(tabData)
        if (response.result) tabManager.applySaveResult(response.data)
    })

    document.getElementById('save_as').addEventListener('click', async () => {
        const tabData: TabsData = tabManager.getActivatedTab()
        const response: Response<TabData> = await window[electronAPI.channel].saveAs(tabData)
        if (response.result) {
            const newData = response.data
            tabManager.addTab(newData.id, newData.filePath, newData.fileName, newData.content, true)
        }
    })

    document.getElementById('save_all').addEventListener('click', async () => {
        const tabsData: TabsData[] = tabManager.getTabData()
        const response: Response<TabData[]> = await window[electronAPI.channel].saveAll(tabsData)
        if (response.result) tabManager.applySaveAllResults(response.data)
    })
}