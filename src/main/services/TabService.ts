import ITreeRepository from "@contracts/out/ITreeRepository"
import TabEditorDto from "@shared/dto/TabEditorDto"
import { BrowserWindow } from "electron"
import { inject } from "inversify"
import DI_KEYS from "../constants/di_keys"
import IDialogService from "../ports/out/IDialogService"
import IFileManager from "../ports/out/IFileManager"
import ITabSessionRepository from "../ports/out/ITabSessionRepository"
import TabSession from "../models/TabSessionModel"
import ITabService from "../ports/in/ITabService"

export default class TabService implements ITabService {
    constructor(
        @inject(DI_KEYS.FileManager) private readonly fileManager: IFileManager,
        @inject(DI_KEYS.TabSessionRepository) private readonly tabSessionRepository: ITabSessionRepository,
        @inject(DI_KEYS.dialogService) private readonly dialogService: IDialogService,
        @inject(DI_KEYS.TreeReposotory) private readonly treeRepository: ITreeRepository
    ) {

    }
    
    async closeTab(data: TabEditorDto, mainWindow: BrowserWindow, writeSession = true) {
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

    async closeTabsExcept(exceptData: TabEditorDto, allData: TabEditorDto[], mainWindow: BrowserWindow): Promise<boolean[]> {
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

    async closeTabsToRight(referenceData: TabEditorDto, allData: TabEditorDto[], mainWindow: BrowserWindow): Promise<boolean[]> {
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

    async closeAllTabs(data: TabEditorDto[], mainWindow: BrowserWindow): Promise<boolean[]> {
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