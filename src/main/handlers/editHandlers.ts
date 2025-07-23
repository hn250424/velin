import { electronAPI } from '@shared/constants/electronAPI'
import { clipboard, ipcMain } from 'electron'

export default function registerEditHandlers() {
    ipcMain.handle(electronAPI.events.cutEditor, (e, text: string) => {
        clipboard.writeText(text)
    })

    ipcMain.handle(electronAPI.events.copyEditor, (e, text: string) => {
        clipboard.writeText(text)
    })
    
    ipcMain.handle(electronAPI.events.pasteEditor, () => {
        return clipboard.readText()
    })
}