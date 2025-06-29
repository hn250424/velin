import IFileService from '@services/contracts/IFileService'
import { electronAPI } from '@shared/constants/electronAPI'
import TabData from '@shared/types/TabData'
import { BrowserWindow, ipcMain } from 'electron'
import DI_KEYS from '../constants/di_keys'
import diContainer from '../diContainer'

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
        const tabData: TabData = await fileService.openFile()
        return {
            result: true,
            data: tabData
        }
    })

    ipcMain.handle(electronAPI.events.openDirectory, async (e, dirPath?: string, indent?: number) => {
        const tree = await fileService.openDirectory(dirPath, indent)
        return {
            result: true,
            data: tree
        }
    })

    ipcMain.handle(electronAPI.events.save, async (e, data: TabData) => {
        const tabData: TabData = await fileService.save(data, mainWindow)
        return {
            result: true,
            data: tabData
        }
    })

    ipcMain.handle(electronAPI.events.saveAs, async (e, data: TabData) => {
        const tabData: TabData = await fileService.saveAs(data, mainWindow)
        return {
            result: true,
            data: tabData
        }
    })

    ipcMain.handle(electronAPI.events.saveAll, async (e, data: TabData[]) => {
        const tabDataArr: TabData[] = await fileService.saveAll(data, mainWindow)
        return {
            result: true,
            data: tabDataArr
        }
    })

    ipcMain.handle(electronAPI.events.closeTab, async (e, data: TabData) => {
        const result = await fileService.closeTab(data, mainWindow)
        return {
            result: result,
            data: undefined as void
        }
    })

    ipcMain.handle(electronAPI.events.closeTabsExcept, async (e, exceptData: TabData, allData: TabData[] ) => {
        const resultArr = await fileService.closeTabsExcept(exceptData, allData, mainWindow)
        return {
            result: true,
            data: resultArr
        }
    })

    ipcMain.handle(electronAPI.events.closeTabsToRight, async (e, referenceData: TabData, allData: TabData[] ) => {
        const resultArr = await fileService.closeTabsToRight(referenceData, allData, mainWindow)
        return {
            result: true,
            data: resultArr
        }
    })

    ipcMain.handle(electronAPI.events.closeAllTabs, async (e, data: TabData[]) => {
        const resultArr = await fileService.closeAllTabs(data, mainWindow)
        return {
            result: true,
            data: resultArr
        }
    })
}