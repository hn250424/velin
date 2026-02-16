import "@milkdown/theme-nord/style.css"

import ShortcutRegistry from "../../core/ShortcutRegistry"
import type MenuElements from "@renderer/modules/menu/MenuElements"
import type SettingsFacade from "@renderer/modules/settings/SettingsFacade"
import { exit as actExit } from "../../actions"
import TabEditorFacade from "@renderer/modules/tab_editor/TabEditorFacade"
import TreeFacade from "@renderer/modules/tree/TreeFacade"
import { Dispatcher } from "../../dispatch"

export function handleFileMenu(
	dispatcher: Dispatcher,
	shortcutRegistry: ShortcutRegistry,
	menueElements: MenuElements,
	settingsFacade: SettingsFacade,
	tabEditorFacade: TabEditorFacade,
	treeFacade: TreeFacade
) {
	bindMenuEvents(dispatcher, menueElements, settingsFacade, tabEditorFacade, treeFacade)
	bindShortcutEvents(dispatcher, shortcutRegistry, settingsFacade)
}

function bindMenuEvents(
	dispatcher: Dispatcher,
	menuElements: MenuElements,
	settingsFacade: SettingsFacade,
	tabEditorFacade: TabEditorFacade,
	treeFacade: TreeFacade
) {
	const { newTab, openFile, openDirectory, save, saveAs, saveAll, settings, exit } = menuElements

	newTab.addEventListener("click", async () => {
		await dispatcher.dispatch("newTab", "menu")
	})

	openFile.addEventListener("click", async () => {
		await dispatcher.dispatch("openFile", "menu")
	})

	openDirectory.addEventListener("click", async () => {
		await dispatcher.dispatch("openDirectory", "menu")
	})

	save.addEventListener("click", async () => {
		await dispatcher.dispatch("save", "menu")
	})

	saveAs.addEventListener("click", async () => {
		await dispatcher.dispatch("saveAs", "menu")
	})

	saveAll.addEventListener("click", async () => {
		await dispatcher.dispatch("saveAll", "menu")
	})

	settings.addEventListener("click", () => {
		settingsFacade.openSettings()
	})

	exit.addEventListener("click", () => {
		actExit(tabEditorFacade, treeFacade)
	})
}

function bindShortcutEvents(
	dispatcher: Dispatcher,
	shortcutRegistry: ShortcutRegistry,
	settingsFacade: SettingsFacade
) {
	shortcutRegistry.register("Ctrl+T", async () => await dispatcher.dispatch("newTab", "shortcut"))
	shortcutRegistry.register("Ctrl+O", async () => await dispatcher.dispatch("openFile", "shortcut"))
	shortcutRegistry.register("Ctrl+Shift+O", async () => await dispatcher.dispatch("openDirectory", "shortcut"))
	shortcutRegistry.register("Ctrl+S", async () => await dispatcher.dispatch("save", "shortcut"))
	shortcutRegistry.register("Ctrl+Shift+S", async () => await dispatcher.dispatch("saveAs", "shortcut"))
	shortcutRegistry.register("Ctrl+,", () => settingsFacade.openSettings())
}
