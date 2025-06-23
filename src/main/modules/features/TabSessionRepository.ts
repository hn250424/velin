
import IFileManager from 'src/main/contracts/IFileManager'
import ITabSessionRepository from 'src/main/contracts/ITabSessionRepository'
import TabSession from '../../models/TabSession'
import { injectable } from 'inversify'

@injectable()
export default class TabSessionRepository implements ITabSessionRepository {

    constructor(private tabSessionPath: string, private fileManager: IFileManager) {

    }

    async readTabSession(): Promise<TabSession[]> {
        if (!(await this.fileManager.exists(this.tabSessionPath))) {
            return []
        }

        const json = await this.fileManager.read(this.tabSessionPath)
        return json.trim() ? JSON.parse(json) : []
    }

    async writeTabSession(tabSessionArr: TabSession[]) {
        this.fileManager.write(this.tabSessionPath, JSON.stringify(tabSessionArr, null, 4))
    }

    getTabSessionPath(): string {
        return this.tabSessionPath
    }
}