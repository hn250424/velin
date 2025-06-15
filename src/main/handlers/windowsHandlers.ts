import { app, ipcMain, dialog, BrowserWindow } from 'electron'
import fs from 'fs'
import path from 'path'

import StateManager from '../modules/core/StateManager'
import { electronAPI } from '../../shared/constants/electronAPI'

export default function registerWindowsHandlers(mainWindow: BrowserWindow) {
    ipcMain.on(electronAPI.events.minimize, (e) => { mainWindow.minimize() })
        
    ipcMain.on(electronAPI.events.maximize, (e) => {
        if (mainWindow.isMaximized()) mainWindow.unmaximize()
        else mainWindow.maximize()
    })

    ipcMain.on(electronAPI.events.close, (e) => { mainWindow.close() })
}