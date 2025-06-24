import { BrowserWindow } from "electron"
import TabData from "@shared/types/TabData"
import TabSession from "../models/TabSession"
import IDialogService from "../contracts/IDialogService"
import IFileManager from "../contracts/IFileManager"
import ITabSessionRepository from "../contracts/ITabSessionRepository"
import IFileService from "./contracts/IFileService"
import { inject } from "inversify"
import DI_KEYS from "../constants/di_keys"

export default class FileService implements IFileService {
    constructor(
        @inject(DI_KEYS.FileManager) private readonly fileManager: IFileManager,
        @inject(DI_KEYS.TabSessionRepository) private readonly tabSessionRepository: ITabSessionRepository,
        @inject(DI_KEYS.dialogService) private readonly dialogService: IDialogService,
    ) {

    }

    async newTab() {
        const arr = await this.tabSessionRepository.readTabSession()
        const id = arr.length > 0 ? arr[arr.length - 1].id + 1 : 0
        arr.push({ id: id, filePath: '' })
        await this.tabSessionRepository.writeTabSession(arr)
        return {
            result: true,
            data: id
        }
    }

    async open() {
        const result = await this.dialogService.showOpenDialog()

        if (result.canceled || result.filePaths.length === 0) {
            return {
                result: false,
                data: null
            }
        }

        const filePath = result.filePaths[0]
        const fileName = this.fileManager.getBasename(filePath)
        const content = await this.fileManager.read(filePath)

        const arr = await this.tabSessionRepository.readTabSession()
        const id = arr.length > 0 ? arr[arr.length - 1].id + 1 : 0
        arr.push({ id: id, filePath: filePath })
        await this.tabSessionRepository.writeTabSession(arr)

        return {
            result: true,
            data: { id: id, isModified: false, filePath: filePath, fileName: fileName, content: content }
        }
    }

    async save(data: TabData, mainWindow: BrowserWindow) {
        if (!data.filePath) {
            const result = await this.dialogService.showSaveDialog(mainWindow, data.fileName)

            if (result.canceled || !result.filePath) {
                return {
                    result: false,
                    data: data
                }
            } else {
                await this.fileManager.write(result.filePath, data.content)

                const tabSession = await this.tabSessionRepository.readTabSession()
                tabSession.find(s => s.id === data.id).filePath = result.filePath
                await this.tabSessionRepository.writeTabSession(tabSession)

                return {
                    result: true,
                    data: {
                        ...data,
                        isModified: false,
                        filePath: result.filePath,
                        fileName: this.fileManager.getBasename(result.filePath)
                    }
                }
            }
        } else {
            await this.fileManager.write(data.filePath, data.content)
            return {
                result: true,
                data: {
                    ...data,
                    isModified: false,
                    filePath: data.filePath,
                    fileName: this.fileManager.getBasename(data.filePath)
                }
            }
        }
    }

    async saveAs(data: TabData, mainWindow: BrowserWindow) {
        const result = await this.dialogService.showSaveDialog(mainWindow, data.fileName)

        if (result.canceled || !result.filePath) {
            return {
                result: false,
                data: data
            }
        } else {
            await this.fileManager.write(result.filePath, data.content)

            const arr = await this.tabSessionRepository.readTabSession()
            const id = arr.length > 0 ? arr[arr.length - 1].id + 1 : 0
            arr.push({ id: id, filePath: result.filePath })
            this.tabSessionRepository.writeTabSession(arr)

            const newData: TabData = {
                id: id,
                isModified: false,
                filePath: result.filePath,
                fileName: this.fileManager.getBasename(result.filePath),
                content: data.content
            }

            return {
                result: true,
                data: newData
            }
        }
    }

    async saveAll(data: TabData[], mainWindow: BrowserWindow) {
        const sessionArr: TabSession[] = []
        const responseArr: TabData[] = []

        for (const tab of data) {
            const { id, isModified, filePath, fileName, content } = tab

            if ((!filePath) && (!isModified)) {
                sessionArr.push({ id: id, filePath: filePath })
                responseArr.push({ id: id, isModified: false, filePath: filePath, fileName: fileName, content: content })
            } else if ((!filePath) && isModified) {
                const result = await this.dialogService.showSaveDialog(mainWindow, fileName)

                if (result.canceled || !result.filePath) {
                    sessionArr.push({ id: id, filePath: filePath })
                    responseArr.push({ id: id, isModified: true, filePath: filePath, fileName: fileName, content: content })
                } else {
                    await this.fileManager.write(result.filePath, content)

                    sessionArr.push({ id: id, filePath: result.filePath })
                    responseArr.push({ id: id, isModified: false, filePath: result.filePath, fileName: this.fileManager.getBasename(result.filePath), content: content })
                }
            } else if (filePath && (!isModified)) {
                sessionArr.push({ id: id, filePath: filePath })
                responseArr.push({ id: id, isModified: false, filePath: filePath, fileName: this.fileManager.getBasename(filePath), content: content })
            } else if (filePath && isModified) {
                await this.fileManager.write(filePath, content)
                sessionArr.push({ id: id, filePath: filePath })
                responseArr.push({ id: id, isModified: false, filePath: filePath, fileName: this.fileManager.getBasename(filePath), content: content })
            }
        }

        await this.tabSessionRepository.writeTabSession(sessionArr)

        return {
            result: true,
            data: responseArr
        }
    }

    async closeTab(data: TabData, mainWindow: BrowserWindow) {
        let returnResult = false

        if (data.isModified) {
            const confirm = await this.dialogService.showConfirmDialog(`Do you want to save ${data.fileName} file?`)

            if (confirm) {
                if (data.filePath === '') {
                    const result = await this.dialogService.showSaveDialog(mainWindow, data.fileName)

                    if (result.canceled || !result.filePath) {
                        return {
                            result: returnResult,
                            data: undefined as void
                        }
                    } else {
                        await this.fileManager.write(result.filePath, data.content)
                    }
                } else {
                    await this.fileManager.write(data.filePath, data.content)
                }
            }
        }

        // Delete session.
        try {
            const tabSession = await this.tabSessionRepository.readTabSession()
            const updatedSession = tabSession.filter(session => session.id !== data.id)
            await this.tabSessionRepository.writeTabSession(updatedSession)
            returnResult = true
        } catch (e) {
            console.error(e)
        }

        return {
            result: returnResult,
            data: undefined as void
        }
    }
}


