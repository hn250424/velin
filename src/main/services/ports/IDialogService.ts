import { BrowserWindow } from "electron"

export default interface IDialogService {
    showConfirmDialog(message: string): Promise<boolean>
    showOpenDialog(): Promise<Electron.OpenDialogReturnValue>
    showSaveDialog(mainWindow: BrowserWindow, fileName?: string): Promise<Electron.SaveDialogReturnValue>
}