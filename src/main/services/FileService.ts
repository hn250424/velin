import { BrowserWindow } from "electron"
import TabEditorDto from "@shared/dto/TabEditorDto"
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

    async openDirectory(treeNode?: TreeNode): Promise<TreeNode | null> {
        let path
        let indent
        if (!treeNode || !treeNode.path) {
            const result = await this.dialogService.showOpenDirectoryDialog()

            if (result.canceled || result.filePaths.length === 0) {
                return null
            }

            path = result.filePaths[0]
            indent = 0
        } else {
            path = treeNode.path
            indent = treeNode.indent
        }

        const directoryTree = this.treeRepository.getDirectoryTree(path, indent)

        return {
            path,
            name: this.fileManager.getBasename(path),
            indent,
            directory: directoryTree.directory,
            expanded: directoryTree.expanded,
            children: directoryTree?.children ?? [],
        }
    }

    async save(data: TabEditorDto, mainWindow: BrowserWindow, writeSession = true) {
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

    async saveAs(data: TabEditorDto, mainWindow: BrowserWindow) {
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

    async saveAll(data: TabEditorDto[], mainWindow: BrowserWindow) {
        const sessionArr: TabSession[] = []
        const responseArr: TabEditorDto[] = []

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
}


