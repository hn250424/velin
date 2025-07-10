import IFileService from '@contracts/in/IFileService'
import { electronAPI } from '@shared/constants/electronAPI'
import TabEditorDto from '@shared/dto/TabEditorDto'
import { BrowserWindow, ipcMain } from 'electron'
import DI_KEYS from '../../../constants/di_keys'
import diContainer from '../../../diContainer'
import TreeDto from '@shared/dto/TreeDto'

export default function registerFileHandlers(mainWindow: BrowserWindow) {
    const fileService: IFileService = diContainer.get(DI_KEYS.FileService)

    ipcMain.handle(electronAPI.events.newTab, async () => {
        const id = await fileService.newTab()
        return {
            result: true,
            data: id
        }
    })

    ipcMain.handle(electronAPI.events.openFile, async (e, filePath?: string) => {
        const data: TabEditorDto = await fileService.openFile(filePath)
        return {
            result: true,
            data: data
        }
    })

    ipcMain.handle(electronAPI.events.openDirectory, async (e, treeDto?: TreeDto) => {
        const tree = await fileService.openDirectory(treeDto)
        return {
            result: true,
            data: tree
        }
    })

    ipcMain.handle(electronAPI.events.save, async (e, data: TabEditorDto) => {
        const tabEditorData: TabEditorDto = await fileService.save(data, mainWindow)
        return {
            result: true,
            data: tabEditorData
        }
    })

    ipcMain.handle(electronAPI.events.saveAs, async (e, data: TabEditorDto) => {
        const tabEditorData: TabEditorDto = await fileService.saveAs(data, mainWindow)
        return {
            result: true,
            data: tabEditorData
        }
    })

    ipcMain.handle(electronAPI.events.saveAll, async (e, data: TabEditorDto[]) => {
        const dataArr: TabEditorDto[] = await fileService.saveAll(data, mainWindow)
        return {
            result: true,
            data: dataArr
        }
    })
}