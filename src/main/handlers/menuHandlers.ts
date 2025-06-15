import { ipcMain, dialog, BrowserWindow } from 'electron'
import fs from 'fs'
import path from 'path'

import StateManager from '../modules/core/StateManager'
import { electronAPI } from '../../shared/constants/electronAPI'
import { log } from 'console'

export default function registerMenuHandlers(mainWindow: BrowserWindow) {
    const stateManager = StateManager.getInstancec()

    ipcMain.handle(electronAPI.events.open, async () => {
        const result = await dialog.showOpenDialog({
            title: 'Open',
            filters: [
                { name: 'Markdown', extensions: ['md', 'markdown'] }
            ],
            properties: ['openFile']
        })

        if (result.canceled || result.filePaths.length === 0) return

        const filePath = result.filePaths[0]
        const fileName = path.basename(filePath)
        const content = await fs.promises.readFile(filePath, 'utf-8')

        return { filePath: filePath, fileName: fileName, content: content }
    })

    ipcMain.handle(electronAPI.events.save, (event, data: { filePath: string; content: string }[]) => {
        log(data[0])
        log(data[1])
    })
}