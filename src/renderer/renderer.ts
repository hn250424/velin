import './index.scss'

import "@milkdown/theme-nord/style.css"
import { electronAPI } from '../shared/constants/electronAPI'
import { DATASET_ATTR_TAB_ID } from './constants/dom'

import registerFileHandlers from './handlers/fileHandlers'
import registerLoadHandlers from './handlers/loadHandlers'
import registerWindowHandlers from './handlers/windowHandlers'
import registerExitHandlers from './handlers/exitHandlers'

import TabDataManager from './modules/core/TabDataManager'

let contextMenu: HTMLElement
let menuBar: HTMLElement
let menuItems: NodeListOf<HTMLElement>
let titleBar: HTMLElement

window.addEventListener('DOMContentLoaded', () => {
    contextMenu = document.getElementById('tab_context_menu')
    menuBar = document.getElementById('#menu_bar')
    menuItems = document.querySelectorAll('#menu_bar .menu_item')
    titleBar = document.getElementById('title_bar')

    registerWindowHandlers()
    registerFileHandlers()
    registerLoadHandlers()
    registerExitHandlers()

    bindMenuBarEvents()
    bindDocumentClickEvents()
    bindDocumentContextMenuEvents()

    window[electronAPI.channel].loadedRenderer()
})

function bindDocumentContextMenuEvents() {
    document.addEventListener('contextmenu', (e) => {
        menuItems.forEach(i => i.classList.remove('active'))

        const tab = (e.target as HTMLElement).closest('.tab') as HTMLElement
        if (!tab) {
            contextMenu.style.display = 'none'
        } else {
            e.preventDefault()
            contextMenu.style.display = 'flex'
            contextMenu.style.left = `${e.clientX}px`
            contextMenu.style.top = `${e.clientY}px`
        }
    })
}

function bindDocumentClickEvents() {
    document.addEventListener('click', (e) => {
        menuItems.forEach(i => i.classList.remove('active'))
        contextMenu.style.display = 'none'

        const target = e.target as HTMLElement
        const tabDiv = target.closest('.tab') as HTMLElement   
        if (tabDiv) {
            if (target.tagName === 'BUTTON') {
                const id = tabDiv.dataset[DATASET_ATTR_TAB_ID]
                //
            } else if (target.tagName === 'SPAN') {
                const id = tabDiv.dataset[DATASET_ATTR_TAB_ID]
                if (id) {
                    const tabDataManager = TabDataManager.getInstance()
                    tabDataManager.setActivateTabWithId(Number(id))
                }
            }
        }
    })
}

function bindMenuBarEvents() {
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