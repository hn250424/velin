import { BrowserWindow } from "electron";
import { electronAPI } from "../../shared/constants/electronAPI";
import IFileManager from "./ports/IFileManager";
import ITabSessionRepository from "./ports/ITabSessionRepository";

export async function loadedRenderer(
    mainWindow: BrowserWindow,
    tabSessionPath: string,
    fileManager: IFileManager,
    tabSessionRepository: ITabSessionRepository
) {
    const exists = await fileManager.exists(tabSessionPath)
    const tabSessionArr = exists ? await tabSessionRepository.readTabSession() : []

    if (!exists || tabSessionArr.length === 0) {
        const emptySession = [{ id: 0, filePath: '' }]
        await tabSessionRepository.writeTabSession(emptySession)

        const tabDataArr = emptySession.map(({ id, filePath }) => ({
            id,
            isModified: false,
            filePath,
            fileName: '',
            content: '',
        }))

        mainWindow.webContents.send(electronAPI.events.tabSession, tabDataArr)
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