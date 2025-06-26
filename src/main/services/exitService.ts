import { BrowserWindow } from "electron"
import TabData from "@shared/types/TabData"
import IFileManager from "@contracts/IFileManager"
import ITabSessionRepository from "@contracts/ITabSessionRepository"
import IDialogService from "@contracts/IDialogService"
import TabSession from "../models/TabSession"

export default async function exit(
    data: TabData[],
    mainWindow: BrowserWindow,
    fileManager: IFileManager,
    tabSessionRepository: ITabSessionRepository,
    dialogService: IDialogService
) {
    const sessionArr: TabSession[] = []

    for (const tab of data) {
        const { id, isModified, filePath, fileName, content } = tab

        if (!isModified) {
            sessionArr.push({ id: id, filePath: filePath })
            continue
        }

        const confirm = await dialogService.showConfirmDialog(`Do you want to save ${fileName} file?`)
        if (!confirm) {
            sessionArr.push({ id: id, filePath: filePath })
            continue
        }

        if (!filePath) {
            const result = await dialogService.showSaveDialog(mainWindow, fileName)

            if (result.canceled || !result.filePath) {
                sessionArr.push({ id: id, filePath: filePath })
            } else {
                await fileManager.write(result.filePath, content)

                sessionArr.push({ id: id, filePath: result.filePath })
            }
        } else if (filePath) {
            await fileManager.write(filePath, content)
            sessionArr.push({ id: id, filePath: filePath })
        }
    }

    await tabSessionRepository.writeTabSession(sessionArr)
    mainWindow.close()
}