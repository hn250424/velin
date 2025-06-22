import 'reflect-metadata'
import { app } from 'electron'
import path from 'path'
import { TAB_SESSION_PATH } from './constants/file_info'
import { Container } from 'inversify'
import DI_KEYS from './types/di_keys'
import IFileManager from '@services/ports/IFileManager'
import FileManager from './modules/core/FileManager'
import ITabSessionRepository from '@services/ports/ITabSessionRepository'
import TabSessionRepository from './modules/features/TabSessionRepository'

const diContainer = new Container()

diContainer.bind<IFileManager>(DI_KEYS.FileManager).to(FileManager).inSingletonScope()

const userDataPath = app.getPath('userData')
const tabSessionPath = path.join(userDataPath, TAB_SESSION_PATH)
const fileManager = diContainer.get<IFileManager>(DI_KEYS.FileManager)
diContainer.bind<ITabSessionRepository>(DI_KEYS.TabSessionRepository)
    .toDynamicValue(() => new TabSessionRepository(tabSessionPath, fileManager))
    .inSingletonScope()

export default diContainer