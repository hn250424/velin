import { BrowserWindow } from "electron"
import TabData from "@shared/types/TabData"
import TabSession from "../models/TabSession"
import IDialogService from "../contracts/IDialogService"
import IFileManager from "../contracts/IFileManager"
import ITabSessionRepository from "../contracts/ITabSessionRepository"
import IFileService from "./contracts/IFileService"
import { inject } from "inversify"
import DI_KEYS from "../constants/di_keys"
import TreeNode from "@shared/types/TreeNode"
import TreeReposotory from "../modules/features/TreeReposotory"
import ITreeRepository from "@contracts/ITreeRepository"

export default class FileService implements IFileService {
    constructor(
        @inject(DI_KEYS.FileManager) private readonly fileManager: IFileManager,
        @inject(DI_KEYS.TabSessionRepository) private readonly tabSessionRepository: ITabSessionRepository,
        @inject(DI_KEYS.dialogService) private readonly dialogService: IDialogService,
        @inject(DI_KEYS.TreeReposotory) private readonly treeRepository: ITreeRepository
    ) {

    }

    async newTab() {
        const arr = await this.tabSessionRepository.readTabSession()
        const id = arr.length > 0 ? arr[arr.length - 1].id + 1 : 0
        arr.push({ id: id, filePath: '' })
        await this.tabSessionRepository.writeTabSession(arr)
        return id
    }

    async openFile() {
        const result = await this.dialogService.showOpenFileDialog()

        if (result.canceled || result.filePaths.length === 0) {
            return null
        }

        const filePath = result.filePaths[0]
        const fileName = this.fileManager.getBasename(filePath)
        const content = await this.fileManager.read(filePath)

        const arr = await this.tabSessionRepository.readTabSession()
        const id = arr.length > 0 ? arr[arr.length - 1].id + 1 : 0
        arr.push({ id: id, filePath: filePath })
        await this.tabSessionRepository.writeTabSession(arr)

        return { id: id, isModified: false, filePath: filePath, fileName: fileName, content: content }
    }

    async openDirectory(dirPath?: string, indent?: number): Promise<TreeNode | null> {
        if (!dirPath) {
            const result = await this.dialogService.showOpenDirectoryDialog()

            if (result.canceled || result.filePaths.length === 0) {
                return null
            }

            dirPath = result.filePaths[0]
            indent = 0
        }

        const dirName = this.fileManager.getBasename(dirPath)
        const directoryTree = this.treeRepository.getDirectoryTree(dirPath, indent)

        return {
            path: dirPath,
            name: dirName,
            indent: indent,
            directory: directoryTree.directory,
            children: directoryTree?.children ?? [],
        }
    }

    async save(data: TabData, mainWindow: BrowserWindow, writeSession = true) {
        if (!data.filePath) {
            const result = await this.dialogService.showSaveDialog(mainWindow, data.fileName)

            if (result.canceled || !result.filePath) {
                return data
            } else {
                await this.fileManager.write(result.filePath, data.content)

                const tabSession = await this.tabSessionRepository.readTabSession()
                tabSession.find(s => s.id === data.id).filePath = result.filePath
                if (writeSession) await this.tabSessionRepository.writeTabSession(tabSession)

                return {
                    ...data,
                    isModified: false,
                    filePath: result.filePath,
                    fileName: this.fileManager.getBasename(result.filePath)
                }
            }
        } else {
            await this.fileManager.write(data.filePath, data.content)
            return {
                ...data,
                isModified: false,
                filePath: data.filePath,
                fileName: this.fileManager.getBasename(data.filePath)
            }
        }
    }

    async saveAs(data: TabData, mainWindow: BrowserWindow) {
        const result = await this.dialogService.showSaveDialog(mainWindow, data.fileName)

        if (result.canceled || !result.filePath) {
            return null
        } else {
            await this.fileManager.write(result.filePath, data.content)

            const arr = await this.tabSessionRepository.readTabSession()
            const id = arr.length > 0 ? arr[arr.length - 1].id + 1 : 0
            arr.push({ id: id, filePath: result.filePath })
            this.tabSessionRepository.writeTabSession(arr)

            return {
                id: id,
                isModified: false,
                filePath: result.filePath,
                fileName: this.fileManager.getBasename(result.filePath),
                content: data.content
            }
        }
    }

