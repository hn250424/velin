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
import FocusManager from './modules/state/FocusManager'
import ShortcutRegistry from './modules/input/ShortcutRegistry'
import TabEditorManager from './modules/manager/TabEditorManager'
import TreeLayoutManager from './modules/manager/TreeLayoutManager'
import diContainer from './diContainer'
import DI_KEYS from './constants/di_keys'
import CommandDispatcher from './modules/command/CommandDispatcher'
import {
    SELECTOR_TREE_NODE,
    CLASS_TREE_NODE,
    CLASS_FOCUSED,
    CLASS_SELECTED
} from './constants/dom'
import WindowLayoutManager from './modules/layout/WindowLayoutManager'
import ZoomManager from './modules/layout/ZoomManager'

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

    const windowLayoutManager = WindowLayoutManager.getInstance()
    const zoomManager = ZoomManager.getInstance()
    const focusManager = diContainer.get<FocusManager>(DI_KEYS.FocusManager)
    const tabEditorManager = diContainer.get<TabEditorManager>(DI_KEYS.TabEditorManager)
    const treeLayoutManager = diContainer.get<TreeLayoutManager>(DI_KEYS.TreeLayoutManager)
    const commandDispatcher = diContainer.get<CommandDispatcher>(DI_KEYS.CommandDispatcher)
    const shortcutRegistry = diContainer.get<ShortcutRegistry>(DI_KEYS.ShortcutRegistry)

    registerWindowHandlers(windowLayoutManager)
    registerFileHandlers(commandDispatcher, tabEditorManager, shortcutRegistry)
    registerLoadHandlers(tabEditorManager, treeLayoutManager)
    registerExitHandlers(tabEditorManager, treeLayoutManager)
    registerEditHandlers(commandDispatcher, shortcutRegistry)
    registerViewHandlers(shortcutRegistry, zoomManager)
    registerSideHandlers(treeLayoutManager)
    registerTabHandlers(commandDispatcher, tabContainer, tabEditorManager, tabContextMenu, shortcutRegistry)
    registerTreeHandlers(commandDispatcher, focusManager, treeContentContainer, treeLayoutManager, tabEditorManager, treeContextMenu, shortcutRegistry)
    registerMenuHandlers(menuItems)

    bindDocumentClickEvent(tabContextMenu, treeContextMenu)
    bindDocumentMousedownEvnet(focusManager, tabEditorManager, treeLayoutManager)
    document.addEventListener('keydown', (e) => { shortcutRegistry.handleKeyEvent(e) })
    window[electronAPI.channel].loadedRenderer()
})

function bindDocumentClickEvent(tabContextMenu: HTMLElement, treeContextMenu: HTMLElement) {
    document.addEventListener('click', () => {
        tabContextMenu.classList.remove(CLASS_SELECTED)
        treeContextMenu.classList.remove(CLASS_SELECTED)
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
        trackRelevantFocus(e.target as HTMLElement, focusManager)

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

function trackRelevantFocus(target: HTMLElement, focusManager: FocusManager) {
    if (target.closest('#editor_container')) {
        focusManager.setFocus('editor')
    } else if (target.closest('#tree')) {
        focusManager.setFocus('tree')
    }
}