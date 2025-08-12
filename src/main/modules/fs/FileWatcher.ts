import { FSWatcher, watch } from 'chokidar'
import { BrowserWindow } from 'electron'
import { injectable } from 'inversify'
import path from 'path'
import IFileManager from '../contracts/IFileManager'
import ITabUtils from '../contracts/ITabUtils'
import ITreeUtils from '../contracts/ITreeUtils'
import ITabRepository from '../contracts/ITabRepository'
import ITreeRepository from '../contracts/ITreeRepository'
import { electronAPI } from '@shared/constants/electronAPI/electronAPI'
import TreeDto from '@shared/dto/TreeDto'

@injectable()
export default class FileWatcher {
    private watcher: FSWatcher | null = null
    private skip: boolean = false

    constructor(
        private mainWindow: BrowserWindow,
        private fileManager: IFileManager,
        private tabUtils: ITabUtils,
        private treeUtils: ITreeUtils,
        private tabRepository: ITabRepository,
        private treeRepository: ITreeRepository
    ) { }

    setSkipState(state: boolean) {
        this.skip = state
    }

    async watch(dirPath: string) {
        this._watch(dirPath)
    }

    private async _watch(dirPath: string) {
        await this.watcher?.close()
        this.watcher = watch(dirPath, {
            persistent: true,
            ignoreInitial: true,
            awaitWriteFinish: {
                stabilityThreshold: 200,
                pollInterval: 100,
            },
            ignored: (filePath: string) => {
                const base = path.basename(filePath)
                return base.startsWith('.')
                // return base.startsWith('.') || base === 'node_modules'
            },
        })

        this.watcher.on('add', async (changedPath) => await this._process(changedPath))
        this.watcher.on('addDir', async (changedPath) => await this._process(changedPath))
        this.watcher.on('unlink', async (changedPath) => await this._process(changedPath))
        this.watcher.on('unlinkDir', async (changedPath) => await this._process(changedPath))

        this.watcher.on('error', err => { console.error('[watcher error]', err) })
    }

    private async _process(changedPath: string) {
        if (this.skip) return

        const tabSession = await this.tabRepository.readTabSession()
        const newTabSession = tabSession ? await this.tabUtils.syncSessionWithFs(tabSession) : null
        if (newTabSession) await this.tabRepository.writeTabSession(newTabSession)

        const treeSession = await this.treeRepository.readTreeSession()
        const newTreeSession = treeSession ? await this.treeUtils.syncWithFs(treeSession) : null
        if (newTreeSession) await this.treeRepository.writeTreeSession(newTreeSession)

        const tabDto = newTabSession ? await this.tabUtils.toTabEditorsDto(newTabSession) : null
        const treeDto = newTreeSession ? newTreeSession as TreeDto : null

        this.mainWindow.webContents.send(electronAPI.events.mainToRenderer.syncFromWatch, tabDto, treeDto)
    }
}