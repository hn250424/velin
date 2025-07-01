import IFileService from '@services/contracts/IFileService'
import { electronAPI } from '@shared/constants/electronAPI'
import TabEditorDto from '@shared/dto/TabEditorDto'
import { BrowserWindow, ipcMain } from 'electron'
import DI_KEYS from '../constants/di_keys'
import diContainer from '../diContainer'
import TabSession from '../models/TabSession'
import IFileManager from '@contracts/IFileManager'
import ITabSessionRepository from '@contracts/ITabSessionRepository'
import IDialogService from '@contracts/IDialogService'
import exit from '@services/exitService'

export default function registerExitHandlers(mainWindow: BrowserWindow) {
    ipcMain.handle(electronAPI.events.exit, async (e, data: TabEditorDto[]) => {
        const fileManager = diContainer.get<IFileManager>(DI_KEYS.FileManager)
        const tabSessionRepository = diContainer.get<ITabSessionRepository>(DI_KEYS.TabSessionRepository)
        const dialogService = diContainer.get<IDialogService>(DI_KEYS.dialogService)
        await exit(data, mainWindow, fileManager, tabSessionRepository, dialogService)
    })
}