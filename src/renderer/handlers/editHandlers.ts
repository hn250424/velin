import { electronAPI } from "@shared/constants/electronAPI"
import TabEditorManager from "../modules/features/TabEditorManager"

export default function registerEditHandlers() {
    const tabEditorManager = TabEditorManager.getInstance()

    const commands: { id: string, cmd: 'undo' | 'redo' | 'cut' | 'copy' | 'paste' }[] = [
        { id: 'edit_menu_undo', cmd: 'undo' },
        { id: 'edit_menu_redo', cmd: 'redo' },
        { id: 'edit_menu_cut', cmd: 'cut' },
        { id: 'edit_menu_copy', cmd: 'copy' },
        { id: 'edit_menu_paste', cmd: 'paste' },
    ]

    for (const { id, cmd } of commands) {
        const el = document.getElementById(id)
        if (!el) continue

        el.addEventListener('click', async () => {
            const editable = document.querySelector('#editor_container [contenteditable="true"]') as HTMLElement
            if (!editable) return

            if (cmd === 'paste') {
                const text = await window[electronAPI.channel].paste()
                editable.focus()
                document.execCommand('insertText', false, text)
            } else if (cmd === 'undo') {
                tabEditorManager.undo()
            } else if (cmd === 'redo') {
                tabEditorManager.redo() 
            } else {
                document.execCommand(cmd)
            }
        })
    }
}