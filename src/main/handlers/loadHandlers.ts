import { BrowserWindow, ipcMain } from 'electron'

import IFileManager from 'src/main/contracts/IFileManager'
import ITabSessionRepository from 'src/main/contracts/ITabSessionRepository'
import { electronAPI } from '@shared/constants/electronAPI'
import diContainer from '../diContainer'
import { loadedRenderer } from '../services/loadService'
import DI_KEYS from '../constants/di_keys'

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