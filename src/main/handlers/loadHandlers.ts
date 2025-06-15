import { app, ipcMain, dialog, BrowserWindow } from 'electron'
import fs from 'fs'
import path from 'path'

import StateManager from '../modules/core/StateManager'
import { electronAPI } from '../../shared/constants/electronAPI'

export default function registerLoadHandlers(mainWindow: BrowserWindow) {
    ipcMain.on(electronAPI.events.loadedRenderer, (e) => {
        const tab_session = path.join(app.getPath('userData'), 'tab_session.json')
        if (fs.existsSync(tab_session)) {
            const content = fs.readFileSync(tab_session, 'utf-8')
            if (content.trim().length === 0) {

            } else {

            }

            console.log('yes')
        } else {
            mainWindow.webContents.send(electronAPI.events.noTab)
        }
    })
}