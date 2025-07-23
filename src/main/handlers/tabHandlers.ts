import { BrowserWindow, ipcMain } from 'electron'

import ITabService from '@services/contracts/ITabService'
import { electronAPI } from '@shared/constants/electronAPI'
import { TabEditorDto, TabEditorsDto } from '@shared/dto/TabEditorDto'

export default function registerTabHandlers(mainWindow: BrowserWindow, tabService: ITabService) {
    ipcMain.handle(electronAPI.events.closeTab, async (e, data: TabEditorDto) => {
        const result = await tabService.closeTab(data, mainWindow)
        return {
            result: result,
            data: undefined as void
        }
    })

    ipcMain.handle(electronAPI.events.closeTabsExcept, async (e, exceptData: TabEditorDto, allData: TabEditorsDto) => {
        const resultArr = await tabService.closeTabsExcept(exceptData, allData, mainWindow)
        return {
            result: true,
            data: resultArr
        }
    })

    ipcMain.handle(electronAPI.events.closeTabsToRight, async (e, referenceData: TabEditorDto, allData: TabEditorsDto) => {
        const resultArr = await tabService.closeTabsToRight(referenceData, allData, mainWindow)
        return {
            result: true,
            data: resultArr
        }
    })

    ipcMain.handle(electronAPI.events.closeAllTabs, async (e, data: TabEditorsDto) => {
        const resultArr = await tabService.closeAllTabs(data, mainWindow)
        return {
            result: true,
            data: resultArr
        }
    })

    ipcMain.handle(electronAPI.events.syncTabSessionFromRenderer, async (e, data: TabEditorsDto) => {
        return await tabService.syncTabSession(data)
    })
}