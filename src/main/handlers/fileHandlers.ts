import IFileService from '@services/contracts/IFileService'
import { electronAPI } from '@shared/constants/electronAPI'
import TabData from '@shared/types/TabData'
import { BrowserWindow, ipcMain } from 'electron'
import DI_KEYS from '../constants/di_keys'
import diContainer from '../diContainer'

export default function registerFileHandlers(mainWindow: BrowserWindow) {
    const fileService: IFileService = diContainer.get(DI_KEYS.FileService)

    ipcMain.handle(electronAPI.events.newTab, async () => {
        return await fileService.newTab()
    })

    ipcMain.handle(electronAPI.events.open, async () => {
        return fileService.open()
    })

    ipcMain.handle(electronAPI.events.save, async (event, data: TabData) => {
        return fileService.save(data, mainWindow)
    })

    ipcMain.handle(electronAPI.events.saveAs, async (e, data: TabData) => {
        return fileService.saveAs(data, mainWindow)
    })

    ipcMain.handle(electronAPI.events.saveAll, async (event, data: TabData[]) => {
        return fileService.saveAll(data, mainWindow)
    })

    ipcMain.handle(electronAPI.events.closeTab, async (e, data: TabData) => {
        return fileService.closeTab(data, mainWindow)
    })
}