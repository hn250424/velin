import TreeSessionModel from 'src/main/models/TreeSessionModel'
import IFileManager from 'src/main/modules/contracts/IFileManager'
import ITreeReposotory from 'src/main/modules/contracts/ITreeRepository'

export default class TreeReposotory implements ITreeReposotory {
    private session: TreeSessionModel | null = null

    constructor(
        private treeSessionPath: string,
        private fileManager: IFileManager,
    ) {

    }

    async readTreeSession(): Promise<TreeSessionModel> {
        if (this.session) return this.session

        try {
            const json = await this.fileManager.read(this.treeSessionPath)
            this.session = JSON.parse(json)
            return this.session
        } catch (e) {
            return null
        }
    }

    async writeTreeSession(treeSessionModel: TreeSessionModel) {
        this.session = treeSessionModel
        this.fileManager.write(this.treeSessionPath, JSON.stringify(treeSessionModel, null, 4))
    }
}