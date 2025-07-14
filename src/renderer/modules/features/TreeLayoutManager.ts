import {
    DATASET_ATTR_TREE_PATH,
    EXPANDED_TEXT,
    NOT_EXPANDED_TEXT,
    CLASS_FOCUSED,
    CLASS_SELECTED,
    CLASS_EXPANDED,
    CLASS_TREE_NODE,
    CLASS_TREE_NODE_ICON,
    CLASS_TREE_NODE_OPEN,
    CLASS_TREE_NODE_WRAPPER,
    CLASS_TREE_NODE_CHILDREN,
    SELECTOR_TREE_NODE
} from "../../constants/dom"
import TreeDto from "@shared/dto/TreeDto"
import TreeViewModel from "../../viewmodels/TreeViewModel"

export default class TreeLayoutManager {
    private static instance: TreeLayoutManager | null = null

    private _sideOpenStatus = false

    private _tree: HTMLElement
    private _tree_top: HTMLElement
    private _tree_top_name: HTMLElement
    private _tree_top_add_file: HTMLElement
    private _tree_top_add_directory: HTMLElement
    private _tree_content: HTMLElement
    private _tree_resizer: HTMLElement

    private pathToFlattenArrayIndexMap: Map<string, number> = new Map()
    private pathToTreeWrapperMap: Map<string, HTMLElement> = new Map()
    private flattenTreeArray: TreeViewModel[] = []

    private _lastSelectedIndex: number = -1
    private _multiSelectedIndex = new Set<number>

    private constructor() {
        this._tree_content = document.getElementById('tree_content')
        this._tree_top_name = document.getElementById('tree_top_name')
    }

    static getInstance(): TreeLayoutManager {
        if (this.instance === null) {
            this.instance = new TreeLayoutManager()
        }

        return this.instance
    }

    isSideOpen(): boolean {
        return this._sideOpenStatus
    }

    setSideOpen(status: boolean) {
        this._sideOpenStatus = status
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
        box.classList.add(CLASS_TREE_NODE)
        box.style.paddingLeft = `${(viewModel.indent - 1) * 16}px`
        box.dataset[DATASET_ATTR_TREE_PATH] = viewModel.path
        box.title = viewModel.path

        const openStatus = document.createElement('span')
        openStatus.classList.add(CLASS_TREE_NODE_OPEN)
        if (viewModel.directory) openStatus.textContent = viewModel.expanded ? EXPANDED_TEXT : NOT_EXPANDED_TEXT

        const icon = document.createElement('img')
        icon.classList.add(CLASS_TREE_NODE_ICON)
        icon.src = viewModel.directory
            ? new URL('../../assets/icons/setting.png', import.meta.url).toString()
            : new URL('../../assets/icons/file.png', import.meta.url).toString()

        const text = document.createElement('span')
        text.classList.add('tree_node_text', 'ellipsis')
        text.textContent = viewModel.name

        const childrenContainer = document.createElement('div')
        childrenContainer.classList.add(CLASS_TREE_NODE_CHILDREN)
        if (viewModel.expanded) childrenContainer.classList.add(CLASS_EXPANDED)
        else childrenContainer.classList.remove(CLASS_EXPANDED)

        box.appendChild(openStatus)
        box.appendChild(icon)
        box.appendChild(text)

        const wrapper = document.createElement('div')
        wrapper.classList.add(CLASS_TREE_NODE_WRAPPER)
        wrapper.appendChild(box)
        wrapper.appendChild(childrenContainer)

        this.pathToTreeWrapperMap.set(viewModel.path, wrapper)
        container.appendChild(wrapper)

        if (viewModel.expanded && viewModel.children && viewModel.children.length > 0) {
            for (const child of viewModel.children) {
                this._renderNode(childrenContainer, child)
            }
        }
    }

    restoreFlattenArrayAndMaps(tree: TreeViewModel) {
        this.flattenTreeArray = this.flattenTree(tree)
        this.rebuildIndexMap()
    }

    rebuildIndexMap() {
        this.pathToFlattenArrayIndexMap.clear()

        for (let i = 0; i < this.flattenTreeArray.length; i++) {
            const viewModel = this.flattenTreeArray[i]
            const path = viewModel.path

            this.pathToFlattenArrayIndexMap.set(path, i)
        }
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

        this.rebuildIndexMap()
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

        this.rebuildIndexMap()
    }

    isTreeSelected(): boolean {
        return this._lastSelectedIndex !== -1
    }

    getFlattenTreeIndexByPath(path: string) {
        return this.pathToFlattenArrayIndexMap.get(path)
    }

    setFlattenTreeIndexByPath(path: string, index: number) {
        this.pathToFlattenArrayIndexMap.set(path, index)
    }

    getTreeNodeByPath(path: string) {
        const wrapper = this.pathToTreeWrapperMap.get(path)
        return wrapper.querySelector(SELECTOR_TREE_NODE) as HTMLElement
    }

    getTreeWrapperByPath(path: string) {
        return this.pathToTreeWrapperMap.get(path)
    }

    setTreeWrapperByPath(path: string, wrapper: HTMLElement) {
        this.pathToTreeWrapperMap.set(path, wrapper)
    }

    getTreeNodeByIndex(index: number) {
        const wrapper = this.pathToTreeWrapperMap.get( this.getTreeViewModelByIndex(index).path )
        return wrapper.querySelector(SELECTOR_TREE_NODE) as HTMLElement
    }

    getTreeWrapperByIndex(index: number) {
        return this.pathToTreeWrapperMap.get( this.getTreeViewModelByIndex(index).path )
    }

    setTreeWrapperByIndex(index: number, wrapper: HTMLElement) {
        this.pathToTreeWrapperMap.set(this.getTreeViewModelByIndex(index).path, wrapper)
    }

    getIndexByPath(path: string) {
        return this.pathToFlattenArrayIndexMap.get(path)
    }

    getTreeViewModelByIndex(index: number) {
        return this.flattenTreeArray[index]
    }

    getTreeViewModelByPath(path: string) {
        return this.flattenTreeArray[ this.pathToFlattenArrayIndexMap.get(path) ]
    }

    get lastSelectedIndex() {
        return this._lastSelectedIndex
    }

    set lastSelectedIndex(index: number) {
        this._lastSelectedIndex = index
    }

    setLastSelectedIndexByPath(path: string) {
        this._lastSelectedIndex = this.pathToFlattenArrayIndexMap.get(path)
    }

    removeLastSelectedIndex() {
        this._lastSelectedIndex = -1
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

    getFlattenTreeArrayLength(): number {
        return this.flattenTreeArray.length
    }
}