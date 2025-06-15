import { app, ipcMain, dialog, BrowserWindow } from 'electron'
import fs from 'fs'
import path from 'path'

import StateManager from '../modules/core/StateManager'
import { electronAPI } from '../../shared/constants/electronAPI'
import { TABS_SESSION } from '../constants/file_info'
import { log } from 'console'

export default function registerLoadHandlers(mainWindow: BrowserWindow) {
    ipcMain.on(electronAPI.events.loadedRenderer, async (e) => {
        const tabs_session = path.join(app.getPath('userData'), TABS_SESSION)

        if (! fs.existsSync(tabs_session)) {
            mainWindow.webContents.send(electronAPI.events.tabSession, [])
            return
        }

        try {
            const jsonTabSession = fs.readFileSync(tabs_session, 'utf-8')
            let objTabSession: { order: number, filePath: string }[] = JSON.parse(jsonTabSession)
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