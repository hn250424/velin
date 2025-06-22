import { app } from 'electron'
import path from 'path'

import IFileManager from 'src/main/services/ports/IFileManager'
import ITabSessionRepository from 'src/main/services/ports/ITabSessionRepository'
import { TAB_SESSION_PATH } from '../../constants/file_info'
import TabSession from '../../interface/TabSession'

export default class TabSessionRepository implements ITabSessionRepository {
    private userDataPath = app.getPath('userData')
    private tabSessionPath = path.join(this.userDataPath, TAB_SESSION_PATH)

    constructor(private fileManager: IFileManager) {

    }

    async readTabSession(): Promise<TabSession[]> {
        if (!this.fileManager.exists(this.tabSessionPath)) {
            return []
        } else {
            const json = await this.fileManager.read(this.tabSessionPath)
            return JSON.parse(json)
        }
    }

    async writeTabSession(tabSessionArr: TabSession[]) {
        this.fileManager.write(this.tabSessionPath, JSON.stringify(tabSessionArr, null, 4))
    }
}