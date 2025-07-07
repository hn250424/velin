import { DATASET_ATTR_TREE_PATH, EXPANDED_TEXT, NOT_EXPANDED_TEXT } from "../../constants/dom"
import TreeDto from "@shared/dto/TreeDto"
import TreeViewModel from "../../viewmodels/TreeViewModel"

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

    private pathToTreeViewModelMap: Map<string, TreeViewModel> = new Map()

    private flattenTreeArray: TreeViewModel[] = []
    private _lastSelectedIndex: number = -1
    private _multiSelectedIndex = new Set<number>

    private constructor() {
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

    renderTreeData(viewModel: TreeViewModel, container?: HTMLElement) {
        if (!container) {
            this._tree_top_name.textContent = viewModel.name
            container = this._tree_content
        }

        this.clean(container)

        if (viewModel.children) {
            for (const child of viewModel.children) {
                this._renderNode(container, child)
            }
        }
    }

    private _renderNode(container: HTMLElement, viewModel: TreeViewModel) {
        const box = document.createElement('div')
        box.classList.add('tree_node')
        box.style.paddingLeft = `${(viewModel.indent - 1) * 16}px`
        box.dataset[DATASET_ATTR_TREE_PATH] = viewModel.path
        box.title = viewModel.path
        this.setTreeViewModelByPath(viewModel.path, viewModel)

        const openStatus = document.createElement('span')
        openStatus.classList.add('tree_node_open_status')
        if (viewModel.directory) openStatus.textContent = viewModel.expanded ? EXPANDED_TEXT : NOT_EXPANDED_TEXT

        const icon = document.createElement('img')
        icon.classList.add('tree_node_icon')
        icon.src = viewModel.directory
            ? new URL('../../assets/icons/setting.png', import.meta.url).toString()
            : new URL('../../assets/icons/file.png', import.meta.url).toString()

        const text = document.createElement('span')
        text.classList.add('tree_node_text', 'ellipsis')
        text.textContent = viewModel.name

        const childrenContainer = document.createElement('div')
        childrenContainer.classList.add('tree_children')
        childrenContainer.style.display = viewModel.expanded ? 'block' : 'none'

        box.appendChild(openStatus)
        box.appendChild(icon)
        box.appendChild(text)

        const wrapper = document.createElement('div')
        wrapper.classList.add('tree_node_wrapper')
        wrapper.appendChild(box)
        wrapper.appendChild(childrenContainer)

        container.appendChild(wrapper)

        if (viewModel.expanded && viewModel.children && viewModel.children.length > 0) {
            for (const child of viewModel.children) {
                this._renderNode(childrenContainer, child)
            }
        }
    }

    restoreFlattenTree(tree: TreeViewModel) {
        this.flattenTreeArray = this.flattenTree(tree)
    }

    private flattenTree(tree: TreeViewModel): TreeViewModel[] {
        const result: TreeViewModel[] = []

        function dfs(node: TreeViewModel) {
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

    extractTreeViewModel(): TreeViewModel | null {
        if (!this.flattenTreeArray || this.flattenTreeArray.length === 0) return null

        const pathToNode = new Map<string, TreeViewModel>()
        const root = this.flattenTreeArray[0]
        pathToNode.set(root.path, root)

        for (let i = 1; i < this.flattenTreeArray.length; i++) {
            const node = this.flattenTreeArray[i]
            pathToNode.set(node.path, node)
        }

        for (let i = 1; i < this.flattenTreeArray.length; i++) {
            const node = pathToNode.get(this.flattenTreeArray[i].path)!
            for (let j = i - 1; j >= 0; j--) {
                const possibleParent = this.flattenTreeArray[j]
                if (possibleParent.indent === node.indent - 1) {
                    const parent = pathToNode.get(possibleParent.path)!
                    if (!parent.children) parent.children = []
                    parent.children.push(node)
                    break
                }
            }
        }

        return root
    }

    expandNode(node: TreeViewModel) {
        const index = this.flattenTreeArray.findIndex(dto => dto.path === node.path)
        if (index === -1) return

        const childrenToInsert = this.flattenTree(node).slice(1) // Remove the first element (the node itself) using slice(1)
        this.flattenTreeArray.splice(index + 1, 0, ...childrenToInsert)
    }

    collapseNode(node: TreeViewModel) {
        const index = this.flattenTreeArray.findIndex(dto => dto.path === node.path)
        if (index === -1) return

        let removeCount = 0
        for (let i = index + 1; i < this.flattenTreeArray.length; i++) {
            if (this.flattenTreeArray[i].indent <= node.indent) break
            removeCount++
        }
        this.flattenTreeArray.splice(index + 1, removeCount)
    }

    isTreeOpen(): boolean {
        return this._treeOpenStatus
    }

    setTreeOpen(status: boolean) {
        this._treeOpenStatus = status
    }

    setTreeViewModelByPath(path: string, viewModel: TreeViewModel) {
        this.pathToTreeViewModelMap.set(path, viewModel)
    }

    getTreeViewModelByPath(path: string) {
        return this.pathToTreeViewModelMap.get(path)
    }

    toTreeDto(viewModel: TreeViewModel): TreeDto {
        return {
            path: viewModel.path,
            name: viewModel.name,
            indent: viewModel.indent,
            directory: viewModel.directory,
            expanded: viewModel.expanded,
            children: viewModel.children
                ? viewModel.children.map(child => this.toTreeDto(child))
                : null
        }
    }

    toTreeViewModel(dto: TreeDto): TreeViewModel {
        return {
            path: dto.path,
            name: dto.name,
            indent: dto.indent,
            directory: dto.directory,
            expanded: dto.expanded,
            selected: false,
            children: dto.children
                ? dto.children.map(child => this.toTreeViewModel(child))
                : null
        }
    }

    getTreeViewModelByIndex(index: number) {
        return this.flattenTreeArray[index]
    }

    isTreeSelected(): boolean {
        return this._lastSelectedIndex !== -1
    }

    getLastSelectedIndex(): number {
        return this._lastSelectedIndex
    }

    removeLastSelectedIndex() {
        this._lastSelectedIndex = -1
    }

    getIndexByPath(path: string) {
        return this.flattenTreeArray.findIndex(node => node.path === path)
    }

    setLastSelectedIndexByPath(path: string) {
        this._lastSelectedIndex = this.flattenTreeArray.findIndex(node => node.path === path)
    }

    addMultiSelectedIndex(index: number) {
        this._multiSelectedIndex.add(index)

    }

    getMultiSelectedIndex(): number[] {
        return [...this._multiSelectedIndex]
    }

    clearMultiSelectedIndex() {
        this._multiSelectedIndex.clear()
    }
}