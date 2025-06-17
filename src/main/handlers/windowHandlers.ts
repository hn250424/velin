import { app, ipcMain, dialog, BrowserWindow } from 'electron'
import fs from 'fs'
import path from 'path'

import { electronAPI } from '../../shared/constants/electronAPI'

export default function registerWindowHandlers(mainWindow: BrowserWindow) {
    ipcMain.on(electronAPI.events.minimize, (e) => { mainWindow.minimize() })
    ipcMain.on(electronAPI.events.maximize, (e) => { mainWindow.maximize() })
    ipcMain.on(electronAPI.events.unmaximize, (e) => { mainWindow.unmaximize() })
    ipcMain.on(electronAPI.events.close, (e) => { mainWindow.close() })
}