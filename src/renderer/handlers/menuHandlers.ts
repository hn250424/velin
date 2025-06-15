import { Editor, rootCtx, editorViewCtx, parserCtx, serializerCtx } from "@milkdown/kit/core"
import { history } from "@milkdown/kit/plugin/history"
import { commonmark } from "@milkdown/kit/preset/commonmark"
import { nord } from "@milkdown/theme-nord"
import "@milkdown/theme-nord/style.css"

import { electronAPI } from '../../shared/constants/electronAPI'
import TabManager from "../modules/core/TabManager"

const log = console.log

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
    document.getElementById('open').addEventListener('click', async () => {
        const response = await window[electronAPI.channel].open()
        if (response) {
            const tabManager = TabManager.getInstance()
            await tabManager.addTab(response.filePath, response.fileName, response.content)
        }
    })

    document.getElementById('save').addEventListener('click', async () => {
        const tabManager = TabManager.getInstance()
        const tabsData: { filePath: string; content: string }[] = tabManager.getTabsData()

        const response = await window[electronAPI.channel].save(tabsData)
        if (response) {

        }
    })
}