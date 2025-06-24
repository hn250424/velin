import 'reflect-metadata'
import { app } from 'electron'
import path from 'path'
import { TAB_SESSION_PATH } from './constants/file_info'
import { Container } from 'inversify'
import DI_KEYS from './constants/di_keys'
import IFileManager from '@contracts/IFileManager'
import FileManager from './modules/core/FileManager'
import ITabSessionRepository from '@contracts/ITabSessionRepository'
import TabSessionRepository from './modules/features/TabSessionRepository'
import IDialogService from '@contracts/IDialogService'
import dialogService from './modules/features/dialogService'
import FileService from '@services/FileService'
import IFileService from '@services/contracts/IFileService'

const diContainer = new Container()

diContainer.bind<IFileManager>(DI_KEYS.FileManager).to(FileManager).inSingletonScope()
diContainer.bind<IDialogService>(DI_KEYS.dialogService).toConstantValue(dialogService)

const _fileManager = diContainer.get<IFileManager>(DI_KEYS.FileManager)
const _dialogService = diContainer.get<IDialogService>(DI_KEYS.dialogService)

const userDataPath = app.getPath('userData')
const tabSessionPath = path.join(userDataPath, TAB_SESSION_PATH)
diContainer.bind<ITabSessionRepository>(DI_KEYS.TabSessionRepository)
    .toDynamicValue(() => new TabSessionRepository(tabSessionPath, _fileManager))
    .inSingletonScope()

const _tabSessionRepository = diContainer.get<ITabSessionRepository>(DI_KEYS.TabSessionRepository)

diContainer.bind<IFileService>(DI_KEYS.FileService).to(FileService).inSingletonScope()
// diContainer.bind<IFileService>(DI_KEYS.FileService)
//     .toDynamicValue(() => new FileService(_fileManager, _tabSessionRepository, _dialogService))
//     .inSingletonScope()

export default diContainer