    async saveAll(data: TabData[], mainWindow: BrowserWindow) {
        const sessionArr: TabSession[] = []
        const responseArr: TabData[] = []

        for (const tab of data) {
            const { id, isModified, filePath, fileName, content } = tab

            if (!isModified) {
                sessionArr.push({ id: id, filePath: filePath })
                responseArr.push({ id: id, isModified: false, filePath: filePath, fileName: fileName, content: content })
                continue
            }

            const result = await this.save(tab, mainWindow, false)
            sessionArr.push({ id: result.id, filePath: result.filePath })
            responseArr.push(result)
        }

        await this.tabSessionRepository.writeTabSession(sessionArr)

        return responseArr
    }

    async closeTab(data: TabData, mainWindow: BrowserWindow, writeSession = true) {
        if (data.isModified) {
            const confirm = await this.dialogService.showConfirmDialog(`Do you want to save ${data.fileName} file?`)

            if (confirm) {
                if (!data.filePath) {
                    const result = await this.dialogService.showSaveDialog(mainWindow, data.fileName)

                    if (result.canceled || !result.filePath) {
                        return false
                    } else {
                        await this.fileManager.write(result.filePath, data.content)
                    }
                } else {
                    await this.fileManager.write(data.filePath, data.content)
                }
            }
        }

        // Delete session.
        if (writeSession) {
            try {
                const tabSession = await this.tabSessionRepository.readTabSession()
                const updatedSession = tabSession.filter(session => session.id !== data.id)
                await this.tabSessionRepository.writeTabSession(updatedSession)
            } catch (e) {
                console.error(e)
                return false
            }
        }

        return true
    }

    async closeTabsExcept(exceptData: TabData, allData: TabData[], mainWindow: BrowserWindow): Promise<boolean[]> {
        const sessionArr: TabSession[] = []
        const responseArr: boolean[] = []

        for (const data of allData) {
            if (exceptData.id === data.id) {
                sessionArr.push({ id: data.id, filePath: data.filePath })
                responseArr.push(false)
                continue
            }

            const result = await this.closeTab(data, mainWindow, false)
            if (result) {
                responseArr.push(true)
            } else {
                sessionArr.push({ id: data.id, filePath: data.filePath })
                responseArr.push(false)
            }
        }

        await this.tabSessionRepository.writeTabSession(sessionArr)

        return responseArr
    }

    async closeTabsToRight(referenceData: TabData, allData: TabData[], mainWindow: BrowserWindow): Promise<boolean[]> {
        const refIdx = allData.findIndex(data => data.id === referenceData.id)

        const sessionToKeep = []
        const responseArr = []
        for (let i = 0; i <= refIdx; i++) {
            sessionToKeep.push({ id: allData[i].id, filePath: allData[i].filePath })
            responseArr.push(false)
        }

        for (let i = refIdx + 1; i < allData.length; i++) {
            const result = await this.closeTab(allData[i], mainWindow, false)
            if (result) {
                responseArr.push(true)
            } else {
                responseArr.push(false)
                sessionToKeep.push({ id: allData[i].id, filePath: allData[i].filePath })
            }
        }

        await this.tabSessionRepository.writeTabSession(sessionToKeep)

        return responseArr
    }

    async closeAllTabs(data: TabData[], mainWindow: BrowserWindow): Promise<boolean[]> {
        const sessionArr = []
        const responseArr = []

        for (const tab of data) {
            const result = await this.closeTab(tab, mainWindow, false)

            if (result) {
                responseArr.push(true)
            } else {
                responseArr.push(false)
                sessionArr.push({ id: tab.id, filePath: tab.filePath })
            }
        }

        await this.tabSessionRepository.writeTabSession(sessionArr)
        return responseArr
    }
}


