import CommandDispatcher from "../CommandDispatcher"
import { CLASS_SELECTED } from "../constants/dom"
import ShortcutRegistry from "../modules/input/ShortcutRegistry"
import SettingsFacade from "../modules/settings/SettingsFacade"

export default function registerSettingsHandlers(
    commandDispatcher: CommandDispatcher,
    shortcutRegistry: ShortcutRegistry,
    settingsFacade: SettingsFacade
) {
    // Init.
    settingsFacade.renderSettingsValue(settingsFacade.getSettingsValue())
    commandDispatcher.performApplySettings('programmatic', settingsFacade.getSettingsValue())

    // Bind.
    bindCommandWithmenu(commandDispatcher)
    bindCommandWithShortcut(commandDispatcher, shortcutRegistry)
    bindCommandWithSettingsContainer(commandDispatcher, settingsFacade)
}

function bindCommandWithmenu(commandDispatcher: CommandDispatcher) {
    document.getElementById('file_menu_settings').addEventListener('click', () => {
        commandDispatcher.performOpenSettings('menu')
    })
}

function bindCommandWithShortcut(commandDispatcher: CommandDispatcher, shortcutRegistry: ShortcutRegistry) {
    shortcutRegistry.register('Ctrl+,', (e: KeyboardEvent) => commandDispatcher.performOpenSettings('shortcut'))
}

function bindCommandWithSettingsContainer(commandDispatcher: CommandDispatcher, settingsFacade: SettingsFacade) {
    document.getElementById('settings-exit').addEventListener('click', () => {
        commandDispatcher.performCloseSettings('element_button')
    })

    document.getElementById('settings-apply-btn').addEventListener('click', () => {
        commandDispatcher.performApplySettings('element_button', settingsFacade.getChangeSet())
    })

    document.getElementById('settings-close-btn').addEventListener('click', () => {
        commandDispatcher.performCloseSettings('element_button')
    })


    const settingsMenus = [
        document.getElementById('settings-menu-font'),
        document.getElementById('settings-menu-theme'),
    ]
    const settingsContents = [
        document.getElementById('settings-contents-font'),
        document.getElementById('settings-contents-theme'),
    ]
    settingsMenus[0].classList.add(CLASS_SELECTED)
    settingsContents[0].style.display = 'block'
    
    settingsMenus.forEach((el, idx) => {
        el.addEventListener('click', () => {
            settingsMenus.forEach(m => m.classList.remove(CLASS_SELECTED))
            settingsContents.forEach(c => (c.style.display = 'none'))

            el.classList.add(CLASS_SELECTED)
            settingsContents[idx].style.display = 'block'
        })
    })
}