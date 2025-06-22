import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'

import { electronAPI } from '../../shared/constants/electronAPI'
import { TAB_SESSION_PATH } from '../constants/file_info'
import FileManager from '../modules/core/FileManager'
import TabSessionRepository from '../modules/feature/TabSessionRepository'
import { loadedRenderer } from '../services/loadService'

export default function registerLoadHandlers(mainWindow: BrowserWindow) {
    ipcMain.on(electronAPI.events.loadedRenderer, async (e) => {
        const userDataPath = app.getPath('userData')
        const tabSessionPath = path.join(userDataPath, TAB_SESSION_PATH)
        const fileManager = new FileManager()
        const tabSessionRepository = new TabSessionRepository(fileManager)
        loadedRenderer(mainWindow, tabSessionPath, fileManager, tabSessionRepository)
    })

    ipcMain.on(electronAPI.events.showMainWindow, () => {
        mainWindow.show()
    })
}