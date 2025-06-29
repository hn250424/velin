import TreeNode from "@shared/types/TreeNode"

export default interface ITreeRepository {
    getDirectoryTree(dirPath: string, indent?: number): TreeNode
}