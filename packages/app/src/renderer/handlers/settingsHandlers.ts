import type MenuElements from "@renderer/modules/menu/MenuElements"
import CommandManager from "../CommandManager"
import { CLASS_SELECTED } from "../constants/dom"
import ShortcutRegistry from "../modules/input/ShortcutRegistry"
import SettingsFacade from "../modules/settings/SettingsFacade"

export default function registerSettingsHandlers(
	commandManager: CommandManager,
	shortcutRegistry: ShortcutRegistry,
	settingsFacade: SettingsFacade,
	menuElements: MenuElements
) {
	// Init.
	settingsFacade.renderSettingsValue(settingsFacade.getSettingsValue())
	commandManager.performApplySettings("programmatic", settingsFacade.getSettingsValue())

	// Bind.
	bindCommandWithmenu(commandManager, menuElements)
	bindCommandWithShortcut(commandManager, shortcutRegistry)
	bindCommandWithSettingsContainer(commandManager, settingsFacade)
}

function bindCommandWithmenu(commandManager: CommandManager, menuElements: MenuElements) {
	menuElements.settings.addEventListener("click", () => {
		commandManager.performOpenSettings("menu")
	})
}

function bindCommandWithShortcut(commandManager: CommandManager, shortcutRegistry: ShortcutRegistry) {
	shortcutRegistry.register("Ctrl+,", (e: KeyboardEvent) => commandManager.performOpenSettings("shortcut"))
}

function bindCommandWithSettingsContainer(commandManager: CommandManager, settingsFacade: SettingsFacade) {
	const { exit, apply, close, menus, contents } = settingsFacade.renderer.elements

	exit.addEventListener("click", () => {
		commandManager.performCloseSettings("button")
	})

	apply.addEventListener("click", () => {
		commandManager.performApplySettings("button", settingsFacade.getChangeSet())
	})

	close.addEventListener("click", () => {
		commandManager.performCloseSettings("button")
	})

	menus[0].classList.add(CLASS_SELECTED)
	contents[0].style.display = "block"

	menus.forEach((el, idx) => {
		el.addEventListener("click", () => {
			menus.forEach((m) => m.classList.remove(CLASS_SELECTED))
			contents.forEach((c) => (c.style.display = "none"))

			el.classList.add(CLASS_SELECTED)
			contents[idx].style.display = "block"
		})
	})
}
