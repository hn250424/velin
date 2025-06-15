import { Editor, rootCtx, editorViewCtx, parserCtx, serializerCtx } from "@milkdown/kit/core"
import { history } from "@milkdown/kit/plugin/history"
import { commonmark } from "@milkdown/kit/preset/commonmark"
import { nord } from "@milkdown/theme-nord"
import "@milkdown/theme-nord/style.css"

import { electronAPI } from '../../shared/constants/electronAPI'
import TabManager from "../modules/core/TabManager"
import TabsData from "../../shared/interface/TabsData"
import SaveAllResponse from "../../shared/interface/SaveAllResponse"
import TabSession from "../../shared/interface/TabSession"
import OpenResponse from "../../shared/interface/OpenResponse"

const log = console.log

export default function registerMenuHandlers() {
    bindMenuEvents()
    bindMenuItemCommands()

    window[electronAPI.channel].tabSession((tabs: TabSession[]) => {
        const tabManager = TabManager.getInstance()
        if (tabs.length > 0) {
            for (const tab of tabs) {
                tabManager.addTab(tab.filePath, tab.fileName, tab.content)
            }
        } else {
            tabManager.addTab()
        }
    })
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

    document.getElementById('new').addEventListener('click', async () => {
        tabManager.addTab()
    })

    document.getElementById('open').addEventListener('click', async () => {
        const response: OpenResponse = await window[electronAPI.channel].open()
        if (response) {      
            await tabManager.addTab(response.filePath, response.fileName, response.content)
        }
    })

    document.getElementById('save_all').addEventListener('click', async () => {
        const tabsData: TabsData[] = tabManager.getTabsData()
        const response: SaveAllResponse[] = await window[electronAPI.channel].saveAll(tabsData)
        tabManager.applySaveAllResults(response)
    })
}