
import IFileManager from "src/main/modules/contracts/IFileManager"
import ITabRepository from "src/main/modules/contracts/ITabRepository"
import { TabSessionModel, TabSessionData } from 'src/main/models/TabSessionModel'

export default class FakeTabRepository implements ITabRepository {
    constructor(private tabSessionPath: string, private fileManager: IFileManager) {

    }

    async setTabSession(tabSessionArr: TabSessionModel) {
        await this.fileManager.write(this.tabSessionPath, JSON.stringify(tabSessionArr, null, 4))
    }

    async readTabSession(): Promise<TabSessionModel> {
        if (!(await this.fileManager.exists(this.tabSessionPath))) {
            return null
        } else {
            const json = await this.fileManager.read(this.tabSessionPath)
            return JSON.parse(json)
        }
    }

    async writeTabSession(tabSessionArr: TabSessionModel) {
        await this.fileManager.write(this.tabSessionPath, JSON.stringify(tabSessionArr, null, 4))
    }

    getTabSessionPath(): string {
        return this.tabSessionPath
    }
}