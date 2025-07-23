import IFileManager from 'src/main/modules/contracts/IFileManager'
import ITreeReposotory from 'src/main/modules/contracts/ITreeRepository'
import TreeDto from '@shared/dto/TreeDto'
import path from 'path'
import TreeSessionModel from 'src/main/models/TreeSessionModel'
import ITreeManager from '../contracts/ITreeManager'

export default class TreeReposotory implements ITreeReposotory {
    private session: TreeSessionModel | null = null

    constructor(
        private treeSessionPath: string,
        private fileManager: IFileManager,
        private treeManager: ITreeManager
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







    // async updateSessionWithFsData(
    //     dirPath: string,
    //     indent: number,
    //     fsChildren: TreeDto[] | null
    // ): Promise<TreeSessionModel | null> {
    //     let preTree = await this.readTreeSession()

    //     if (!preTree) {
    //         const newTree: TreeSessionModel = {
    //             path: dirPath,
    //             name: path.basename(dirPath),
    //             indent,
    //             directory: true,
    //             expanded: true,
    //             children: fsChildren?.map(child => ({
    //                 ...child,
    //                 children: null as null
    //             })),
    //         }
    //         await this.writeTreeSession(newTree)
    //         return newTree
    //     }

    //     const newNode: TreeSessionModel = {
    //         path: dirPath,
    //         name: path.basename(dirPath),
    //         indent,
    //         directory: true,
    //         expanded: true,
    //         children: fsChildren
    //     }

    //     const newTree = this.replaceNode(preTree, dirPath, newNode) || preTree
    //     await this.writeTreeSession(newTree)
    // }

    // private replaceNode(root: TreeSessionModel, targetPath: string, newNode: TreeSessionModel): TreeSessionModel | null {
    //     if (root.path === targetPath) {
    //         return newNode
    //     }

    //     if (root.children) {
    //         const newChildren = root.children.map(child => {
    //             return this.replaceNode(child, targetPath, newNode)
    //         })

    //         return { ...root, children: newChildren }
    //     }

    //     return root
    // }

    // async syncTreeSessionWithFs() {
    //     const syncTree = async (node: TreeDto): Promise<TreeDto | null> => {
    //         const exists = await this.fileManager.exists(node.path)
    //         if (!exists) return null

    //         if (!node.directory) return node

    //         if (!node.expanded) {
    //             return {
    //                 ...node,
    //                 children: null
    //             }
    //         }

    //         const current = await this.treeManager.getDirectoryTree(node.path, node.indent)
    //         const sessionChildren = node.children ?? []
    //         const sessionMap = new Map(sessionChildren.map((c) => [c.path, c]))

    //         const updatedChildren: TreeDto[] = []

    //         for (const child of current.children ?? []) {
    //             const sessionChild = sessionMap.get(child.path)
    //             const merged = await syncTree(sessionChild ?? child)
    //             if (merged) updatedChildren.push(merged)
    //         }

    //         return {
    //             ...node,
    //             expanded: node.expanded,
    //             children: updatedChildren.length > 0 ? updatedChildren : null,
    //         }
    //     }

    //     const treeSession = await this.readTreeSession()
    //     if (!treeSession) return null

    //     const newTreeSession = await syncTree(treeSession)
    //     await this.writeTreeSession(newTreeSession)
    //     return newTreeSession
    // }
}