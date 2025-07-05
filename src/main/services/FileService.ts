import ITreeRepository from "@contracts/out/ITreeRepository"
import TabEditorDto from "@shared/dto/TabEditorDto"
import { BrowserWindow } from "electron"
import { inject } from "inversify"
import DI_KEYS from "../constants/di_keys"
import IDialogService from "../ports/out/IDialogService"
import IFileManager from "../ports/out/IFileManager"
import ITabRepository from "../ports/out/ITabRepository"
import TabSession from "../models/TabSessionModel"
import TreeDto from "@shared/dto/TreeDto"
import IFileService from "../ports/in/IFileService"
import ITreeManager from "@contracts/out/ITreeManager"

export default class FileService implements IFileService {
    constructor(
        @inject(DI_KEYS.FileManager) private readonly fileManager: IFileManager,
        @inject(DI_KEYS.TabRepository) private readonly tabRepository: ITabRepository,
        @inject(DI_KEYS.dialogService) private readonly dialogService: IDialogService,
        @inject(DI_KEYS.TreeReposotory) private readonly treeRepository: ITreeRepository,
        @inject(DI_KEYS.TreeManager) private readonly treeManager: ITreeManager,
    ) {

    }

    async newTab() {
        const arr = await this.tabRepository.readTabSession()
        const id = arr.length > 0 ? arr[arr.length - 1].id + 1 : 0
        arr.push({ id: id, filePath: '' })
        await this.tabRepository.writeTabSession(arr)
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

        const arr = await this.tabRepository.readTabSession()
        const id = arr.length > 0 ? arr[arr.length - 1].id + 1 : 0
        arr.push({ id: id, filePath: filePath })
        await this.tabRepository.writeTabSession(arr)

        return { id: id, isModified: false, filePath: filePath, fileName: fileName, content: content }
    }

    async openDirectory(dto?: TreeDto): Promise<TreeDto | null> {
        let path
        let indent
        if (!dto || !dto.path) {
            const result = await this.dialogService.showOpenDirectoryDialog()

            if (result.canceled || result.filePaths.length === 0) {
                return null
            }

            path = result.filePaths[0]
            indent = 0
        } else {
            path = dto.path
            indent = dto.indent
        }

        const fsTree = await this.treeManager.getDirectoryTree(path, indent)
        if (indent === 0) await this.treeRepository.writeTreeSession(fsTree)
        else await this.treeRepository.updateSessionWithFsData(path, indent, fsTree.children)

        return {
            path,
            name: this.fileManager.getBasename(path),
            indent,
            directory: fsTree.directory,
            expanded: fsTree.expanded,
            children: fsTree?.children ?? [],
        }
    }

    async save(data: TabEditorDto, mainWindow: BrowserWindow, writeSession = true) {
        if (!data.filePath) {
            const result = await this.dialogService.showSaveDialog(mainWindow, data.fileName)

            if (result.canceled || !result.filePath) {
                return data
            } else {
                await this.fileManager.write(result.filePath, data.content)

                const tabSession = await this.tabRepository.readTabSession()
                tabSession.find(s => s.id === data.id).filePath = result.filePath
                if (writeSession) await this.tabRepository.writeTabSession(tabSession)

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

            const arr = await this.tabRepository.readTabSession()
            const id = arr.length > 0 ? arr[arr.length - 1].id + 1 : 0
            arr.push({ id: id, filePath: result.filePath })
            this.tabRepository.writeTabSession(arr)

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

        await this.tabRepository.writeTabSession(sessionArr)

        return responseArr
    }
}


