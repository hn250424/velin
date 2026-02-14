import "@milkdown/theme-nord/style.css"

import CommandManager from "../CommandManager"
import ShortcutRegistry from "../modules/input/ShortcutRegistry"
import type MenuElements from "@renderer/modules/menu/MenuElements"

export default function registerFileHandlers(
	commandManager: CommandManager,
	shortcutRegistry: ShortcutRegistry,
	menueElements: MenuElements
) {
	bindCommandWithmenu(commandManager, menueElements)
	bindCommandWithShortcut(commandManager, shortcutRegistry)
}

function bindCommandWithmenu(commandManager: CommandManager, menuElements: MenuElements) {
	const { newTab, openFile, openDirectory, save, saveAs, saveAll } = menuElements

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
}

function bindCommandWithShortcut(commandManager: CommandManager, shortcutRegistry: ShortcutRegistry) {
	shortcutRegistry.register("Ctrl+T", async () => await commandManager.performNewTab("shortcut"))
	shortcutRegistry.register("Ctrl+O", async () => await commandManager.performOpenFile("shortcut"))
	shortcutRegistry.register("Ctrl+Shift+O", async () => await commandManager.performOpenDirectory("shortcut"))
	shortcutRegistry.register("Ctrl+S", async () => await commandManager.performSave("shortcut"))
	shortcutRegistry.register("Ctrl+Shift+S", async () => await commandManager.performSaveAs("shortcut"))
}
