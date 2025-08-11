import { injectable } from "inversify"
import {
    CLASS_EXPANDED,
    CLASS_TREE_GHOST,
    CLASS_TREE_NODE,
    CLASS_TREE_NODE_CHILDREN,
    CLASS_TREE_NODE_ICON,
    CLASS_TREE_NODE_INPUT,
    CLASS_TREE_NODE_OPEN,
    CLASS_TREE_NODE_TEXT,
    CLASS_TREE_NODE_WRAPPER,
    DATASET_ATTR_TREE_PATH,
    EXPANDED_TEXT,
    NOT_EXPANDED_TEXT,
    SELECTOR_TREE_NODE
} from "../../constants/dom"
import TreeViewModel from "../../viewmodels/TreeViewModel"

@injectable()
export default class TreeRenderer {
    private _tree_top_name: HTMLElement
    private _tree_node_container: HTMLElement

    private ghostBox: HTMLElement | null = null

    private _pathToTreeWrapperMap: Map<string, HTMLElement> = new Map()

    constructor() {
        this._tree_node_container = document.getElementById('tree_node_container')
        this._tree_top_name = document.getElementById('tree_top_name')
    }

    clean(container: HTMLElement) {
        while (container.firstChild) {
            container.removeChild(container.firstChild)
        }
    }

    // Each DOM element with class `tree_node` has a dataset attribute for its path.
    // The root node uses the container `tree_node_container` to hold its path in the dataset.
    renderTreeData(viewModel: TreeViewModel, container?: HTMLElement) {
        if (!container) {
            this._tree_top_name.textContent = viewModel.name
            container = this._tree_node_container

            this._pathToTreeWrapperMap.set(viewModel.path, container)
            container.dataset[DATASET_ATTR_TREE_PATH] = viewModel.path
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

        if (!viewModel.directory) {
            icon.src = new URL('../../assets/icons/file.png', import.meta.url).toString();
        } else {
            if (viewModel.expanded) {
                icon.src = new URL('../../assets/icons/opened_folder.png', import.meta.url).toString();
            } else {
                icon.src = new URL('../../assets/icons/folder.png', import.meta.url).toString();
            }
        }

        const text = document.createElement('span')
        text.classList.add(CLASS_TREE_NODE_TEXT, 'ellipsis')
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

        this._pathToTreeWrapperMap.set(viewModel.path, wrapper)
        container.appendChild(wrapper)

        if (viewModel.expanded && viewModel.children && viewModel.children.length > 0) {
            for (const child of viewModel.children) {
                this._renderNode(childrenContainer, child)
            }
        }
    }

    createInputbox(directory: boolean, indent: number) {
        const box = document.createElement('div')
        box.classList.add('tree_node_temp')
        box.style.paddingLeft = `${indent * 16}px`

        const openStatus = document.createElement('span')
        openStatus.classList.add(CLASS_TREE_NODE_OPEN)
        if (directory) openStatus.textContent = NOT_EXPANDED_TEXT

        const icon = document.createElement('img')
        icon.classList.add(CLASS_TREE_NODE_ICON)
        console.log(directory)
        icon.src = directory
            ? new URL('../../assets/icons/folder.png', import.meta.url).toString()
            : new URL('../../assets/icons/file.png', import.meta.url).toString()

        const input = document.createElement('input')
        input.type = 'text'
        input.value = ''
        input.classList.add(CLASS_TREE_NODE_INPUT)

        box.appendChild(openStatus)
        box.appendChild(icon)
        box.appendChild(input)

        const wrapper = document.createElement('div')
        wrapper.classList.add(CLASS_TREE_NODE_WRAPPER)
        wrapper.appendChild(box)

        return { wrapper, input }
    }

    createGhostBox(count: number) {
        if (this.ghostBox) return this.ghostBox

        const div = document.createElement('div')
        div.classList.add(CLASS_TREE_GHOST)
        div.textContent = `${count} items`

        this.ghostBox = div
        document.body.appendChild(div)

        return this.ghostBox
    }

    removeGhostBox() {
        if (this.ghostBox) {
            this.ghostBox.remove()
            this.ghostBox = null
        }
    }



    getTreeNodeByPath(path: string) {
        const wrapper = this._pathToTreeWrapperMap.get(path)
        return wrapper.querySelector(SELECTOR_TREE_NODE) as HTMLElement
    }

    getTreeWrapperByPath(path: string) {
        return this._pathToTreeWrapperMap.get(path)
    }

    setTreeWrapperByPath(path: string, wrapper: HTMLElement) {
        this._pathToTreeWrapperMap.set(path, wrapper)
    }

    deleteTreeWrapperByPath(path: string) {
        this._pathToTreeWrapperMap.delete(path)
    }
}