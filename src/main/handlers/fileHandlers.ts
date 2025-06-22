import { BrowserWindow, ipcMain } from 'electron'

import { electronAPI } from '../../shared/constants/electronAPI'
import TabData from '../../shared/interface/TabData'
import FileManager from '../modules/core/FileManager'
import dialogService from '../modules/feature/dialogService'
import TabSessionRepository from '../modules/feature/TabSessionRepository'
import { newTab, open, save, saveAs, saveAll, closeTab } from '../services/fileService'

export default function registerFileHandlers(mainWindow: BrowserWindow) {
    ipcMain.handle(electronAPI.events.newTab, async () => {
        const fileManager = new FileManager()
        const tabSessionRepository = new TabSessionRepository(fileManager)
        const id = await newTab(tabSessionRepository)
        return {
            result: true,
            data: id
        }
    })

    ipcMain.handle(electronAPI.events.open, async () => {
        const fileManager = new FileManager()
        const tabSessionRepository = new TabSessionRepository(fileManager)
        return open(dialogService, fileManager, tabSessionRepository)
    })

    ipcMain.handle(electronAPI.events.save, async (event, data: TabData) => {
        const fileManager = new FileManager()
        const tabSessionRepository = new TabSessionRepository(fileManager)
        return save(data, mainWindow, dialogService, fileManager, tabSessionRepository)
    })

    ipcMain.handle(electronAPI.events.saveAs, async (e, data: TabData) => {
        const fileManager = new FileManager()
        const tabSessionRepository = new TabSessionRepository(fileManager)
        return saveAs(data, mainWindow, dialogService, fileManager, tabSessionRepository)
    })

    ipcMain.handle(electronAPI.events.saveAll, async (event, data: TabData[]) => {
        const fileManager = new FileManager()
        const tabSessionRepository = new TabSessionRepository(fileManager)
        return saveAll(data, mainWindow, dialogService, fileManager, tabSessionRepository)
    })

    ipcMain.handle(electronAPI.events.closeTab, async (e, data: TabData) => {
        const fileManager = new FileManager()
        const tabSessionRepository = new TabSessionRepository(fileManager)
        return closeTab(data, mainWindow, dialogService, fileManager, tabSessionRepository)
    })
}