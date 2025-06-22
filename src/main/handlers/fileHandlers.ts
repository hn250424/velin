import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import { electronAPI } from '@shared/constants/electronAPI'
import TabData from '../../shared/interface/TabData'
import FileManager from '../modules/core/FileManager'
import dialogService from '../modules/features/dialogService'
import TabSessionRepository from '../modules/features/TabSessionRepository'
import { newTab, open, save, saveAs, saveAll, closeTab } from '../services/fileService'
import { TAB_SESSION_PATH } from '../constants/file_info'

export default function registerFileHandlers(mainWindow: BrowserWindow) {
    ipcMain.handle(electronAPI.events.newTab, async () => {
        const userDataPath = app.getPath('userData')
        const tabSessionPath = path.join(userDataPath, TAB_SESSION_PATH)
        const fileManager = new FileManager()
        const tabSessionRepository = new TabSessionRepository(tabSessionPath, fileManager)
        const id = await newTab(tabSessionRepository)
        return {
            result: true,
            data: id
        }
    })

    ipcMain.handle(electronAPI.events.open, async () => {
        const userDataPath = app.getPath('userData')
        const tabSessionPath = path.join(userDataPath, TAB_SESSION_PATH)
        const fileManager = new FileManager()
        const tabSessionRepository = new TabSessionRepository(tabSessionPath, fileManager)
        return open(dialogService, fileManager, tabSessionRepository)
    })

    ipcMain.handle(electronAPI.events.save, async (event, data: TabData) => {
        const userDataPath = app.getPath('userData')
        const tabSessionPath = path.join(userDataPath, TAB_SESSION_PATH)
        const fileManager = new FileManager()
        const tabSessionRepository = new TabSessionRepository(tabSessionPath, fileManager)
        return save(data, mainWindow, dialogService, fileManager, tabSessionRepository)
    })

    ipcMain.handle(electronAPI.events.saveAs, async (e, data: TabData) => {
        const userDataPath = app.getPath('userData')
        const tabSessionPath = path.join(userDataPath, TAB_SESSION_PATH)
        const fileManager = new FileManager()
        const tabSessionRepository = new TabSessionRepository(tabSessionPath, fileManager)
        return saveAs(data, mainWindow, dialogService, fileManager, tabSessionRepository)
    })

    ipcMain.handle(electronAPI.events.saveAll, async (event, data: TabData[]) => {
        const userDataPath = app.getPath('userData')
        const tabSessionPath = path.join(userDataPath, TAB_SESSION_PATH)
        const fileManager = new FileManager()
        const tabSessionRepository = new TabSessionRepository(tabSessionPath, fileManager)
        return saveAll(data, mainWindow, dialogService, fileManager, tabSessionRepository)
    })

    ipcMain.handle(electronAPI.events.closeTab, async (e, data: TabData) => {
        const userDataPath = app.getPath('userData')
        const tabSessionPath = path.join(userDataPath, TAB_SESSION_PATH)
        const fileManager = new FileManager()
        const tabSessionRepository = new TabSessionRepository(tabSessionPath, fileManager)
        return closeTab(data, mainWindow, dialogService, fileManager, tabSessionRepository)
    })
}