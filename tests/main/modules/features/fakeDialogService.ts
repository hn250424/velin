import IDialogService from "@contracts/IDialogService"
import { dialog, BrowserWindow } from "electron"

let fakeConfirmResult: boolean = false
export function setFakeConfirmResult(result: boolean) {
    fakeConfirmResult = result
}

let fakeSaveDialogResult: Electron.SaveDialogReturnValue = { canceled: false, filePath: undefined }
export function setFakeSaveDialogResult(result: Electron.SaveDialogReturnValue) {
    fakeSaveDialogResult = result
}

let fakeOpenDialogResult: Electron.OpenDialogReturnValue = { canceled: false, filePaths: [] }
export function setFakeOpenDialogResult(result: Electron.OpenDialogReturnValue) {
    fakeOpenDialogResult = result
}

const fakeDialogService: IDialogService = {
    async showConfirmDialog(message: string): Promise<boolean> {
        return fakeConfirmResult
    },

    async showOpenDialog(): Promise<Electron.OpenDialogReturnValue> {
        return fakeOpenDialogResult
    },

    async showSaveDialog(mainWindow: BrowserWindow, fileName: string = ''): Promise<Electron.SaveDialogReturnValue> {
        return fakeSaveDialogResult
    },
}

export default fakeDialogService
