import IDialogService from 'src/main/modules/contracts/IDialogService'
import IFileManager from 'src/main/modules/contracts/IFileManager'
import ITabRepository from 'src/main/modules/contracts/ITabRepository'
import exit from '@services/exitService'
import { electronAPI } from '@shared/constants/electronAPI'
import { TabEditorDto, TabEditorsDto } from '@shared/dto/TabEditorDto'
import { BrowserWindow, ipcMain } from 'electron'
import DI_KEYS from '../constants/di_keys'
import diContainer from '../diContainer'
import TreeDto from '@shared/dto/TreeDto'
import ITreeRepository from 'src/main/modules/contracts/ITreeRepository'

export default function registerExitHandlers(mainWindow: BrowserWindow) {
    ipcMain.handle(electronAPI.events.exit, async (e, tabSessionData: TabEditorsDto, treeSessionData: TreeDto) => {
        const fileManager = diContainer.get<IFileManager>(DI_KEYS.FileManager)
        const tabRepository = diContainer.get<ITabRepository>(DI_KEYS.TabRepository)
        const treeRepository = diContainer.get<ITreeRepository>(DI_KEYS.TreeReposotory)
        const dialogService = diContainer.get<IDialogService>(DI_KEYS.dialogService)
        await exit(mainWindow, fileManager, dialogService, tabRepository, treeRepository, tabSessionData, treeSessionData)
    })
}