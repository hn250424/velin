import IFileManager from 'src/main/modules/contracts/IFileManager'
import ITreeReposotory from 'src/main/modules/contracts/ITreeRepository'
import TreeDto from '@shared/dto/TreeDto'
import path from 'path'
import TreeSessionModel from 'src/main/models/TreeSessionModel'

export default class TreeReposotory implements ITreeReposotory {
    private session: TreeSessionModel | null = null

    constructor(private treeSessionPath: string, private fileManager: IFileManager) {
 
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

    async updateSessionWithFsData(
        dirPath: string,
        indent: number,
        fsChildren: TreeDto[] | null
    ): Promise<TreeSessionModel | null> {
        let preTree = await this.readTreeSession()

        if (!preTree) {
            const newTree: TreeSessionModel = {
                path: dirPath,
                name: path.basename(dirPath),
                indent,
                directory: true,
                expanded: true,
                children: fsChildren?.map(child => ({
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