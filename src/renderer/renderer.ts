import './index.scss'

import "@milkdown/theme-nord/style.css"
import { electronAPI } from '../shared/constants/electronAPI'
import { DATASET_ATTR_TAB_ID, MODIFIED_TEXT, NOT_MODIFIED_TEXT } from './constants/dom'

import registerEditHandlers from './handlers/editHandlers'
import registerExitHandlers from './handlers/exitHandlers'
import registerFileHandlers from './handlers/fileHandlers'
import registerLoadHandlers from './handlers/loadHandlers'
import registerSideHandlers from './handlers/sideHandlers'
import registerViewHandlers from './handlers/viewHandlers'
import registerWindowHandlers from './handlers/windowHandlers'

import Response from '@shared/types/Response'
import shortcutRegistry from './modules/features/shortcutRegistry'
import TabDataManager from './modules/features/TabAndEditorManager'

let contextMenu: HTMLElement
let menuContainer: HTMLElement
let tabContainer: HTMLElement
let menuItems: NodeListOf<HTMLElement>
let title: HTMLElement

window.addEventListener('DOMContentLoaded', () => {
    contextMenu = document.getElementById('tab_context_menu')
    menuContainer = document.getElementById('menu_container')
    tabContainer = document.getElementById('tab_container')
    menuItems = document.querySelectorAll('#menu_container .menu_item')
    title = document.getElementById('title')

    registerWindowHandlers()
    registerFileHandlers()
    registerLoadHandlers()
    registerExitHandlers()
    registerEditHandlers()
    registerViewHandlers()
    registerSideHandlers()

    const tabDataManager = TabDataManager.getInstance()
    bindDocumentClickEvents(tabDataManager)
    bindDocumentContextMenuEvents(tabDataManager)
    bindMenucontainerEvents()

    document.addEventListener('keydown', (e) => {
        shortcutRegistry.handleKeyEvent(e)
    })

    window[electronAPI.channel].loadedRenderer()
})

function bindDocumentContextMenuEvents(tabDataManager: TabDataManager) {
    document.addEventListener('contextmenu', (e) => {
        menuItems.forEach(i => i.classList.remove('active'))

        const tab = (e.target as HTMLElement).closest('.tab') as HTMLElement
        if (!tab) {
            contextMenu.style.display = 'none'
            tabDataManager.removeContextTabId()
        } else {
            e.preventDefault()
            contextMenu.style.display = 'flex'
            contextMenu.style.left = `${e.clientX}px`
            contextMenu.style.top = `${e.clientY}px`
            tabDataManager.contextTabId = parseInt(tab.dataset[DATASET_ATTR_TAB_ID], 10)
        }
    })
}

function bindDocumentClickEvents(tabDataManager: TabDataManager) {
    document.addEventListener('click', async (e) => {
        menuItems.forEach(i => i.classList.remove('active'))
        contextMenu.style.display = 'none'

        const target = e.target as HTMLElement
        const tabDiv = target.closest('.tab') as HTMLElement
        if (tabDiv) {
            if (target.tagName === 'BUTTON') {
                const id = parseInt(tabDiv.dataset[DATASET_ATTR_TAB_ID], 10)
                const tabData = tabDataManager.getTabDataById(id)
                const response: Response<void> = await window[electronAPI.channel].closeTab(tabData)
                if (response.result) tabDataManager.removeTab(tabData.id)
            } else if (target.tagName === 'SPAN') {
                const id = tabDiv.dataset[DATASET_ATTR_TAB_ID]
                tabDataManager.activateTabById(parseInt(id, 10))
            }
        }
    })
}

function bindMenucontainerEvents() {
    menuItems.forEach(item => {
        item.addEventListener('click', e => {
            e.stopPropagation()

            menuItems.forEach(i => {
                if (i !== item) i.classList.remove('active')
            })

            item.classList.toggle('active')

            if (contextMenu.style.display === 'flex') {
                contextMenu.style.display = 'none'
            }
        })

        item.addEventListener('mouseenter', () => {
            const anyActive = Array.from(menuItems).some(i => i.classList.contains('active'))
            if (anyActive) {
                menuItems.forEach(i => i.classList.remove('active'))
                item.classList.add('active')
            }
        })
    })
}
