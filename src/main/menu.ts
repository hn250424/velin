import { ipcMain, Menu, MenuItemConstructorOptions, BrowserWindow, dialog } from 'electron'
import fs from 'fs'
import path from 'path'

import StateManager from './modules/core/StateManager'
import { electronAPI } from '../Shared/constants/electronAPI'

export const createMenu = (mainWindow: BrowserWindow) => {
    const template: MenuItemConstructorOptions[] = [
        {
            label: 'File',
            submenu: [
                { label: 'Create', click: () => { create(mainWindow) } },
                { label: 'Open', click: () => { open(mainWindow) } },
                { label: 'Save', click: () => { save(mainWindow, false) } },
                { label: 'Save as..', click: () => { save(mainWindow, true) } },
                { role: 'quit' }
            ]
        },
        {
            label: 'Help',
            submenu: [
                {
                    label: 'Version',
                    click: () => {
                        console.log('version');
                    }
                }
            ]
        }
    ]

    const menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)
}

function create(mainWindow: BrowserWindow) {
    // TODO: Confirm save action.

    const stateManager = StateManager.getInstancec()
    stateManager.setCurrentPath('')

    mainWindow.webContents.send(electronAPI.events.onCreate)
}

async function open(mainWindow: BrowserWindow) {
    const result = await dialog.showOpenDialog({
        title: 'Open',
        filters: [
            { name: 'Markdown', extensions: ['md', 'markdown'] }
        ],
        properties: ['openFile']
    })

    if (result.canceled || result.filePaths.length === 0) return

    const filePath = result.filePaths[0]
    const content = await fs.promises.readFile(filePath, 'utf-8')
    mainWindow.webContents.send(electronAPI.events.onOpen, content)
    
    const stateManager = StateManager.getInstancec()
    stateManager.setCurrentPath(filePath)
}

async function save(mainWindow: BrowserWindow, isSaveAs: boolean) {
    mainWindow.webContents.send(electronAPI.events.onSave, isSaveAs)
}