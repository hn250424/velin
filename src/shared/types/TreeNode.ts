export default interface TreeNode {
    path: string
    name: string
    indent: number
    directory: boolean
    expanded: boolean
    children: TreeNode[] | null
}