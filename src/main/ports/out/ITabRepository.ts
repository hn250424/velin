import TabSessionModel from "src/main/models/TabSessionModel"

export default interface ITabRepository {
    readTabSession(): Promise<TabSessionModel[]>
    writeTabSession(tabSessionArr: TabSessionModel[]): Promise<void>
    getTabSessionPath(): string
}