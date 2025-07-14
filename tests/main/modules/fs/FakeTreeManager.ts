import ITreeManager from "src/main/modules/contracts/ITreeManager"
import TreeDto from "@shared/dto/TreeDto"

export default class FakeTreeManager implements ITreeManager {
    private tree: TreeDto | null = null

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
}