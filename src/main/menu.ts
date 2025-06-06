import { Menu, MenuItemConstructorOptions, BrowserWindow } from 'electron'
import StateManager from './module/core/StateManager'
import { Mode } from '../Shared/constants/Mode'
import { electronAPI } from '../Shared/constants/electronAPI'

export const createMenu = (mainWindow: BrowserWindow) => {
    const template: MenuItemConstructorOptions[] = [
        {
            label: 'File',
            submenu: [
                { label: 'New', click: () => { console.log('New clicked'); } },
                { label: 'Open', click: () => { console.log('Open clicked'); } },
                { label: 'Save', click: () => { console.log('Save clicked'); } },
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

function setMode(mainWindow: BrowserWindow, mode: number) {
    const stateManager = StateManager.getInstancec()
    stateManager.setModeState(mode)

    mainWindow.webContents.send('setMode', mode);
}