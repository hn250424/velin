import CommandDispatcher from "../modules/command/CommandDispatcher"
import ShortcutRegistry from "../modules/input/ShortcutRegistry"

export default function registerEditHandlers(
    commandDispatcher: CommandDispatcher,
    shortcutRegistry: ShortcutRegistry,
) {
    bindCommandWithmenu(commandDispatcher)
    bindCommandWithShortcut(commandDispatcher, shortcutRegistry)
}

function bindCommandWithmenu(commandDispatcher: CommandDispatcher) {
    document.getElementById('edit_menu_undo').addEventListener('click', async () => {
        await commandDispatcher.performUndo('menu')
    })

    document.getElementById('edit_menu_redo').addEventListener('click', async () => {
        await commandDispatcher.performRedo('menu')
    })

    document.getElementById('edit_menu_cut').addEventListener('click', async () => {
        await commandDispatcher.performCut('menu')
    })

    document.getElementById('edit_menu_copy').addEventListener('click', async () => {
        await commandDispatcher.performCopy('menu')
    })

    document.getElementById('edit_menu_paste').addEventListener('click', async () => {
        await commandDispatcher.performPaste('menu')
    })

    document.getElementById('edit_menu_find').addEventListener('click', async () => {
        commandDispatcher.toggleFindReplaceBox('menu', false)
    })

    document.getElementById('edit_menu_replace').addEventListener('click', async () => {
        commandDispatcher.toggleFindReplaceBox('menu', true)
    })

    document.getElementById('find_up').addEventListener('click', async () => {
        commandDispatcher.performFind('menu', 'up')
    })

    document.getElementById('find_down').addEventListener('click', async () => {
        commandDispatcher.performFind('menu', 'down')
    })

    document.getElementById('find_close').addEventListener('click', async () => {
        commandDispatcher.performCloseFindReplaceBox('menu')
    })
}

function bindCommandWithShortcut(commandDispatcher: CommandDispatcher, shortcutRegistry: ShortcutRegistry) {
    shortcutRegistry.register('Ctrl+Z', async (e: KeyboardEvent) => await commandDispatcher.performUndo('shortcut'))
    shortcutRegistry.register('Ctrl+Shift+Z', async (e: KeyboardEvent) => await commandDispatcher.performRedo('shortcut'))
    shortcutRegistry.register('Ctrl+X', async (e: KeyboardEvent) => await commandDispatcher.performCut('shortcut'))
    shortcutRegistry.register('Ctrl+C', async (e: KeyboardEvent) => await commandDispatcher.performCopy('shortcut'))
    shortcutRegistry.register('Ctrl+V', async (e: KeyboardEvent) => await commandDispatcher.performPaste('shortcut'))
    shortcutRegistry.register('Ctrl+F', (e: KeyboardEvent) => commandDispatcher.toggleFindReplaceBox('shortcut', false))
    shortcutRegistry.register('Ctrl+R', (e: KeyboardEvent) => commandDispatcher.toggleFindReplaceBox('shortcut', true))
}