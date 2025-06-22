import { app, BrowserWindow, Menu } from 'electron'
import started from 'electron-squirrel-startup'
import path from 'node:path'
import { fileURLToPath } from 'url'

import registerFileHandlers from './handlers/fileHandlers'
import registerLoadHandlers from './handlers/loadHandlers'
import registerWindowHandlers from './handlers/windowHandlers'


const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const createMainWindow = () => {
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        titleBarStyle: 'hidden',
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

    registerLoadHandlers(mainWindow)
    registerWindowHandlers(mainWindow)
    registerFileHandlers(mainWindow)

    loadUrl(mainWindow)
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