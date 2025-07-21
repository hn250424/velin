import ITreeService from '@services/contracts/ITreeService'
import { electronAPI } from '@shared/constants/electronAPI'
import { BrowserWindow, ipcMain } from 'electron'
import TreeDto from '@shared/dto/TreeDto'

export default function registerTreeHandlers(mainWindow: BrowserWindow, treeService: ITreeService) {
    ipcMain.handle(electronAPI.events.renameTree, async (e, prePath: string, newPath: string) => {
        return await treeService.rename(prePath, newPath)
    })

    ipcMain.handle(electronAPI.events.delete, async (e, arr: string[]) => {
        return await treeService.delete(arr)
    })

    ipcMain.handle(electronAPI.events.syncTreeSession, async (e, dto: TreeDto) => {
        return await treeService.syncTreeSession(dto)
    })
}