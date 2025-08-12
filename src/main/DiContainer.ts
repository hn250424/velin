import 'reflect-metadata'
import { app, BrowserWindow } from 'electron'
import path from 'path'
import { TAB_SESSION_PATH, TREE_SESSION_PATH } from './constants/file_info'
import { Container } from 'inversify'
import DI_KEYS from './constants/di_keys'
import IFileManager from '@main/modules/contracts/IFileManager'
import FileManager from './modules/fs/FileManager'
import ITabRepository from 'src/main/modules/contracts/ITabRepository'
import TabRepository from './modules/tab/TabRepository'
import IDialogManager from 'src/main/modules/contracts/IDialogManager'
import dialogManager from './modules/ui/dialogManager'
import FileService from '@services/FileService'
import TabService from '@services/TabService'
import ITreeRepository from 'src/main/modules/contracts/ITreeRepository'
import TreeRepository from './modules/tree/TreeRepository'
import ITreeUtils from '@main/modules/contracts/ITreeUtils'
import TreeUtils from './modules/tree/TreeUtils'
import TreeService from '@services/TreeService'
import ITabUtils from './modules/contracts/ITabUtils'
import TabUtils from './modules/tab/TabUtils'
import IFileWatcher from './modules/contracts/IFileWatcher'
import FileWatcher from './modules/fs/FileWatcher'

export default class DIContainer {
    private static _instance: Container | null = null
    private static _mainWindow: BrowserWindow | null = null

    private constructor() { }

    public static init(mainWindow: BrowserWindow) {
        if (this._instance) throw new Error('DIContainer.init(mainWindow) must be called before getInstance()')
        this._mainWindow = mainWindow
    }

    public static getInstance(): Container {
        if (!this._mainWindow) throw new Error('DIContainer.init(mainWindow) must be called before getInstance()')
            
        if (!this._instance) {
            const container = new Container()

            container.bind<IFileManager>(DI_KEYS.FileManager).to(FileManager).inSingletonScope()
            container.bind<IDialogManager>(DI_KEYS.dialogManager).toConstantValue(dialogManager)
            container.bind<ITreeUtils>(DI_KEYS.TreeUtils).to(TreeUtils).inSingletonScope()
            container.bind<ITabUtils>(DI_KEYS.TabUtils).to(TabUtils).inSingletonScope()

            const userDataPath = app.getPath('userData')
            const tabSessionPath = path.join(userDataPath, TAB_SESSION_PATH)
            const treeSessionPath = path.join(userDataPath, TREE_SESSION_PATH)

            const fileManager = container.get<IFileManager>(DI_KEYS.FileManager)

            container.bind<ITabRepository>(DI_KEYS.TabRepository)
                .toDynamicValue(() => new TabRepository(tabSessionPath, fileManager))
                .inSingletonScope()

            container.bind<ITreeRepository>(DI_KEYS.TreeRepository)
                .toDynamicValue(() => new TreeRepository(treeSessionPath, fileManager))
                .inSingletonScope()

            const tabUtils = container.get<ITabUtils>(DI_KEYS.TabUtils)
            const treeUtils = container.get<ITreeUtils>(DI_KEYS.TreeUtils)
            const tabRepository = container.get<ITabRepository>(DI_KEYS.TabRepository)
            const treeRepository = container.get<ITreeRepository>(DI_KEYS.TreeRepository)

            container.bind<IFileWatcher>(DI_KEYS.FileWatcher)
                .toDynamicValue(() => new FileWatcher(this._mainWindow, fileManager, tabUtils, treeUtils, tabRepository, treeRepository))
                .inSingletonScope()

            container.bind(DI_KEYS.FileService).to(FileService).inSingletonScope()
            container.bind(DI_KEYS.TabService).to(TabService).inSingletonScope()
            container.bind(DI_KEYS.TreeService).to(TreeService).inSingletonScope()

            this._instance = container
        }

        return this._instance
    }
}