import "./index.scss"
import "@milkdown/theme-nord/style.css"

import DI_KEYS from "./constants/di_keys"
import diContainer from "./diContainer"

import { FocusManager, ShortcutRegistry } from "./core"
import { Dispatcher } from "./dispatch"

import {
	MenuElements,
	TabEditorFacade,
	TreeFacade,
	SettingsFacade,
	SideFacade,
	InfoFacade,
	WindowFacade,
	ZoomManager,
} from "./modules"

import {
	handleGlobalInput,
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
	handleSync,
} from "./handlers"

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

	const dispatcher = diContainer.get<Dispatcher>(DI_KEYS.Dispatcher)

	handleGlobalInput(dispatcher, focusManager, menuElements, tabEditorFacade, treeFacade, shortcutRegistry)
	handleMenuItems(menuElements)
	handleFileMenu(dispatcher, shortcutRegistry, menuElements, settingsFacade, tabEditorFacade, treeFacade)
	handleEditMenu(dispatcher, shortcutRegistry, menuElements)
	handleViewMenu(shortcutRegistry, menuElements, zoomManager, sideFacade)
	handleHelpMenu(shortcutRegistry, menuElements, infoFacade)

	handleTabEditor(dispatcher, tabEditorFacade, shortcutRegistry)
	handleInfo(infoFacade)
	handleWindow(windowFacade, tabEditorFacade, treeFacade)
	handleTree(dispatcher, focusManager, treeFacade, shortcutRegistry)
	handleSide(sideFacade)
	handleSettings(dispatcher, settingsFacade)
	handleSync(tabEditorFacade, treeFacade)

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

	window.rendererToMain.loadedRenderer()
})
