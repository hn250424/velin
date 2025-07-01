import './index.scss'

import "@milkdown/theme-nord/style.css"
import { electronAPI } from '../shared/constants/electronAPI'

import registerEditHandlers from './handlers/editHandlers'
import registerExitHandlers from './handlers/exitHandlers'
import registerFileHandlers from './handlers/fileHandlers'
import registerLoadHandlers from './handlers/loadHandlers'
import registerSideHandlers from './handlers/sideHandlers'
import registerTabHandlers from './handlers/tabHandlers'
import registerTreeHandlers from './handlers/treeHandlers'
import registerViewHandlers from './handlers/viewHandlers'
import registerWindowHandlers from './handlers/windowHandlers'
import registerMenuHandlers from './handlers/menuHandlers'

import FocusManager from './modules/core/FocusManager'
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

    const focusManager = FocusManager.getInstance()
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
    registerMenuHandlers(menuItems, tabContextMenu)

    bindDocumentClickEvents(focusManager)
    bindDocumentContextMenuEvents(focusManager)

    document.addEventListener('keydown', (e) => {
        shortcutRegistry.handleKeyEvent(e)
    })

    window[electronAPI.channel].loadedRenderer()
})

function bindDocumentContextMenuEvents(focusManager: FocusManager) {
    document.addEventListener('contextmenu', (e) => {
        menuItems.forEach(i => i.classList.remove('active'))
        trackFocus(e.target as HTMLElement, focusManager)
    })
}

function bindDocumentClickEvents(focusManager: FocusManager) {
    document.addEventListener('click', async (e) => {
        menuItems.forEach(i => i.classList.remove('active'))
        tabContextMenu.style.display = 'none'
        trackFocus(e.target as HTMLElement, focusManager)
    })
}

function trackFocus(target: HTMLElement, focusManager: FocusManager) {
    if (target.closest('#editor_container')) {
        focusManager.setFocus('editor')
    } else if (target.closest('#tab_container')) {
        focusManager.setFocus('tab')
    } else if (target.closest('#tree')) {
        focusManager.setFocus('tree')
    } else {
        focusManager.setFocus('other')
    }
}
