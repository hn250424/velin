import IDialogService from "src/main/contracts/IDialogService"
import { dialog, BrowserWindow } from "electron"

const dialogService: IDialogService = {
    async showConfirmDialog(message: string): Promise<boolean> {
        const result = await dialog.showMessageBox({
            type: 'question',
            buttons: ['Yes', 'No'],
            defaultId: 0,
            cancelId: 1,
            message: message
        })
        return result.response === 0
    },

    async showOpenFileDialog() {
        return await dialog.showOpenDialog({
            title: 'Open',
            filters: [
                { name: 'Markdown', extensions: ['md', 'markdown'] }
            ],
            properties: ['openFile']
        })
    },

    async showOpenDirectoryDialog() {
        return await dialog.showOpenDialog({
            title: 'Open Directory',
            properties: ['openDirectory']
        })
    },

    async showSaveDialog(mainWindow: BrowserWindow, fileName: string = ''): Promise<Electron.SaveDialogReturnValue> {
        return await dialog.showSaveDialog(mainWindow, {
            title: 'Save As',
            defaultPath: fileName,
            filters: [{ name: 'Markdown', extensions: ['md', 'markdown'] }]
        })
    }
}

export default dialogService