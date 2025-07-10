import ITreeRepository from "@contracts/out/ITreeRepository"
import TreeDto from "@shared/dto/TreeDto"
import TreeSessionModel from "src/main/models/TreeSessionModel"
import IFileManager from "@contracts/out/IFileManager"

export default class FakeTreeRepository implements ITreeRepository {
    constructor(
        private treeSessionPath: string,
        private fileManager: IFileManager
    ) { }

    async readTreeSession(): Promise<TreeSessionModel | null> {
        if (!(await this.fileManager.exists(this.treeSessionPath))) {
            return null
        }

        const json = await this.fileManager.read(this.treeSessionPath)
        return JSON.parse(json)
    }

    async writeTreeSession(treeSession: TreeSessionModel): Promise<void> {
        await this.fileManager.write(this.treeSessionPath, JSON.stringify(treeSession, null, 4))
    }
    
    async updateSessionWithFsData(
        dirPath: string,
        indent: number,
        fsChildren: TreeDto[]
    ): Promise<TreeSessionModel | null> {
        const newTree: TreeSessionModel = {
            path: dirPath,
            name: dirPath.split(/[\\/]/).pop() || '',
            indent,
            directory: true,
            expanded: true,
            children: fsChildren.map(child => ({
                ...child,
                children: null as null
            })),
        }

        await this.writeTreeSession(newTree)
        return newTree
    }

    async setTreeSession(treeSession: TreeSessionModel): Promise<void> {
        await this.writeTreeSession(treeSession)
    }
}