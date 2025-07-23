import 'reflect-metadata'
import { app } from 'electron'
import path from 'path'
import { TAB_SESSION_PATH, TREE_SESSION_PATH } from './constants/file_info'
import { Container } from 'inversify'
import DI_KEYS from './constants/di_keys'
import IFileManager from 'src/main/modules/contracts/IFileManager'
import FileManager from './modules/fs/FileManager'
import ITabRepository from 'src/main/modules/contracts/ITabRepository'
import TabRepository from './modules/persistence/TabRepository'
import IDialogService from 'src/main/modules/contracts/IDialogService'
import dialogService from './modules/ui/dialogService'
import FileService from '@services/FileService'
import TabService from '@services/TabService'
import IFileService from '@services/contracts/IFileService'
import ITreeRepository from 'src/main/modules/contracts/ITreeRepository'
import TreeReposotory from './modules/persistence/TreeReposotory'
import ITabService from '@services/contracts/ITabService'
import ITreeManager from 'src/main/modules/contracts/ITreeManager'
import TreeManager from './modules/managers/TreeManager'
import ITreeService from '@services/contracts/ITreeService'
import TreeService from '@services/TreeService'

const diContainer = new Container()

diContainer.bind<IFileManager>(DI_KEYS.FileManager).to(FileManager).inSingletonScope()
diContainer.bind<IDialogService>(DI_KEYS.dialogService).toConstantValue(dialogService)
diContainer.bind<ITreeManager>(DI_KEYS.TreeManager).to(TreeManager).inSingletonScope()

const _fileManager = diContainer.get<IFileManager>(DI_KEYS.FileManager)
const _dialogService = diContainer.get<IDialogService>(DI_KEYS.dialogService)
const _treeManager = diContainer.get<ITreeManager>(DI_KEYS.TreeManager)

const userDataPath = app.getPath('userData')
const tabSessionPath = path.join(userDataPath, TAB_SESSION_PATH)
diContainer.bind<ITabRepository>(DI_KEYS.TabRepository)
    .toDynamicValue(() => new TabRepository(tabSessionPath, _fileManager))
    .inSingletonScope()

const _tabRepository = diContainer.get<ITabRepository>(DI_KEYS.TabRepository)

const treeSessionPath = path.join(userDataPath, TREE_SESSION_PATH)
diContainer.bind<ITreeRepository>(DI_KEYS.TreeReposotory)
    .toDynamicValue(() => new TreeReposotory(treeSessionPath, _fileManager, _treeManager))
    .inSingletonScope()

diContainer.bind<IFileService>(DI_KEYS.FileService).to(FileService).inSingletonScope()
// diContainer.bind<IFileService>(DI_KEYS.FileService)
//     .toDynamicValue(() => new FileService(_fileManager, _tabRepository, _dialogService))
//     .inSingletonScope()

diContainer.bind<ITabService>(DI_KEYS.TabService).to(TabService).inSingletonScope()
diContainer.bind<ITreeService>(DI_KEYS.TreeService).to(TreeService).inSingletonScope()

export default diContainer