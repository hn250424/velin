import { BrowserWindow, ipcMain } from 'electron'

import IFileManager from '@services/ports/IFileManager'
import ITabSessionRepository from '@services/ports/ITabSessionRepository'
import { electronAPI } from '@shared/constants/electronAPI'
import diContainer from '../diContainer'
import { loadedRenderer } from '../services/loadService'
import DI_KEYS from '../types/di_keys'

export default function registerLoadHandlers(mainWindow: BrowserWindow) {
    ipcMain.on(electronAPI.events.loadedRenderer, async (e) => {
        const fileManager = diContainer.get<IFileManager>(DI_KEYS.FileManager)
        const tabSessionRepository = diContainer.get<ITabSessionRepository>(DI_KEYS.TabSessionRepository)
        loadedRenderer(mainWindow, fileManager, tabSessionRepository)
    })

    ipcMain.on(electronAPI.events.showMainWindow, () => {
        mainWindow.show()
    })
}