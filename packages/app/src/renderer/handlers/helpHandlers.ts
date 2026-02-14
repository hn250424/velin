import type MenuElements from "@renderer/modules/menu/MenuElements"
import CommandManager from "../CommandManager"
import ShortcutRegistry from "../modules/input/ShortcutRegistry"

export default function registerHelpHandlers(
	commandManager: CommandManager,
	shortcutRegistry: ShortcutRegistry,
	menuElements: MenuElements
) {
	bindCommandWithmenu(commandManager, menuElements)
	bindCommandWithShortcut(commandManager, shortcutRegistry)
}

function bindCommandWithmenu(commandManager: CommandManager, menuElements: MenuElements) {
	const { information } = menuElements

	information.addEventListener("click", async () => {
		commandManager.performShowInformation("menu")
	})
}

function bindCommandWithShortcut(commandManager: CommandManager, shortcutRegistry: ShortcutRegistry) {
	shortcutRegistry.register("F1", async () => commandManager.performShowInformation("shortcut"))
}
