import "@milkdown/theme-nord/style.css"

import CommandManager from "../../CommandManager"
import ShortcutRegistry from "../../core/ShortcutRegistry"
import type MenuElements from "@renderer/modules/menu/MenuElements"
import type SettingsFacade from "@renderer/modules/settings/SettingsFacade"

export function handleFileMenu(
	commandManager: CommandManager,
	shortcutRegistry: ShortcutRegistry,
	menueElements: MenuElements,
	settingsFacade: SettingsFacade
) {
	bindCommandWithMenu(commandManager, menueElements, settingsFacade)
	bindCommandWithShortcut(commandManager, shortcutRegistry, settingsFacade)
}

function bindCommandWithMenu(
	commandManager: CommandManager,
	menuElements: MenuElements,
	settingsFacade: SettingsFacade
) {
	const { newTab, openFile, openDirectory, save, saveAs, saveAll, settings } = menuElements

	newTab.addEventListener("click", async () => {
		await commandManager.performNewTab("menu")
	})

	openFile.addEventListener("click", async () => {
		await commandManager.performOpenFile("menu")
	})

	openDirectory.addEventListener("click", async () => {
		await commandManager.performOpenDirectory("menu")
	})

	save.addEventListener("click", async () => {
		await commandManager.performSave("menu")
	})

	saveAs.addEventListener("click", async () => {
		await commandManager.performSaveAs("menu")
	})

	saveAll.addEventListener("click", async () => {
		await commandManager.performSaveAll("menu")
	})

	settings.addEventListener("click", () => {
		settingsFacade.openSettings()
	})
}

function bindCommandWithShortcut(
	commandManager: CommandManager,
	shortcutRegistry: ShortcutRegistry,
	settingsFacade: SettingsFacade
) {
	shortcutRegistry.register("Ctrl+T", async () => await commandManager.performNewTab("shortcut"))
	shortcutRegistry.register("Ctrl+O", async () => await commandManager.performOpenFile("shortcut"))
	shortcutRegistry.register("Ctrl+Shift+O", async () => await commandManager.performOpenDirectory("shortcut"))
	shortcutRegistry.register("Ctrl+S", async () => await commandManager.performSave("shortcut"))
	shortcutRegistry.register("Ctrl+Shift+S", async () => await commandManager.performSaveAs("shortcut"))
	shortcutRegistry.register("Ctrl+,", () => settingsFacade.openSettings())
}
