export default interface TreeViewModel {
    path: string
    name: string
    indent: number
    directory: boolean
    expanded: boolean
    children: TreeViewModel[] | null
    selected: boolean
}