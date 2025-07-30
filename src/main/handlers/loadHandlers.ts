import { BrowserWindow, ipcMain } from 'electron'

import { electronAPI } from '@shared/constants/electronAPI/electronAPI'
import IFileManager from 'src/main/modules/contracts/IFileManager'
import ITabRepository from 'src/main/modules/contracts/ITabRepository'
import ITreeManager from 'src/main/modules/contracts/ITreeManager'
import ITreeRepository from 'src/main/modules/contracts/ITreeRepository'
import { loadedRenderer } from '../services/loadService'
import ITabManager from '@main/modules/contracts/ITabManager'

export default function registerLoadHandlers(
    mainWindow: BrowserWindow,
    fileManager: IFileManager,
    tabRepository: ITabRepository,
    treeRepository: ITreeRepository,
    tabManager: ITabManager,
    treeManager: ITreeManager
) {
    ipcMain.on(electronAPI.events.rendererToMain.loadedRenderer, async (e) => {
        loadedRenderer(mainWindow, fileManager, tabRepository, treeRepository, tabManager, treeManager)
    })

    ipcMain.on(electronAPI.events.rendererToMain.showMainWindow, () => {
        mainWindow.show()
    })
}