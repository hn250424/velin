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
import TreeLayoutManager from './modules/features/TreeLayoutManager'

import {
    SELECTOR_TREE_NODE,
    CLASS_TREE_NODE,
    CLASS_FOCUSED,
    CLASS_SELECTED
} from './constants/dom'

let tabContextMenu: HTMLElement
let menuContainer: HTMLElement
let tabContainer: HTMLElement
let menuItems: NodeListOf<HTMLElement>
let title: HTMLElement
let treeContentContainer: HTMLElement
let treeContextMenu: HTMLElement

window.addEventListener('DOMContentLoaded', () => {
    title = document.getElementById('title')

    tabContainer = document.getElementById('tab_container')
    tabContextMenu = document.getElementById('tab_context_menu')
    treeContextMenu = document.getElementById('tree_context_menu')

    menuContainer = document.getElementById('menu_container')
    menuItems = document.querySelectorAll('#menu_container .menu_item')

    treeContentContainer = document.getElementById('tree_content')

    const focusManager = FocusManager.getInstance()
    const tabEditorManager = TabEditorManager.getInstance()
    const treeLayoutManager = TreeLayoutManager.getInstance()

    registerWindowHandlers()
    registerFileHandlers()
    registerLoadHandlers()
    registerExitHandlers()
    registerEditHandlers()
    registerViewHandlers()
    registerSideHandlers()
    registerTabHandlers(tabContainer, tabEditorManager, tabContextMenu)
    registerTreeHandlers(focusManager, treeContentContainer, treeLayoutManager, tabEditorManager, treeContextMenu)
    registerMenuHandlers(menuItems)

    bindDocumentClickEvent(tabContextMenu, treeContextMenu)
    bindDocumentMousedownEvnet(focusManager, tabEditorManager, treeLayoutManager)
    document.addEventListener('keydown', (e) => { shortcutRegistry.handleKeyEvent(e) })

    window[electronAPI.channel].loadedRenderer()
})

function bindDocumentClickEvent(tabContextMenu: HTMLElement, treeContextMenu: HTMLElement) {
    document.addEventListener('click', () => {
        tabContextMenu.style.display = 'none'
        treeContextMenu.style.display = 'none'
    })
}

function bindDocumentMousedownEvnet(focusManager: FocusManager, tabEditorManager: TabEditorManager, treeLayoutManager: TreeLayoutManager) {
    document.addEventListener('mousedown', (e) => {
        const target = e.target as HTMLElement
        const isInTree = !!target.closest('#tree_context_menu')
        const isInTab = !!target.closest('#tab_context_menu')
        const isInMenuItem = !!target.closest('.menu_item')

        if (!isInMenuItem) menuItems.forEach(i => i.classList.remove(CLASS_SELECTED))
        if (!isInTab) tabContextMenu.classList.remove(CLASS_SELECTED)
        if (!isInTree) treeContextMenu.classList.remove(CLASS_SELECTED)
        trackFocus(e.target as HTMLElement, focusManager)

        if (!isInTab) {
            tabEditorManager.removeContextTabId()
        }

        if (!isInTree) {
            const idx = treeLayoutManager.lastSelectedIndex
            if (idx < 0) return

            const viewModel = treeLayoutManager.getTreeViewModelByIndex(idx)
            const treeWrapper = treeLayoutManager.getTreeWrapperByPath(viewModel.path)
            const treeNode = treeWrapper.querySelector(SELECTOR_TREE_NODE)
            treeNode.classList.remove(CLASS_FOCUSED)
            treeLayoutManager.removeLastSelectedIndex()
        }
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
