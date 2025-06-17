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

        try {
            const arr = await Promise.all(
                tabSessionArr.map(async (data) => {
                    const filePath = data.filePath ? data.filePath : ''
                    const fileName = filePath ? path.basename(filePath) : ''
                    const content = filePath ? await fs.promises.readFile(data.filePath, 'utf-8') : ''
                    return {
                        id: data.id,
                        isModified: false,
                        filePath: filePath,
                        fileName: fileName,
                        content: content,
                    }
                })
            )

            mainWindow.webContents.send(electronAPI.events.tabSession, arr)
        } catch (e) {
            console.log(e)
        }
    })

    ipcMain.on(electronAPI.events.showMainWindow, () => {
        mainWindow.show()
    })
}