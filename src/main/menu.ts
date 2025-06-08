import { ipcMain, Menu, MenuItemConstructorOptions, BrowserWindow, dialog } from 'electron'
import fs from 'fs'
import path from 'path'

import StateManager from './module/core/StateManager'
import { Mode } from '../Shared/constants/Mode'
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
            label: 'Mode',
            submenu: [
                { label: 'Edit', type: 'radio', click: () => { setMode(mainWindow, Mode.Edit) } },
                { label: 'Reading', type: 'radio', checked: true, click: () => { setMode(mainWindow, Mode.Reading) } }
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

    const stateManager = StateManager.getInstancec()
    stateManager.setCurrentPath(filePath)

    mainWindow.webContents.send(electronAPI.events.onOpen, content)
}

async function save(mainWindow: BrowserWindow, isSaveAs: Boolean) {
    mainWindow.webContents.send(electronAPI.events.onSave, isSaveAs)
}

function setMode(mainWindow: BrowserWindow, mode: number) {
    const stateManager = StateManager.getInstancec()
    stateManager.setModeState(mode)

    mainWindow.webContents.send(electronAPI.events.onSetMode, mode)
}

