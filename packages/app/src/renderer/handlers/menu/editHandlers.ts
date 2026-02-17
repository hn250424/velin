import type MenuElements from "@renderer/modules/menu/MenuElements"
import ShortcutRegistry from "../../core/ShortcutRegistry"
import { Dispatcher } from "../../dispatch"

export function handleEditMenu(
	dispatcher: Dispatcher,
	shortcutRegistry: ShortcutRegistry,
	menuElements: MenuElements
) {
	bindMenuEvents(dispatcher, menuElements)
	bindShortcutEvents(dispatcher, shortcutRegistry)
}

function bindMenuEvents(dispatcher: Dispatcher, menuElements: MenuElements) {
	const { undo, redo, cut, copy, paste, find, replace } = menuElements

	undo.addEventListener("click", async () => {
		await dispatcher.dispatch("undo", "menu")
	})

	redo.addEventListener("click", async () => {
		await dispatcher.dispatch("redo", "menu")
	})

	cut.addEventListener("click", async () => {
		await dispatcher.dispatch("cut", "menu")
	})

	copy.addEventListener("click", async () => {
		await dispatcher.dispatch("copy", "menu")
	})

	paste.addEventListener("click", async () => {
		await dispatcher.dispatch("paste", "menu")
	})

	find.addEventListener("click", async () => {
		await dispatcher.dispatch("toggleFindReplace", "menu", false)
	})

	replace.addEventListener("click", async () => {
		await dispatcher.dispatch("toggleFindReplace", "menu", true)
	})
}

function bindShortcutEvents(dispatcher: Dispatcher, shortcutRegistry: ShortcutRegistry) {
	shortcutRegistry.register("Ctrl+Z", async () => await dispatcher.dispatch("undo", "shortcut"))
	shortcutRegistry.register("Ctrl+Shift+Z", async () => await dispatcher.dispatch("redo", "shortcut"))
	shortcutRegistry.register("Ctrl+X", async () => await dispatcher.dispatch("cut", "shortcut"))
	shortcutRegistry.register("Ctrl+C", async () => await dispatcher.dispatch("copy", "shortcut"))
	shortcutRegistry.register("Ctrl+V", async () => await dispatcher.dispatch("paste", "shortcut"))
	shortcutRegistry.register("Ctrl+F", () => dispatcher.dispatch("toggleFindReplace", "shortcut", false))
	shortcutRegistry.register("Ctrl+R", () => dispatcher.dispatch("toggleFindReplace", "shortcut", true))
}
