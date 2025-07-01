import { BrowserWindow, ipcMain } from 'electron'

import IFileManager from '@contracts/out/IFileManager'
import ITabSessionRepository from '@contracts/out/ITabSessionRepository'
import { electronAPI } from '@shared/constants/electronAPI'
import diContainer from '../../../diContainer'
import { loadedRenderer } from '../../../services/loadService'
import DI_KEYS from '../../../constants/di_keys'

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