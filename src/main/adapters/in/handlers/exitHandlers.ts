import IDialogService from '@contracts/out/IDialogService'
import IFileManager from '@contracts/out/IFileManager'
import ITabRepository from '@contracts/out/ITabRepository'
import exit from '@services/exitService'
import { electronAPI } from '@shared/constants/electronAPI'
import TabEditorDto from '@shared/dto/TabEditorDto'
import { BrowserWindow, ipcMain } from 'electron'
import DI_KEYS from '../../../constants/di_keys'
import diContainer from '../../../diContainer'
import TreeDto from '@shared/dto/TreeDto'
import ITreeRepository from '@contracts/out/ITreeRepository'

export default function registerExitHandlers(mainWindow: BrowserWindow) {
    ipcMain.handle(electronAPI.events.exit, async (e, tabSessionData: TabEditorDto[], treeSessionData: TreeDto) => {
        const fileManager = diContainer.get<IFileManager>(DI_KEYS.FileManager)
        const tabRepository = diContainer.get<ITabRepository>(DI_KEYS.TabRepository)
        const treeRepository = diContainer.get<ITreeRepository>(DI_KEYS.TreeReposotory)
        const dialogService = diContainer.get<IDialogService>(DI_KEYS.dialogService)
        await exit(mainWindow, fileManager, dialogService, tabRepository, treeRepository, tabSessionData, treeSessionData)
    })
}