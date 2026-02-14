import CommandManager from "../CommandManager"
import ShortcutRegistry from "../modules/input/ShortcutRegistry"

export default function registerHelpHandlers(commandManager: CommandManager, shortcutRegistry: ShortcutRegistry) {
	bindCommandWithmenu(commandManager)
	bindCommandWithShortcut(commandManager, shortcutRegistry)
}

function bindCommandWithmenu(commandManager: CommandManager) {
	document.querySelector("#help-information")!.addEventListener("click", async () => {
		commandManager.performShowInformation("menu")
	})

	document.querySelector("#info-button")!.addEventListener("click", () => {
		commandManager.performHideInformation("menu")
	})
}

function bindCommandWithShortcut(commandManager: CommandManager, shortcutRegistry: ShortcutRegistry) {
	shortcutRegistry.register("F1", async (e: KeyboardEvent) => commandManager.performShowInformation("shortcut"))
}
