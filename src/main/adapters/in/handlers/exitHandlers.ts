import IDialogService from '@contracts/out/IDialogService'
import IFileManager from '@contracts/out/IFileManager'
import ITabSessionRepository from '@contracts/out/ITabSessionRepository'
import exit from '@services/exitService'
import { electronAPI } from '@shared/constants/electronAPI'
import TabEditorDto from '@shared/dto/TabEditorDto'
import { BrowserWindow, ipcMain } from 'electron'
import DI_KEYS from '../../../constants/di_keys'
import diContainer from '../../../diContainer'

export default function registerExitHandlers(mainWindow: BrowserWindow) {
    ipcMain.handle(electronAPI.events.exit, async (e, data: TabEditorDto[]) => {
        const fileManager = diContainer.get<IFileManager>(DI_KEYS.FileManager)
        const tabSessionRepository = diContainer.get<ITabSessionRepository>(DI_KEYS.TabSessionRepository)
        const dialogService = diContainer.get<IDialogService>(DI_KEYS.dialogService)
        await exit(data, mainWindow, fileManager, tabSessionRepository, dialogService)
    })
}