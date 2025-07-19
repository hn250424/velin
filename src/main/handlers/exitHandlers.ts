import exit from '@services/exitService'
import { electronAPI } from '@shared/constants/electronAPI'
import { TabEditorsDto } from '@shared/dto/TabEditorDto'
import TreeDto from '@shared/dto/TreeDto'
import { BrowserWindow, ipcMain } from 'electron'
import IDialogService from 'src/main/modules/contracts/IDialogService'
import IFileManager from 'src/main/modules/contracts/IFileManager'
import ITabRepository from 'src/main/modules/contracts/ITabRepository'
import ITreeRepository from 'src/main/modules/contracts/ITreeRepository'

export default function registerExitHandlers(
    mainWindow: BrowserWindow,
    fileManager: IFileManager,
    dialogService: IDialogService,
    tabRepository: ITabRepository,
    treeRepository: ITreeRepository,
) {
    ipcMain.handle(electronAPI.events.exit, async (e, tabSessionData: TabEditorsDto, treeSessionData: TreeDto) => {
        await exit(mainWindow, fileManager, dialogService, tabRepository, treeRepository, tabSessionData, treeSessionData)
    })
}