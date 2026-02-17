import "./index.scss"
import "@milkdown/theme-nord/style.css"

import type { TabEditorsDto } from "@shared/dto/TabEditorDto"
import type { TreeDto } from "@shared/dto/TreeDto"

import {
	handleMenuItems,
	handleFileMenu,
	handleEditMenu,
	handleViewMenu,
	handleHelpMenu,
	handleInfo,
	handleLoad,
	handleSettings,
	handleSide,
	handleTabEditor,
	handleTree,
	handleWindow,
} from "./handlers"

import FocusManager from "./core/FocusManager"
import ShortcutRegistry from "./core/ShortcutRegistry"
import ZoomManager from "./modules/zoom/ZoomManager"

import TabEditorFacade from "./modules/tab_editor/TabEditorFacade"
import TreeFacade from "./modules/tree/TreeFacade"
import SettingsFacade from "./modules/settings/SettingsFacade"

import DI_KEYS from "./constants/di_keys"
import {
	CLASS_SELECTED,
	SELECTOR_TAB_CONTEXT_MENU,
	SELECTOR_TREE_CONTEXT_MENU,
	SELECTOR_TREE_NODE_CONTAINER,
	SELECTOR_MENU_ITEM,
	SELECTOR_EDITOR_CONTAINER,
	SELECTOR_FIND_REPLACE_CONTAINER,
	SELECTOR_TREE,
} from "./constants/dom"

import diContainer from "./diContainer"

import CommandManager from "./modules/CommandManager"
import type MenuElements from "./modules/menu/MenuElements"
import type WindowFacade from "./modules/window/WindowFacade"
import SideFacade from "./modules/side/SideFacade"
import InfoFacade from "./modules/info/InfoFacade"
import { Dispatcher } from "./dispatch"

window.addEventListener("DOMContentLoaded", () => {
	const menuElements = diContainer.get<MenuElements>(DI_KEYS.MenuElements)

	const focusManager = diContainer.get<FocusManager>(DI_KEYS.FocusManager)
	const zoomManager = diContainer.get<ZoomManager>(DI_KEYS.ZoomManager)
	const shortcutRegistry = diContainer.get<ShortcutRegistry>(DI_KEYS.ShortcutRegistry)

	const infoFacade = diContainer.get<InfoFacade>(DI_KEYS.InfoFacade)
	const settingsFacade = diContainer.get<SettingsFacade>(DI_KEYS.SettingsFacade)
	const tabEditorFacade = diContainer.get<TabEditorFacade>(DI_KEYS.TabEditorFacade)
	const treeFacade = diContainer.get<TreeFacade>(DI_KEYS.TreeFacade)
	const sideFacade = diContainer.get<SideFacade>(DI_KEYS.SideFacade)
	const windowFacade = diContainer.get<WindowFacade>(DI_KEYS.WindowFacade)

	const commandManager = diContainer.get<CommandManager>(DI_KEYS.CommandManager)
	const dispatcher = diContainer.get<Dispatcher>(DI_KEYS.Dispatcher)

	handleMenuItems(menuElements)
	handleFileMenu(dispatcher, shortcutRegistry, menuElements, settingsFacade, tabEditorFacade, treeFacade)
	handleEditMenu(dispatcher, shortcutRegistry, menuElements)
	handleViewMenu(shortcutRegistry, menuElements, zoomManager, sideFacade)
	handleHelpMenu(shortcutRegistry, menuElements, infoFacade)

	handleTabEditor(dispatcher, tabEditorFacade, shortcutRegistry)
	handleInfo(infoFacade)
	handleWindow(windowFacade, tabEditorFacade, treeFacade)
	handleTree(commandManager, focusManager, treeFacade, shortcutRegistry)
	handleSide(sideFacade)
	handleSettings(dispatcher, settingsFacade)

	handleLoad(
		dispatcher,
		windowFacade,
		settingsFacade,
		tabEditorFacade,
		treeFacade,
		sideFacade,
		infoFacade,
		menuElements
	)

	bindSyncEventFromWatch(tabEditorFacade, treeFacade)
	bindDocumentClickEvent(tabEditorFacade, treeFacade)
	bindDocumentMousedownEvnet(menuElements, focusManager, tabEditorFacade, treeFacade)
	bindShortcutEvent(commandManager, shortcutRegistry)
	document.addEventListener("keydown", (e) => {
		shortcutRegistry.handleKeyEvent(e)
	})

	window.rendererToMain.loadedRenderer()
	console.log(import.meta.env)
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

			treeFacade.removeLastSelectedIndex()
			treeFacade.clearSelectedIndices()
			treeFacade.clearClipboardPaths()
			treeFacade.loadFlattenArrayAndMaps(viewModel)
		}
	})
}

function bindDocumentClickEvent(tabEditorFacade: TabEditorFacade, treeFacade: TreeFacade) {
	const { tabContextMenu } = tabEditorFacade.renderer.elements
	const { treeContextMenu } = treeFacade.renderer.elements

	document.addEventListener("click", () => {
		tabContextMenu.classList.remove(CLASS_SELECTED)
		treeContextMenu.classList.remove(CLASS_SELECTED)
	})
}

function bindDocumentMousedownEvnet(
	menuElements: MenuElements,
	focusManager: FocusManager,
	tabEditorFacade: TabEditorFacade,
	treeFacade: TreeFacade
) {
	const { menuItems } = menuElements
	const { tabContextMenu } = tabEditorFacade.renderer.elements
	const { treeContextMenu } = treeFacade.renderer.elements

	document.addEventListener("mousedown", (e) => {
		const target = e.target as HTMLElement
		const isInTreeContextMenu = !!target.closest(SELECTOR_TREE_CONTEXT_MENU)
		const isInTabContextMenu = !!target.closest(SELECTOR_TAB_CONTEXT_MENU)
		const isInTreeNodeContainer = !!target.closest(SELECTOR_TREE_NODE_CONTAINER)
		const isInMenuItem = !!target.closest(SELECTOR_MENU_ITEM)

		if (!isInMenuItem) menuItems.forEach((i) => i.classList.remove(CLASS_SELECTED))
		if (!isInTabContextMenu) tabContextMenu.classList.remove(CLASS_SELECTED)
		if (!isInTreeContextMenu) treeContextMenu.classList.remove(CLASS_SELECTED)
		trackRelevantFocus(e.target as HTMLElement, focusManager)

		if (!isInTabContextMenu) tabEditorFacade.removeContextTabId()
		if (!isInTreeContextMenu && !isInTreeNodeContainer) {
			treeFacade.removeTreeFocus()
			treeFacade.removeLastSelectedIndex()
			treeFacade.clearTreeSelected()
		}
	})
}

function bindShortcutEvent(commandManager: CommandManager, shortcutRegistry: ShortcutRegistry) {
	shortcutRegistry.register("ESC", async (e: KeyboardEvent) => await commandManager.performESC("shortcut"))
	shortcutRegistry.register("ENTER", async (e: KeyboardEvent) => await commandManager.performENTER(e, "shortcut"))
}

function trackRelevantFocus(target: HTMLElement, focusManager: FocusManager) {
	if (target.closest(SELECTOR_EDITOR_CONTAINER)) {
		focusManager.setFocus("editor")
	} else if (target.closest(SELECTOR_TREE)) {
		focusManager.setFocus("tree")
	} else if (target.closest(SELECTOR_FIND_REPLACE_CONTAINER)) {
		focusManager.setFocus("find-replace")
	}
}
