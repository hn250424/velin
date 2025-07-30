import './index.scss'
import "@milkdown/theme-nord/style.css"
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
import TabEditorManager from './modules/managers/TabEditorManager'
import TreeLayoutManager from './modules/managers/TreeLayoutManager'
import diContainer from './diContainer'
import DI_KEYS from './constants/di_keys'
import CommandDispatcher from './modules/command/CommandDispatcher'
import {
    SELECTOR_TREE_NODE,
    CLASS_TREE_NODE,
    CLASS_FOCUSED,
    CLASS_SELECTED,
    ID_TREE_NODE_CONTAINER
} from './constants/dom'
import WindowLayoutManager from './modules/layout/WindowLayoutManager'
import ZoomManager from './modules/layout/ZoomManager'

let tabContextMenu: HTMLElement
let menuContainer: HTMLElement
let tabContainer: HTMLElement
let menuItems: NodeListOf<HTMLElement>
let title: HTMLElement
let treeNodeContainer: HTMLElement
let treeContextMenu: HTMLElement

window.addEventListener('DOMContentLoaded', () => {
    title = document.getElementById('title')
    tabContainer = document.getElementById('tab_container')
    tabContextMenu = document.getElementById('tab_context_menu')
    treeContextMenu = document.getElementById('tree_context_menu')
    menuContainer = document.getElementById('menu_container')
    menuItems = document.querySelectorAll('#menu_container .menu_item')
    treeNodeContainer = document.getElementById(ID_TREE_NODE_CONTAINER)

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
    registerTreeHandlers(commandDispatcher, focusManager, treeNodeContainer, treeLayoutManager, tabEditorManager, treeContextMenu, shortcutRegistry)
    registerMenuHandlers(menuItems)

    bindDocumentClickEvent(tabContextMenu, treeContextMenu)
    bindDocumentMousedownEvnet(focusManager, tabEditorManager, treeLayoutManager)
    bindShortcutEvent(commandDispatcher, shortcutRegistry)
    document.addEventListener('keydown', (e) => { shortcutRegistry.handleKeyEvent(e) })
    window.rendererToMain.loadedRenderer()
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
        const isInTreeContextMenu = !!target.closest('#tree_context_menu')
        const isInTabContextMenu = !!target.closest('#tab_context_menu')
        const isInTreeNodecontainer = !!target.closest('#tree_node_container')
        const isInTabContainer = !!target.closest('#tab_container')
        const isInMenuItem = !!target.closest('.menu_item')

        if (!isInMenuItem) menuItems.forEach(i => i.classList.remove(CLASS_SELECTED))
        if (!isInTabContextMenu) tabContextMenu.classList.remove(CLASS_SELECTED)
        if (!isInTreeContextMenu) treeContextMenu.classList.remove(CLASS_SELECTED)
        trackRelevantFocus(e.target as HTMLElement, focusManager)

        if (!isInTabContextMenu) {
            tabEditorManager.removeContextTabId()
        }

        if (!isInTreeContextMenu && !isInTreeNodecontainer) {
            const idx = treeLayoutManager.lastSelectedIndex
            if (idx < 0) return

            const treeNode = treeLayoutManager.getTreeNodeByIndex(idx)
            treeNode.classList.remove(CLASS_FOCUSED)
            treeLayoutManager.removeLastSelectedIndex()
        }
    })
}

function bindShortcutEvent(commandDispatcher: CommandDispatcher, shortcutRegistry: ShortcutRegistry) {
    shortcutRegistry.register('ESC', async (e: KeyboardEvent) => await commandDispatcher.performESC('shortcut'))
    shortcutRegistry.register('ENTER', async (e: KeyboardEvent) => await commandDispatcher.performENTER('shortcut'))
}

function trackRelevantFocus(target: HTMLElement, focusManager: FocusManager) {
    if (target.closest('#editor_container')) {
        focusManager.setFocus('editor')
    } else if (target.closest('#tree')) {
        focusManager.setFocus('tree')
    } else if (target.closest('#find_replace_container')) {
        focusManager.setFocus('find_replace')
    }
}