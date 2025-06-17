import { app, ipcMain, dialog, BrowserWindow } from 'electron'
import fs from 'fs'
import path from 'path'

import { TAB_SESSION_PATH } from '../../constants/file_info'
import TabSession from '../../interface/TabSession'

export default class TabSessionManager {
    static instance: TabSessionManager | null = null

    private userDataPath = app.getPath('userData')
    private tabSessionPath = path.join(this.userDataPath, TAB_SESSION_PATH)

    private tabSessionList: TabSession[] = []

    private constructor() {}

    static getInstance(): TabSessionManager {
        if (this.instance === null) {
            this.instance = new TabSessionManager()
        }
        return this.instance
    }

    readTabSession(): TabSession[] {
        if (!fs.existsSync(this.tabSessionPath)) {
            this.tabSessionList = []
        } else {
            const jsonTabSession = fs.readFileSync(this.tabSessionPath, 'utf-8')
            this.tabSessionList = JSON.parse(jsonTabSession)
        }

        return this.tabSessionList
    }

    writeTabSession(tabSessionArr: TabSession[]) {
        fs.writeFileSync(this.tabSessionPath, JSON.stringify(tabSessionArr, null, 4), 'utf-8')
        this.tabSessionList = tabSessionArr
    }
}