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
import registerSettingsHandlers from './handlers/settingsHandlers'
import registerHelpHandlers from './handlers/helpHandlers'

import FocusManager from './modules/state/FocusManager'
import ShortcutRegistry from './modules/input/ShortcutRegistry'
import TabEditorFacade from './modules/tab_editor/TabEditorFacade'
import TreeFacade from './modules/tree/TreeFacade'
import diContainer from './diContainer'
import DI_KEYS from './constants/di_keys'
import CommandDispatcher from './CommandDispatcher'
import {
    CLASS_FOCUSED,
    CLASS_SELECTED,
    ID_TREE_NODE_CONTAINER
} from './constants/dom'
import WindowState from './modules/state/WindowState'
import ZoomManager from './modules/layout/ZoomManager'
import FindReplaceState from './modules/state/FindReplaceState'
import { TabEditorsDto } from '@shared/dto/TabEditorDto'
import TreeDto from '@shared/dto/TreeDto'
import SideState from './modules/state/SideState'
import SettingsFacade from './modules/settings/SettingsFacade'

window.addEventListener('DOMContentLoaded', () => {
    const title = document.getElementById('title')
    const tabContainer = document.getElementById('tab_container')
    const tabContextMenu = document.getElementById('tab_context_menu')
    const treeContextMenu = document.getElementById('tree_context_menu')
    const menuContainer = document.getElementById('menu_container')
    const menuItems: NodeListOf<HTMLElement> = document.querySelectorAll('#menu_container .menu_item')
    const treeNodeContainer = document.getElementById(ID_TREE_NODE_CONTAINER)

    const focusManager = diContainer.get<FocusManager>(DI_KEYS.FocusManager)
    const findReplaceState = diContainer.get<FindReplaceState>(DI_KEYS.FindReplaceState)
    const sideState = diContainer.get<SideState>(DI_KEYS.SideState)
    const windowState = diContainer.get<WindowState>(DI_KEYS.WindowState)
    const zoomManager = diContainer.get<ZoomManager>(DI_KEYS.ZoomManager)
    const shortcutRegistry = diContainer.get<ShortcutRegistry>(DI_KEYS.ShortcutRegistry)

    const settingsFacade = diContainer.get<SettingsFacade>(DI_KEYS.SettingsFacade)
    const tabEditorFacade = diContainer.get<TabEditorFacade>(DI_KEYS.TabEditorFacade)
    const treeFacade = diContainer.get<TreeFacade>(DI_KEYS.TreeFacade)
    
    const commandDispatcher = diContainer.get<CommandDispatcher>(DI_KEYS.CommandDispatcher)

    registerFileHandlers(commandDispatcher, tabEditorFacade, shortcutRegistry)
    registerExitHandlers(tabEditorFacade, treeFacade)
    registerEditHandlers(commandDispatcher, shortcutRegistry)
    registerViewHandlers(shortcutRegistry, zoomManager)
    registerTabHandlers(commandDispatcher, tabContainer, tabEditorFacade, tabContextMenu, shortcutRegistry)
    registerTreeHandlers(commandDispatcher, focusManager, treeNodeContainer, treeFacade, treeContextMenu, shortcutRegistry)
    registerHelpHandlers(commandDispatcher, shortcutRegistry)
    registerMenuHandlers(menuItems)
    
    registerLoadHandlers(windowState, settingsFacade, sideState, tabEditorFacade, treeFacade, () => {
        // TODO: Facade ?
        registerWindowHandlers(windowState)
        registerSideHandlers(sideState)
        
        registerSettingsHandlers(commandDispatcher, shortcutRegistry, settingsFacade)
    })

    bindSyncEventFromWatch(tabEditorFacade, treeFacade)
    bindDocumentClickEvent(tabContextMenu, treeContextMenu)
    bindDocumentMousedownEvnet(menuItems, tabContextMenu, treeContextMenu, focusManager, tabEditorFacade, treeFacade)
    bindShortcutEvent(commandDispatcher, shortcutRegistry)
    document.addEventListener('keydown', (e) => { shortcutRegistry.handleKeyEvent(e) })
    
    window.rendererToMain.loadedRenderer()

    // TODO.
    // document.getElementById('settings').addEventListener('click', () => {
        // document.documentElement.className = ''
        // document.documentElement.classList.add('dark')
    // })
})

function bindSyncEventFromWatch(tabEditorFacade: TabEditorFacade, treeFacade: TreeFacade) {
    window.mainToRenderer.syncFromWatch(async (tabEditorsDto: TabEditorsDto, treeDto: TreeDto) => {
        if (tabEditorsDto) {
            await tabEditorFacade.syncTabs(tabEditorsDto)
        }

        if (treeDto) {
            const viewModel = treeFacade.toTreeViewModel(treeDto)

            treeFacade.clearPathToTreeWrapperMap() // Must clear map manually before renderTreeData (no built-in clear).
            treeFacade.renderTreeData(viewModel)

            treeFacade.loadFlattenArrayAndMaps(viewModel)
        }
    })
}

function bindDocumentClickEvent(tabContextMenu: HTMLElement, treeContextMenu: HTMLElement) {
    document.addEventListener('click', () => {
        tabContextMenu.classList.remove(CLASS_SELECTED)
        treeContextMenu.classList.remove(CLASS_SELECTED)
    })
}

function bindDocumentMousedownEvnet(
    menuItems: NodeListOf<HTMLElement>,
    tabContextMenu: HTMLElement,
    treeContextMenu: HTMLElement,
    focusManager: FocusManager, 
    tabEditorFacade: TabEditorFacade,
    treeFacade: TreeFacade
) {
    document.addEventListener('mousedown', (e) => {
        const target = e.target as HTMLElement
        const isInTreeContextMenu = !!target.closest('#tree_context_menu')
        const isInTabContextMenu = !!target.closest('#tab_context_menu')
        const isInTree = !!target.closest('#tree')
        const isInMenuItem = !!target.closest('.menu_item')

        if (!isInMenuItem) menuItems.forEach(i => i.classList.remove(CLASS_SELECTED))
        if (!isInTabContextMenu) tabContextMenu.classList.remove(CLASS_SELECTED)
        if (!isInTreeContextMenu) treeContextMenu.classList.remove(CLASS_SELECTED)
        trackRelevantFocus(e.target as HTMLElement, focusManager)

        if (!isInTabContextMenu) {
            tabEditorFacade.removeContextTabId()
        }

        if (!isInTreeContextMenu && !isInTree) {
            const idx = treeFacade.lastSelectedIndex
            if (idx < 0) return

            const treeNode = treeFacade.getTreeNodeByIndex(idx)
            treeNode.classList.remove(CLASS_FOCUSED)
            treeFacade.removeLastSelectedIndex()
        }
    })
}

function bindShortcutEvent(commandDispatcher: CommandDispatcher, shortcutRegistry: ShortcutRegistry) {
    shortcutRegistry.register('ESC', async (e: KeyboardEvent) => await commandDispatcher.performESC('shortcut'))
    shortcutRegistry.register('ENTER', async (e: KeyboardEvent) => await commandDispatcher.performENTER(e, 'shortcut'))
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