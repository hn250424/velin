import { BrowserWindow, ipcMain } from 'electron'

import { electronAPI } from '@shared/constants/electronAPI'

export default function registerWindowHandlers(mainWindow: BrowserWindow) {
    ipcMain.on(electronAPI.events.minimizeWindow, (e) => { mainWindow.minimize() })
    ipcMain.on(electronAPI.events.maximizeWindow, (e) => { mainWindow.maximize() })
    ipcMain.on(electronAPI.events.unmaximizeWindow, (e) => { mainWindow.unmaximize() })
    ipcMain.on(electronAPI.events.closeWindow, (e) => { mainWindow.close() })
}