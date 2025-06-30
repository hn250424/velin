import TreeNode from "@shared/types/TreeNode"
import { DATASET_ATTR_TREE_PATH, EXPANDED_TEXT, NOT_EXPANDED_TEXT } from "../../constants/dom"

export default class TreeLayoutMaanger {
    private static instance: TreeLayoutMaanger | null = null

    private _treeOpenStatus = false
    private _target: HTMLElement

    private _tree: HTMLElement
    private _tree_top: HTMLElement
    private _tree_top_name: HTMLElement
    private _tree_top_add_file: HTMLElement
    private _tree_top_add_directory: HTMLElement
    private _tree_content: HTMLElement
    private _tree_resizer: HTMLElement

    private _pathToTreeNodeMap: Map<string, TreeNode> = new Map()

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

    isTreeOpen(): boolean {
        return this._treeOpenStatus
    }

    setTreeOpen(status: boolean) {
        this._treeOpenStatus = status
    }

    clean(container: HTMLElement) {
        while (container.firstChild) {
            container.removeChild(container.firstChild)
        }
    }

    renderTreeData(tree: TreeNode, container?: HTMLElement) {
        if (tree.indent === 0 || !container) {
            this._tree_top_name.textContent = tree.name
            container = this._tree_content
        }

        if (tree.expanded) container.style.display = 'block'

        if (!container) return
        this.clean(container)

        for (const child of tree.children) {
            this._renderNode(container, child)
        }
    }

    private _renderNode(container: HTMLElement, node: TreeNode) {
        const box = document.createElement('div')
        box.classList.add('tree_node')
        box.style.paddingLeft = `${(node.indent - 1) * 16}px`
        box.dataset[DATASET_ATTR_TREE_PATH] = node.path
        box.title = node.path
        this.setTreeNodeByPath(node.path, node)

        const openStatus = document.createElement('span')
        openStatus.classList.add('tree_node_open_status')
        if (node.directory) openStatus.textContent = node.expanded ? EXPANDED_TEXT : NOT_EXPANDED_TEXT

        const icon = document.createElement('img')
        icon.classList.add('tree_node_icon')
        icon.src = node.directory
            ? new URL('../../assets/icons/setting.png', import.meta.url).toString()
            : new URL('../../assets/icons/file.png', import.meta.url).toString()

        const text = document.createElement('span')
        text.classList.add('tree_node_text', 'ellipsis')
        text.textContent = node.name

        const childrenContainer = document.createElement('div')
        childrenContainer.classList.add('tree_children')
        childrenContainer.style.display = node.expanded ? 'block' : 'none'

        box.appendChild(openStatus)
        box.appendChild(icon)
        box.appendChild(text)

        const wrapper = document.createElement('div')
        wrapper.classList.add('tree_node_wrapper')
        wrapper.appendChild(box)
        wrapper.appendChild(childrenContainer)

        container.appendChild(wrapper)
    }

    // safeIdFromPath(path: string): string {
    //     return 'node-' + path.replace(/[^\w\-]/g, '_')
    // }

    // setTarget(target: HTMLElement) {
    //     this._target = target
    // }

    getTreeNodeByPath(path: string) {
        return this._pathToTreeNodeMap.get(path)
    }

    setTreeNodeByPath(path: string, node: TreeNode) {
        this._pathToTreeNodeMap.set(path, node)
    }

    // get target() {
    //     return this._target
    // }
}