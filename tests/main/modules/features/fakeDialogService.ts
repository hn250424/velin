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

let fakeOpenFileDialogResult: Electron.OpenDialogReturnValue = { canceled: false, filePaths: [] }
export function setFakeOpenFileDialogResult(result: Electron.OpenDialogReturnValue) {
    fakeOpenFileDialogResult = result
}

let fakeOpenDirectoryDialogResult: Electron.OpenDialogReturnValue = { canceled: false, filePaths: [] }
export function setFakeOpenDirectoryDialogResult(result: Electron.OpenDialogReturnValue) {
    fakeOpenDirectoryDialogResult = result
}

const fakeDialogService: IDialogService = {
    async showConfirmDialog(message: string): Promise<boolean> {
        return fakeConfirmResult
    },

    async showOpenFileDialog(): Promise<Electron.OpenDialogReturnValue> {
        return fakeOpenFileDialogResult
    },

    async showOpenDirectoryDialog() {
        return fakeOpenDirectoryDialogResult
    },

    async showSaveDialog(mainWindow: BrowserWindow, fileName: string = ''): Promise<Electron.SaveDialogReturnValue> {
        return fakeSaveDialogResult
    },
}

export default fakeDialogService
