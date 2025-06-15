import { app, BrowserWindow, Menu, MenuItemConstructorOptions  } from 'electron'
import fs from 'fs'
import path from 'node:path'
import started from 'electron-squirrel-startup'
import { fileURLToPath } from 'url'

import { electronAPI } from '../shared/constants/electronAPI'
import { createMenu } from './menu'
import registerLoadHandlers from './handlers/loadHandlers'
import registerWindowsHandlers from './handlers/windowsHandlers'
import registerMenuHandlers from './handlers/menuHandlers'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const createMainWindow = () => {
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        frame: false,
        show: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
        },
    })

    return mainWindow
}

const loadUrl = (mainWindow: BrowserWindow) => {
    if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
        mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL)
    } else {
        mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`))
    }

    mainWindow.webContents.openDevTools({ mode: 'detach' })
}

const createWindow = () => {
    const mainWindow = createMainWindow()
    Menu.setApplicationMenu(null)
    // createMenu(mainWindow)
    loadUrl(mainWindow)

    registerLoadHandlers(mainWindow)
    registerWindowsHandlers(mainWindow)
    registerMenuHandlers(mainWindow)
    // registerIpcHandlers(mainWindow)
    
    mainWindow.webContents.once('did-finish-load', () => { mainWindow.show() })
}

if (started) app.quit()
app.on('ready', createWindow)
app.on('window-all-closed', () => {
    // TODO: Confirm save action.

    if (process.platform !== 'darwin') {
        app.quit()
    }
})
app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
})