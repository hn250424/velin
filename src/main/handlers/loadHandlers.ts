import { BrowserWindow, ipcMain } from 'electron'
import fs from 'fs'
import path from 'path'

import { electronAPI } from '../../shared/constants/electronAPI'
import TabSessionManager from '../modules/core/TabSessionManager'

export default function registerLoadHandlers(mainWindow: BrowserWindow) {
    ipcMain.on(electronAPI.events.loadedRenderer, async (e) => {
        const tabSessionManager = TabSessionManager.getInstance()
        const tabSessionArr = tabSessionManager.readTabSession()

        if (tabSessionArr.length === 0) {
            tabSessionArr.push({ id: 0, filePath: '' })
            tabSessionManager.writeTabSession(tabSessionArr)
            mainWindow.webContents.send(electronAPI.events.tabSession, tabSessionArr)
            return
        }

        let isChanged = false
        const arr = await Promise.all(
            tabSessionArr.map(async (data) => {
                const filePath = data.filePath ?? ''
                try {
                    if (!filePath) throw new Error('No file path')

                    await fs.promises.access(filePath, fs.constants.R_OK)
                    const fileName = path.basename(filePath)
                    const content = await fs.promises.readFile(data.filePath, 'utf-8')
                    return {
                        id: data.id,
                        isModified: false,
                        filePath: filePath,
                        fileName: fileName,
                        content: content,
                    }
                } catch (e) {
                    if (!isChanged) isChanged = true
                    return {
                        id: data.id,
                        isModified: false,
                        filePath: '',
                        fileName: '',
                        content: '',
                    }
                }
            })
        )

        if (isChanged) tabSessionManager.writeTabSession(arr)
        mainWindow.webContents.send(electronAPI.events.tabSession, arr)
    })

    ipcMain.on(electronAPI.events.showMainWindow, () => {
        mainWindow.show()
    })
}