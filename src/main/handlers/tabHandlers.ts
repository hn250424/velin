import { BrowserWindow, ipcMain } from 'electron'

import IFileManager from 'src/main/contracts/IFileManager'
import ITabSessionRepository from 'src/main/contracts/ITabSessionRepository'
import { electronAPI } from '@shared/constants/electronAPI'
import diContainer from '../diContainer'
import { loadedRenderer } from '../services/loadService'
import DI_KEYS from '../constants/di_keys'
import ITabService from '@services/contracts/ITabService'
import TabEditorDto from '@shared/dto/TabEditorDto'

export default function registerTabHandlers(mainWindow: BrowserWindow) {
    const tabService: ITabService = diContainer.get(DI_KEYS.TabService)

    ipcMain.handle(electronAPI.events.closeTab, async (e, data: TabEditorDto) => {
        const result = await tabService.closeTab(data, mainWindow)
        return {
            result: result,
            data: undefined as void
        }
    })

    ipcMain.handle(electronAPI.events.closeTabsExcept, async (e, exceptData: TabEditorDto, allData: TabEditorDto[]) => {
        const resultArr = await tabService.closeTabsExcept(exceptData, allData, mainWindow)
        return {
            result: true,
            data: resultArr
        }
    })

    ipcMain.handle(electronAPI.events.closeTabsToRight, async (e, referenceData: TabEditorDto, allData: TabEditorDto[]) => {
        const resultArr = await tabService.closeTabsToRight(referenceData, allData, mainWindow)
        return {
            result: true,
            data: resultArr
        }
    })

    ipcMain.handle(electronAPI.events.closeAllTabs, async (e, data: TabEditorDto[]) => {
        const resultArr = await tabService.closeAllTabs(data, mainWindow)
        return {
            result: true,
            data: resultArr
        }
    })
}