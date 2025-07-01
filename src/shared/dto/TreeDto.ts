export default interface TreeDto {
    path: string
    name: string
    indent: number
    directory: boolean
    expanded: boolean
    children: TreeDto[] | null
}