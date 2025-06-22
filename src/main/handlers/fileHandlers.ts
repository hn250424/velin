import IFileManager from '@services/ports/IFileManager'
import ITabSessionRepository from '@services/ports/ITabSessionRepository'
import { electronAPI } from '@shared/constants/electronAPI'
import TabData from '@shared/interface/TabData'
import { BrowserWindow, ipcMain } from 'electron'
import diContainer from '../diContainer'
import dialogService from '../modules/features/dialogService'
import { closeTab, newTab, open, save, saveAll, saveAs } from '../services/fileService'
import DI_KEYS from '../types/di_keys'

export default function registerFileHandlers(mainWindow: BrowserWindow) {
    ipcMain.handle(electronAPI.events.newTab, async () => {
        const fileManager = diContainer.get<IFileManager>(DI_KEYS.FileManager)
        const tabSessionRepository = diContainer.get<ITabSessionRepository>(DI_KEYS.TabSessionRepository)
        const id = await newTab(tabSessionRepository)
        return {
            result: true,
            data: id
        }
    })

    ipcMain.handle(electronAPI.events.open, async () => {
        const fileManager = diContainer.get<IFileManager>(DI_KEYS.FileManager)
        const tabSessionRepository = diContainer.get<ITabSessionRepository>(DI_KEYS.TabSessionRepository)
        return open(dialogService, fileManager, tabSessionRepository)
    })

    ipcMain.handle(electronAPI.events.save, async (event, data: TabData) => {
        const fileManager = diContainer.get<IFileManager>(DI_KEYS.FileManager)
        const tabSessionRepository = diContainer.get<ITabSessionRepository>(DI_KEYS.TabSessionRepository)
        return save(data, mainWindow, dialogService, fileManager, tabSessionRepository)
    })

    ipcMain.handle(electronAPI.events.saveAs, async (e, data: TabData) => {
        const fileManager = diContainer.get<IFileManager>(DI_KEYS.FileManager)
        const tabSessionRepository = diContainer.get<ITabSessionRepository>(DI_KEYS.TabSessionRepository)
        return saveAs(data, mainWindow, dialogService, fileManager, tabSessionRepository)
    })

    ipcMain.handle(electronAPI.events.saveAll, async (event, data: TabData[]) => {
        const fileManager = diContainer.get<IFileManager>(DI_KEYS.FileManager)
        const tabSessionRepository = diContainer.get<ITabSessionRepository>(DI_KEYS.TabSessionRepository)
        return saveAll(data, mainWindow, dialogService, fileManager, tabSessionRepository)
    })

    ipcMain.handle(electronAPI.events.closeTab, async (e, data: TabData) => {
        const fileManager = diContainer.get<IFileManager>(DI_KEYS.FileManager)
        const tabSessionRepository = diContainer.get<ITabSessionRepository>(DI_KEYS.TabSessionRepository)
        return closeTab(data, mainWindow, dialogService, fileManager, tabSessionRepository)
    })
}