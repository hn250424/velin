import TabSession from "src/main/models/TabSession"

export default interface ITabSessionRepository {
    readTabSession(): Promise<TabSession[]>
    writeTabSession(tabSessionArr: TabSession[]): Promise<void>
    getTabSessionPath(): string
}