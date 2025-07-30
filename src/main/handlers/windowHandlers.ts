import { BrowserWindow, ipcMain } from 'electron'

import { electronAPI } from '@shared/constants/electronAPI/electronAPI'

export default function registerWindowHandlers(mainWindow: BrowserWindow) {
    ipcMain.on(electronAPI.events.rendererToMain.requestMinimizeWindow, (e) => { mainWindow.minimize() })
    ipcMain.on(electronAPI.events.rendererToMain.requestMaximizeWindow, (e) => { mainWindow.maximize() })
    ipcMain.on(electronAPI.events.rendererToMain.requestUnmaximizeWindow, (e) => { mainWindow.unmaximize() })

    mainWindow.on('maximize', () => { mainWindow.webContents.send(electronAPI.events.mainToRenderer.onMaximizeWindow) })
    mainWindow.on('unmaximize', () => { mainWindow.webContents.send(electronAPI.events.mainToRenderer.onUnmaximizeWindow) })
}