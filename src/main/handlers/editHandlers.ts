import { electronAPI } from '@shared/constants/electronAPI'
import { clipboard, ipcMain } from 'electron'

export default function registerEditHandlers() {
    ipcMain.handle(electronAPI.events.paste, () => {
        return clipboard.readText()
    })
}