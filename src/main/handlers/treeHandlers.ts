import { electronAPI } from '@shared/constants/electronAPI/electronAPI'
import { BrowserWindow, ipcMain } from 'electron'
import TreeDto from '@shared/dto/TreeDto'
import TrashMap from '@shared/types/TrashMap'
import ClipboardMode from '@shared/types/ClipboardMode'
import TreeService from '@main/services/TreeService'

export default function registerTreeHandlers(mainWindow: BrowserWindow, treeService: TreeService) {
    ipcMain.handle(electronAPI.events.rendererToMain.rename, async (e, prePath: string, newPath: string) => {
        return await treeService.rename(prePath, newPath)
    })

    ipcMain.handle(electronAPI.events.rendererToMain.copyTree, async (e, src: string, dest: string) => {
        return await treeService.copy(src, dest)
    })

    ipcMain.handle(electronAPI.events.rendererToMain.pasteTree, async (e, targetDto: TreeDto, selectedDtos: TreeDto[], clipboardMode: ClipboardMode) => {
        return await treeService.paste(targetDto, selectedDtos, clipboardMode)
    })

    ipcMain.handle(electronAPI.events.rendererToMain.delete, async (e, arr: string[]) => {
        const trashMap = await treeService.delete(arr)
        return {
            result: trashMap ? true : false,
            data: trashMap
        }
    })

    ipcMain.handle(electronAPI.events.rendererToMain.undo_delete, async (e, trashMap: TrashMap[] | null) => {
        return await treeService.undo_delete(trashMap)
    })

    ipcMain.handle(electronAPI.events.rendererToMain.deletePermanently, async (e, path: string) => {
        return await treeService.deletePermanently(path)
    })

    ipcMain.handle(electronAPI.events.rendererToMain.create, async (e, path: string, directory: boolean) => {
        return await treeService.create(path, directory)
    })

    ipcMain.handle(electronAPI.events.rendererToMain.syncTreeSessionFromRenderer, async (e, dto: TreeDto) => {
        return await treeService.syncTreeSessionFromRenderer(dto)
    })

    ipcMain.handle(electronAPI.events.rendererToMain.getSyncedTreeSession, async () => {
        return await treeService.getSyncedTreeSession()
    })
}