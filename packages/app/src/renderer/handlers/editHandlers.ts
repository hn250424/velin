import type MenuElements from "@renderer/modules/menu/MenuElements"
import CommandManager from "../CommandManager"
import ShortcutRegistry from "../modules/input/ShortcutRegistry"

export default function registerEditHandlers(
	commandManager: CommandManager,
	shortcutRegistry: ShortcutRegistry,
	menuElements: MenuElements
) {
	bindCommandWithmenu(commandManager, menuElements)
	bindCommandWithShortcut(commandManager, shortcutRegistry)
}

function bindCommandWithmenu(commandManager: CommandManager, menuElements: MenuElements) {
	const { undo, redo, cut, copy, paste, find, replace } = menuElements

	undo.addEventListener("click", async () => {
		await commandManager.performUndo("menu")
	})

	redo.addEventListener("click", async () => {
		await commandManager.performRedo("menu")
	})

	cut.addEventListener("click", async () => {
		await commandManager.performCut("menu")
	})

	copy.addEventListener("click", async () => {
		await commandManager.performCopy("menu")
	})

	paste.addEventListener("click", async () => {
		await commandManager.performPaste("menu")
	})

	find.addEventListener("click", async () => {
		commandManager.toggleFindReplaceBox("menu", false)
	})

	replace.addEventListener("click", async () => {
		commandManager.toggleFindReplaceBox("menu", true)
	})
}

function bindCommandWithShortcut(commandManager: CommandManager, shortcutRegistry: ShortcutRegistry) {
	shortcutRegistry.register("Ctrl+Z", async () => await commandManager.performUndo("shortcut"))
	shortcutRegistry.register("Ctrl+Shift+Z", async () => await commandManager.performRedo("shortcut"))
	shortcutRegistry.register("Ctrl+X", async () => await commandManager.performCut("shortcut"))
	shortcutRegistry.register("Ctrl+C", async () => await commandManager.performCopy("shortcut"))
	shortcutRegistry.register("Ctrl+V", async () => await commandManager.performPaste("shortcut"))
	shortcutRegistry.register("Ctrl+F", () => commandManager.toggleFindReplaceBox("shortcut", false))
	shortcutRegistry.register("Ctrl+R", () => commandManager.toggleFindReplaceBox("shortcut", true))
	shortcutRegistry.register("Ctrl+Alt+ENTER", () => commandManager.performReplaceAll("shortcut"))
}
