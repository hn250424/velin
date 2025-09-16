import CommandDispatcher from "../CommandDispatcher"
import { CLASS_SELECTED } from "../constants/dom"
import ShortcutRegistry from "../modules/input/ShortcutRegistry"

export default function registerSettingsHandlers(
    commandDispatcher: CommandDispatcher,
    shortcutRegistry: ShortcutRegistry,
) {
    bindCommandWithmenu(commandDispatcher)
    bindCommandWithShortcut(commandDispatcher, shortcutRegistry)
    bindCommandWithSettingsContainer(commandDispatcher)
}

function bindCommandWithmenu(commandDispatcher: CommandDispatcher) {
    document.getElementById('file_menu_settings').addEventListener('click', () => {
        commandDispatcher.performOpenSettings('menu')
    })
}

function bindCommandWithShortcut(commandDispatcher: CommandDispatcher, shortcutRegistry: ShortcutRegistry) {
    shortcutRegistry.register('Ctrl+,', (e: KeyboardEvent) => commandDispatcher.performOpenSettings('shortcut'))
}

function bindCommandWithSettingsContainer(commandDispatcher: CommandDispatcher) {
    const settingsOverlay = document.getElementById('settings-overlay')
    const settingsExit = document.getElementById('settings-exit')
    const settingsApplyBtn = document.getElementById('settings-apply-btn')
    const settingsCancelBtn = document.getElementById('settings-cancel-btn')
    
    const settingsMenus = [
        document.getElementById('settings-menu-theme'),
        document.getElementById('settings-menu-font'),
    ]
    const settingsContents = [
        document.getElementById('settings-contents-theme'),
        document.getElementById('settings-contents-font'),
    ]
    
    settingsExit.addEventListener('click', () => {
        settingsOverlay.style.display = 'none'
    })

    settingsApplyBtn.addEventListener('click', () => {
        // TODO:
        // save session.
        // adapt settings.

        settingsOverlay.style.display = 'none'
    })

    settingsCancelBtn.addEventListener('click', () => {
        settingsOverlay.style.display = 'none'
    })

    settingsMenus.forEach((el, idx) => {
        el.addEventListener('click', () => {
            settingsMenus.forEach(m => m.classList.remove(CLASS_SELECTED))
            settingsContents.forEach(c => (c.style.display = 'none'))

            el.classList.add(CLASS_SELECTED)
            settingsContents[idx].style.display = 'block'
        })
    })

    // if (settingsMenus.length > 0 && settingsContents.length > 0) {
    //     settingsMenus[0].classList.add(CLASS_SELECTED);
    //     settingsContents[0].style.display = 'block';
    // }
}