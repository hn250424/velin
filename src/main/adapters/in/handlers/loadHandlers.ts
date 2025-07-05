import { BrowserWindow, ipcMain } from 'electron'

import IFileManager from '@contracts/out/IFileManager'
import ITabRepository from '@contracts/out/ITabRepository'
import { electronAPI } from '@shared/constants/electronAPI'
import diContainer from '../../../diContainer'
import { loadedRenderer } from '../../../services/loadService'
import DI_KEYS from '../../../constants/di_keys'
import ITreeRepository from '@contracts/out/ITreeRepository'
import ITreeManager from '@contracts/out/ITreeManager'

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