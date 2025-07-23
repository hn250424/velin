import path from 'path'
import ITreeManager from "src/main/modules/contracts/ITreeManager"
import TreeDto from "@shared/dto/TreeDto"
import TreeSessionModel from "@main/models/TreeSessionModel"
import IFileManager from "@main/modules/contracts/IFileManager"

export default class FakeTreeManager implements ITreeManager {
    private tree: TreeDto | null = null

    constructor(
        private fakeFileManager: IFileManager
    ) {

    }

    setTree(tree: TreeDto) {
        this.tree = tree
    }

    async getDirectoryTree(dirPath: string, indent: number = 0): Promise<TreeDto | null> {
        if (!this.tree) return null

        const findNode = (node: TreeDto): TreeDto | null => {
            if (node.path === dirPath) return node
            if (!node.children) return null

            for (const child of node.children) {
                const result = findNode(child)
                if (result) return result
            }

            return null
        }

        const node = findNode(this.tree)
        return node ? { ...node, indent } : null
    }


    async updateSessionWithFsData(
        dirPath: string,
        indent: number,
        fsChildren: TreeDto[] | null,
        preTree: TreeSessionModel
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

        if (!preTree) {
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
        return updatedTree
    }

    async syncWithFs(node: TreeSessionModel): Promise<TreeSessionModel | null> {
        if (!node.directory) return node

        const realNode = await this.getDirectoryTree(node.path, node.indent)
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
            const syncedChild = await this.syncWithFs(sessionChild)
            if (syncedChild) updatedChildren.push(syncedChild)
        }

        return {
            ...node,
            expanded: node.expanded,
            children: updatedChildren.length > 0 ? updatedChildren : null,
        }
    }
}