import ITreeRepository from "@modules_contracts/ITreeRepository"
import TreeDto from "@shared/dto/TreeDto"
import TreeSessionModel from "@main/models/TreeSessionModel"
import IFileManager from "@modules_contracts/IFileManager"
import path from 'path'
import ITreeManager from "@modules_contracts/ITreeManager"

export default class FakeTreeRepository implements ITreeRepository {
    constructor(
        private treeSessionPath: string,
        private fakeFileManager: IFileManager,
        private fakeTreeManager: ITreeManager
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