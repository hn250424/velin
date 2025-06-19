import { app } from 'electron'
import fs from 'fs'
import path from 'path'

import { TAB_SESSION_PATH } from '../../constants/file_info'
import TabSession from '../../interface/TabSession'

export default class TabSessionManager {
    static instance: TabSessionManager | null = null

    private userDataPath = app.getPath('userData')
    private tabSessionPath = path.join(this.userDataPath, TAB_SESSION_PATH)

    private constructor() {}

    static getInstance(): TabSessionManager {
        if (this.instance === null) {
            this.instance = new TabSessionManager()
        }
        return this.instance
    }

    readTabSession(): TabSession[] {
        if (!fs.existsSync(this.tabSessionPath)) {
            return []
        } else {
            const jsonTabSession = fs.readFileSync(this.tabSessionPath, 'utf-8')
            return JSON.parse(jsonTabSession)
        }
    }

    writeTabSession(tabSessionArr: TabSession[]) {
        fs.writeFileSync(this.tabSessionPath, JSON.stringify(tabSessionArr, null, 4), 'utf-8')
    }
}