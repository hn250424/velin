import ITreeRepository from "@contracts/out/ITreeRepository"
import TreeDto from "@shared/dto/TreeDto"
import TreeSessionModel from "src/main/models/TreeSessionModel"
import IFileManager from "@contracts/out/IFileManager"
import path from 'path'

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
        fsChildren: TreeDto[] | null
    ): Promise<TreeSessionModel | null> {
        const newNode: TreeSessionModel = {
            path: dirPath,
            name: path.basename(dirPath),
            indent,
            directory: true,
            expanded: true,
            children: fsChildren?.map(child => ({
                ...child,
                children: null as null
            })) ?? null,
        }

        let preTree = await this.readTreeSession()

        if (!preTree) {
            await this.writeTreeSession(newNode)
            return newNode
        }

        const replaceNode = (root: TreeSessionModel): TreeSessionModel => {
            if (root.path === dirPath) {
                return newNode;
            }

            if (root.children) {
                const newChildren = root.children.map(child => replaceNode(child))
                return { ...root, children: newChildren }
            }

            return root
        }

        const updatedTree = replaceNode(preTree)
        await this.writeTreeSession(updatedTree)

        return updatedTree
    }

    async setTreeSession(treeSession: TreeSessionModel): Promise<void> {
        await this.writeTreeSession(treeSession)
    }
}