import { BrowserWindow, ipcMain } from 'electron'

import { electronAPI } from '@shared/constants/electronAPI'
import IFileManager from 'src/main/modules/contracts/IFileManager'
import ITabRepository from 'src/main/modules/contracts/ITabRepository'
import ITreeManager from 'src/main/modules/contracts/ITreeManager'
import ITreeRepository from 'src/main/modules/contracts/ITreeRepository'
import { loadedRenderer } from '../services/loadService'

export default function registerLoadHandlers(
    mainWindow: BrowserWindow,
    fileManager: IFileManager,
    tabRepository: ITabRepository,
    treeRepository: ITreeRepository,
    treeManager: ITreeManager
) {
    ipcMain.on(electronAPI.events.loadedRenderer, async (e) => {
        loadedRenderer(mainWindow, fileManager, tabRepository, treeRepository, treeManager)
    })

    ipcMain.on(electronAPI.events.showMainWindow, () => {
        mainWindow.show()
    })
}