import IFileManager from '@contracts/out/IFileManager'
import ITreeReposotory from '@contracts/out/ITreeRepository'
import TreeDto from '@shared/dto/TreeDto'
import path from 'path'
import TreeSessionModel from 'src/main/models/TreeSessionModel'

export default class TreeReposotory implements ITreeReposotory {

    constructor(private treeSessionPath: string, private fileManager: IFileManager) {
 
    }

    async readTreeSession(): Promise<TreeSessionModel> {
        try {
            const json = await this.fileManager.read(this.treeSessionPath)
            return JSON.parse(json)
        } catch (e) {
            return null
        }
    }

    async writeTreeSession(treeSessionArr: TreeSessionModel) {
        this.fileManager.write(this.treeSessionPath, JSON.stringify(treeSessionArr, null, 4))
    }

    async updateSessionWithFsData(
        dirPath: string,
        indent: number,
        fsChildren: TreeDto[]
    ): Promise<TreeSessionModel | null> {
        let preTree = await this.readTreeSession()

        if (!preTree) {
            const newTree: TreeSessionModel = {
                path: dirPath,
                name: path.basename(dirPath),
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

        const newNode: TreeSessionModel = {
            path: dirPath,
            name: path.basename(dirPath),
            indent,
            directory: true,
            expanded: true,
            children: fsChildren
        }

        const newTree = this.replaceNode(preTree, dirPath, newNode) || preTree
        await this.writeTreeSession(newTree)
    }

    private replaceNode(root: TreeSessionModel, targetPath: string, newNode: TreeSessionModel): TreeSessionModel | null {
        if (root.path === targetPath) {
            return newNode
        }

        if (root.children) {
            const newChildren = root.children.map(child => {
                return this.replaceNode(child, targetPath, newNode)
            })

            return { ...root, children: newChildren }
        }

        return root
    }
}