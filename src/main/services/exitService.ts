import { BrowserWindow } from "electron"
import TabEditorDto from "@shared/dto/TabEditorDto"
import IFileManager from "@contracts/out/IFileManager"
import ITabRepository from "@contracts/out/ITabRepository"
import IDialogService from "@contracts/out/IDialogService"
import TabSessionModel from "../models/TabSessionModel"

export default async function exit(
    data: TabEditorDto[],
    mainWindow: BrowserWindow,
    fileManager: IFileManager,
    tabRepository: ITabRepository,
    dialogService: IDialogService
) {
    const sessionArr: TabSessionModel[] = []

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

    await tabRepository.writeTabSession(sessionArr)
    mainWindow.close()
}