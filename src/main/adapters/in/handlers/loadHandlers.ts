import { BrowserWindow, ipcMain } from 'electron'

import IFileManager from '@contracts/out/IFileManager'
import ITabSessionRepository from '@contracts/out/ITabSessionRepository'
import { electronAPI } from '@shared/constants/electronAPI'
import diContainer from '../../../diContainer'
import { loadedRenderer } from '../../../services/loadService'
import DI_KEYS from '../../../constants/di_keys'
import ITreeRepository from '@contracts/out/ITreeRepository'

export default function registerLoadHandlers(mainWindow: BrowserWindow) {
    ipcMain.on(electronAPI.events.loadedRenderer, async (e) => {
        const fileManager = diContainer.get<IFileManager>(DI_KEYS.FileManager)
        const tabSessionRepository = diContainer.get<ITabSessionRepository>(DI_KEYS.TabSessionRepository)
        const treeSessionRepository = diContainer.get<ITreeRepository>(DI_KEYS.TreeReposotory)
        loadedRenderer(mainWindow, fileManager, tabSessionRepository, treeSessionRepository)
    })

    ipcMain.on(electronAPI.events.showMainWindow, () => {
        mainWindow.show()
    })
}