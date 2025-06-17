import { app, ipcMain, dialog, BrowserWindow } from 'electron'
import fs from 'fs'
import path from 'path'

import { electronAPI } from '../../shared/constants/electronAPI'
import { TAB_SESSION_PATH } from '../constants/file_info'
import { log } from 'console'
import TabData from '../../shared/interface/TabData'
import { showConfirm } from '../utils/utils'
import TabSession from '../interface/TabSession'

export default function registerMenuHandlers(mainWindow: BrowserWindow) {
    ipcMain.handle(electronAPI.events.open, async () => {
        const result = await dialog.showOpenDialog({
            title: 'Open',
            filters: [
                { name: 'Markdown', extensions: ['md', 'markdown'] }
            ],
            properties: ['openFile']
        })

        if (result.canceled || result.filePaths.length === 0) return null

        const filePath = result.filePaths[0]
        const fileName = path.basename(filePath)
        const content = await fs.promises.readFile(filePath, 'utf-8')

        return { filePath: filePath, fileName: fileName, content: content }
    })

    ipcMain.handle(electronAPI.events.save, async (event, tab: TabData) => {
        const { id, isModified, filePath, fileName, content } = tab

        if (!filePath) {
            const result = await dialog.showSaveDialog(mainWindow, {
                title: 'Save As',
                defaultPath: fileName,
                filters: [{ name: 'Markdown', extensions: ['md', 'markdown'] }]
            })

            if (result.canceled || !result.filePath) {
                return { id: id, isSaved: false, filePath: filePath, fileName: fileName }
            } else {
                await fs.promises.writeFile(result.filePath, content, 'utf-8')

                const tabsSessionPath = path.join(app.getPath('userData'), TAB_SESSION_PATH)
                const jsonTabSession = fs.readFileSync(tabsSessionPath, 'utf-8')
                let objTabSession: TabSession[] = JSON.parse(jsonTabSession)
                objTabSession.push({ id: id, filePath: result.filePath })
                // objTabSession = objTabSession.sort((a, b) => a.order - b.order)

                fs.writeFileSync(tabsSessionPath, JSON.stringify(objTabSession, null, 4), 'utf-8')

                return { id: id, isSaved: true, filePath: result.filePath, fileName: path.basename(result.filePath) }
            }
        } else {
            await fs.promises.writeFile(filePath, content, 'utf-8')
            return { id: id, isSaved: true, filePath: filePath, fileName: path.basename(filePath) }
        }
    })

    ipcMain.handle(electronAPI.events.saveAs, async (e, data: TabData) => {
        const { id, isModified, filePath, fileName, content } = data

        const result = await dialog.showSaveDialog(mainWindow, {
            title: 'Save As',
            defaultPath: fileName,
            filters: [{ name: 'Markdown', extensions: ['md', 'markdown'] }]
        })

        if (result.canceled || !result.filePath) {
            return { id: id, isSaved: false, filePath: filePath, fileName: fileName }
        } else {
            await fs.promises.writeFile(result.filePath, content, 'utf-8')

            const tabsSessionPath = path.join(app.getPath('userData'), TAB_SESSION_PATH)
            const jsonTabSession = fs.readFileSync(tabsSessionPath, 'utf-8')
            const objTabSession: TabSession[] = JSON.parse(jsonTabSession)
            objTabSession.push({ id: objTabSession[objTabSession.length - 1].id + 1, filePath: result.filePath })

            const userDataPath = app.getPath('userData')
            const tabsDataPath = path.join(userDataPath, TAB_SESSION_PATH)
            fs.writeFileSync(tabsDataPath, JSON.stringify(objTabSession, null, 4), 'utf-8')

            return { id: id, isSaved: true, filePath: result.filePath, fileName: path.basename(result.filePath) }
        }
    })

    ipcMain.handle(electronAPI.events.saveAll, async (event, data: TabData[]) => {
        const userDataPath = app.getPath('userData')
        const tabsDataPath = path.join(userDataPath, TAB_SESSION_PATH)

        const sessionArr = []
        const responseArr = []

        for (const tab of data) {
            const { id, isModified, filePath, fileName, content } = tab

            if ((!filePath) && (!isModified)) {
                responseArr.push({ id: id, isSaved: false, filePath: filePath, fileName: fileName })
            } else if ((!filePath) && isModified) {
                const result = await dialog.showSaveDialog(mainWindow, {
                    title: 'Save As',
                    defaultPath: fileName,
                    filters: [{ name: 'Markdown', extensions: ['md', 'markdown'] }]
                })

                if (result.canceled || !result.filePath) {
                    responseArr.push({ id: id, isSaved: false, filePath: filePath, fileName: fileName })
                } else {
                    await fs.promises.writeFile(result.filePath, content, 'utf-8')

                    responseArr.push({ id: id, isSaved: true, filePath: result.filePath, fileName: path.basename(result.filePath) })
                    sessionArr.push({ id: id, filePath: result.filePath })
                }
            } else if (filePath && (!isModified)) {
                responseArr.push({ id: id, isSaved: false, filePath: filePath, fileName: path.basename(filePath) })
                sessionArr.push({ id: id, filePath: filePath })
            } else if (filePath && isModified) {
                await fs.promises.writeFile(filePath, content, 'utf-8')
                responseArr.push({ id: id, isSaved: true, filePath: filePath, fileName: path.basename(filePath) })
                sessionArr.push({ id: id, filePath: filePath })
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