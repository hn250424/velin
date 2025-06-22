import { app, BrowserWindow } from "electron";
import { electronAPI } from "../../shared/constants/electronAPI";
import IFileManager from "./ports/IFileManager";
import ITabSessionRepository from "./ports/ITabSessionRepository";
import { TAB_SESSION_PATH } from "../constants/file_info";
import path from 'path'

export async function loadedRenderer(
    mainWindow: BrowserWindow,
    tabSessionPath: string,
    fileManager: IFileManager,
    tabSessionRepository: ITabSessionRepository
) {
    if (!await fileManager.exists(tabSessionPath)) {
        const _session = [{ id: 0, filePath: '' }]
        tabSessionRepository.writeTabSession(_session)
        mainWindow.webContents.send(electronAPI.events.tabSession, _session)
        return
    }
    
    const tabSessionArr = await tabSessionRepository.readTabSession()
    if (tabSessionArr.length === 0) {
        tabSessionArr.push({ id: 0, filePath: '' })
        tabSessionRepository.writeTabSession(tabSessionArr)
        mainWindow.webContents.send(electronAPI.events.tabSession, tabSessionArr)
        return
    }

    let isChanged = false
    const arr = await Promise.all(
        tabSessionArr.map(async (data) => {
            const filePath = data.filePath ?? ''
            try {
                if (!filePath) throw new Error('No file path')

                await fileManager.exists(filePath)
                const fileName = fileManager.getBasename(filePath)
                const content = await fileManager.read(data.filePath)
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

    if (isChanged) {
        const sessionArr = arr.map(({ id, filePath }) => ({ id, filePath }))
        await tabSessionRepository.writeTabSession(sessionArr)
    }
    mainWindow.webContents.send(electronAPI.events.tabSession, arr)
}