import ITreeService from '@services/contracts/ITreeService'
import { electronAPI } from '@shared/constants/electronAPI'
import { BrowserWindow, ipcMain } from 'electron'
import TreeDto from '@shared/dto/TreeDto'
import TrashMap from '@shared/types/TrashMap'
import ClipboardMode from '@shared/types/ClipboardMode'

export default function registerTreeHandlers(mainWindow: BrowserWindow, treeService: ITreeService) {
    ipcMain.handle(electronAPI.events.rename, async (e, prePath: string, newPath: string) => {
        return await treeService.rename(prePath, newPath)
    })

    ipcMain.handle(electronAPI.events.copyTree, async (e, src: string, dest: string) => {
        return await treeService.copy(src, dest)
    })

    ipcMain.handle(electronAPI.events.pasteTree, async (e, targetDto: TreeDto, selectedDtos: TreeDto[], clipboardMode: ClipboardMode) => {
        return await treeService.paste(targetDto, selectedDtos, clipboardMode)
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

    ipcMain.handle(electronAPI.events.deletePermanently, async (e, path: string) => {
        return await treeService.deletePermanently(path)
    })

    ipcMain.handle(electronAPI.events.syncTreeSessionFromRenderer, async (e, dto: TreeDto) => {
        return await treeService.syncTreeSessionFromRenderer(dto)
    })

    ipcMain.handle(electronAPI.events.getSyncedTreeSession, async () => {
        return await treeService.getSyncedTreeSession()
    })
}