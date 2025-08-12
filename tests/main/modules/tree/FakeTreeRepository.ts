import TreeSessionModel from "@main/models/TreeSessionModel"
import IFileManager from "@main/modules/contracts/IFileManager"
import ITreeRepository from "@modules_contracts/ITreeRepository"

export default class FakeTreeRepository implements ITreeRepository {
    constructor(
        private treeSessionPath: string,
        private fakeFileManager: IFileManager,
    ) { }

    async readTreeSession(): Promise<TreeSessionModel | null> {
        if (!(await this.fakeFileManager.exists(this.treeSessionPath))) {
            return null
        }

        const json = await this.fakeFileManager.read(this.treeSessionPath)
        return JSON.parse(json)
    }

    async writeTreeSession(treeSession: TreeSessionModel): Promise<void> {
        await this.fakeFileManager.write(this.treeSessionPath, JSON.stringify(treeSession, null, 4))
    }

    async setTreeSession(treeSession: TreeSessionModel): Promise<void> {
        await this.writeTreeSession(treeSession)
    }
}