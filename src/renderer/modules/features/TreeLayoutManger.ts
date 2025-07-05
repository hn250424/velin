import { DATASET_ATTR_TREE_PATH, EXPANDED_TEXT, NOT_EXPANDED_TEXT } from "../../constants/dom"
import TreeDto from "@shared/dto/TreeDto"

export default class TreeLayoutMaanger {
    private static instance: TreeLayoutMaanger | null = null

    private _treeOpenStatus = false

    private _tree: HTMLElement
    private _tree_top: HTMLElement
    private _tree_top_name: HTMLElement
    private _tree_top_add_file: HTMLElement
    private _tree_top_add_directory: HTMLElement
    private _tree_content: HTMLElement
    private _tree_resizer: HTMLElement

    private pathToTreeDtoModelMap: Map<string, TreeDto> = new Map()
    flattenTreeArray: TreeDto[] = []

    constructor() {
        this._tree_content = document.getElementById('tree_content')
        this._tree_top_name = document.getElementById('tree_top_name')
    }

    static getInstance(): TreeLayoutMaanger {
        if (this.instance === null) {
            this.instance = new TreeLayoutMaanger()
        }

        return this.instance
    }

    clean(container: HTMLElement) {
        while (container.firstChild) {
            container.removeChild(container.firstChild)
        }
    }

    renderTreeData(dto: TreeDto, container?: HTMLElement) {
        if (!container) {
            this._tree_top_name.textContent = dto.name
            container = this._tree_content
        }

        this.clean(container)

        if (dto.children) {
            for (const child of dto.children) {
                this._renderNode(container, child)
            }
        }
    }

    private _renderNode(container: HTMLElement, dto: TreeDto) {
        const box = document.createElement('div')
        box.classList.add('tree_node')
        box.style.paddingLeft = `${(dto.indent - 1) * 16}px`
        box.dataset[DATASET_ATTR_TREE_PATH] = dto.path
        box.title = dto.path
        this.setTreeDtoByPath(dto.path, dto)

        const openStatus = document.createElement('span')
        openStatus.classList.add('tree_node_open_status')
        if (dto.directory) openStatus.textContent = dto.expanded ? EXPANDED_TEXT : NOT_EXPANDED_TEXT

        const icon = document.createElement('img')
        icon.classList.add('tree_node_icon')
        icon.src = dto.directory
            ? new URL('../../assets/icons/setting.png', import.meta.url).toString()
            : new URL('../../assets/icons/file.png', import.meta.url).toString()

        const text = document.createElement('span')
        text.classList.add('tree_node_text', 'ellipsis')
        text.textContent = dto.name

        const childrenContainer = document.createElement('div')
        childrenContainer.classList.add('tree_children')
        childrenContainer.style.display = dto.expanded ? 'block' : 'none'

        box.appendChild(openStatus)
        box.appendChild(icon)
        box.appendChild(text)

        const wrapper = document.createElement('div')
        wrapper.classList.add('tree_node_wrapper')
        wrapper.appendChild(box)
        wrapper.appendChild(childrenContainer)

        container.appendChild(wrapper)

        if (dto.expanded && dto.children && dto.children.length > 0) {
            for (const child of dto.children) {
                this._renderNode(childrenContainer, child)
            }
        }
    }

    // TODO: Check.
    ///////////////
    restoreFlattenTree(tree: TreeDto) {
        this.flattenTreeArray = this.flattenTree(tree)
    }

    flattenTree(tree: TreeDto): TreeDto[] {
        const result: TreeDto[] = []

        function dfs(node: TreeDto) {
            result.push(node)
            if (node.children) {
                for (const child of node.children) {
                    dfs(child)
                }
            }
        }

        dfs(tree)
        return result
    }

    extractTreeDto(): TreeDto | null {
        if (!this.flattenTreeArray || this.flattenTreeArray.length === 0) return null

        const pathToNode = new Map<string, TreeDto>()
        const root = structuredClone(this.flattenTreeArray[0])
        pathToNode.set(root.path, root)

        for (let i = 1; i < this.flattenTreeArray.length; i++) {
            const node = structuredClone(this.flattenTreeArray[i])
            node.children = null
            pathToNode.set(node.path, node)
        }

        for (let i = 1; i < this.flattenTreeArray.length; i++) {
            const node = pathToNode.get(this.flattenTreeArray[i].path)!
            for (let j = i - 1; j >= 0; j--) {
                const possibleParent = this.flattenTreeArray[j]
                if (possibleParent.indent === node.indent - 1) {
                    const parent = pathToNode.get(possibleParent.path)!
                    if (!parent.children) parent.children = []
                    if (!parent.children.some(c => c.path === node.path)) {
                        parent.children.push(node)
                    }
                    break
                }
            }
        }

        return root
    }

    expandNode(node: TreeDto) {
        const index = this.flattenTreeArray.findIndex(dto => dto.path === node.path)
        if (index === -1) return

        const childrenToInsert = this.flattenTree(node).slice(1)
        this.flattenTreeArray.splice(index + 1, 0, ...childrenToInsert)
    }

    collapseNode(node: TreeDto) {
        const index = this.flattenTreeArray.findIndex(dto => dto.path === node.path)
        if (index === -1) return

        let removeCount = 0
        for (let i = index + 1; i < this.flattenTreeArray.length; i++) {
            if (this.flattenTreeArray[i].indent <= node.indent) break
            removeCount++
        }
        this.flattenTreeArray.splice(index + 1, removeCount)
    }
    ////////////////

    isTreeOpen(): boolean {
        return this._treeOpenStatus
    }

    setTreeOpen(status: boolean) {
        this._treeOpenStatus = status
    }

    setTreeDtoByPath(path: string, dto: TreeDto) {
        this.pathToTreeDtoModelMap.set(path, dto)
    }

    getTreeDtoByPath(path: string) {
        return this.pathToTreeDtoModelMap.get(path)
    }
}