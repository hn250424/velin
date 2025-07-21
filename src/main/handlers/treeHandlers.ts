import ITreeService from '@services/contracts/ITreeService'
import { electronAPI } from '@shared/constants/electronAPI'
import { BrowserWindow, ipcMain } from 'electron'
import TreeDto from '@shared/dto/TreeDto'
import TrashMap from '@shared/types/TrashMap'

export default function registerTreeHandlers(mainWindow: BrowserWindow, treeService: ITreeService) {
    ipcMain.handle(electronAPI.events.renameTree, async (e, prePath: string, newPath: string) => {
        return await treeService.rename(prePath, newPath)
    })

    ipcMain.handle(electronAPI.events.delete, async (e, arr: string[]) => {
        const trashMap = await treeService.delete(arr)
        return {
            result: trashMap ? true : false,
            data: trashMap
        }
    })

    ipcMain.handle(electronAPI.events.undo_delete, async (e, trashMap: TrashMap[] | null) => {
        return await treeService.undo_delete(trashMap)
    })

    ipcMain.handle(electronAPI.events.syncTreeSession, async (e, dto: TreeDto) => {
        return await treeService.syncTreeSession(dto)
    })

    ipcMain.handle(electronAPI.events.requestTreeSession, async () => {
        return await treeService.requestTreeSession()
    })
}