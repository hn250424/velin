import { BrowserWindow, ipcMain } from 'electron'

import ITabService from '@contracts/in/ITabService'
import { electronAPI } from '@shared/constants/electronAPI'
import TabEditorDto from '@shared/dto/TabEditorDto'
import DI_KEYS from '../../../constants/di_keys'
import diContainer from '../../../diContainer'

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