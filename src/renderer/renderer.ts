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
import registerTabHandlers from './handlers/tabHandlers'
import registerTreeHandlers from './handlers/treeHandlers'

import Response from '@shared/types/Response'
import shortcutRegistry from './modules/features/shortcutRegistry'
import TabEditorManager from './modules/features/TabEditorManager'
import TreeLayoutMaanger from './modules/features/TreeLayoutManger'

let tabContextMenu: HTMLElement
let menuContainer: HTMLElement
let tabContainer: HTMLElement
let menuItems: NodeListOf<HTMLElement>
let title: HTMLElement
let treeContentContainer: HTMLElement

window.addEventListener('DOMContentLoaded', () => {
    title = document.getElementById('title')

    tabContainer = document.getElementById('tab_container')
    tabContextMenu = document.getElementById('tab_context_menu')

    menuContainer = document.getElementById('menu_container')
    menuItems = document.querySelectorAll('#menu_container .menu_item')

    treeContentContainer = document.getElementById('tree_content')

    const tabEditorManager = TabEditorManager.getInstance()
    const treeLayoutManager = TreeLayoutMaanger.getInstance()

    registerWindowHandlers()
    registerFileHandlers()
    registerLoadHandlers()
    registerExitHandlers()
    registerEditHandlers()
    registerViewHandlers()
    registerSideHandlers()
    registerTabHandlers(tabContainer, tabEditorManager, tabContextMenu)
    registerTreeHandlers(treeContentContainer, treeLayoutManager)

    bindDocumentClickEvents()
    bindDocumentContextMenuEvents()
    bindMenucontainerEvents()

    document.addEventListener('keydown', (e) => {
        shortcutRegistry.handleKeyEvent(e)
    })

    window[electronAPI.channel].loadedRenderer()
})

function bindDocumentContextMenuEvents() {
    document.addEventListener('contextmenu', (e) => {
        menuItems.forEach(i => i.classList.remove('active'))
    })
}

function bindDocumentClickEvents() {
    document.addEventListener('click', async (e) => {
        menuItems.forEach(i => i.classList.remove('active'))
        tabContextMenu.style.display = 'none'
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

            if (tabContextMenu.style.display === 'flex') {
                tabContextMenu.style.display = 'none'
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
