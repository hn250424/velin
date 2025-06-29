export default interface TreeNode {
    path: string
    name: string
    indent: number
    directory: boolean
    children: TreeNode[] | null
}