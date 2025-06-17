import { BrowserWindow, dialog, ipcMain } from 'electron'
import fs from 'fs'
import path from 'path'

import { electronAPI } from '../../shared/constants/electronAPI'
import Response from '../../shared/interface/Response'
import TabData from '../../shared/interface/TabData'
import TabSession from '../interface/TabSession'
import TabSessionManager from '../modules/core/TabSessionManager'
import { showConfirm } from '../utils/utils'

export default function registerMenuHandlers(mainWindow: BrowserWindow) {
    ipcMain.handle(electronAPI.events.newTab, async () => {
        const tabSessionManager = TabSessionManager.getInstance()
        const arr = tabSessionManager.readTabSession()
        const id = arr[arr.length - 1].id + 1
        arr.push({ id: id, filePath: '' })
        tabSessionManager.writeTabSession(arr)

        const response: Response<number> = {
            result: true,
            data: id
        }

        return response
    })

    ipcMain.handle(electronAPI.events.open, async () => {
        const result = await dialog.showOpenDialog({
            title: 'Open',
            filters: [
                { name: 'Markdown', extensions: ['md', 'markdown'] }
            ],
            properties: ['openFile']
        })

        if (result.canceled || result.filePaths.length === 0) {
            const response: Response<TabData> = {
                result: false,
                data: null
            }
            return response
        }

        const filePath = result.filePaths[0]
        const fileName = path.basename(filePath)
        const content = await fs.promises.readFile(filePath, 'utf-8')

        const tabSessionManager = TabSessionManager.getInstance()
        const arr = tabSessionManager.readTabSession()
        const id = arr[arr.length - 1].id + 1
        arr.push({ id: id, filePath: filePath })
        tabSessionManager.writeTabSession(arr)

        const response: Response<TabData> = {
            result: true,
            data: { id: id, isModified: false, filePath: filePath, fileName: fileName, content: content }
        }

        return response
    })

    ipcMain.handle(electronAPI.events.save, async (event, data: TabData) => {
        if (!data.filePath) {
            const result = await dialog.showSaveDialog(mainWindow, {
                title: 'Save As',
                defaultPath: data.fileName,
                filters: [{ name: 'Markdown', extensions: ['md', 'markdown'] }]
            })

            if (result.canceled || !result.filePath) {
                return {
                    result: false,
                    data: data
                }
            } else {
                await fs.promises.writeFile(result.filePath, data.content, 'utf-8')

                const tabSessionManager = TabSessionManager.getInstance()
                const tabSession = tabSessionManager.readTabSession()
                tabSession.find(s => s.id === data.id).filePath = result.filePath
                tabSessionManager.writeTabSession(tabSession)

                data.isModified = false
                data.filePath = result.filePath
                data.fileName = path.basename(result.filePath)

                return {
                    result: true,
                    data: data
                }
            }
        } else {
            await fs.promises.writeFile(data.filePath, data.content, 'utf-8')
            return {
                result: true,
                data: data
            }
        }
    })

    ipcMain.handle(electronAPI.events.saveAs, async (e, data: TabData) => {
        const result = await dialog.showSaveDialog(mainWindow, {
            title: 'Save As',
            defaultPath: data.fileName,
            filters: [{ name: 'Markdown', extensions: ['md', 'markdown'] }]
        })

        if (result.canceled || !result.filePath) {
            return {
                result: false,
                data: data
            }
        } else {
            await fs.promises.writeFile(result.filePath, data.content, 'utf-8')

            const tabSessionManager = TabSessionManager.getInstance()
            const arr = tabSessionManager.readTabSession()
            const id = arr[arr.length - 1].id + 1
            arr.push({ id: id, filePath: result.filePath })
            tabSessionManager.writeTabSession(arr)
            
            const newData: TabData = {
                id: id,
                isModified: false,
                filePath: result.filePath,
                fileName: path.basename(result.filePath),
                content: data.content
            }

            return {
                result: true,
                data: newData
            }
        }
    })

    ipcMain.handle(electronAPI.events.saveAll, async (event, data: TabData[]) => {
        const sessionArr: TabSession[] = []
        const responseArr: TabData[] = []

        for (const tab of data) {
            const { id, isModified, filePath, fileName, content } = tab

            if ((!filePath) && (!isModified)) {
                sessionArr.push({ id: id, filePath: filePath })
                responseArr.push({ id: id, isModified: false, filePath: filePath, fileName: fileName, content: content })
            } else if ((!filePath) && isModified) {
                const result = await dialog.showSaveDialog(mainWindow, {
                    title: 'Save As',
                    defaultPath: fileName,
                    filters: [{ name: 'Markdown', extensions: ['md', 'markdown'] }]
                })

                if (result.canceled || !result.filePath) {
                    sessionArr.push({ id: id, filePath: filePath })
                    responseArr.push({ id: id, isModified: true, filePath: filePath, fileName: fileName, content: content })
                } else {
                    await fs.promises.writeFile(result.filePath, content, 'utf-8')

                    sessionArr.push({ id: id, filePath: result.filePath })
                    responseArr.push({ id: id, isModified: false, filePath: result.filePath, fileName: path.basename(result.filePath), content: content })
                }
            } else if (filePath && (!isModified)) {
                sessionArr.push({ id: id, filePath: filePath })
                responseArr.push({ id: id, isModified: false, filePath: filePath, fileName: path.basename(filePath), content: content })
            } else if (filePath && isModified) {
                await fs.promises.writeFile(filePath, content, 'utf-8')
                sessionArr.push({ id: id, filePath: filePath })
                responseArr.push({ id: id, isModified: false, filePath: filePath, fileName: path.basename(filePath), content: content })
            }
        }

        const tabSessionManager = TabSessionManager.getInstance()
        tabSessionManager.writeTabSession(sessionArr)

        return {
            result: true,
            data: responseArr
        }
    })

    ipcMain.handle(electronAPI.events.confirm, async (e, message) => {
        return showConfirm(message)
    })
}