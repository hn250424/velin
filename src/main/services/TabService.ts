import ITreeRepository from "src/main/modules/contracts/ITreeRepository"
import { TabEditorDto, TabEditorsDto } from "@shared/dto/TabEditorDto"
import { BrowserWindow } from "electron"
import { inject } from "inversify"
import DI_KEYS from "../constants/di_keys"
import IDialogManager from "../modules/contracts/IDialogManager"
import IFileManager from "../modules/contracts/IFileManager"
import ITabRepository from "../modules/contracts/ITabRepository"
import { TabSessionData, TabSessionModel } from "../models/TabSessionModel"
import ITabService from "./contracts/ITabService"
import path from 'path'

export default class TabService implements ITabService {
    constructor(
        @inject(DI_KEYS.FileManager) private readonly fileManager: IFileManager,
        @inject(DI_KEYS.TabRepository) private readonly tabRepository: ITabRepository,
        @inject(DI_KEYS.dialogManager) private readonly dialogManager: IDialogManager,
        @inject(DI_KEYS.TreeReposotory) private readonly treeRepository: ITreeRepository
    ) {

    }
    async closeTab(data: TabEditorDto, mainWindow: BrowserWindow, writeSession = true) {
        if (data.isModified) {
            const confirm = await this.dialogManager.showConfirmDialog(`Do you want to save ${data.fileName} file?`)

            if (confirm) {
                if (!data.filePath) {
                    const result = await this.dialogManager.showSaveDialog(mainWindow, data.fileName)

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
                const tabSession = await this.tabRepository.readTabSession()
                const updatedData = tabSession.data.filter(session => session.id !== data.id)
                await this.tabRepository.writeTabSession({
                    activatedId: tabSession.activatedId,
                    data: updatedData
                })
            } catch (e) {
                console.error(e)
                return false
            }
        }

        return true
    }

    async closeTabsExcept(exceptData: TabEditorDto, dto: TabEditorsDto, mainWindow: BrowserWindow): Promise<boolean[]> {
        const sessionArr: TabSessionData[] = []
        const responseArr: boolean[] = []

        for (const data of dto.data) {
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

        await this.tabRepository.writeTabSession({
            activatedId: dto.activatedId,
            data: sessionArr
        })

        return responseArr
    }

    async closeTabsToRight(referenceData: TabEditorDto, dto: TabEditorsDto, mainWindow: BrowserWindow): Promise<boolean[]> {
        const data = dto.data
        const refIdx = data.findIndex(_data => _data.id === referenceData.id)

        const sessionToKeep = []
        const responseArr = []
        for (let i = 0; i <= refIdx; i++) {
            sessionToKeep.push({ id: data[i].id, filePath: data[i].filePath })
            responseArr.push(false)
        }

        for (let i = refIdx + 1; i < data.length; i++) {
            const result = await this.closeTab(data[i], mainWindow, false)
            if (result) {
                responseArr.push(true)
            } else {
                responseArr.push(false)
                sessionToKeep.push({ id: data[i].id, filePath: data[i].filePath })
            }
        }

        await this.tabRepository.writeTabSession({
            activatedId: dto.activatedId,
            data: sessionToKeep
        })

        return responseArr
    }

    async closeAllTabs(dto: TabEditorsDto, mainWindow: BrowserWindow): Promise<boolean[]> {
        const sessionArr = []
        const responseArr = []

        for (const tab of dto.data) {
            const result = await this.closeTab(tab, mainWindow, false)

            if (result) {
                responseArr.push(true)
            } else {
                responseArr.push(false)
                sessionArr.push({ id: tab.id, filePath: tab.filePath })
            }
        }

        await this.tabRepository.writeTabSession({
            activatedId: dto.activatedId,
            data: sessionArr
        })
        return responseArr
    }

    async syncTabSession(dto: TabEditorsDto): Promise<boolean> {
        const newSession: TabSessionModel = {
            activatedId: dto.activatedId,
            data: dto.data.map(d => ({
                id: d.id,
                filePath: d.filePath
            }))
        }

        await this.tabRepository.writeTabSession(newSession)
        return true
    }
}