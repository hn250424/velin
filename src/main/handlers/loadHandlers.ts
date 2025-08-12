import { BrowserWindow, ipcMain } from 'electron'

import { electronAPI } from '@shared/constants/electronAPI/electronAPI'
import IFileManager from '@main/modules/contracts/IFileManager'
import ITabRepository from 'src/main/modules/contracts/ITabRepository'
import ITreeUtils from '@main/modules/contracts/ITreeUtils'
import ITreeRepository from 'src/main/modules/contracts/ITreeRepository'
import { loadedRenderer } from '../services/loadService'
import ITabUtils from '@main/modules/contracts/ITabUtils'
import IFileWatcher from '@main/modules/contracts/IFileWatcher'

export default function registerLoadHandlers(
    mainWindow: BrowserWindow,
    fileManager: IFileManager,
    fileWatcher: IFileWatcher,
    tabRepository: ITabRepository,
    treeRepository: ITreeRepository,
    tabUtils: ITabUtils,
    treeUtils: ITreeUtils
) {
    ipcMain.on(electronAPI.events.rendererToMain.loadedRenderer, async (e) => {
        loadedRenderer(mainWindow, fileManager, fileWatcher, tabRepository, treeRepository, tabUtils, treeUtils)
    })

    ipcMain.on(electronAPI.events.rendererToMain.showMainWindow, () => {
        mainWindow.show()
    })
}