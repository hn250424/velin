import CommandManager from "../CommandManager"
import { CLASS_SELECTED } from "../constants/dom"
import ShortcutRegistry from "../modules/input/ShortcutRegistry"
import SettingsFacade from "../modules/settings/SettingsFacade"

export default function registerSettingsHandlers(
	commandManager: CommandManager,
	shortcutRegistry: ShortcutRegistry,
	settingsFacade: SettingsFacade
) {
	// Init.
	settingsFacade.renderSettingsValue(settingsFacade.getSettingsValue())
	commandManager.performApplySettings("programmatic", settingsFacade.getSettingsValue())

	// Bind.
	bindCommandWithmenu(commandManager)
	bindCommandWithShortcut(commandManager, shortcutRegistry)
	bindCommandWithSettingsContainer(commandManager, settingsFacade)
}

function bindCommandWithmenu(commandManager: CommandManager) {
	document.getElementById("file_menu_settings")!.addEventListener("click", () => {
		commandManager.performOpenSettings("menu")
	})
}

function bindCommandWithShortcut(commandManager: CommandManager, shortcutRegistry: ShortcutRegistry) {
	shortcutRegistry.register("Ctrl+,", (e: KeyboardEvent) => commandManager.performOpenSettings("shortcut"))
}

function bindCommandWithSettingsContainer(commandManager: CommandManager, settingsFacade: SettingsFacade) {
	document.getElementById("settings-exit")!.addEventListener("click", () => {
		commandManager.performCloseSettings("button")
	})

	document.getElementById("settings-apply-btn")!.addEventListener("click", () => {
		commandManager.performApplySettings("button", settingsFacade.getChangeSet())
	})

	document.getElementById("settings-close-btn")!.addEventListener("click", () => {
		commandManager.performCloseSettings("button")
	})

	const settingsMenus = [document.getElementById("settings-menu-font"), document.getElementById("settings-menu-theme")]
	const settingsContents = [
		document.getElementById("settings-contents-font"),
		document.getElementById("settings-contents-theme"),
	]
	settingsMenus[0]!.classList.add(CLASS_SELECTED)
	settingsContents[0]!.style.display = "block"

	settingsMenus.forEach((el, idx) => {
		el!.addEventListener("click", () => {
			settingsMenus.forEach((m) => m!.classList.remove(CLASS_SELECTED))
			settingsContents.forEach((c) => (c!.style.display = "none"))

			el!.classList.add(CLASS_SELECTED)
			settingsContents[idx]!.style.display = "block"
		})
	})
}
