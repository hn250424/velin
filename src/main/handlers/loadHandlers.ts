import { BrowserWindow, ipcMain } from 'electron'

import IFileManager from 'src/main/modules/contracts/IFileManager'
import ITabRepository from 'src/main/modules/contracts/ITabRepository'
import { electronAPI } from '@shared/constants/electronAPI'
import diContainer from '../diContainer'
import { loadedRenderer } from '../services/loadService'
import DI_KEYS from '../constants/di_keys'
import ITreeRepository from 'src/main/modules/contracts/ITreeRepository'
import ITreeManager from 'src/main/modules/contracts/ITreeManager'

export default function registerLoadHandlers(mainWindow: BrowserWindow) {
    ipcMain.on(electronAPI.events.loadedRenderer, async (e) => {
        const fileManager = diContainer.get<IFileManager>(DI_KEYS.FileManager)
        const tabRepository = diContainer.get<ITabRepository>(DI_KEYS.TabRepository)
        const treeRepository = diContainer.get<ITreeRepository>(DI_KEYS.TreeReposotory)
        const treeManager = diContainer.get<ITreeManager>(DI_KEYS.TreeManager)
        loadedRenderer(mainWindow, fileManager, tabRepository, treeRepository, treeManager)
    })

    ipcMain.on(electronAPI.events.showMainWindow, () => {
        mainWindow.show()
    })
}