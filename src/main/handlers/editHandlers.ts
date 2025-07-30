import { electronAPI } from '@shared/constants/electronAPI/electronAPI'
import { clipboard, ipcMain } from 'electron'

export default function registerEditHandlers() {
    ipcMain.handle(electronAPI.events.rendererToMain.cutEditor, (e, text: string) => {
        clipboard.writeText(text)
    })

    ipcMain.handle(electronAPI.events.rendererToMain.copyEditor, (e, text: string) => {
        clipboard.writeText(text)
    })
    
    ipcMain.handle(electronAPI.events.rendererToMain.pasteEditor, () => {
        return clipboard.readText()
    })
}