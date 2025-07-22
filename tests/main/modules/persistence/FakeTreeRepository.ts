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
                return newNode
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

    async syncTreeSessionWithFs(): Promise<TreeSessionModel | null> {
        const syncTree = async (node: TreeSessionModel): Promise<TreeSessionModel | null> => {
            if (!node.directory) return node

            const realNode = await this.fakeTreeManager.getDirectoryTree(node.path, node.indent)
            if (!realNode) return null

            if (!node.expanded) {
                return {
                    ...node,
                    children: null,
                }
            }

            const sessionChildren = node.children ?? []
            const sessionMap = new Map(sessionChildren.map(c => [c.path, c]))

            const updatedChildren: TreeSessionModel[] = []
            for (const child of realNode.children ?? []) {
                const sessionChild = sessionMap.get(child.path) ?? child
                const syncedChild = await syncTree(sessionChild)
                if (syncedChild) updatedChildren.push(syncedChild)
            }

            return {
                ...node,
                expanded: node.expanded,
                children: updatedChildren.length > 0 ? updatedChildren : null,
            }
        }

        const session = await this.readTreeSession()
        if (!session) return null

        const syncedSession = await syncTree(session)

        await this.writeTreeSession(syncedSession)
        return syncedSession
    }
}