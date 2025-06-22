import { app } from 'electron'
import path from 'path'

import TabSession from 'src/main/interface/TabSession'
import IFileManager from "@services/ports/IFileManager"
import ITabSessionRepository from "@services/ports/ITabSessionRepository"

export default class FakeTabSessionRepository implements ITabSessionRepository {
    constructor(private tabSessionPath: string, private fileManager: IFileManager) {

    }

    async setTabSession(tabSessionArr: TabSession[]) {
        await this.fileManager.write(this.tabSessionPath, JSON.stringify(tabSessionArr, null, 4))
    }

    async readTabSession(): Promise<TabSession[]> {
        if (!(await this.fileManager.exists(this.tabSessionPath))) {
            return []
        } else {
            const json = await this.fileManager.read(this.tabSessionPath)
            return JSON.parse(json)
        }
    }

    async writeTabSession(tabSessionArr: TabSession[]) {
        await this.fileManager.write(this.tabSessionPath, JSON.stringify(tabSessionArr, null, 4))
    }
}