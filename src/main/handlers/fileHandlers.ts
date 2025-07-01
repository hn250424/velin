import IFileService from '@services/contracts/IFileService'
import { electronAPI } from '@shared/constants/electronAPI'
import TabEditorDto from '@shared/dto/TabEditorDto'
import { BrowserWindow, ipcMain } from 'electron'
import DI_KEYS from '../constants/di_keys'
import diContainer from '../diContainer'
import TreeNode from '@shared/types/TreeNode'

export default function registerFileHandlers(mainWindow: BrowserWindow) {
    const fileService: IFileService = diContainer.get(DI_KEYS.FileService)

    ipcMain.handle(electronAPI.events.newTab, async () => {
        const id = await fileService.newTab()
        return {
            result: true,
            data: id
        }
    })

    ipcMain.handle(electronAPI.events.openFile, async () => {
        const data: TabEditorDto = await fileService.openFile()
        return {
            result: true,
            data: data
        }
    })

    ipcMain.handle(electronAPI.events.openDirectory, async (e, treeNode?: TreeNode) => {
        const tree = await fileService.openDirectory(treeNode)
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