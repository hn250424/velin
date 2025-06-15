import { app, ipcMain, dialog, BrowserWindow } from 'electron'
import fs from 'fs'
import path from 'path'

import StateManager from '../modules/core/StateManager'
import { electronAPI } from '../../shared/constants/electronAPI'
import { TAB_SESSION_PATH } from '../constants/file_info'
import SavedTabSession from '../interface/SavedTabSession'
import { log } from 'console'

export default function registerLoadHandlers(mainWindow: BrowserWindow) {
    ipcMain.on(electronAPI.events.loadedRenderer, async (e) => {
        const tabSessionPath = path.join(app.getPath('userData'), TAB_SESSION_PATH)

        if (! fs.existsSync(tabSessionPath)) {
            mainWindow.webContents.send(electronAPI.events.tabSession, [])
            return
        }

        try {
            const jsonTabSession = fs.readFileSync(tabSessionPath, 'utf-8')
            let objTabSession: SavedTabSession[] = JSON.parse(jsonTabSession)
            objTabSession = objTabSession.sort((a, b) => a.order - b.order)

            const arr = await Promise.all(
                objTabSession.map(async (data) => {
                    const content = await fs.promises.readFile(data.filePath, 'utf-8')
                    return {
                        filePath: data.filePath,
                        fileName: path.basename(data.filePath),
                        content,
                    }
                })
            )

            mainWindow.webContents.send(electronAPI.events.tabSession, arr)
        } catch (e) {
            mainWindow.webContents.send(electronAPI.events.tabSession, [])
        }
    })
}