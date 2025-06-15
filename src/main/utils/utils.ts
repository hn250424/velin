import { dialog } from "electron"

export async function showConfirm(message: string): Promise<boolean> {
    const result = await dialog.showMessageBox({
        type: 'question',
        buttons: ['Yes', 'No'],
        defaultId: 0,
        cancelId: 1,
        message: message
    })
    return result.response === 0
}