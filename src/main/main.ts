import { app, BrowserWindow, Menu } from 'electron'
import started from 'electron-squirrel-startup'
import path from 'node:path'
import { fileURLToPath } from 'url'

import registerFileHandlers from './handlers/fileHandlers'
import registerLoadHandlers from './handlers/loadHandlers'
import registerWindowHandlers from './handlers/windowHandlers'
import registerExitHandlers from './handlers/exitHandlers'
import registerEditHandlers from './handlers/editHandlers'
import registerTabHandlers from './handlers/tabHandlers'
import registerTreeHandlers from './handlers/treeHandlers'
import diContainer from './diContainer'
import DI_KEYS from './constants/di_keys'
import IFileManager from './modules/contracts/IFileManager'
import ITreeRepository from './modules/contracts/ITreeRepository'
import ITabRepository from './modules/contracts/ITabRepository'
import IFileService from '@services/contracts/IFileService'
import ITabService from '@services/contracts/ITabService'
import ITreeManager from './modules/contracts/ITreeManager'
import IDialogService from './modules/contracts/IDialogService'
import ITreeService from '@services/contracts/ITreeService'

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
            sandbox: false,
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

    const fileManager = diContainer.get<IFileManager>(DI_KEYS.FileManager)
    const dialogService = diContainer.get<IDialogService>(DI_KEYS.dialogService)
    const tabRepository = diContainer.get<ITabRepository>(DI_KEYS.TabRepository)
    const treeRepository = diContainer.get<ITreeRepository>(DI_KEYS.TreeReposotory)
    const treeManager = diContainer.get<ITreeManager>(DI_KEYS.TreeManager)

    const fileService = diContainer.get<IFileService>(DI_KEYS.FileService)
    const tabService = diContainer.get<ITabService>(DI_KEYS.TabService)
    const treeService = diContainer.get<ITreeService>(DI_KEYS.TreeService)

    registerLoadHandlers(mainWindow, fileManager, tabRepository, treeRepository, treeManager)
    registerWindowHandlers(mainWindow)
    registerFileHandlers(mainWindow, fileService)
    registerExitHandlers(mainWindow, fileManager, dialogService, tabRepository, treeRepository)
    registerTabHandlers(mainWindow, tabService)
    registerTreeHandlers(mainWindow, treeService)
    registerEditHandlers()

    loadUrl(mainWindow)
}

if (started) app.quit()
app.on('ready', createWindow)
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})
app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
})