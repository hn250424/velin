import ITreeService from '@services/contracts/ITreeService'
import { electronAPI } from '@shared/constants/electronAPI'
import { BrowserWindow, ipcMain } from 'electron'

export default function registerTreeHandlers(mainWindow: BrowserWindow, treeService: ITreeService) {
    ipcMain.handle(electronAPI.events.renameTree, async (e, prePath: string, newPath: string) => {
        return await treeService.rename(prePath, newPath)
    })
}