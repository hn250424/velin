import { BrowserWindow, ipcMain } from 'electron'

import { electronAPI } from '@shared/constants/electronAPI'

export default function registerWindowHandlers(mainWindow: BrowserWindow) {
    ipcMain.on(electronAPI.events.requestMinimizeWindow, (e) => { mainWindow.minimize() })
    ipcMain.on(electronAPI.events.requestMaximizeWindow, (e) => { mainWindow.maximize() })
    ipcMain.on(electronAPI.events.requestUnmaximizeWindow, (e) => { mainWindow.unmaximize() })

    mainWindow.on('maximize', () => { mainWindow.webContents.send(electronAPI.events.onMaximizeWindow) })
    mainWindow.on('unmaximize', () => { mainWindow.webContents.send(electronAPI.events.onUnmaximizeWindow) })
}