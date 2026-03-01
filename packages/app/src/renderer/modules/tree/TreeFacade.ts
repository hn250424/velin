import type ClipboardMode from "@shared/types/ClipboardMode"
import type Response from "@shared/types/Response"
import type { TreeDto } from "@shared/dto/TreeDto"
import type { TreeViewModel } from "../../viewmodels/TreeViewModel"

import { inject, injectable } from "inversify"
import DI_KEYS from "../../constants/di_keys"
import {
	DATASET_ATTR_TREE_PATH,
	SELECTOR_TREE_NODE,
	CLASS_FOCUSED,
	CLASS_SELECTED,
	CLASS_CUT,
	CLASS_DEACTIVE,
	CLASS_TREE_DRAG_OVERLAY,
	SELECTOR_TREE_NODE_WRAPPER,
	SELECTOR_TREE_NODE_CONTAINER,
} from "../../constants/dom"
import { TreeRenderer } from "./TreeRenderer"
import { TreeStore } from "./TreeStore"
import { TreeDragManager } from "./TreeDragManager"

@injectable()
export class TreeFacade {
	constructor(
		@inject(DI_KEYS.TreeStore) public readonly store: TreeStore,
		@inject(DI_KEYS.TreeRenderer) public readonly renderer: TreeRenderer,
		@inject(DI_KEYS.TreeDragManager) public readonly drag: TreeDragManager
	) {}

	// store

	toTreeDto(viewModel: TreeViewModel): TreeDto {
		return this.store.toTreeDto(viewModel)
	}

	toTreeViewModel(dto: TreeDto): TreeViewModel {
		return this.store.toTreeViewModel(dto)
	}

	//

	getRootTreeViewModel(): TreeViewModel {
		return this.store.getRootTreeViewModel()
	}

	syncPathToFlattenTreeIndex() {
		this.store.syncPathToFlattenTreeIndex()
	}

	//

	toFlatList(tree: TreeViewModel) {
		return this.store.toFlatList(tree)
	}

	findParentDirectoryIndex(index: number) {
		return this.store.findParentDirectoryIndex(index)
	}

	//

	insertChildNodes(node: TreeViewModel) {
		this.store.insertChildNodes(node)
	}

	removeChildNodes(node: TreeViewModel) {
		this.store.removeChildNodes(node)
	}

	//

	get flattenTree(): readonly TreeViewModel[] {
		return this.store.flattenTree
	}

	set flattenTree(arr: TreeViewModel[]) {
		this.store.flattenTree = arr
	}

	spliceFlattenTree(start: number, length: number) {
		this.store.spliceFlattenTree(start, length)
	}

	//

	getTreeViewModelByIndex(index: number) {
		return this.store.getTreeViewModelByIndex(index)
	}

	getTreeViewModelByPath(path: string) {
		return this.store.getTreeViewModelByPath(path)
	}

	//

	getFlattenIndexByPath(path: string) {
		return this.store.getFlattenIndexByPath(path)
	}

	setFlattenIndexByPath(path: string, index: number) {
		this.store.setFlattenIndexByPath(path, index)
	}

	deleteFlattenIndexByPath(path: string) {
		this.store.deleteFlattenIndexByPath(path)
	}

	//

	get lastSelectedIndex() {
		return this.store.lastSelectedIndex
	}

	set lastSelectedIndex(index: number) {
		const treeNode = this.getTreeNodeByIndex(index)
		treeNode.focus()
		this.store.lastSelectedIndex = index
	}

	removeLastSelectedIndex() {
		this.store.lastSelectedIndex = -1
	}

	setLastSelectedIndexByPath(path: string) {
		this.lastSelectedIndex = this.store.getFlattenIndexByPath(path)!
	}

	//

	get contextTreeIndex() {
		return this.store.contextTreeIndex
	}

	set contextTreeIndex(index: number) {
		this.store.contextTreeIndex = index
	}

	removeContextTreeIndex() {
		this.store.removeContextTreeIndex()
	}

	setContextTreeIndexByPath(path: string) {
		this.store.contextTreeIndex = this.store.getFlattenIndexByPath(path)!
	}

	//

	get selectedDragIndex() {
		return this.store.selectedDragIndex
	}

	set selectedDragIndex(index: number) {
		this.store.selectedDragIndex = index
	}

	setSelectedDragIndexByPath(path: string) {
		this.store.selectedDragIndex = this.store.getFlattenIndexByPath(path)!
	}

	//

	addSelectedIndices(index: number) {
		this.store.addSelectedIndices(index)
	}

	getSelectedIndices(): number[] {
		return this.store.getSelectedIndices()
	}

	clearSelectedIndices() {
		this.store.clearSelectedIndices()
	}

	//

	get clipboardMode() {
		return this.store.clipboardMode
	}

	set clipboardMode(mode: ClipboardMode) {
		this.store.clipboardMode = mode
	}

	addClipboardPaths(path: string) {
		this.store.addClipboardPaths(path)
	}

