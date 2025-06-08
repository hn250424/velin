import { ipcMain, dialog, BrowserWindow } from 'electron'
import fs from 'fs'
import path from 'path'

import StateManager from './module/core/StateManager'
import { Mode } from '../Shared/constants/Mode'
import { electronAPI } from '../Shared/constants/electronAPI'

export default function registerMainHandler(mainWindow: BrowserWindow) {
    const stateManager = StateManager.getInstancec()

    ipcMain.on(electronAPI.events.sendSave, async (event, content: string, isSaveAs: Boolean) => {
        if (isSaveAs || stateManager.getCurrentPath() === '') {
            const result = await dialog.showSaveDialog(mainWindow, {
                title: 'Save As',
                filters: [{ name: 'Markdown', extensions: ['md', 'markdown'] }]
            })
            if (result.canceled || ! result.filePath) return
            await fs.promises.writeFile(result.filePath, content, 'utf-8')
            stateManager.setCurrentPath(result.filePath)
        } else {
            const path = stateManager.getCurrentPath()
            if (! path) return
            await fs.promises.writeFile(path, content, 'utf-8')
        }
    })
}

