import { BrowserWindow } from "electron"

export default interface IDialogService {
    showConfirmDialog(message: string): Promise<boolean>
    showOpenFileDialog(): Promise<Electron.OpenDialogReturnValue>
    showOpenDirectoryDialog(): Promise<Electron.OpenDialogReturnValue>
    showSaveDialog(mainWindow: BrowserWindow, fileName?: string): Promise<Electron.SaveDialogReturnValue>
}