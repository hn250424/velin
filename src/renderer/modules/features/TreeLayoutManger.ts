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
        if (dto.indent === 0 || !container) {
            this._tree_top_name.textContent = dto.name
            container = this._tree_content
        }

        if (dto.expanded) container.style.display = 'block'

        if (!container) return
        this.clean(container)

        for (const child of dto.children) {
            this._renderNode(container, child)
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
    }

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