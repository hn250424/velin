import IFileService from '@services/contracts/IFileService'
import { electronAPI } from '@shared/constants/electronAPI/electronAPI'
import { TabEditorDto, TabEditorsDto } from '@shared/dto/TabEditorDto'
import TreeDto from '@shared/dto/TreeDto'
import { BrowserWindow, ipcMain } from 'electron'

export default function registerFileHandlers(mainWindow: BrowserWindow, fileService: IFileService) {
    ipcMain.handle(electronAPI.events.rendererToMain.newTab, async () => {
        const id = await fileService.newTab()
        return {
            result: true,
            data: id
        }
    })

    ipcMain.handle(electronAPI.events.rendererToMain.openFile, async (e, filePath?: string) => {
        const data: TabEditorDto = await fileService.openFile(filePath)
        return {
            result: true,
            data: data
        }
    })

    ipcMain.handle(electronAPI.events.rendererToMain.openDirectory, async (e, treeDto?: TreeDto) => {
        const tree = await fileService.openDirectory(treeDto)
        return {
            result: true,
            data: tree
        }
    })

    ipcMain.handle(electronAPI.events.rendererToMain.save, async (e, data: TabEditorDto) => {
        const tabEditorData: TabEditorDto = await fileService.save(data, mainWindow)
        return {
            result: true,
            data: tabEditorData
        }
    })

    ipcMain.handle(electronAPI.events.rendererToMain.saveAs, async (e, data: TabEditorDto) => {
        const tabEditorData: TabEditorDto = await fileService.saveAs(data, mainWindow)
        return {
            result: true,
            data: tabEditorData
        }
    })

    ipcMain.handle(electronAPI.events.rendererToMain.saveAll, async (e, data: TabEditorsDto) => {
        const dataArr: TabEditorsDto = await fileService.saveAll(data, mainWindow)
        return {
            result: true,
            data: dataArr
        }
    })
}