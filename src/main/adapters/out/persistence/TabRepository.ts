
import IFileManager from '@contracts/out/IFileManager'
import ITabRepository from '@contracts/out/ITabRepository'
import { TabSessionModel } from '../../../models/TabSessionModel'
import { injectable } from 'inversify'

@injectable()
export default class TabRepository implements ITabRepository {

    constructor(private tabSessionPath: string, private fileManager: IFileManager) {

    }

    async readTabSession(): Promise<TabSessionModel> {
        try {
            const json = await this.fileManager.read(this.tabSessionPath)
            return JSON.parse(json)
        } catch (e) {
            return null
        }
    }

    async writeTabSession(tabSessionArr: TabSessionModel) {
        this.fileManager.write(this.tabSessionPath, JSON.stringify(tabSessionArr, null, 4))
    }

    getTabSessionPath(): string {
        return this.tabSessionPath
    }
}