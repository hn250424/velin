import { app, ipcMain, dialog, BrowserWindow } from 'electron'
import fs from 'fs'
import path from 'path'

import StateManager from '../modules/core/StateManager'
import { electronAPI } from '../../shared/constants/electronAPI'
import { TABS_SESSION } from '../constants/file_info'
import { log } from 'console'
import TabsData from '../../shared/interface/TabsData'
import { showConfirm } from '../utils/utils'

export default function registerMenuHandlers(mainWindow: BrowserWindow) {
    ipcMain.handle(electronAPI.events.open, async () => {
        const result = await dialog.showOpenDialog({
            title: 'Open',
            filters: [
                { name: 'Markdown', extensions: ['md', 'markdown'] }
            ],
            properties: ['openFile']
        })

        if (result.canceled || result.filePaths.length === 0) return

        const filePath = result.filePaths[0]
        const fileName = path.basename(filePath)
        const content = await fs.promises.readFile(filePath, 'utf-8')

        return { filePath: filePath, fileName: fileName, content: content }
    })

    ipcMain.handle(electronAPI.events.saveAll, async (event, data: TabsData[]) => {
        const userDataPath = app.getPath('userData')
        const tabsDataPath = path.join(userDataPath, TABS_SESSION)

        const sessionArr = []
        const responseArr = []

        for (const tab of data) {
            const { id, isModified, order, filePath, fileName, content } = tab

            if ((!filePath) && (!isModified)) {
                responseArr.push({ id: id, isSaved: false, filePath: '', fileName: '' })
            } else if ((!filePath) && isModified) {
                const result = await dialog.showSaveDialog(mainWindow, {
                    title: 'Save As',
                    defaultPath: fileName,
                    filters: [{ name: 'Markdown', extensions: ['md', 'markdown'] }]
                })

                if (result.canceled || !result.filePath) {
                    responseArr.push({ id: id, isSaved: false, filePath: filePath, fileName: path.basename(filePath) })
                } else {
                    await fs.promises.writeFile(result.filePath, content, 'utf-8')

                    responseArr.push({ id: id, isSaved: true, filePath: result.filePath, fileName: path.basename(result.filePath) })
                    sessionArr.push({ order: order, filePath: result.filePath })
                }
            } else if (filePath && (!isModified)) {
                responseArr.push({ id: id, isSaved: false, filePath: filePath, fileName: path.basename(filePath) })
                sessionArr.push({ order: order, filePath: filePath })
            } else if (filePath && isModified) {
                await fs.promises.writeFile(filePath, content, 'utf-8')
                responseArr.push({ id: id, isSaved: true, filePath: filePath, fileName: path.basename(filePath) })
                sessionArr.push({ order: order, filePath: filePath })
            }
        }

        try {
            fs.writeFileSync(tabsDataPath, JSON.stringify(sessionArr, null, 4), 'utf-8')
        } catch (err) {
            console.error('Failed to write tabsData.json:', err)
        }

        return responseArr
    })

    ipcMain.handle(electronAPI.events.confirm, async (e, message) => {
        return showConfirm(message)
    })
}