	getClipboardPaths(): string[] {
		return this.store.getClipboardPaths()
	}

	clearClipboardPaths() {
		const paths = this.store.getClipboardPaths()
		for (const path of paths) {
			const wrapper = this.getTreeWrapperByPath(path)
			wrapper?.classList.remove(CLASS_CUT)
		}

		this.store.clearClipboardPaths()
	}

	// renderer

	clean(container: HTMLElement) {
		this.renderer.clean(container)
	}

	//

	// TODO: expense
	render(viewModel: TreeViewModel, container?: HTMLElement) {
		this.renderer.render(viewModel, container)
	}

	//

	createInput(directory: boolean, indent: number) {
		return this.renderer.createInput(directory, indent)
	}

	createGhost(count: number) {
		return this.renderer.createGhost(count)
	}

	removeGhost() {
		this.renderer.removeGhost()
	}

	//

	clearPathToTreeWrapper() {
		this.renderer.clearPathToTreeWrapper()
	}

	getTreeNodeByPath(path: string) {
		return this.renderer.getTreeNodeByPath(path)
	}

	getTreeWrapperByPath(path: string) {
		return this.renderer.getTreeWrapperByPath(path)
	}

	setTreeWrapperByPath(path: string, wrapper: HTMLElement) {
		this.renderer.setTreeWrapperByPath(path, wrapper)
	}

	deleteTreeWrapperByPath(path: string) {
		this.renderer.deleteTreeWrapperByPath(path)
	}

	// drag

	isDrag(): boolean {
		return this.drag.isDrag()
	}

	startDrag() {
		this.drag.startDrag()
	}

	endDrag() {
		this.drag.endDrag()
	}

	//

	getStartPosition() {
		return this.drag.getStartPosition()
	}

	setStartPosition(x: number, y: number) {
		this.drag.setStartPosition(x, y)
	}

	getStartPosition_x() {
		return this.drag.getStartPosition_x()
	}

	getStartPosition_y() {
		return this.drag.getStartPosition_y()
	}

	//

	isMouseDown(): boolean {
		return this.drag.isMouseDown()
	}

	setMouseDown(state: boolean) {
		this.drag.setMouseDown(state)
	}

	//

	getDragTreeCount() {
		return this.drag.getDragTreeCount()
	}

	setDragTreeCount(count: number) {
		this.drag.setDragTreeCount(count)
	}

	//

	getInsertWrapper() {
		return this.drag.getInsertWrapper()
	}

	setInsertWrapper(wrapper: HTMLElement | null) {
		this.drag.setInsertWrapper(wrapper)
	}

	getInsertPath() {
		return this.drag.getInsertPath()
	}

	setInsertPath(path: string) {
		this.drag.setInsertPath(path)
	}

	// orchestra - drag

	initDrag(count: number, x: number, y: number) {
		this.setMouseDown(true)
		this.setDragTreeCount(count)
		this.setStartPosition(x, y)
	}

	moveGhost(x: number, y: number) {
		const ghost = this.createGhost(this.getDragTreeCount())
		ghost.style.left = `${x + 5}px`
		ghost.style.top = `${y + 5}px`
	}

	updateDragOverStatus(target: HTMLElement) {
		const previousWrapper = this.getInsertWrapper()

		let currentWrapper = target.closest(SELECTOR_TREE_NODE_WRAPPER) as HTMLElement
		let isContainer = false

		if (!currentWrapper) {
			const container = target.closest(SELECTOR_TREE_NODE_CONTAINER) as HTMLElement
			if (!container) {
				this.clearDrag()
				return
			}
			currentWrapper = container
			isContainer = true
		}

		if (previousWrapper === currentWrapper) return

		if (previousWrapper) previousWrapper.classList.remove(CLASS_TREE_DRAG_OVERLAY)

		const path = isContainer
			? currentWrapper.dataset[DATASET_ATTR_TREE_PATH]!
			: (currentWrapper.querySelector(SELECTOR_TREE_NODE) as HTMLElement).dataset[DATASET_ATTR_TREE_PATH]!

		const viewModel = this.getTreeViewModelByPath(path)

		if (!viewModel || !viewModel.directory) {
			this.setInsertWrapper(null)
			this.setInsertPath("")
			return
		}

		this.setInsertPath(viewModel.path)
		this.setInsertWrapper(currentWrapper)
		currentWrapper.classList.add(CLASS_TREE_DRAG_OVERLAY)
	}

	clearDrag() {
		this.endDrag()
		this.removeGhost()
	}

	// orchestra

	getTreeWrapperByIndex(index: number) {
		const viewModel = this.store.getTreeViewModelByIndex(index)
		return this.renderer.getTreeWrapperByPath(viewModel.path)
	}

	getTreeNodeByIndex(index: number) {
		const wrapper = this.getTreeWrapperByIndex(index)!
		return wrapper.querySelector(SELECTOR_TREE_NODE) as HTMLElement
	}

