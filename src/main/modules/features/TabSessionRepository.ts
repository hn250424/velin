
import IFileManager from 'src/main/services/ports/IFileManager'
import ITabSessionRepository from 'src/main/services/ports/ITabSessionRepository'
import TabSession from '../../interface/TabSession'
import { injectable } from 'inversify'

@injectable()
export default class TabSessionRepository implements ITabSessionRepository {

    constructor(private tabSessionPath: string, private fileManager: IFileManager) {
        
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
        this.fileManager.write(this.tabSessionPath, JSON.stringify(tabSessionArr, null, 4))
    }

    getTabSessionPath(): string {
        return this.tabSessionPath
    }
}