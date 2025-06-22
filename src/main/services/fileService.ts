import { BrowserWindow } from "electron"
import TabData from "src/shared/interface/TabData"
import TabSession from "../interface/TabSession"
import IDialogService from "./ports/IDialogService"
import IFileManager from "./ports/IFileManager"
import ITabSessionRepository from "./ports/ITabSessionRepository"

export async function newTab(
    tabSessionRepository: ITabSessionRepository
): Promise<number> {
    const arr = await tabSessionRepository.readTabSession()
    const id = arr.length > 0 ? arr[arr.length - 1].id + 1 : 0
    arr.push({ id: id, filePath: '' })
    await tabSessionRepository.writeTabSession(arr)
    return id
}

export async function open(
    dialogService: IDialogService,
    fileManager: IFileManager,
    tabSessionRepository: ITabSessionRepository
) {
    const result = await dialogService.showOpenDialog()

    if (result.canceled || result.filePaths.length === 0) {
        return {
            result: false,
            data: null
        }
    }

    const filePath = result.filePaths[0]
    const fileName = fileManager.getBasename(filePath)
    const content = await fileManager.read(filePath)

    const arr = await tabSessionRepository.readTabSession()
    const id = arr.length > 0 ? arr[arr.length - 1].id + 1 : 0
    arr.push({ id: id, filePath: filePath })
    await tabSessionRepository.writeTabSession(arr)

    return {
        result: true,
        data: { id: id, isModified: false, filePath: filePath, fileName: fileName, content: content }
    }
}

export async function save(
    data: TabData,
    mainWindow: BrowserWindow,
    dialogService: IDialogService,
    fileManager: IFileManager,
    tabSessionRepository: ITabSessionRepository
) {
    if (!data.filePath) {
        const result = await dialogService.showSaveDialog(mainWindow, data.fileName)

        if (result.canceled || !result.filePath) {
            return {
                result: false,
                data: data
            }
        } else {
            await fileManager.write(result.filePath, data.content)

            const tabSession = await tabSessionRepository.readTabSession()
            tabSession.find(s => s.id === data.id).filePath = result.filePath
            await tabSessionRepository.writeTabSession(tabSession)

            return {
                result: true,
                data: {
                    ...data,
                    isModified: false,
                    filePath: result.filePath,
                    fileName: fileManager.getBasename(result.filePath)
                }
            }
        }
    } else {
        await fileManager.write(data.filePath, data.content)
        return {
            result: true,
            data: {
                ...data,
                isModified: false,
                filePath: data.filePath,
                fileName: fileManager.getBasename(data.filePath)
            }
        }
    }
}

export async function saveAs(
    data: TabData,
    mainWindow: BrowserWindow,
    dialogService: IDialogService,
    fileManager: IFileManager,
    tabSessionRepository: ITabSessionRepository
) {
    const result = await dialogService.showSaveDialog(mainWindow, data.fileName)

    if (result.canceled || !result.filePath) {
        return {
            result: false,
            data: data
        }
    } else {
        await fileManager.write(result.filePath, data.content)

        const arr = await tabSessionRepository.readTabSession()
        const id = arr.length > 0 ? arr[arr.length - 1].id + 1 : 0
        arr.push({ id: id, filePath: result.filePath })
        tabSessionRepository.writeTabSession(arr)

        const newData: TabData = {
            id: id,
            isModified: false,
            filePath: result.filePath,
            fileName: fileManager.getBasename(result.filePath),
            content: data.content
        }

        return {
            result: true,
            data: newData
        }
    }
}

export async function saveAll(
    data: TabData[],
    mainWindow: BrowserWindow,
    dialogService: IDialogService,
    fileManager: IFileManager,
    tabSessionRepository: ITabSessionRepository
) {
    const sessionArr: TabSession[] = []
    const responseArr: TabData[] = []

    for (const tab of data) {
        const { id, isModified, filePath, fileName, content } = tab

        if ((!filePath) && (!isModified)) {
            sessionArr.push({ id: id, filePath: filePath })
            responseArr.push({ id: id, isModified: false, filePath: filePath, fileName: fileName, content: content })
        } else if ((!filePath) && isModified) {
            const result = await dialogService.showSaveDialog(mainWindow, fileName)

            if (result.canceled || !result.filePath) {
                sessionArr.push({ id: id, filePath: filePath })
                responseArr.push({ id: id, isModified: true, filePath: filePath, fileName: fileName, content: content })
            } else {
                await fileManager.write(result.filePath, content)

                sessionArr.push({ id: id, filePath: result.filePath })
                responseArr.push({ id: id, isModified: false, filePath: result.filePath, fileName: fileManager.getBasename(result.filePath), content: content })
            }
        } else if (filePath && (!isModified)) {
            sessionArr.push({ id: id, filePath: filePath })
            responseArr.push({ id: id, isModified: false, filePath: filePath, fileName: fileManager.getBasename(filePath), content: content })
        } else if (filePath && isModified) {
            await fileManager.write(filePath, content)
            sessionArr.push({ id: id, filePath: filePath })
            responseArr.push({ id: id, isModified: false, filePath: filePath, fileName: fileManager.getBasename(filePath), content: content })
        }
    }

    await tabSessionRepository.writeTabSession(sessionArr)

    return {
        result: true,
        data: responseArr
    }
}

export async function closeTab(
    data: TabData,
    mainWindow: BrowserWindow,
    dialogService: IDialogService,
    fileManager: IFileManager,
    tabSessionRepository: ITabSessionRepository
) {
    let returnResult = false

    if (data.isModified) {
        const confirm = await dialogService.showConfirmDialog('Do you want to save this file?')

        if (confirm) {
            if (data.filePath === '') {
                const result = await dialogService.showSaveDialog(mainWindow, data.fileName)

                if (result.canceled || !result.filePath) {
                    return {
                        result: returnResult,
                    }
                } else {
                    await fileManager.write(result.filePath, data.content)
                }
            } else {
                await fileManager.write(data.filePath, data.content)
            }
        }
    }

    // Delete session.
    try {
        const tabSession = await tabSessionRepository.readTabSession()
        const updatedSession = tabSession.filter(session => session.id !== data.id)
        await tabSessionRepository.writeTabSession(updatedSession)
        returnResult = true
    } catch (e) { }

    return {
        result: returnResult,
    }
}