import { BrowserWindow, ipcMain } from 'electron'

import { electronAPI } from '@shared/constants/electronAPI/electronAPI'
import IWindowRepository from '@main/modules/contracts/IWindowRepository'
import { syncWindowBoundSession, syncWindowMaximizeSession } from '../actions/windowActions'

export default function registerWindowHandlers(mainWindow: BrowserWindow, windowRepository: IWindowRepository) {
    ipcMain.on(electronAPI.events.rendererToMain.requestMinimizeWindow, (e) => { mainWindow.minimize() })
    ipcMain.on(electronAPI.events.rendererToMain.requestMaximizeWindow, (e) => { 
        mainWindow.maximize() 
        syncWindowMaximizeSession(mainWindow, windowRepository)
    })
    ipcMain.on(electronAPI.events.rendererToMain.requestUnmaximizeWindow, (e) => { 
        mainWindow.unmaximize() 
        syncWindowMaximizeSession(mainWindow, windowRepository)
    })

    mainWindow.on('maximize', () => { mainWindow.webContents.send(electronAPI.events.mainToRenderer.onMaximizeWindow) })
    mainWindow.on('unmaximize', () => { mainWindow.webContents.send(electronAPI.events.mainToRenderer.onUnmaximizeWindow) })
    mainWindow.on('resized', () => { syncWindowBoundSession(mainWindow, windowRepository) })
    mainWindow.on('moved', () => { syncWindowBoundSession(mainWindow, windowRepository) })
}