	blur() {
		const index = this.lastSelectedIndex
		if (index === 0) {
			this.renderer.elements.treeNodeContainer.classList.remove(CLASS_FOCUSED)
		} else {
			const node = this.getTreeNodeByIndex(index)
			node.classList.remove(CLASS_FOCUSED)
		}
	}

	clearTreeSelected() {
		const selectedIndices = this.getSelectedIndices()
		for (const i of selectedIndices) {
			const div = this.getTreeNodeByIndex(i)
			div.classList.remove(CLASS_SELECTED)
		}
		this.clearSelectedIndices()
	}

	removeLastSelectedTreeNodeFocus() {
		if (this.lastSelectedIndex > 0) {
			const lastSelectedTreeNode = this.getTreeNodeByIndex(this.lastSelectedIndex)
			lastSelectedTreeNode.classList.remove(CLASS_FOCUSED)
		}
	}

	removeContextSelectedTreeNodeFocus() {
		if (this.contextTreeIndex !== -1) {
			const contextSelectedTreeNode = this.getTreeNodeByIndex(this.contextTreeIndex)
			contextSelectedTreeNode.classList.remove(CLASS_FOCUSED)
		}
	}

	focusContainer() {
		const { treeNodeContainer } = this.renderer.elements
		treeNodeContainer.classList.add(CLASS_FOCUSED)
		this.clearTreeSelected()
		this.lastSelectedIndex = 0
	}

	renderContextmenuAndUpdateContextIndex(treeNode: HTMLElement, x: number, y: number) {
		const { treeContextMenu, treeContextPaste } = this.renderer.elements

		const path = treeNode.dataset[DATASET_ATTR_TREE_PATH]!
		const viewModel = this.getTreeViewModelByPath(path)

		const isPasteDisabled =
			this.clipboardMode === "none" || !viewModel.directory || this.getSelectedIndices().length === 0

		treeContextPaste.classList.toggle(CLASS_DEACTIVE, isPasteDisabled)
		treeContextMenu.classList.add(CLASS_SELECTED)
		treeContextMenu.style.left = `${x}px`
		treeContextMenu.style.top = `${y}px`
		treeNode.classList.add(CLASS_FOCUSED)

		this.setContextTreeIndexByPath(path)
	}

	loadFlattenArrayAndMaps(json: TreeViewModel) {
		this.store.flattenTree = this.toFlatList(json)
		this.syncPathToFlattenTreeIndex()
	}

	async rename(preBase: string, newBase: string) {
		const response: Response<string> = await window.rendererToMain.rename(preBase, newBase)
		if (!response.result) return response
		newBase = response.data

		const start = this.store.getFlattenIndexByPath(preBase)!

		for (let i = start; i < this.store.flattenTree.length; i++) {
			const node = this.getTreeViewModelByIndex(i)
			if (node.path.startsWith(preBase)) {
				const treeWrapper = this.renderer.getTreeWrapperByPath(node.path)!
				const idx = this.store.getFlattenIndexByPath(node.path)!
				const treeNode = this.renderer.getTreeNodeByPath(node.path)
				this.store.deleteFlattenIndexByPath(node.path)
				this.deleteTreeWrapperByPath(node.path)
				const relative = window.utils.getRelativePath(preBase, node.path)
				const newPath = window.utils.getJoinedPath(newBase, relative)
				node.path = newPath
				node.name = window.utils.getBaseName(node.path)
				treeNode.dataset[DATASET_ATTR_TREE_PATH] = newPath
				treeNode.title = newPath
				this.store.setFlattenIndexByPath(newPath, idx)
				this.renderer.setTreeWrapperByPath(newPath, treeWrapper)
			} else {
				break
			}
		}

		return response
	}

	delete(indices: number[]) {
		indices.sort((a, b) => b - a)

		for (const index of indices) {
			const target = this.store.flattenTree[index]
			const baseIndent = target.indent

			let parentIndex = -1
			for (let i = index - 1; i >= 0; i--) {
				if (this.store.flattenTree[i].indent === baseIndent - 1) {
					parentIndex = i
					break
				}
			}

			const toDelete: TreeViewModel[] = []

			// Collects the deletion target: Self + all children
			for (let i = index; i < this.store.flattenTree.length; i++) {
				const node = this.store.getTreeViewModelByIndex(i)
				if (i !== index && node.indent <= baseIndent) break
				toDelete.push(node)
			}

			if (parentIndex >= 0) {
				const parent = this.store.flattenTree[parentIndex]
				if (parent.children) {
					parent.children = parent.children.filter(
						(child: any) => !toDelete.some((deleted) => deleted.path === child.path)
					)
				}
			}

			for (const node of toDelete) {
				const path = node.path

				const wrapper = this.renderer.getTreeWrapperByPath(path)
				wrapper?.remove()

				this.deleteTreeWrapperByPath(path)
			}

			this.store.spliceFlattenTree(index, toDelete.length)
		}

		this.syncPathToFlattenTreeIndex()
	}
}
