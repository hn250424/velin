import 'reflect-metadata'
import { app } from 'electron'
import path from 'path'
import { TAB_SESSION_PATH, Tree_SESSION_PATH } from './constants/file_info'
import { Container } from 'inversify'
import DI_KEYS from './constants/di_keys'
import IFileManager from '@contracts/out/IFileManager'
import FileManager from './adapters/out/fs/FileManager'
import ITabSessionRepository from '@contracts/out/ITabSessionRepository'
import TabSessionRepository from './adapters/out/persistence/TabSessionRepository'
import IDialogService from '@contracts/out/IDialogService'
import dialogService from './adapters/out/ui/dialogService'
import FileService from '@services/FileService'
import TabService from '@services/TabService'
import IFileService from '@contracts/in/IFileService'
import ITreeRepository from '@contracts/out/ITreeRepository'
import TreeReposotory from './adapters/out/persistence/TreeReposotory'
import ITabService from '@contracts/in/ITabService'
import ITreeManager from '@contracts/out/ITreeManager'
import TreeManager from './adapters/out/persistence/TreeManager'

const diContainer = new Container()

diContainer.bind<IFileManager>(DI_KEYS.FileManager).to(FileManager).inSingletonScope()
diContainer.bind<IDialogService>(DI_KEYS.dialogService).toConstantValue(dialogService)
diContainer.bind<ITreeManager>(DI_KEYS.TreeManager).to(TreeManager).inSingletonScope()

const _fileManager = diContainer.get<IFileManager>(DI_KEYS.FileManager)
const _dialogService = diContainer.get<IDialogService>(DI_KEYS.dialogService)

const userDataPath = app.getPath('userData')
const tabSessionPath = path.join(userDataPath, TAB_SESSION_PATH)
diContainer.bind<ITabSessionRepository>(DI_KEYS.TabSessionRepository)
    .toDynamicValue(() => new TabSessionRepository(tabSessionPath, _fileManager))
    .inSingletonScope()

const _tabSessionRepository = diContainer.get<ITabSessionRepository>(DI_KEYS.TabSessionRepository)

const treeSessionPath = path.join(userDataPath, Tree_SESSION_PATH)
diContainer.bind<ITreeRepository>(DI_KEYS.TreeReposotory)
    .toDynamicValue(() => new TreeReposotory(treeSessionPath, _fileManager))
    .inSingletonScope()

diContainer.bind<IFileService>(DI_KEYS.FileService).to(FileService).inSingletonScope()
// diContainer.bind<IFileService>(DI_KEYS.FileService)
//     .toDynamicValue(() => new FileService(_fileManager, _tabSessionRepository, _dialogService))
//     .inSingletonScope()

diContainer.bind<ITabService>(DI_KEYS.TabService).to(TabService).inSingletonScope()

export default diContainer