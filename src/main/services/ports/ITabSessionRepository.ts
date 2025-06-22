import TabSession from "src/main/interface/TabSession"

export default interface ITabSessionRepository {
    readTabSession(): Promise<TabSession[]>
    writeTabSession(tabSessionArr: TabSession[]): Promise<void>
}