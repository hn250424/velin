import TreeNode from "@shared/types/TreeNode"

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

    clean() {
        while (this._target.firstChild) {
            this._target.removeChild(this._target.firstChild)
        }
    }

    setTreeData(treeNode: TreeNode) {
        if (!this.target) {
            this._tree_top_name.textContent = treeNode.name
            this._target = this._tree_content
        }

        this.clean()

        if (treeNode.children?.length) {
            for (const child of treeNode.children) {
                this.renderNode(this._target, child)
            }
        }
    }

    renderNode(container: ParentNode, node: TreeNode) {
        const box = document.createElement('div')
        box.classList.add('tree_node')
        box.style.paddingLeft = `${(node.indent - 1) * 16}px`
        box.id = this.safeIdFromPath(node.path)
        box.title = node.path

        const open_status = document.createElement('span')
        open_status.classList.add('tree_node_open_status')
        if (node.directory) open_status.textContent = '▷'

        const icon = document.createElement('img')
        icon.classList.add('tree_node_icon')
        if (node.directory) icon.src = new URL('../../assets/icons/setting.png', import.meta.url).toString()
        else icon.src = new URL('../../assets/icons/file.png', import.meta.url).toString()

        const text = document.createElement('span')
        text.classList.add('tree_node_text')
        text.classList.add('ellipsis')
        text.textContent = node.name

        box.appendChild(open_status)
        box.appendChild(icon)
        box.appendChild(text)
        container.appendChild(box)
    }

    safeIdFromPath(path: string): string {
        return 'node-' + path.replace(/[^\w\-]/g, '_')
    }

    setTarget(target: HTMLElement) {
        this._target = target
    }

    get target() {
        return this._target
    }
}