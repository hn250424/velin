import { BrowserWindow } from "electron";
import { electronAPI } from "@shared/constants/electronAPI";
import IFileManager from "../ports/out/IFileManager";
import ITabRepository from "../ports/out/ITabRepository";
import ITreeRepository from "@contracts/out/ITreeRepository";

export async function loadedRenderer(
    mainWindow: BrowserWindow,
    fileManager: IFileManager,
    tabRepository: ITabRepository,
    treeRepository: ITreeRepository,
) {
    await sendTabSession(mainWindow, fileManager, tabRepository)
    await sendTreeSession(mainWindow, fileManager, treeRepository)
}

async function sendTabSession(mainWindow: BrowserWindow, fileManager: IFileManager, tabRepository: ITabRepository) {
    const tabSessionArr = await tabRepository.readTabSession()
    if (tabSessionArr.length === 0) {
        mainWindow.webContents.send(electronAPI.events.tabSession, [])
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
        await tabRepository.writeTabSession(sessionArr)
    }
    mainWindow.webContents.send(electronAPI.events.tabSession, arr)
}

async function sendTreeSession(mainWindow: BrowserWindow, fileManager: IFileManager, treeRepository: ITreeRepository) {
    
}